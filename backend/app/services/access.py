"""Role-based access: officers only see applications assigned to them; Senior Reviewers and Administrators have oversight."""
from fastapi import HTTPException
from ..models import Application
OVERSIGHT = ("Administrator", "Senior Reviewer")
def guard(u, app):
    if u.role == "Scrutiny Officer" and app.reviewer_id != u.id:
        raise HTTPException(403, "This application is assigned to another officer.")
def scoped(db, u):
    q = db.query(Application)
    return q.filter(Application.reviewer_id == u.id) if u.role == "Scrutiny Officer" else q
