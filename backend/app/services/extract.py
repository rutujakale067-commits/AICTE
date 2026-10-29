"""PDF ingestion: PyMuPDF text layer -> optional Tesseract OCR fallback -> label-based field extraction.
Fields are only returned when a labelled value is actually found. Nothing is guessed."""
import re, io, os, hashlib, uuid
from datetime import date, datetime
try:   # PyMuPDF is optional: some Windows policies block its DLL. Fall back to pure-Python pypdf.
    if os.environ.get("VERIFYAI_NO_MUPDF"): raise ImportError
    import pymupdf
except Exception:
    pymupdf = None
from ..config import UPLOAD_DIR, MAX_UPLOAD_BYTES
from ..models import Document, ExtractedField

PATTERNS = {
 "institution_name": r"(?:Name of (?:the )?Institution|Institution)\s*[:\-]\s*(.+)",
 "certificate_type": r"Certificate Type\s*[:\-]\s*(.+)",
 "certificate_number": r"(?:Certificate|Licence|License|Receipt|Reference)\s*(?:No\.?|Number)\s*[:\-]\s*([A-Za-z0-9][A-Za-z0-9/\-\.]*)",
 "issuing_authority": r"Issued by\s*[:\-]\s*(.+)",
 "issue_date": r"(?:Date of Issue|Issued on|Issue Date)\s*[:\-]\s*(.+)",
 "expiry_date": r"(?:Valid (?:Until|Up ?to|Till)|Expiry Date|Date of Expiry)\s*[:\-]\s*(.+)",
 "address": r"(?:Address|Location)\s*[:\-]\s*(.+)",
 "latitude": r"Latitude\s*[:\-]?\s*([0-9]{1,2}\.[0-9]+)",
 "longitude": r"Longitude\s*[:\-]?\s*([0-9]{1,3}\.[0-9]+)",
 "financial_year": r"Financial Year\s*[:\-]\s*([0-9]{4}\s*[-/]\s*[0-9]{2,4})",
}
DATE_FMTS = ["%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d %B %Y", "%d %b %Y", "%Y-%m-%d"]
def parse_date(s):
    s = (s or "").strip().rstrip(".")
    for f in DATE_FMTS:
        try: return datetime.strptime(s, f).date()
        except ValueError: pass
    return None

def validate_upload(name, data: bytes):
    if not name.lower().endswith(".pdf"): return "Only PDF files are permitted."
    if len(data) > MAX_UPLOAD_BYTES: return f"File exceeds {MAX_UPLOAD_BYTES // (1024*1024)} MB limit."
    if not data.startswith(b"%PDF"): return "File content is not a valid PDF."
    return None

def _ocr_page(page):
    try:
        import pytesseract
        from PIL import Image
        pix = page.get_pixmap(dpi=200)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        d = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        words = [(w, float(c)) for w, c in zip(d["text"], d["conf"]) if w.strip() and float(c) >= 0]
        text = pytesseract.image_to_string(img)
        conf = round(sum(c for _, c in words) / len(words) / 100, 2) if words else None
        return text, conf
    except Exception:
        return "", None

def store_and_extract(db, app, doc_type, filename, data: bytes) -> Document:
    stored = f"{uuid.uuid4().hex}.pdf"
    (UPLOAD_DIR / stored).write_bytes(data)
    for old in db.query(Document).filter_by(application_id=app.id, doc_type=doc_type, superseded=False): old.superseded = True
    doc = Document(application_id=app.id, doc_type=doc_type, original_name=filename[:250], stored_path=stored,
                   sha256=hashlib.sha256(data).hexdigest(), size_bytes=len(data))
    db.add(doc); db.flush()
    extract_into(doc, data)
    return doc

def extract_into(doc: Document, data: bytes):
    ocr_conf, used_ocr = {}, False
    if pymupdf:
        try: pdf = pymupdf.open(stream=data, filetype="pdf")
        except Exception:
            doc.extraction_status = "Unreadable"; return
        doc.page_count = len(pdf); pages = {}
        for i, page in enumerate(pdf, 1):
            t = page.get_text().strip()
            if len(t) < 20:
                t2, conf = _ocr_page(page)
                if len(t2.strip()) >= 20: t, used_ocr, ocr_conf[i] = t2.strip(), True, conf
            pages[str(i)] = t
        try: doc.has_signature_field = any(w.field_type == pymupdf.PDF_WIDGET_TYPE_SIGNATURE for p in pdf for w in (p.widgets() or []))
        except Exception: doc.has_signature_field = False
    else:  # pure-Python path (no OCR: scanned PDFs are reported as Unreadable -> Manual Review)
        try:
            from pypdf import PdfReader
            rd = PdfReader(io.BytesIO(data)); doc.page_count = len(rd.pages)
            pages = {str(i): (p.extract_text() or "").strip() for i, p in enumerate(rd.pages, 1)}
            sig = False
            for p in rd.pages:
                for an in (p.get("/Annots") or []):
                    o = an.get_object(); ft = o.get("/FT") or (o.get("/Parent").get_object().get("/FT") if o.get("/Parent") else None)
                    sig = sig or ft == "/Sig"
            doc.has_signature_field = sig
        except Exception:
            doc.extraction_status = "Unreadable"; return
    doc.page_text = pages
    if not any(len(t) >= 20 for t in pages.values()):
        doc.extraction_status = "Unreadable"; return
    doc.extraction_status = "OCR Used" if used_ocr else "Completed"
    for name, pat in PATTERNS.items():
        for pno, text in pages.items():
            m = re.search(pat, text, re.I)
            if m:
                p = int(pno); conf = ocr_conf.get(p) if p in ocr_conf else 0.9
                doc.fields.append(ExtractedField(name=name, value=m.group(1).strip()[:290], page=p, confidence=conf,
                                                 method="ocr" if p in ocr_conf else "text-layer"))
                break
