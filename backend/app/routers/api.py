import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    DemoUser, Institution, Application, Document, ExtractedField,
    Rule, RuleVersion, ScrutinyRun, Finding, ReviewEvent, Report,
    ApplicationTracking, IntakeCapacity, Faculty, OCRResult,
    CrossDocumentValidation, ComplianceAssessment
)
from ..config import UPLOAD_DIR, REPORT_DIR, DEMO_NOTICE
from ..rules.handbook_rules import DOC_TYPES, CAT_SD, CAT_SITE
from ..services import auth, audit, engine, extract, report as reportsvc, access, tracking, samples as S
from ..services.auth import current_user, require_roles

router = APIRouter(prefix="/api")
SENIOR = ("Senior Reviewer", "Administrator")
REVIEW_STATUSES = ["Pending", "Under Review", "Approved", "Rejected", "Returned for Correction"]
def iso(d): return d.isoformat() if d else None

# ---------- auth ----------
class Login(BaseModel): username: str; password: str
@router.post("/auth/login")
def login(b: Login, db: Session = Depends(get_db)):
    u = db.query(DemoUser).filter_by(username=b.username).first()
    if not u or not auth.check_pw(b.password, u.password_hash): raise HTTPException(401, "Invalid username or password")
    return {"token": auth.make_token(u), "user": user_out(u)}
def user_out(u): return {"id": u.id, "username": u.username, "name": u.full_name, "role": u.role}
@router.get("/auth/me")
def me(u=Depends(current_user)): return user_out(u)

# ---------- checklist / serialisation ----------
def latest_run(db, app_id): return db.query(ScrutinyRun).filter_by(application_id=app_id).order_by(ScrutinyRun.run_no.desc()).first()
def doc_out(d, verification="Not yet verified"):
    return {
        "id": d.id,
        "document_id": d.document_id,
        "doc_type": d.doc_type,
        "document_type": d.document_type,
        "label": DOC_TYPES.get(d.doc_type, d.document_type.replace('_', ' ').title()),
        "filename": d.original_name,
        "file_name": d.file_name,
        "uploaded_at": iso(d.uploaded_at or d.upload_timestamp),
        "pages": d.page_count,
        "extraction_status": d.extraction_status,
        "verification_status": d.verification_status,
        "verification": verification,
        "sha256": d.sha256 or d.sha256_hash,
        "size": d.size_bytes or d.file_size_bytes,
        "has_signature_field": d.has_signature_field,
        "issuing_authority": d.issuing_authority,
        "issue_date": iso(d.issue_date),
        "expiry_date": iso(d.expiry_date)
    }

RANK = ["Potential Deficiency", "Manual Review Required", "Resolved", "Pass", "Not Applicable"]
def checklist(db, app):
    run = latest_run(db, app.id); docs = {d.doc_type: d for d in app.documents if not d.superseded}; items = []
    for rv in engine.active_rules(db, app):
        if not rv.rule.doc_type: continue
        st, why = engine.applicability(rv, app)
        req = {"applies": "Required" if rv.applicability == "required" else "Conditionally required - applies", "na": "Not applicable", "unknown": "Manual review required"}[st]
        d = docs.get(rv.rule.doc_type); ver = "Not yet verified"
        if run:
            fs = [f.status for f in run.findings if f.rule_code == rv.rule.rule_id or (d and f.document_id == d.id)]
            if fs: ver = sorted(fs, key=RANK.index)[0]
        items.append({"rule_id": rv.rule.rule_id, "doc_type": rv.rule.doc_type, "label": rv.rule.title, "requirement": req, "note": why, "clause": rv.clause, "printed_page": rv.printed_page,
                      "state": st, "document": doc_out(d, ver) if d else None, "verification": ver})
    return items

def completeness(db, app):
    it = [i for i in checklist(db, app) if i["state"] != "na"]
    return round(100 * sum(1 for i in it if i["document"]) / len(it)) if it else 0

