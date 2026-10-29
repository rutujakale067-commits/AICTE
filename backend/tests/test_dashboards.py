"""Role-based dashboards, tracking and access control. Run from backend/: python -m app.seed && python -m pytest -q"""
from fastapi.testclient import TestClient
from app.main import app
c = TestClient(app)
def hdr(u, p): return {"Authorization": "Bearer " + c.post("/api/auth/login", json={"username": u, "password": p}).json()["token"]}
def test_admin_officer_dashboards_and_tracking():
    A, O1, O2 = hdr("admin", "Admin@123"), hdr("officer", "Officer@123"), hdr("officer2", "Officer@123")
    ov = c.get("/api/admin/overview", headers=A).json()
    assert ov["total"] == sum(ov[k] for k in ("pending", "under_review", "approved", "rejected", "returned"))        # counts are consistent
    assert sum(o["assigned"] for o in ov["officers"]) + ov["unassigned_count"] == ov["total"]
    mine = c.get("/api/officer/overview", headers=O1).json()
    assert mine["assigned"] == c.get("/api/applications?size=100", headers=O1).json()["total"] == next(o for o in ov["officers"] if o["name"] == mine["officer"]["name"])["assigned"]
    assert c.get("/api/admin/overview", headers=O1).status_code == 403                                           # role separation
    other = next(a for a in c.get("/api/applications?size=100", headers=A).json()["items"] if a["reviewer"] == "Demo Officer B")["id"]
    assert c.get(f"/api/applications/{other}", headers=O1).status_code == 403                                   # no access to other officer's application
    assert c.get(f"/api/applications/{other}", headers=O2).status_code == 200
    un = ov["unassigned"][0]["id"]
    assert c.post(f"/api/applications/{un}/assign", headers=A, json={"officer_id": 1}).status_code == 200
    assert c.post(f"/api/applications/{un}/assign", headers=O1, json={"officer_id": 1}).status_code == 403
    assert c.get("/api/officer/overview", headers=O1).json()["assigned"] == mine["assigned"] + 1               # counts update automatically
    assert c.get(f"/api/applications/{un}", headers=O1).json()["review_status"] == "Under Review"                # review started on open
    assert c.post(f"/api/applications/{un}/review-status", headers=O1, json={"status": "Approved", "remark": "approve now"}).status_code == 409  # no run yet
    assert c.post(f"/api/applications/{un}/review-status", headers=O1, json={"status": "Returned for Correction", "remark": "Documents not uploaded"}).status_code == 200
    ov2 = c.get("/api/admin/overview", headers=A).json(); assert ov2["returned"] == ov["returned"] + 1 and ov2["unassigned_count"] == ov["unassigned_count"] - 1
    t = c.get(f"/api/applications/{un}/tracking", headers=A).json()
    assert [e["event"] for e in t["events"]] == ["Submitted", "Assigned", "Review started", "Status changed"]
    assert c.get("/api/officers/1", headers=O2).status_code == 403 and c.get("/api/officers/1?status=Returned for Correction", headers=A).json()["applications"]
