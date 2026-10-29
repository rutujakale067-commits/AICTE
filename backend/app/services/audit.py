from ..models import ReviewEvent
def log(db, app_id, actor, action, details=""):
    ev = ReviewEvent(application_id=app_id, actor=actor, action=action, details=details); db.add(ev); return ev
