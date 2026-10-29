"""
AICTE Extension of Approval (EoA) Scrutiny Portal Seeder
Populates the database from the official synthetic 3NF dataset in data/:
 - institutions.csv (50 institutions)
 - applications.csv (100 applications)
 - intake_capacities.csv (504 courses)
 - faculty.csv (8,860 faculty records)
 - document_metadata.csv (594 documents)
 - ocr_results_sample.csv (50 OCR text & bounding box records)
 - cross_document_validations.csv (72 cross-document discrepancy records)
 - compliance_assessments.csv (100 automated compliance scores & speaking orders)
"""

import csv
import json
import logging
from datetime import date, datetime, timedelta
from pathlib import Path

from .database import Base, engine, SessionLocal
from .models import (
    DemoUser, Institution, Application, IntakeCapacity, Faculty,
    Document, OCRResult, CrossDocumentValidation, ComplianceAssessment,
    ExtractedField, Rule, RuleVersion, ScrutinyRun, Finding,
    ReviewEvent, ApplicationTracking
)
from .rules.handbook_rules import RULES
from .services import auth, tracking as trk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

def parse_date(val: str) -> date | None:
    if not val:
        return None
    val = val.strip()
    try:
        if "T" in val:
            return datetime.fromisoformat(val).date()
        return datetime.strptime(val[:10], "%Y-%m-%d").date()
    except Exception:
        return None

def parse_datetime(val: str) -> datetime | None:
    if not val:
        return None
    val = val.strip()
    try:
        return datetime.fromisoformat(val)
    except Exception:
        try:
            return datetime.strptime(val[:19], "%Y-%m-%d %H:%M:%S")
        except Exception:
            return None

def parse_bool(val: str) -> bool:
    if not val:
        return False
    return val.strip().lower() in ("true", "1", "t", "yes")

def parse_float(val: str, default: float = 0.0) -> float:
    if not val:
        return default
    try:
        return float(val.strip())
    except Exception:
        return default

def parse_int(val: str, default: int = 0) -> int:
    if not val:
        return default
    try:
        return int(float(val.strip()))
    except Exception:
        return default

from .config import DB_URL, BASE_DIR
import sqlalchemy as sa

