"""Generates clearly labelled SYNTHETIC sample PDFs (fictional institutions only)."""
import io, os
try:
    if os.environ.get("VERIFYAI_NO_MUPDF"): raise ImportError
    import pymupdf
except Exception:
    pymupdf = None
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def make_pdf(title, lines, signature=False, image_only=False, map_box=False) -> bytes:
    buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=A4); w, h = A4
    c.setFont("Helvetica-Bold", 15); c.drawString(50, h - 70, title)
    c.setFont("Helvetica", 8); c.drawString(50, h - 86, "SYNTHETIC SAMPLE DOCUMENT - generated for the SIH demonstration. Not a real certificate.")
    c.setFont("Helvetica", 11); y = h - 125
    for ln in lines: c.drawString(50, y, ln); y -= 22
    if map_box: c.rect(50, 200, 400, 250); c.drawString(60, 430, "[ synthetic satellite map placeholder ]"); c.circle(250, 320, 5, fill=1)
    c.showPage(); c.save(); data = buf.getvalue()
    if image_only and pymupdf:  # rasterise: removes the text layer so OCR fallback is exercised
        src = pymupdf.open(stream=data, filetype="pdf"); out = pymupdf.open()
        pix = src[0].get_pixmap(dpi=150); pg = out.new_page(width=w, height=h); pg.insert_image(pg.rect, stream=pix.tobytes("jpg", jpg_quality=80))
        return out.tobytes()
    if signature and not pymupdf:   # pure-Python: add an empty signature form field with pypdf
        from pypdf import PdfReader, PdfWriter
        from pypdf.generic import DictionaryObject, NameObject, TextStringObject, ArrayObject, FloatObject, NumberObject
        w = PdfWriter(clone_from=PdfReader(io.BytesIO(data)))
        ref = w._add_object(DictionaryObject({NameObject("/Type"): NameObject("/Annot"), NameObject("/Subtype"): NameObject("/Widget"), NameObject("/FT"): NameObject("/Sig"),
            NameObject("/T"): TextStringObject("Signature1"), NameObject("/F"): NumberObject(4), NameObject("/Rect"): ArrayObject([FloatObject(380), FloatObject(60), FloatObject(540), FloatObject(120)])}))
        w.pages[0][NameObject("/Annots")] = ArrayObject([ref]); w._root_object[NameObject("/AcroForm")] = DictionaryObject({NameObject("/Fields"): ArrayObject([ref])})
        out = io.BytesIO(); w.write(out); return out.getvalue()
    if signature:
        d = pymupdf.open(stream=data, filetype="pdf"); wd = pymupdf.Widget(); wd.field_type = pymupdf.PDF_WIDGET_TYPE_SIGNATURE
        wd.field_name = "Signature1"; wd.rect = pymupdf.Rect(380, 700, 540, 760); d[0].add_widget(wd); return d.tobytes()
    return data

def cert(title, inst, no, auth, issued, valid=None, extra=()):
    L = [f"Institution: {inst}", f"Certificate Type: {title}", f"Certificate No.: {no}", f"Issued by: {auth}", f"Date of Issue: {issued}"]
    if valid: L.append(f"Valid Until: {valid}")
    return [*L, *extra]
