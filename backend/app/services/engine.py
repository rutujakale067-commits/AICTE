"""Deterministic, configurable compliance engine. Rules come from rule_versions in the DB (never hard-coded here)."""
import re, difflib
from datetime import date
from ..models import RuleVersion, Rule, ScrutinyRun, Finding, Document
from .extract import parse_date
from .explain import get_explainer
from .audit import log

def norm(s): return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", (s or "").lower())).strip()
def ratio(a, b): return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()
def add_years(d, n):
    try: return d.replace(year=d.year + n)
    except ValueError: return d.replace(year=d.year + n, day=28)
def ay_start(ay): return int(ay[:4])

def active_rules(db, app):
    out = []
    for rv in db.query(RuleVersion).filter_by(active=True):
        if app.category in rv.categories and app.academic_year in rv.effective_ay: out.append(rv)
    return out

class Ctx:
    def __init__(self, db, app, run, user):
        self.db, self.app, self.run, self.user, self.n, self.ex = db, app, run, user, 0, get_explainer()
        self.docs = {d.doc_type: d for d in db.query(Document).filter_by(application_id=app.id, superseded=False)}
    def f(self, doc, name):
        for x in doc.fields:
            if x.name == name: return x
    def add(self, rv, check, title, status, severity, doc=None, field=None, value=None, expected="", reason="", unc="", action="", page=None, conf=None):
        self.n += 1
        if field is not None: page, conf, value = field.page, field.confidence, value if value is not None else field.effective
        sev = severity if status in ("Potential Deficiency", "Manual Review Required") else "None"
        self.db.add(Finding(code=f"F-{self.run.id:03d}-{self.n:03d}", run_id=self.run.id, rule_version_id=rv.id if rv else None,
            rule_code=rv.rule.rule_id if rv else "-", check=check, document_id=doc.id if doc else None, doc_page=page, title=title,
            status=status, original_status=status, severity=sev, extracted_value=(str(value)[:290] if value is not None else None),
            expected=expected, reason=reason, explanation=self.ex.explain(status, title, reason, action), confidence=conf,
            uncertainty=unc, next_action=action or "No action required.", comments=[]))

def applicability(rv, app):
    c = rv.config.get("condition")
    if rv.applicability == "required": return "applies", ""
    inst = app.institution
    if c == "payment_applicable":
        if app.payment_applicable is None: return "unknown", "The application record does not state whether a payment receipt is applicable."
        return ("applies", "") if app.payment_applicable else ("na", "The application record indicates no payment receipt is applicable.")
    if c == "building_age_over_30":
        y = inst.completion_certificate_year
        if y is None: return "unknown", "The year of the Completion Certificate is not recorded, so building age cannot be determined."
        age = ay_start(app.academic_year) - y
        if age > 30: return "applies", f"Completion Certificate year {y}; building age about {age} years (more than thirty)."
        if age == 30: return "unknown", f"Completion Certificate year {y}; building age is exactly thirty years at academic year start - exact issue date is needed."
        return "na", f"Completion Certificate year {y}; building age about {age} years (not more than thirty)."
    return "unknown", "Applicability condition is not configured."

