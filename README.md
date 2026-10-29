# AICTE VerifyAI — Official Scrutiny Portal (SIH demonstration prototype)

> **SIH Demonstration Prototype — Not an Official AICTE Service.** All institutions, certificates and users are fictional. The demo login is **not** a production government identity system. The system flags *potential* deficiencies; it never grants or rejects approval.

AI-assisted scrutiny of Extension of Approval (EoA) applications for AICTE officials: PDF ingestion → text/OCR extraction → configurable handbook rules → evidence-linked findings → official review → PDF report → audit trail.
Handbook used: **AICTE Approval Process Handbook 2024-2027** (printed page = PDF page − 16).

## Structure
```
backend/  app/{main,config,database,seed}.py  models/  routers/api.py  services/{extract,engine,explain,report,auth,audit,samples}.py  rules/handbook_rules.py  tests/
frontend/ src/{components,pages,layouts,services,hooks,types}
sample_data/  synthetic PDFs per application (created by the seed)
```

## Setup (Python 3.10+, Node 18+)
```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed                                        # creates SQLite DB + synthetic PDFs (re-run to reset)
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev                 # http://localhost:5173 (proxies /api to :8000)
```
Optional OCR fallback: install the Tesseract binary (`sudo apt install tesseract-ocr` / Windows installer). Without it, scanned PDFs are flagged *Unreadable → Manual Review*. Env vars: `VERIFYAI_SECRET`, `VERIFYAI_DB_URL`, `VERIFYAI_MAX_UPLOAD_MB`. A random JWT secret is generated into `backend/.jwt_secret` on first run.

## Demo logins
| User | Password | Role |
|---|---|---|
| officer / officer2 / officer3 | Officer@123 | Scrutiny Officers A / B / C |
| senior | Senior@123 | Senior Reviewer (can override + finalize) |
| admin | Admin@123 | Administrator |

## Application tracking and role-based dashboards
- **Two statuses per application:** *Review status* (human workflow: Pending, Under Review, Approved, Rejected, Returned for Correction) and *Scrutiny status* (machine result of the rule checks). Only a person changes the review status; the AI never approves or rejects.
- **Tracking history** (`application_tracking` table): Submitted, Assigned/Reassigned, Review started, every status change, each with actor, remark and timestamp. Shown in the application's *Tracking History* tab; every action is also in the audit log.
- **Administrator dashboard** (`/api/admin/overview`): totals by status, unassigned applications (with Assign control), per-officer workload and progress charts, officer monitoring table (click an officer for their applications and review history, with status/date filters), and a searchable, filterable table of all applications.
- **Officer dashboard** (`/api/officer/overview`): only the logged-in officer's counts (assigned, pending, under review, completed = decision recorded, approved, rejected, returned) and assigned applications.
- Counts are computed live from the SQL database; nothing is hard-coded. Officers get HTTP 403 for other officers' applications, documents, runs, findings, reports and audit events. Senior Reviewers and Administrators have oversight access. Only an Administrator assigns; only the assigned officer (or a Senior Reviewer) records review decisions; **Approved is blocked while findings in the latest run are open**; approved/rejected applications can be reopened only by a Senior Reviewer with a remark.
- Demo flow: `admin` (totals, per-officer counts, assign DEMO-EOA-011) → `officer` (own count rises, open application, *Update review status*) → `admin` again (statistics changed; open *Tracking History*).

## Rules implemented (checklist from the handbook)
Annexure-2 §2.1 (printed p.81) items i–vii, Clause 2.3.4 (p.15) for DSC/upload context, Clause 6.17(g)(h)(i) (pp.56-57) for occupancy/structural (valid 5 years, needed when building > 30 years from Completion Certificate)/fire. Each rule stores clause, printed page, source text, effective AYs, version and config in `rules`/`rule_versions`. Rules marked *internal* (name/cert-number consistency, readability) are prototype checks, **not** handbook clauses. Other EoA categories (e.g. Change of Site, which needs Annexure-1 documents) are deliberately unconfigured → *Manual Review Required*.

## Testing
```bash
cd backend && python -m app.seed && python -m pytest -q    # API workflow test
cd frontend && npm run build                               # type-check + bundle
```

## Judging demo script (≈5 min)
1. Sign in as `officer`; show dashboard cards, status chart, filters/search (try "EOA-001", status = Potential Deficiencies).
2. Open **DEMO-EOA-001** → *Required Documents*: structural certificate applies (Completion Certificate 1985); fire/structural certificates expired; satellite map missing.
3. *AI Verification Findings*: open an expired-certificate finding → rule, clause, printed page, extracted value vs expected, uncertainty; click the evidence link to open the PDF at that page.
4. Show name-mismatch / certificate-number mismatch findings; correct an extracted field (Documents → Extracted fields), **Rerun checks**, compare Run #1 vs #2 in the run selector.
5. Upload `sample_data/DEMO-EOA-002/…` or any PDF into DEMO-EOA-003 (e.g. a satellite map) → extraction → run checks.
6. Add a comment, **Mark resolved**; try override as officer (blocked), then as `senior` (reason mandatory).
7. **Generate PDF report** (labelled "Draft — For Official Review"); finalize as senior → report becomes "Final - Reviewed".
8. Show *Audit Trail* and *DEMO-EOA-006* (scanned fire certificate processed via OCR).

## Known limitations
- Digital signatures: only embedded PDF signature fields are detected; cryptographic/DSC validity is **not** verified. Date checks do not prove authenticity.
- "Previous year" for audited accounts is interpreted as the financial year before the academic year (configurable in code).
- Extraction is label-based (`Label: value`); free-form real certificates need richer extraction. Confidence for text-layer matches is a fixed heuristic (0.90), for OCR the engine's mean word confidence.
- Building age uses the Completion Certificate *year* only; exactly-30-years is sent to manual review. Government-building (>50 years) letter exception is not automated.
- No LLM is used; `services/explain.py` is the interface where one could be added with the rule-based fallback.
- SQLite, local file storage, no HTTPS/rate limiting. Browser opens evidence via blob URL with `#page=N` (works in Chrome/Edge/Firefox PDF viewers).