def app_row(db, a):
    ca = a.compliance_assessment
    return {
        "id": a.id,
        "application_id": a.application_id,
        "app_no": a.app_no,
        "institution": a.institution.name,
        "code": a.institution.aicte_permanent_id or a.institution.code,
        "academic_year": a.academic_year,
        "category": a.category,
        "submitted_on": iso(a.submitted_on),
        "reviewer": a.reviewer.full_name if a.reviewer else "Unassigned",
        "completeness": completeness(db, a),
        "status": a.status,
        "updated_at": iso(a.updated_at),
        "review_status": a.review_status,
        "reviewer_id": a.reviewer_id,
        "submitted_at": iso(a.submitted_at),
        "assigned_at": iso(a.assigned_at),
        "review_started_at": iso(a.review_started_at),
        "decided_at": iso(a.decided_at),
        "compliance_score": ca.overall_compliance_score if ca else 100.0,
        "compliance_category": ca.compliance_category if ca else "FULLY_COMPLIANT",
        "overall_recommendation": ca.overall_recommendation if ca else "RECOMMENDED",
        "is_multi_year_eligible": a.is_multi_year_eligible,
        "multi_year_duration_years": a.multi_year_duration_years
    }

def get_app(db, id_val, u=None):
    a = None
    try:
        val_int = int(id_val)
        a = db.get(Application, val_int)
    except (ValueError, TypeError):
        pass
    if not a:
        a = db.query(Application).filter((Application.application_id == str(id_val)) | (Application.app_no == str(id_val))).first()
    if not a:
        raise HTTPException(404, "Application not found")
    if u:
        access.guard(u, a)
    return a

# ---------- dashboard & queue ----------
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), u=Depends(current_user)):
    apps = access.scoped(db, u).all(); ids = {a.id for a in apps}; c = lambda s: sum(1 for a in apps if a.status == s)
    chart = {}
    for a in apps: chart[a.status] = chart.get(a.status, 0) + 1
    ev = db.query(ReviewEvent).filter(ReviewEvent.application_id.in_(ids or [0])).order_by(ReviewEvent.at.desc()).limit(8).all()
    return {"total": len(apps), "pending": c("Pending Scrutiny"), "deficiencies": c("Potential Deficiencies"), "manual": c("Manual Review Required"), "completed": c("Scrutiny Completed"),
            "under_review": c("Under Official Review"), "chart": [{"status": k, "count": v} for k, v in chart.items()],
            "activity": [{"id": e.id, "app_no": (db.get(Application, e.application_id).app_no if e.application_id else "-"), "actor": e.actor, "action": e.action, "details": e.details, "at": iso(e.at)} for e in ev]}

@router.get("/filters")
def filters(db: Session = Depends(get_db), u=Depends(current_user)):
    apps = access.scoped(db, u).all()
    return {"years": sorted({a.academic_year for a in apps}), "categories": sorted({a.category for a in apps}), "statuses": sorted({a.status for a in apps}),
            "reviewers": sorted({a.reviewer.full_name for a in apps if a.reviewer} | {"Unassigned"}), "review_statuses": REVIEW_STATUSES, "officers": [{"id": o.id, "name": o.full_name} for o in db.query(DemoUser).filter_by(role="Scrutiny Officer")], "doc_types": DOC_TYPES}

@router.get("/applications")
def applications(q: str = "", year: str = "", category: str = "", status: str = "", reviewer: str = "", review_status: str = "", officer: int = 0, date_from: str = "", date_to: str = "", sort: str = "updated_at", dir: str = "desc", page: int = 1, size: int = 10,
                 db: Session = Depends(get_db), u=Depends(current_user)):
    rows = [app_row(db, a) for a in access.scoped(db, u).all()]
    ql = q.lower().strip()
    rows = [r for r in rows if (not ql or ql in r["app_no"].lower() or ql in r["institution"].lower() or ql in r["code"].lower()) and (not year or r["academic_year"] == year)
            and (not category or r["category"] == category) and (not status or r["status"] == status) and (not reviewer or r["reviewer"] == reviewer) and (not review_status or r["review_status"] == review_status)
            and (not officer or r["reviewer_id"] == officer) and (not date_from or r["submitted_on"] >= date_from) and (not date_to or r["submitted_on"] <= date_to)]
    if sort in (rows[0] if rows else {}): rows.sort(key=lambda r: (r[sort] is None, r[sort]), reverse=dir == "desc")
    size = max(1, min(size, 100)); total = len(rows)
    return {"total": total, "page": page, "size": size, "items": rows[(page - 1) * size: page * size]}