def run_scrutiny(db, app, user):
    rvs = active_rules(db, app)
    n = db.query(ScrutinyRun).filter_by(application_id=app.id).count() + 1
    run = ScrutinyRun(application_id=app.id, run_no=n, run_by=user.full_name,
                      rule_snapshot={rv.rule.rule_id: rv.version for rv in rvs}); db.add(run); db.flush()
    log(db, app.id, user.full_name, "Rules executed", f"Run #{n}; {len(rvs)} rule versions ({app.category}, AY {app.academic_year})")
    cx = Ctx(db, app, run, user); ref = app.submitted_on
    by_id = {rv.rule.rule_id: rv for rv in rvs}
    doc_rules = [rv for rv in rvs if rv.rule.doc_type]
    if not rvs or not doc_rules:
        rv = db.query(RuleVersion).join(Rule).filter(Rule.rule_id == "R-CFG-000").first()
        cx.add(rv, "config", "No configured checklist for this category", "Manual Review Required", "High",
               expected=f"Configured checklist for '{app.category}'", reason="This prototype has no handbook checklist configured for this application category; document requirements differ by category.",
               action="Scrutinise manually against the applicable handbook annexure, or configure the checklist.")
    for rv in doc_rules:
        cfg, dt = rv.config, rv.rule.doc_type; label = rv.rule.title
        state, why = applicability(rv, app)
        if state == "na": cx.add(rv, "applicability", label, "Not Applicable", "None", expected="Condition for requirement", reason=why, action="None."); continue
        if state == "unknown": cx.add(rv, "applicability", label, "Manual Review Required", "Medium", expected="Applicability determinable from application record", reason=why, action="Confirm applicability with the institution record and rerun."); continue
        doc = cx.docs.get(dt)
        if not doc:
            cx.add(rv, "present", label, "Potential Deficiency", "High", expected="Document uploaded", value="No document uploaded",
                   reason=f"{why} No {label} has been uploaded for this application.".strip(), action="Ask the institution to upload the required document, then rerun checks."); continue
        irv = by_id.get("R-EOA-103")
        if doc.extraction_status == "Unreadable":
            cx.add(irv or rv, "readable", label, "Manual Review Required", "High", doc=doc, expected="Machine-readable text", value="No usable text",
                   reason="No text could be extracted from the PDF, and OCR was unavailable or returned nothing.", unc="Extraction failed - not a finding about the document's content.", action="Open the document and verify manually; request a legible copy if needed."); continue
        cx.add(irv or rv, "readable", label, "Pass", "None", doc=doc, expected="Machine-readable text", value=f"{doc.extraction_status}; {doc.page_count} page(s)",
               reason="Text was extracted from the document." + (" OCR was used, so extracted values may contain errors." if doc.extraction_status == "OCR Used" else ""), action="")
        for chk in cfg.get("checks", []):
            if chk == "mandatory_fields":
                miss = [m for m in cfg.get("mandatory", []) if not cx.f(doc, m)]
                if miss: cx.add(rv, chk, label, "Potential Deficiency", "Medium", doc=doc, page=1, expected="Fields: " + ", ".join(cfg["mandatory"]), value="Missing: " + ", ".join(miss),
                                reason="Mandatory fields could not be found in the document text.", unc="Extraction relies on labelled text; fields may be present in an unlabelled form.", action="Verify manually; correct the extracted values if the field exists, else request a corrected document.")
                else: cx.add(rv, chk, label, "Pass", "None", doc=doc, page=1, expected="Fields: " + ", ".join(cfg["mandatory"]), value="All present", reason="All configured mandatory fields were extracted.")
            elif chk == "signature":
                if doc.has_signature_field: cx.add(rv, chk, "Digital signature (Affidavit 2)", "Manual Review Required", "Medium", doc=doc, page=1, expected="Digitally signed using DSC (Cl. 2.3.4(a))", value="PDF signature field present",
                        reason="A signature field exists in the PDF. This prototype does not validate cryptographic signature validity or certificate chains.", unc="Presence of a field does not prove a valid digital signature.", action="Validate the DSC using a trusted PDF/DSC validator.")
                else: cx.add(rv, chk, "Digital signature (Affidavit 2)", "Potential Deficiency", "Medium", doc=doc, page=1, expected="Digitally signed using DSC (Cl. 2.3.4(a))", value="No signature field detected",
                        reason="No embedded digital-signature field was detected. A visible signature image cannot be treated as a digital signature.", unc="Detection covers only embedded PDF signature fields; a re-saved or printed copy may lose them.", action="Verify the original upload for a DSC; request a digitally signed copy if absent.")
            elif chk == "expiry":
                issue, exp = cx.f(doc, "issue_date"), cx.f(doc, "expiry_date")
                if cfg.get("validity_years") and issue and parse_date(issue.effective):
                    e = add_years(parse_date(issue.effective), cfg["validity_years"]); fld, basis = issue, f"issue date + {cfg['validity_years']} years (handbook validity period)"
                elif exp and parse_date(exp.effective): e, fld, basis = parse_date(exp.effective), exp, "validity date stated in document"
                else:
                    if cfg.get("validity_optional") and not exp: cx.add(rv, chk, label, "Manual Review Required", "Low", doc=doc, expected="Valid on reference date", value="No validity date found",
                        reason="The document states no validity date; whether it is still valid depends on the issuing authority's format.", action="Confirm validity with the issuing authority format or the official's judgement.")
                    else: cx.add(rv, chk, label, "Manual Review Required", "Medium", doc=doc, field=issue or exp, expected="Readable validity date", value=(issue or exp).effective if (issue or exp) else "none",
                        reason="A validity or issue date could not be read.", action="Open the document, read the date manually and correct the extracted value.")
                    continue
                if e < ref: cx.add(rv, chk, label, "Potential Deficiency", "High", doc=doc, field=fld, value=f"Valid until {e:%d %b %Y} ({basis})", expected=f"Valid on {ref:%d %b %Y} (application date)",
                                   reason=f"The computed validity date {e:%d %b %Y} is before the application date {ref:%d %b %Y}.", unc="Date comparison only; it does not establish authenticity.", action="Request a currently valid certificate from the Competent Authority.")
                else: cx.add(rv, chk, label, "Pass", "None", doc=doc, field=fld, value=f"Valid until {e:%d %b %Y} ({basis})", expected=f"Valid on {ref:%d %b %Y}", reason="The validity date is on or after the application date.", unc="Date comparison only; it does not establish authenticity.")
            elif chk == "latlong":
                la, lo = cx.f(doc, "latitude"), cx.f(doc, "longitude")
                if not la or not lo: cx.add(rv, chk, label, "Potential Deficiency", "Medium", doc=doc, page=1, expected="Latitude and longitude printed on map", value="Not found", reason="Latitude and/or longitude could not be found in the document text.",
                                            unc="Coordinates drawn only as image pixels cannot be read without OCR.", action="Verify the map visually; request a map showing coordinates at the main building entrance if absent.")
                else:
                    a, b = float(la.effective), float(lo.effective)
                    if 6 <= a <= 38 and 68 <= b <= 98: cx.add(rv, chk, label, "Pass", "None", doc=doc, field=la, value=f"{a}, {b}", expected="Coordinates within India", reason="Coordinates are present and fall within India's bounding box. Position at the building entrance is not verified.", unc="Whether the point marks the main building entrance needs visual confirmation.")
                    else: cx.add(rv, chk, label, "Manual Review Required", "Medium", doc=doc, field=la, value=f"{a}, {b}", expected="Coordinates within India", reason="Coordinates fall outside India's bounding box.", action="Check the coordinates against the institution's address.")
            elif chk == "fy":
                fy = cx.f(doc, "financial_year"); y = ay_start(app.academic_year); exp = f"{y-1}-{str(y)[2:]}"
                if not fy: cx.add(rv, chk, label, "Manual Review Required", "Medium", doc=doc, page=1, expected=f"Financial year {exp}", value="Not found", reason="Financial year could not be read.", action="Read the statement manually and record the year.")
                else:
                    m = re.match(r"(\d{4})\s*[-/]\s*(\d{2,4})", fy.effective); got = int(m.group(1)) if m else None
                    st = "Pass" if got == y - 1 else "Potential Deficiency"
                    cx.add(rv, chk, label, st, "Medium", doc=doc, field=fy, expected=f"Financial year {exp} (year before AY {app.academic_year})",
                           reason="Financial year matches the year before the academic year." if st == "Pass" else f"Financial year {fy.effective} does not match {exp}.",
                           unc="'Previous year' is interpreted as the financial year immediately before the academic year; confirm if the handbook intent differs.", action="" if st == "Pass" else "Request the audited statement for the correct year.")
    # internal consistency checks
    names = []
    for dt, doc in cx.docs.items():
        if doc.extraction_status == "Unreadable": continue
        nf = cx.f(doc, "institution_name")
        if nf:
            names.append((doc, nf)); r = ratio(nf.effective, app.institution.name); rv = by_id.get("R-EOA-100")
            if r >= 0.97: st, rs = "Pass", "Name matches the application record."
            elif r >= 0.85: st, rs = "Manual Review Required", f"Name is similar but not identical to the application record (similarity {r:.2f})."
            else: st, rs = "Potential Deficiency", f"Name differs from the application record (similarity {r:.2f})."
            cx.add(rv, "name_match", DOC_LABEL.get(dt, dt) + " - institution name", st, "High", doc=doc, field=nf, expected=f"Institution name: {app.institution.name}", reason=rs,
                   unc="Text similarity only; abbreviations or spelling variants may be legitimate.", action="" if st == "Pass" else "Compare the names and confirm with the institution if a name change is documented.")
        cn, decl = cx.f(doc, "certificate_number"), app.declared.get(dt)
        if cn and decl:
            ok = norm(cn.effective) == norm(decl)
            cx.add(by_id.get("R-EOA-102"), "cert_match", DOC_LABEL.get(dt, dt) + " - certificate number", "Pass" if ok else "Potential Deficiency", "High", doc=doc, field=cn, expected=f"Declared in application: {decl}",
                   reason="Certificate number matches the declaration." if ok else "Certificate number differs from the number declared in the application.", action="" if ok else "Verify the correct certificate number with the institution and issuing authority.")
    if len(names) >= 2:
        base = names[0][1].effective; bad = [(d, f) for d, f in names[1:] if ratio(f.effective, base) < 0.97]
        cx.add(by_id.get("R-EOA-101"), "cross_doc", "Institution name across documents", "Manual Review Required" if bad else "Pass", "Medium", doc=names[0][0], field=names[0][1],
               expected="Same name in all documents", reason=("Names differ between documents: " + "; ".join(f"{DOC_LABEL.get(d.doc_type)} reads '{f.effective}'" for d, f in bad)) if bad else f"{len(names)} documents carry a consistent institution name.", action="Reconcile the differing names." if bad else "")
    db.flush()
    recompute(db, app, run)
    log(db, app.id, user.full_name, "Finding created", f"Run #{n}: {len(run.findings)} findings recorded")
    return run

from ..rules.handbook_rules import DOC_TYPES as DOC_LABEL

def recompute(db, app, run=None):
    """Update run summary and application status from the latest run's current finding statuses."""
    run = run or db.query(ScrutinyRun).filter_by(application_id=app.id).order_by(ScrutinyRun.run_no.desc()).first()
    if not run: return
    cnt = {}
    for f in run.findings: cnt[f.status] = cnt.get(f.status, 0) + 1
    run.summary = cnt
    latest = db.query(ScrutinyRun).filter_by(application_id=app.id).order_by(ScrutinyRun.run_no.desc()).first()
    if run.id != latest.id: return
    if run.finalized: app.status = "Scrutiny Completed"
    elif cnt.get("Potential Deficiency"): app.status = "Potential Deficiencies"
    elif cnt.get("Manual Review Required"): app.status = "Manual Review Required"
    else: app.status = "Under Official Review"
