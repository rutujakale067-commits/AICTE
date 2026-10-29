from datetime import datetime
from ..models import ApplicationTracking
def track(db, app, event, actor, frm=None, to=None, officer_id=None, remark="", at=None):
    at = at or datetime.utcnow(); app.updated_at = at
    t = ApplicationTracking(application_id=app.id, event=event, from_status=frm, to_status=to, officer_id=officer_id, actor=actor, remark=remark, at=at); db.add(t); return t
def stats(apps):
    c = lambda s: sum(1 for a in apps if a.review_status == s)
    d = dict(assigned=len(apps), pending=c("Pending"), under_review=c("Under Review"), approved=c("Approved"), rejected=c("Rejected"), returned=c("Returned for Correction"))
    d["reviewed"] = d["approved"] + d["rejected"] + d["returned"]   # decision recorded
    d["awaiting"] = d["pending"] + d["under_review"]
    return d