@router.get("/applications/{id}")
def application(id: str, db: Session = Depends(get_db), u=Depends(current_user)):
    a = get_app(db, id, u); row = app_row(db, a)
    numeric_id = a.id
    if not db.query(ReviewEvent).filter_by(application_id=numeric_id, action="Application opened for scrutiny", actor=u.full_name).filter(ReviewEvent.at > datetime.utcnow().replace(hour=0, minute=0, second=0)).first():
        audit.log(db, numeric_id, u.full_name, "Application opened for scrutiny"); db.commit()
    if u.id == a.reviewer_id and a.review_status == "Pending":
        a.review_status, a.review_started_at = "Under Review", datetime.utcnow()
        tracking.track(db, a, "Review started", u.full_name, "Pending", "Under Review", u.id, "Assigned officer opened the application"); audit.log(db, numeric_id, u.full_name, "Review status changed", "Pending -> Under Review"); db.commit(); row = app_row(db, a)
    
    i = a.institution
    ca = a.compliance_assessment
    total_approved_intake = sum(ic.approved_intake for ic in a.intake_capacities)
    prof_count = sum(1 for f in i.faculty_members if "PROFESSOR" in f.designation and "ASSOC" not in f.designation and "ASST" not in f.designation)
    assoc_count = sum(1 for f in i.faculty_members if "ASSOC" in f.designation)
    asst_count = sum(1 for f in i.faculty_members if "ASST" in f.designation)

    return {
        **row,
        "institution_detail": {
            "name": i.name,
            "code": i.aicte_permanent_id or i.code,
            "aicte_permanent_id": i.aicte_permanent_id,
            "address": i.address,
            "state": i.state,
            "aicte_region": i.aicte_region,
            "establishment_year": i.establishment_year,
            "approval_year_first": i.approval_year_first,
            "institution_type": i.institution_type,
            "location_classification": i.location_classification,
            "is_hilly_area": i.is_hilly_area,
            "affiliating_university": i.affiliating_university,
            "affiliating_board": i.affiliating_board,
            "naac_accredited": i.naac_accredited,
            "naac_score": i.naac_score,
            "nirf_ranked": i.nirf_ranked,
            "nirf_rank_band": i.nirf_rank_band,
            "autonomous_status": i.autonomous_status,
            "official_website": i.official_website,
            "official_email": i.official_email,
            "phone_number": i.phone_number,
            "completion_certificate_year": i.completion_certificate_year,
            "govt_building": i.govt_building
        },
        "compliance_assessment": {
            "assessment_id": ca.assessment_id,
            "overall_compliance_score": ca.overall_compliance_score,
            "compliance_category": ca.compliance_category,
            "critical_issues_count": ca.critical_issues_count,
            "major_issues_count": ca.major_issues_count,
            "minor_issues_count": ca.minor_issues_count,
            "missing_documents_count": ca.missing_documents_count,
            "overall_recommendation": ca.overall_recommendation,
            "speaking_order_summary": ca.speaking_order_summary,
            "generated_timestamp": iso(ca.generated_timestamp)
        } if ca else None,
        "cross_validations": [
            {
                "discrepancy_id": cv.discrepancy_id,
                "discrepancy_type": cv.discrepancy_type,
                "source_document_id_1": cv.source_document_id_1,
                "source_document_id_2": cv.source_document_id_2,
                "source_value_1": cv.source_value_1,
                "source_value_2": cv.source_value_2,
                "severity": cv.severity,
                "resolution_status": cv.resolution_status,
                "remarks": cv.remarks
            }
            for cv in a.cross_validations
        ],
        "intake_capacities": [
            {
                "intake_id": ic.intake_id,
                "course_id": ic.course_id,
                "academic_year": ic.academic_year,
                "shift_type": ic.shift_type,
                "division_count": ic.division_count,
                "intake_per_division": ic.intake_per_division,
                "approved_intake": ic.approved_intake,
                "applied_intake": ic.applied_intake,
                "tfw_supernumerary_seats": ic.tfw_supernumerary_seats,
                "fn_oci_ciwg_seats": ic.fn_oci_ciwg_seats,
                "lateral_entry_seats": ic.lateral_entry_seats,
                "working_prof_supernumerary_seats": ic.working_prof_supernumerary_seats,
                "enrolled_students_current_year": ic.enrolled_students_current_year
            }
            for ic in a.intake_capacities
        ],
        "faculty_summary": {
            "total_faculty": len(i.faculty_members),
            "phd_count": sum(1 for f in i.faculty_members if f.has_phd),
            "professors": prof_count,
            "associate_professors": assoc_count,
            "assistant_professors": asst_count,
            "prescribed_faculty": round(total_approved_intake * 0.2),
            "cadre_ratio": f"{prof_count}:{assoc_count}:{asst_count}",
            "biometric_enrolled": sum(1 for f in i.faculty_members if f.biometric_attendance_enrolled),
            "bank_ecs_verified": sum(1 for f in i.faculty_members if f.salary_payment_mode == "ECS_NATIONALIZED_BANK")
        },
        "payment_applicable": a.payment_applicable,
        "declared": a.declared,
        "checklist": checklist(db, a),
        "latest_run_id": (latest_run(db, numeric_id).id if latest_run(db, numeric_id) else None),
        "can_finalize": u.role in SENIOR
    }

