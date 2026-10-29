"""Application tracking, review-status workflow, admin overview and officer monitoring."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import *
from ..services import audit, access, tracking
from ..services.auth import current_user, require_roles
from .api import app_row, get_app, latest_run, iso, REVIEW_STATUSES

router = APIRouter(prefix="/api")
OVERSIGHT = access.OVERSIGHT

def ev_out(t):
    return {"id": t.id, "event": t.event, "from_status": t.from_status, "to_status": t.to_status, "officer": t.officer.full_name if t.officer else None, "officer_id": t.officer_id, "actor": t.actor, "remark": t.remark, "at": iso(t.at)}
def officer_out(db, o):
    apps = db.query(Application).filter_by(reviewer_id=o.id).all()
    return {"id": o.id, "name": o.full_name, "designation": o.designation, "employee_id": o.employee_id, "role": o.role, **tracking.stats(apps)}

# ---------- tracking history ----------
@router.get("/applications/{id}/tracking")
def app_tracking(id: int, db: Session = Depends(get_db), u=Depends(current_user)):
    a = get_app(db, id, u)
    ev = db.query(ApplicationTracking).filter_by(application_id=id).order_by(ApplicationTracking.at, ApplicationTracking.id).all()
    return {"review_status": a.review_status, "reviewer": a.reviewer.full_name if a.reviewer else None, "submitted_at": iso(a.submitted_at), "assigned_at": iso(a.assigned_at),
            "review_started_at": iso(a.review_started_at), "decided_at": iso(a.decided_at), "updated_at": iso(a.updated_at), "events": [ev_out(t) for t in ev]}

# ---------- assignment (administrator only) ----------
class Assign(BaseModel): officer_id: int; remark: str = ""
@router.post("/applications/{id}/assign")
def assign(id: int, b: Assign, db: Session = Depends(get_db), u=Depends(require_roles("Administrator"))):
    a = get_app(db, id); o = db.get(DemoUser, b.officer_id)
    if not o or o.role not in ("Scrutiny Officer", "Senior Reviewer"): raise HTTPException(400, "Applications can only be assigned to a Scrutiny Officer or Senior Reviewer")
    if a.review_status in ("Approved", "Rejected"): raise HTTPException(409, "A decided application cannot be reassigned")
    if a.reviewer_id == o.id: raise HTTPException(400, "Application is already assigned to this officer")
    prev = a.reviewer; a.reviewer_id, a.assigned_at = o.id, datetime.utcnow()
    tracking.track(db, a, "Reassigned" if prev else "Assigned", u.full_name, None, None, o.id, b.remark or (f"From {prev.full_name}" if prev else ""), a.assigned_at)
    audit.log(db, id, u.full_name, "Officer assigned", f"{prev.full_name + ' -> ' if prev else ''}{o.full_name}"); db.commit(); return {"ok": True}

# ---------- review status (officer decision; never made by the AI) ----------
FLOW = {"Pending": {"Under Review"}, "Under Review": {"Approved", "Rejected", "Returned for Correction"}, "Returned for Correction": {"Under Review"}, "Approved": set(), "Rejected": set()}
class RS(BaseModel): status: str; remark: str = Field(default="", max_length=1000)
@router.post("/applications/{id}/review-status")
def set_review(id: int, b: RS, db: Session = Depends(get_db), u=Depends(current_user)):
    a = get_app(db, id, u)
    if u.role == "Administrator": raise HTTPException(403, "Administrators monitor and assign; review decisions are recorded by the assigned officer or a Senior Reviewer.")
    if b.status not in REVIEW_STATUSES: raise HTTPException(400, "Unknown review status")
    if not a.reviewer_id: raise HTTPException(400, "Application is not assigned to an officer yet")
    old = a.review_status; reopen = old in ("Approved", "Rejected") and b.status == "Under Review"
    if reopen and u.role != "Senior Reviewer": raise HTTPException(403, "Only a Senior Reviewer can reopen a decided application")
    if b.status not in FLOW[old] and not reopen: raise HTTPException(409, f"Cannot move from '{old}' to '{b.status}'")
    if b.status in ("Approved", "Rejected", "Returned for Correction", "Under Review") and old != "Pending" and len(b.remark.strip()) < 5: raise HTTPException(422, "A remark of at least 5 characters is required")
    if b.status == "Approved":
        r = latest_run(db, id)
        if not r: raise HTTPException(409, "Run scrutiny checks before approving")
        open_ = [f for f in r.findings if f.status in ("Potential Deficiency", "Manual Review Required")]
        if open_: raise HTTPException(409, f"{len(open_)} finding(s) in the latest run are still open. Resolve or override them (with reasons) before approving.")
    now = datetime.utcnow(); a.review_status = b.status
    if b.status == "Under Review" and not a.review_started_at: a.review_started_at = now
    a.decided_at = now if b.status in ("Approved", "Rejected", "Returned for Correction") else None
    tracking.track(db, a, "Reopened" if reopen else "Status changed", u.full_name, old, b.status, a.reviewer_id, b.remark.strip(), now)
    audit.log(db, id, u.full_name, "Review status changed", f"{old} -> {b.status}. {b.remark[:150]}"); db.commit(); return app_row(db, a)

# ---------- dashboards ----------
@router.get("/officer/overview")
def officer_overview(db: Session = Depends(get_db), u=Depends(current_user)):
    apps = db.query(Application).filter_by(reviewer_id=u.id).all()
    return {"officer": {"id": u.id, "name": u.full_name, "designation": u.designation, "employee_id": u.employee_id}, **tracking.stats(apps)}
@router.get("/admin/overview")
def admin_overview(db: Session = Depends(get_db), u=Depends(require_roles(*OVERSIGHT))):
    apps = db.query(Application).all(); st = tracking.stats(apps); un = [a for a in apps if not a.reviewer_id]
    officers = [officer_out(db, o) for o in db.query(DemoUser).filter(DemoUser.role == "Scrutiny Officer").order_by(DemoUser.full_name)]
    return {"total": len(apps), "unassigned_count": len(un), "pending": st["pending"], "under_review": st["under_review"], "approved": st["approved"], "rejected": st["rejected"], "returned": st["returned"],
            "unassigned": [app_row(db, a) for a in un], "officers": officers, "can_assign": u.role == "Administrator"}
@router.get("/officers/{oid}")
def officer_detail(oid: int, status: str = "", date_from: str = "", date_to: str = "", db: Session = Depends(get_db), u=Depends(current_user)):
    if u.role == "Scrutiny Officer" and u.id != oid: raise HTTPException(403, "Officers can only view their own review history")
    o = db.get(DemoUser, oid)
    if not o: raise HTTPException(404, "Officer not found")
    apps = [app_row(db, a) for a in db.query(Application).filter_by(reviewer_id=oid).order_by(Application.updated_at.desc())]
    apps = [r for r in apps if (not status or r["review_status"] == status) and (not date_from or r["submitted_on"] >= date_from) and (not date_to or r["submitted_on"] <= date_to)]
    ev = db.query(ApplicationTracking).filter_by(officer_id=oid).order_by(ApplicationTracking.at.desc()).all()
    ev = [{**ev_out(t), "app_no": db.get(Application, t.application_id).app_no, "app_id": t.application_id} for t in ev if (not date_from or iso(t.at)[:10] >= date_from) and (not date_to or iso(t.at)[:10] <= date_to)]
    return {"officer": officer_out(db, o), "applications": apps, "history": ev}
