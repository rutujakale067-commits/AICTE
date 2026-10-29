"""End-to-end API test. Run from backend/:  python -m app.seed && python -m pytest -q"""
from fastapi.testclient import TestClient
from app.main import app
from app.services import samples as S
c = TestClient(app)
def hdr(u, p): return {"Authorization": "Bearer " + c.post("/api/auth/login", json={"username": u, "password": p}).json()["token"]}
def test_full_workflow():
    assert c.get("/api/applications").status_code == 401
    H, SR = hdr("officer", "Officer@123"), hdr("senior", "Senior@123")
    assert c.get("/api/dashboard", headers=H).json()["total"] >= 5
    pdf = S.make_pdf("Sat", ["Institution: Demo Polytechnic Institute", "Latitude: 22.3", "Longitude: 73.2"], map_box=True)
    assert c.post("/api/applications/3/documents", headers=H, data={"doc_type": "satellite_map"}, files={"file": ("m.pdf", pdf, "application/pdf")}).status_code == 200
    assert c.post("/api/applications/3/documents", headers=H, data={"doc_type": "satellite_map"}, files={"file": ("x.exe", b"MZ", "application/pdf")}).status_code == 400
    run = c.post("/api/applications/3/scrutiny/run", headers=H).json()
    fs = c.get(f"/api/runs/{run['run_id']}/findings", headers=H).json(); open_ = [f for f in fs if f["status"] == "Potential Deficiency"]
    assert open_ and all(f["rule_code"] for f in fs)
    assert c.post(f"/api/findings/{open_[0]['id']}/override", headers=H, json={"reason": "not allowed for officer", "new_status": "Resolved"}).status_code == 403
    assert c.post(f"/api/findings/{open_[0]['id']}/override", headers=SR, json={"reason": "short", "new_status": "Resolved"}).status_code == 422
    assert c.post(f"/api/findings/{open_[0]['id']}/resolve", headers=H, json={"reason": "verified offline"}).json()["status"] == "Resolved"
    rep = c.post("/api/applications/3/report", headers=H).json(); assert "Draft" in rep["status_label"]
    assert c.get(f"/api/reports/{rep['id']}/download", headers=H).content.startswith(b"%PDF")
    assert any(e["action"] == "Report generated" for e in c.get("/api/audit?application_id=3", headers=H).json())