@router.get("/reviewers")
def reviewers(db: Session = Depends(get_db), u=Depends(current_user)):
    return [user_out(x) for x in db.query(DemoUser).all() if x.role == "Scrutiny Officer"] if u.role != "Administrator" else [user_out(x) for x in db.query(DemoUser).filter(DemoUser.role.in_(["Scrutiny Officer", "Senior Reviewer"]))]

# ---------- documents ----------
@router.post("/applications/{id}/documents")
async def upload(id: str, doc_type: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db), u=Depends(current_user)):
    a = get_app(db, id, u)
    if doc_type not in DOC_TYPES: raise HTTPException(400, "Unknown document type")
    data = await file.read(); err = extract.validate_upload(file.filename or "", data)
    if err: raise HTTPException(400, err)
    d = extract.store_and_extract(db, a, doc_type, file.filename, data)
    audit.log(db, a.id, u.full_name, "Document uploaded", f"{DOC_TYPES[doc_type]}: {d.original_name} (SHA-256 {d.sha256[:12]}...)")
    audit.log(db, a.id, "System", "Extraction completed", f"{d.original_name}: {d.extraction_status}, {len(d.fields)} field(s)")
    if a.status == "Pending Scrutiny": a.status = "In Scrutiny"
    db.commit(); return doc_out(d)

@router.get("/documents/{id}/file")
def doc_file(id: int, db: Session = Depends(get_db), u=Depends(current_user)):
    d = db.get(Document, id)
    if not d: raise HTTPException(404)
    access.guard(u, d.application)
    p = UPLOAD_DIR / (d.stored_path or f"documents/{d.document_id}.pdf")
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        pdf_bytes = S.make_pdf(
            d.document_type.replace('_', ' ').title(),
            [
                f"Institution: {d.application.institution.name}",
                f"AICTE Permanent ID: {d.application.institution.aicte_permanent_id}",
                f"Document Type: {d.document_type}",
                f"Issuing Authority: {d.issuing_authority or 'State Competent Authority'}",
                f"Issue Date: {iso(d.issue_date) or '2023-08-15'}",
                f"Expiry Date: {iso(d.expiry_date) or '2027-03-31'}",
                f"Verification Status: {d.verification_status}",
                f"SHA-256 Checksum: {d.sha256_hash or d.sha256}",
            ],
            signature=True
        )
        p.write_bytes(pdf_bytes)
    return FileResponse(p, media_type="application/pdf", filename=d.original_name, content_disposition_type="inline")