def seed():
    logger.info("Initializing database schema...")
    db_file = BASE_DIR / "verifyai.db"
    if db_file.exists():
        try:
            db_file.unlink()
        except Exception as e:
            logger.warning(f"Could not remove existing db file: {e}")

    try:
        with engine.connect() as conn:
            conn.execute(sa.text("PRAGMA foreign_keys=OFF;"))
            conn.commit()
    except Exception:
        pass

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()

    logger.info("Seeding administrative & scrutiny officers...")
    users = [
        DemoUser(username="officer", full_name="Dr. S. K. Sharma", role="Scrutiny Officer", designation="Senior Scrutiny Officer", employee_id="AICTE-SO-101", password_hash=auth.hash_pw("Officer@123")),
        DemoUser(username="officer2", full_name="Dr. Anita Desai", role="Scrutiny Officer", designation="Assistant Director (Approval)", employee_id="AICTE-AD-102", password_hash=auth.hash_pw("Officer@123")),
        DemoUser(username="officer3", full_name="Prof. R. C. Verma", role="Scrutiny Officer", designation="Deputy Director (EoA)", employee_id="AICTE-DD-103", password_hash=auth.hash_pw("Officer@123")),
        DemoUser(username="senior", full_name="Dr. K. Ramamurthy", role="Senior Reviewer", designation="Joint Director (Regional Officer)", employee_id="AICTE-RO-201", password_hash=auth.hash_pw("Senior@123")),
        DemoUser(username="admin", full_name="Member Secretary AICTE", role="Administrator", designation="Advisor & Member Secretary", employee_id="AICTE-HQ-001", password_hash=auth.hash_pw("Admin@123")),
    ]
    db.add_all(users)
    db.flush()
    officers = [users[0], users[1], users[2]]
    admin_user = users[4]

    logger.info("Seeding AICTE Approval Process Handbook (APH) rule definitions...")
    for r in RULES:
        rule = Rule(rule_id=r["rule_id"], title=r["title"], doc_type=r["doc_type"])
        db.add(rule)
        db.flush()
        db.add(RuleVersion(
            rule_id_fk=rule.id,
            version=r["version"],
            handbook_version=r["handbook_version"],
            clause=r["clause"],
            printed_page=r["printed_page"],
            source_text=r["source_text"],
            effective_ay=r["effective_ay"],
            categories=r["categories"],
            applicability=r["applicability"],
            config=r["config"]
        ))
    db.flush()

    # 1. Institutions
    logger.info("Ingesting institutions.csv...")
    inst_uuid_to_id = {}
    inst_objs = []
    with open(DATA_DIR / "institutions.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            est_yr = parse_int(row.get("establishment_year"))
            # synthesize realistic address and state from affiliating board / region
            region = row.get("aicte_region", "WESTERN").replace("_", " ").title()
            board = row.get("affiliating_board", "")
            state = "Maharashtra"
            if "PUNJAB" in board: state = "Punjab"
            elif "KARNATAKA" in board: state = "Karnataka"
            elif "TAMIL NADU" in board: state = "Tamil Nadu"
            elif "TELANGANA" in board: state = "Telangana"
            elif "KERALA" in board: state = "Kerala"
            elif "GUJARAT" in board: state = "Gujarat"
            elif "RAJASTHAN" in board: state = "Rajasthan"
            elif "DELHI" in board or "NORTH" in region: state = "Delhi NCR"
            
            addr = f"Campus Sector {est_yr % 25 + 1}, Institutional Area, {row.get('location_classification', 'URBAN').title()} Zone"

            inst = Institution(
                institution_id=row["institution_id"],
                aicte_permanent_id=row["aicte_permanent_id"],
                code=row["aicte_permanent_id"],
                trust_id=row.get("trust_id") or None,
                name=row["name"],
                category=row.get("category", "SELF_FINANCING_PRIVATE"),
                institution_type=row.get("institution_type", "CO_ED"),
                establishment_year=est_yr,
                approval_year_first=parse_int(row.get("approval_year_first")),
                aicte_region=row.get("aicte_region"),
                location_classification=row.get("location_classification"),
                is_hilly_area=parse_bool(row.get("is_hilly_area")),
                affiliating_university=row.get("affiliating_university") or None,
                affiliating_board=row.get("affiliating_board") or None,
                naac_accredited=parse_bool(row.get("naac_accredited")),
                naac_score=parse_float(row.get("naac_score")) if row.get("naac_score") else None,
                nirf_ranked=parse_bool(row.get("nirf_ranked")),
                nirf_rank_band=row.get("nirf_rank_band") or None,
                autonomous_status=parse_bool(row.get("autonomous_status")),
                official_website=row.get("official_website") or None,
                official_email=row.get("official_email") or None,
                phone_number=row.get("phone_number") or None,
                address=addr,
                state=state,
                completion_certificate_year=est_yr,
                govt_building=row.get("category") not in ("SELF_FINANCING_PRIVATE", None)
            )
            inst_objs.append(inst)
    db.add_all(inst_objs)
    db.flush()
    for inst in inst_objs:
        inst_uuid_to_id[inst.institution_id] = inst.id

    # 2. Applications
    logger.info("Ingesting applications.csv...")
    app_uuid_to_id = {}
    app_objs = []
    with open(DATA_DIR / "applications.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            inst_id = inst_uuid_to_id[row["institution_id"]]
            sub_dt = parse_datetime(row.get("submission_timestamp")) or datetime.utcnow()
            proc_status = row.get("processing_status", "APPROVED_EOA")
            
            # Map processing_status to human review statuses
            if proc_status == "APPROVED_EOA":
                rev_st = "Approved"
                scr_st = "Scrutiny Completed"
            elif proc_status == "DEFICIENCY_COMMUNICATED":
                rev_st = "Returned for Correction"
                scr_st = "Potential Deficiencies"
            elif proc_status == "SHC_REFERRED":
                rev_st = "Rejected"
                scr_st = "Potential Deficiencies"
            else:
                rev_st = "Under Review"
                scr_st = "In Scrutiny"

            # Assign officer cyclically
            officer = officers[idx % len(officers)]
            
            app = Application(
                application_id=row["application_id"],
                app_no=row["application_number"],
                application_number=row["application_number"],
                institution_id=inst_id,
                institution_uuid=row["institution_id"],
                academic_year=row.get("academic_year", "2024-25"),
                application_type=row.get("application_type", "EOA_SELF_DISCLOSURE"),
                category=row.get("application_type", "EOA_SELF_DISCLOSURE").replace("_", " "),
                ter_charges_in_lakhs=parse_float(row.get("ter_charges_in_lakhs")),
                ter_transaction_id=row.get("ter_transaction_id") or None,
                ter_payment_status=row.get("ter_payment_status", "PAID"),
                submission_timestamp=sub_dt,
                submitted_on=sub_dt.date(),
                processing_status=proc_status,
                is_multi_year_eligible=parse_bool(row.get("is_multi_year_eligible")),
                multi_year_duration_years=parse_int(row.get("multi_year_duration_years"), 1),
                reviewer_id=officer.id,
                status=scr_st,
                review_status=rev_st,
                payment_applicable=True,
                declared={"submission_mode": "Self-Disclosure Portal", "ter_ref": row.get("ter_transaction_id", "")},
                submitted_at=sub_dt,
                assigned_at=sub_dt + timedelta(hours=18),
                review_started_at=sub_dt + timedelta(days=2, hours=4),
                decided_at=(sub_dt + timedelta(days=6, hours=2)) if rev_st in ("Approved", "Rejected", "Returned for Correction") else None,
                updated_at=(sub_dt + timedelta(days=6, hours=2)) if rev_st in ("Approved", "Rejected", "Returned for Correction") else (sub_dt + timedelta(days=2, hours=4))
            )
            app_objs.append(app)
    db.add_all(app_objs)
    db.flush()
    for app in app_objs:
        app_uuid_to_id[app.application_id] = app.id

    # 3. Compliance Assessments
    logger.info("Ingesting compliance_assessments.csv...")
    comp_objs = []
    with open(DATA_DIR / "compliance_assessments.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["application_id"] not in app_uuid_to_id:
                continue
            app_id = app_uuid_to_id[row["application_id"]]
            gen_dt = parse_datetime(row.get("generated_timestamp")) or datetime.utcnow()
            comp = ComplianceAssessment(
                assessment_id=row["assessment_id"],
                application_id=app_id,
                application_uuid=row["application_id"],
                overall_compliance_score=parse_float(row.get("overall_compliance_score")),
                compliance_category=row.get("compliance_category", "FULLY_COMPLIANT"),
                critical_issues_count=parse_int(row.get("critical_issues_count")),
                major_issues_count=parse_int(row.get("major_issues_count")),
                minor_issues_count=parse_int(row.get("minor_issues_count")),
                missing_documents_count=parse_int(row.get("missing_documents_count")),
                overall_recommendation=row.get("overall_recommendation", "RECOMMENDED"),
                speaking_order_summary=row.get("speaking_order_summary", ""),
                generated_timestamp=gen_dt
            )
            comp_objs.append(comp)
    db.add_all(comp_objs)
    db.flush()

    # 4. Intake Capacities
    logger.info("Ingesting intake_capacities.csv...")
    intake_objs = []
    with open(DATA_DIR / "intake_capacities.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["application_id"] not in app_uuid_to_id:
                continue
            app_id = app_uuid_to_id[row["application_id"]]
            intake = IntakeCapacity(
                intake_id=row["intake_id"],
                application_id=app_id,
                application_uuid=row["application_id"],
                course_id=row.get("course_id") or None,
                academic_year=row.get("academic_year", "2024-25"),
                shift_type=row.get("shift_type", "REGULAR"),
                division_count=parse_int(row.get("division_count"), 1),
                intake_per_division=parse_int(row.get("intake_per_division"), 60),
                approved_intake=parse_int(row.get("approved_intake"), 60),
                applied_intake=parse_int(row.get("applied_intake"), 60),
                tfw_supernumerary_seats=parse_int(row.get("tfw_supernumerary_seats")),
                fn_oci_ciwg_seats=parse_int(row.get("fn_oci_ciwg_seats")),
                lateral_entry_seats=parse_int(row.get("lateral_entry_seats")),
                working_prof_supernumerary_seats=parse_int(row.get("working_prof_supernumerary_seats")),
                enrolled_students_current_year=parse_int(row.get("enrolled_students_current_year"))
            )
            intake_objs.append(intake)
    db.add_all(intake_objs)
    db.flush()

    # 5. Faculty (8,860 rows - bulk insert)
    logger.info("Ingesting faculty.csv (8,860 records)...")
    faculty_batch = []
    with open(DATA_DIR / "faculty.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["institution_id"] not in inst_uuid_to_id:
                continue
            inst_id = inst_uuid_to_id[row["institution_id"]]
            f_obj = Faculty(
                faculty_id=row["faculty_id"],
                institution_id=inst_id,
                institution_uuid=row["institution_id"],
                course_id=row.get("course_id") or None,
                aicte_faculty_id=row.get("aicte_faculty_id", ""),
                full_name=row.get("full_name", ""),
                gender=row.get("gender") or None,
                date_of_birth=parse_date(row.get("date_of_birth")),
                designation=row.get("designation", "ASSISTANT_PROFESSOR"),
                cadre_type=row.get("cadre_type", "REGULAR"),
                highest_qualification=row.get("highest_qualification", "POST_GRADUATE"),
                has_phd=parse_bool(row.get("has_phd")),
                phd_specialization=row.get("phd_specialization") or None,
                pan_number=row.get("pan_number") or None,
                is_aadhaar_seeded=parse_bool(row.get("is_aadhaar_seeded")),
                biometric_attendance_enrolled=parse_bool(row.get("biometric_attendance_enrolled")),
                salary_payment_mode=row.get("salary_payment_mode", "ECS_NATIONALIZED_BANK"),
                gross_salary_monthly=parse_float(row.get("gross_salary_monthly")),
                appointment_date=parse_date(row.get("appointment_date")),
                scopus_wos_papers_3yrs=parse_int(row.get("scopus_wos_papers_3yrs"))
            )
            faculty_batch.append(f_obj)
            if len(faculty_batch) >= 1500:
                db.add_all(faculty_batch)
                db.flush()
                faculty_batch = []
    if faculty_batch:
        db.add_all(faculty_batch)
        db.flush()

    # 6. Document Metadata (594 rows)
    logger.info("Ingesting document_metadata.csv...")
    doc_uuid_to_id = {}
    doc_objs = []
    with open(DATA_DIR / "document_metadata.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["application_id"] not in app_uuid_to_id:
                continue
            app_id = app_uuid_to_id[row["application_id"]]
            inst_id = inst_uuid_to_id.get(row.get("institution_id"))
            up_dt = parse_datetime(row.get("upload_timestamp")) or datetime.utcnow()
            dt_type = row.get("document_type", "FIRE_SAFETY")
            # Map canonical type to internal doc_type
            type_map = {
                "FIRE_SAFETY": "fire_cert",
                "OCCUPANCY_CERT": "occupancy_cert",
                "STRUCTURAL_STABILITY": "structural_cert",
                "LAND_CONVERSION_CLU": "satellite_map",
                "AFFIDAVIT_2": "affidavit2",
                "FORMAT_2_NOC": "audited_accounts",
            }
            internal_doc_type = type_map.get(dt_type, dt_type.lower())
            
            doc = Document(
                document_id=row["document_id"],
                application_id=app_id,
                application_uuid=row["application_id"],
                institution_id=inst_id,
                institution_uuid=row.get("institution_id"),
                document_type=dt_type,
                doc_type=internal_doc_type,
                document_category=row.get("document_category", "STATUTORY_CERTIFICATE"),
                file_name=row.get("file_name", "document.pdf"),
                original_name=row.get("file_name", "document.pdf"),
                file_format=row.get("file_format", "PDF"),
                file_size_bytes=parse_int(row.get("file_size_bytes"), 1200000),
                size_bytes=parse_int(row.get("file_size_bytes"), 1200000),
                sha256_hash=row.get("sha256_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
                sha256=row.get("sha256_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
                upload_timestamp=up_dt,
                uploaded_at=up_dt,
                issue_date=parse_date(row.get("issue_date")),
                expiry_date=parse_date(row.get("expiry_date")),
                issuing_authority=row.get("issuing_authority") or None,
                verification_status=row.get("verification_status", "VERIFIED"),
                ocr_status=row.get("ocr_status", "COMPLETED"),
                extraction_status="Completed",
                storage_path=row.get("storage_path") or f"documents/{row['document_id']}.pdf",
                stored_path=row.get("storage_path") or f"documents/{row['document_id']}.pdf",
                version=parse_int(row.get("version"), 1),
                page_count=2,
                superseded=False,
                has_signature_field=True,
                page_text={"1": f"Statutory certificate {dt_type} issued by {row.get('issuing_authority', 'Competent Authority')}."}
            )
            doc_objs.append(doc)
    db.add_all(doc_objs)
    db.flush()
    for d in doc_objs:
        doc_uuid_to_id[d.document_id] = d.id

    # 7. OCR Results
    logger.info("Ingesting ocr_results_sample.csv...")
    ocr_objs = []
    field_objs = []
    with open(DATA_DIR / "ocr_results_sample.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            doc_uuid = row.get("document_id")
            if doc_uuid not in doc_uuid_to_id:
                continue
            doc_id = doc_uuid_to_id[doc_uuid]
            ocr = OCRResult(
                ocr_id=row["ocr_id"],
                document_id=doc_id,
                document_uuid=doc_uuid,
                extracted_text=row.get("extracted_text", ""),
                ocr_lines_json=row.get("ocr_lines_json", "[]"),
                confidence_score=parse_float(row.get("confidence_score"), 0.98),
                language_detected=row.get("language_detected", "en"),
                processing_time_ms=parse_int(row.get("processing_time_ms"), 750),
                quality_score=parse_float(row.get("quality_score"), 0.95),
                ocr_status=row.get("ocr_status", "COMPLETED"),
                created_at=parse_datetime(row.get("created_at")) or datetime.utcnow()
            )
            ocr_objs.append(ocr)

            # Generate extracted fields from lines
            try:
                lines = json.loads(row.get("ocr_lines_json", "[]"))
                for idx, line in enumerate(lines[:6]):
                    t = line.get("text", "")
                    conf = line.get("confidence", 0.95)
                    if ":" in t:
                        k, v = t.split(":", 1)
                        field_objs.append(ExtractedField(
                            document_id=doc_id,
                            name=k.strip()[:40],
                            value=v.strip()[:290],
                            page=1,
                            confidence=conf,
                            method="PaddleOCR (PP-OCRv4)"
                        ))
                    elif "CERTIFICATE" in t.upper():
                        field_objs.append(ExtractedField(
                            document_id=doc_id,
                            name="Document Title",
                            value=t.strip()[:290],
                            page=1,
                            confidence=conf,
                            method="PaddleOCR (PP-OCRv4)"
                        ))
            except Exception:
                pass

    db.add_all(ocr_objs)
    if field_objs:
        db.add_all(field_objs)
    db.flush()

    # 8. Cross-Document Validations
    logger.info("Ingesting cross_document_validations.csv...")
    cross_objs = []
    with open(DATA_DIR / "cross_document_validations.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["application_id"] not in app_uuid_to_id:
                continue
            app_id = app_uuid_to_id[row["application_id"]]
            val = CrossDocumentValidation(
                discrepancy_id=row["discrepancy_id"],
                application_id=app_id,
                application_uuid=row["application_id"],
                discrepancy_type=row.get("discrepancy_type", "INFRASTRUCTURE_MISMATCH"),
                source_document_id_1=row.get("source_document_id_1") or None,
                source_document_id_2=row.get("source_document_id_2") or None,
                source_value_1=row.get("source_value_1") or None,
                source_value_2=row.get("source_value_2") or None,
                severity=row.get("severity", "MINOR"),
                resolution_status=row.get("resolution_status", "OPEN"),
                remarks=row.get("remarks") or None
            )
            cross_objs.append(val)
    db.add_all(cross_objs)
    db.flush()

    # 9. Scrutiny Runs, Findings & Audit Tracking
    logger.info("Generating automated Scrutiny Runs, Findings, and Audit History...")
    comp_by_app_id = {c.application_id: c for c in comp_objs}
    cross_by_app_id = {}
    for cv in cross_objs:
        cross_by_app_id.setdefault(cv.application_id, []).append(cv)

    rule_dict = {r.rule_id: r for r in db.query(Rule).all()}

    for app in app_objs:
        comp = comp_by_app_id.get(app.id)
        discrepancies = cross_by_app_id.get(app.id, [])
        officer = db.get(DemoUser, app.reviewer_id)

        # Build summary
        passed_count = 14
        crit_count = comp.critical_issues_count if comp else 0
        maj_count = comp.major_issues_count if comp else 0
        min_count = comp.minor_issues_count if comp else 0
        def_count = crit_count + maj_count + min_count
        
        summary = {
            "total_rules": 14 + def_count,
            "passed": 14,
            "deficiencies": def_count,
            "manual_review": 1 if min_count > 0 else 0,
            "compliance_score": comp.overall_compliance_score if comp else 100.0,
            "recommendation": comp.overall_recommendation if comp else "RECOMMENDED"
        }

        run = ScrutinyRun(
            application_id=app.id,
            run_no=1,
            started_at=app.review_started_at or app.submitted_at or datetime.utcnow(),
            run_by=officer.full_name if officer else "AICTE Scrutiny Engine",
            rule_snapshot={r: "v1.0" for r in rule_dict.keys()},
            summary=summary,
            finalized=(app.review_status in ("Approved", "Rejected", "Returned for Correction")),
            finalized_by=admin_user.full_name if app.review_status in ("Approved", "Rejected", "Returned for Correction") else None
        )
        db.add(run)
        db.flush()

        # Add findings from cross-document discrepancies
        for idx, d in enumerate(discrepancies):
            sev_map = {"CRITICAL": "Critical", "MAJOR": "Major", "MINOR": "Minor"}
            status_map = {
                "RESOLVED": "Resolved",
                "OPEN": "Potential Deficiency" if d.severity in ("CRITICAL", "MAJOR") else "Manual Review Required"
            }
            finding = Finding(
                code=f"FND-{app.id:04d}-{idx+1:02d}",
                run_id=run.id,
                rule_version_id=None,
                rule_code="R-EOA-101" if "NAME" in d.discrepancy_type else "R-EOA-003" if "EXPIRED" in d.discrepancy_type else "R-EOA-102",
                check=d.discrepancy_type,
                document_id=None,
                doc_page=1,
                title=f"{d.discrepancy_type.replace('_', ' ').title()}",
                status=status_map.get(d.resolution_status, "Potential Deficiency"),
                original_status="Potential Deficiency",
                severity=sev_map.get(d.severity, "Major"),
                extracted_value=d.source_value_1,
                expected=d.source_value_2 or "Norm compliant parameter",
                reason=d.remarks or "Discrepancy detected across statutory documents.",
                explanation=f"Cross-document reconciliation engine detected contradiction: {d.remarks}",
                confidence=0.98,
                uncertainty="",
                next_action="Review uploaded documents or submit clarification.",
                comments=[{"by": "AICTE EoA Scrutiny Engine", "text": d.remarks or "Flagged by cross-document discrepancy engine", "at": None}]
            )
            db.add(finding)

        # Baseline compliant findings for rules
        f_pass = Finding(
            code=f"FND-{app.id:04d}-P1",
            run_id=run.id,
            rule_version_id=None,
            rule_code="R-EOA-001",
            check="Occupancy / Completion Certificate",
            document_id=None,
            doc_page=1,
            title="Competent Municipal Authority Occupancy Certificate Verified",
            status="Pass",
            original_status="Pass",
            severity="Minor",
            extracted_value="Permanent Completion Certificate on record",
            expected="Valid occupancy / completion certificate",
            reason="Verified and conforms to APH 2024-27 Chapter II norms.",
            explanation="Certificate extracted successfully and verified against statutory jurisdiction.",
            confidence=0.99,
            uncertainty="",
            next_action="None required — clause verified.",
            comments=[]
        )
        db.add(f_pass)

        # Tracking Journey & Audit
        sub_time = app.submitted_at or datetime.utcnow()
        trk.track(db, app, "Submitted", "Institution Portal (AICTE EoA)", None, "Pending", None, "Application submitted via online portal", sub_time)
        
        if app.assigned_at:
            trk.track(db, app, "Assigned", admin_user.full_name, None, None, officer.id, f"Assigned to {officer.full_name} for scrutiny", app.assigned_at)
        
        if app.review_started_at:
            trk.track(db, app, "Review started", officer.full_name, "Pending", "Under Review", officer.id, "Scrutiny engine and officer evaluation initiated", app.review_started_at)
        
        if app.decided_at:
            trk.track(db, app, "Status changed", officer.full_name, "Under Review", app.review_status, officer.id, comp.speaking_order_summary[:200] if comp else "Scrutiny order generated", app.decided_at)

        db.add(ReviewEvent(
            application_id=app.id,
            actor="AICTE Scrutiny Engine",
            action="Cross-Document Verification Completed",
            details=f"Compliance Score: {comp.overall_compliance_score if comp else 100.0} / 100. Category: {comp.compliance_category if comp else 'FULLY_COMPLIANT'}",
            at=app.review_started_at or sub_time
        ))

    db.commit()
    db.close()
    logger.info("Successfully seeded database with full 3NF dataset (100 applications, 50 institutions, 504 intake records, 8,860 faculty records, 594 documents, 50 OCR records, 72 cross validations, 100 compliance assessments)!")

if __name__ == "__main__":
    seed()