@router.get("/documents")
def all_docs(db: Session = Depends(get_db), u=Depends(current_user)):
    return [{**doc_out(d), "app_id": d.application_id, "app_no": d.application.app_no, "institution": d.application.institution.name} for d in db.query(Document).filter_by(superseded=False).order_by(Document.uploaded_at.desc()) if u.role != "Scrutiny Officer" or d.application.reviewer_id == u.id]

@router.get("/documents/{id}/fields")
def doc_fields(id: int, db: Session = Depends(get_db), u=Depends(current_user)):
    d = db.get(Document, id)
    if not d: raise HTTPException(404)
    access.guard(u, d.application)
    ocr = db.query(OCRResult).filter_by(document_id=id).first()
    ocr_data = None
    if ocr:
        try:
            lines = json.loads(ocr.ocr_lines_json)
        except Exception:
            lines = []
        ocr_data = {
            "ocr_id": ocr.ocr_id,
            "confidence_score": ocr.confidence_score,
            "processing_time_ms": ocr.processing_time_ms,
            "quality_score": ocr.quality_score,
            "extracted_text": ocr.extracted_text,
            "lines": lines
        }
    return {
        "document": doc_out(d),
        "fields": [{"id": f.id, "name": f.name, "value": f.value, "corrected_value": f.corrected_value, "page": f.page, "confidence": f.confidence, "method": f.method} for f in d.fields],
        "pages": d.page_text,
        "ocr": ocr_data
    }

class FieldFix(BaseModel): value: str = Field(min_length=1, max_length=290)
@router.patch("/fields/{id}")
def fix_field(id: int, b: FieldFix, db: Session = Depends(get_db), u=Depends(current_user)):
    f = db.get(ExtractedField, id)
    if not f: raise HTTPException(404)
    access.guard(u, f.document.application)
    old = f.effective; f.corrected_value = b.value.strip()
    audit.log(db, f.document.application_id, u.full_name, "Extraction value corrected", f"{f.document.original_name} / {f.name}: '{old}' -> '{f.corrected_value}'"); db.commit(); return {"ok": True}

# ---------- scrutiny runs & findings ----------
def fnd_out(f, db):
    rv = f.rule_version
    return {"id": f.id, "code": f.code, "rule_code": f.rule_code, "rule_title": rv.rule.title if rv else "-", "check": f.check, "title": f.title, "status": f.status, "original_status": f.original_status, "severity": f.severity,
            "handbook_version": rv.handbook_version if rv else None, "clause": rv.clause if rv else None, "printed_page": rv.printed_page if rv else None, "rule_version": rv.version if rv else None, "source_text": rv.source_text if rv else None,
            "document_id": f.document_id, "document": f.document.original_name if f.document else None, "doc_page": f.doc_page, "extracted_value": f.extracted_value, "expected": f.expected, "reason": f.reason,
            "explanation": f.explanation, "confidence": f.confidence, "uncertainty": f.uncertainty, "next_action": f.next_action, "comments": f.comments, "override_reason": f.override_reason, "resolved_by": f.resolved_by}

@router.post("/applications/{id}/scrutiny/run")
def run(id: str, db: Session = Depends(get_db), u=Depends(current_user)):
    a = get_app(db, id, u); r = engine.run_scrutiny(db, a, u); db.commit(); return {"run_id": r.id, "run_no": r.run_no, "summary": r.summary}

@router.get("/applications/{id}/runs")
def runs(id: str, db: Session = Depends(get_db), u=Depends(current_user)):
    a = get_app(db, id, u)
    return [{"id": r.id, "run_no": r.run_no, "started_at": iso(r.started_at), "run_by": r.run_by, "summary": r.summary, "rules": r.rule_snapshot, "finalized": r.finalized, "finalized_by": r.finalized_by}
            for r in db.query(ScrutinyRun).filter_by(application_id=a.id).order_by(ScrutinyRun.run_no.desc())]

@router.get("/runs/{rid}/findings")
def findings(rid: int, db: Session = Depends(get_db), u=Depends(current_user)):
    r = db.get(ScrutinyRun, rid)
    if not r: raise HTTPException(404)
    access.guard(u, r.application)
    return [fnd_out(f, db) for f in r.findings]

def get_f(db, id, u=None):
    f = db.get(Finding, id)
    if not f: raise HTTPException(404)
    if u: access.guard(u, f.run.application)
    if f.run.finalized: raise HTTPException(409, "This run has been finalized and can no longer be edited. Rerun checks to create a new run.")
    return f

class Comment(BaseModel): text: str = Field(min_length=1, max_length=1000)
@router.post("/findings/{id}/comment")
def comment(id: int, b: Comment, db: Session = Depends(get_db), u=Depends(current_user)):
    f = get_f(db, id, u); f.comments = [*f.comments, {"by": u.full_name, "text": b.text.strip(), "at": iso(datetime.utcnow())}]
    audit.log(db, f.run.application_id, u.full_name, "Reviewer comment added", f"{f.code}: {b.text[:120]}"); db.commit(); return fnd_out(f, db)

class Reason(BaseModel): reason: str = Field(min_length=5, max_length=1000)
@router.post("/findings/{id}/resolve")
def resolve(id: int, b: Reason, db: Session = Depends(get_db), u=Depends(current_user)):
    f = get_f(db, id, u)
    if f.status not in ("Potential Deficiency", "Manual Review Required"): raise HTTPException(400, "Only open findings can be resolved")
    f.status, f.resolved_by = "Resolved", u.full_name; f.comments = [*f.comments, {"by": u.full_name, "text": "Resolved: " + b.reason.strip(), "at": iso(datetime.utcnow())}]
    audit.log(db, f.run.application_id, u.full_name, "Finding resolved", f"{f.code}: {b.reason[:120]}"); engine.recompute(db, f.run.application, f.run); db.commit(); return fnd_out(f, db)

class Override(BaseModel): reason: str = Field(min_length=10, max_length=1000); new_status: str
@router.post("/findings/{id}/override")
def override(id: int, b: Override, db: Session = Depends(get_db), u=Depends(require_roles(*SENIOR))):
    if b.new_status not in ("Pass", "Not Applicable", "Resolved"): raise HTTPException(400, "Override target must be Pass, Not Applicable or Resolved")
    f = get_f(db, id, u); old = f.status; f.status, f.override_reason, f.resolved_by = b.new_status, b.reason.strip(), u.full_name
    audit.log(db, f.run.application_id, u.full_name, "Manual override recorded", f"{f.code}: {old} -> {b.new_status}. Reason: {b.reason[:150]}"); engine.recompute(db, f.run.application, f.run); db.commit(); return fnd_out(f, db)

@router.post("/runs/{rid}/finalize")
def finalize(rid: int, db: Session = Depends(get_db), u=Depends(require_roles(*SENIOR))):
    r = db.get(ScrutinyRun, rid)
    if not r: raise HTTPException(404)
    access.guard(u, r.application)
    open_ = [f for f in r.findings if f.status in ("Potential Deficiency", "Manual Review Required")]
    r.finalized, r.finalized_by = True, u.full_name
    audit.log(db, r.application_id, u.full_name, "Scrutiny run finalized", f"Run #{r.run_no}; {len(open_)} open finding(s) recorded as potential deficiencies for report"); engine.recompute(db, r.application, r); db.commit(); return {"ok": True}

# ---------- reports ----------
@router.post("/applications/{id}/report")
def make_report(id: str, run_id: int = 0, db: Session = Depends(get_db), u=Depends(current_user)):
    a = get_app(db, id, u); r = db.get(ScrutinyRun, run_id) if run_id else latest_run(db, a.id)
    if not r or r.application_id != a.id: raise HTTPException(400, "Run scrutiny before generating a report")
    names = {d.id: d.original_name for d in a.documents}; label = "Final - Reviewed" if r.finalized else "Draft - For Official Review"
    fn = reportsvc.build_report(a, r, names, label, u); rep = Report(application_id=a.id, run_id=r.id, file_name=fn, status_label=label, generated_by=u.full_name); db.add(rep)
    audit.log(db, a.id, u.full_name, "Report generated", f"{fn} ({label})"); db.commit(); return {"id": rep.id, "file_name": fn, "status_label": label}

@router.get("/reports")
def reports(db: Session = Depends(get_db), u=Depends(current_user)):
    return [{"id": r.id, "app_no": db.get(Application, r.application_id).app_no, "app_id": r.application_id, "file_name": r.file_name, "status_label": r.status_label, "generated_at": iso(r.generated_at), "generated_by": r.generated_by,
             "run_no": db.get(ScrutinyRun, r.run_id).run_no} for r in db.query(Report).order_by(Report.generated_at.desc()) if u.role != "Scrutiny Officer" or db.get(Application, r.application_id).reviewer_id == u.id]

@router.get("/reports/{id}/download")
def dl_report(id: int, db: Session = Depends(get_db), u=Depends(current_user)):
    r = db.get(Report, id)
    if not r: raise HTTPException(404)
    a = db.get(Application, r.application_id)
    access.guard(u, a)
    # Ensure fresh, official report generation using the updated government format
    run = db.get(ScrutinyRun, r.run_id) if r.run_id else latest_run(db, a.id)
    names = {d.id: d.original_name for d in a.documents}
    label = r.status_label or ("Final - Reviewed" if (run and run.finalized) else "Draft - For Official Review")
    fn = reportsvc.build_report(a, run, names, label, u)
    if r.file_name != fn:
        r.file_name = fn
        db.commit()
    target_file = REPORT_DIR / fn
    return FileResponse(target_file, media_type="application/pdf", filename=fn)

# ---------- audit, rules, analytics ----------
@router.get("/audit")
def audit_list(application_id: str = "", limit: int = 200, db: Session = Depends(get_db), u=Depends(current_user)):
    q = db.query(ReviewEvent).order_by(ReviewEvent.at.desc())
    if application_id:
        a = get_app(db, application_id, u)
        q = q.filter_by(application_id=a.id)
    elif u.role == "Scrutiny Officer":
        q = q.filter(ReviewEvent.application_id.in_([a.id for a in access.scoped(db, u)] or [0]))
    return [{"id": e.id, "event_id": f"EVT-{e.id:05d}", "application_id": e.application_id, "app_no": db.get(Application, e.application_id).app_no if e.application_id else "-", "actor": e.actor, "action": e.action, "details": e.details, "at": iso(e.at)} for e in q.limit(limit)]

@router.get("/rules")
def rules(db: Session = Depends(get_db), u=Depends(current_user)):
    return [{"rule_id": rv.rule.rule_id, "title": rv.rule.title, "version": rv.version, "handbook_version": rv.handbook_version, "clause": rv.clause, "printed_page": rv.printed_page, "source_text": rv.source_text,
             "effective_ay": rv.effective_ay, "categories": rv.categories, "applicability": rv.applicability, "config": rv.config, "active": rv.active} for rv in db.query(RuleVersion).join(Rule).order_by(Rule.rule_id)]

@router.get("/analytics")
def analytics(db: Session = Depends(get_db), u=Depends(current_user)):
    by_rule, by_sev, by_cat = {}, {}, {}
    for a in access.scoped(db, u).all(): by_cat[a.category] = by_cat.get(a.category, 0) + 1
    for a in access.scoped(db, u).all():
        r = latest_run(db, a.id)
        if not r: continue
        for f in r.findings:
            if f.status in ("Potential Deficiency", "Manual Review Required"):
                by_rule[f.rule_code] = by_rule.get(f.rule_code, 0) + 1; by_sev[f.severity] = by_sev.get(f.severity, 0) + 1
    return {"by_rule": [{"rule": k, "count": v} for k, v in sorted(by_rule.items())], "by_severity": [{"severity": k, "count": v} for k, v in by_sev.items()], "by_category": [{"category": k, "count": v} for k, v in by_cat.items()]}

@router.get("/meta")
def meta(): return {"notice": DEMO_NOTICE, "handbook": "AICTE Approval Process Handbook 2024-2027"}
