from datetime import datetime, date
import uuid
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base

def now():
    return datetime.utcnow()

def gen_uuid():
    return str(uuid.uuid4())

class DemoUser(Base):
    __tablename__ = "demo_users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    full_name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(30))  # Scrutiny Officer | Senior Reviewer | Administrator
    password_hash: Mapped[str] = mapped_column(String(100))
    designation: Mapped[Optional[str]] = mapped_column(String(80))
    employee_id: Mapped[Optional[str]] = mapped_column(String(30))

class Institution(Base):
    __tablename__ = "institutions"
    id: Mapped[int] = mapped_column(primary_key=True)
    institution_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    aicte_permanent_id: Mapped[str] = mapped_column(String(50), index=True)
    code: Mapped[str] = mapped_column(String(50), index=True)  # alias for aicte_permanent_id
    trust_id: Mapped[Optional[str]] = mapped_column(String(36))
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100))  # e.g. SELF_FINANCING_PRIVATE, GOVT_AIDED
    institution_type: Mapped[Optional[str]] = mapped_column(String(50), default="CO_ED")
    establishment_year: Mapped[Optional[int]] = mapped_column(Integer)
    approval_year_first: Mapped[Optional[int]] = mapped_column(Integer)
    aicte_region: Mapped[Optional[str]] = mapped_column(String(50))
    location_classification: Mapped[Optional[str]] = mapped_column(String(50))
    is_hilly_area: Mapped[bool] = mapped_column(Boolean, default=False)
    affiliating_university: Mapped[Optional[str]] = mapped_column(String(255))
    affiliating_board: Mapped[Optional[str]] = mapped_column(String(255))
    naac_accredited: Mapped[bool] = mapped_column(Boolean, default=False)
    naac_score: Mapped[Optional[float]] = mapped_column(Float)
    nirf_ranked: Mapped[bool] = mapped_column(Boolean, default=False)
    nirf_rank_band: Mapped[Optional[str]] = mapped_column(String(50))
    autonomous_status: Mapped[bool] = mapped_column(Boolean, default=False)
    official_website: Mapped[Optional[str]] = mapped_column(String(255))
    official_email: Mapped[Optional[str]] = mapped_column(String(255))
    phone_number: Mapped[Optional[str]] = mapped_column(String(50))
    address: Mapped[Optional[str]] = mapped_column(String(300))
    state: Mapped[Optional[str]] = mapped_column(String(60))
    completion_certificate_year: Mapped[Optional[int]] = mapped_column(Integer)
    govt_building: Mapped[bool] = mapped_column(Boolean, default=False)

    applications: Mapped[List["Application"]] = relationship(back_populates="institution")
    faculty_members: Mapped[List["Faculty"]] = relationship(back_populates="institution")

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    app_no: Mapped[str] = mapped_column(String(60), index=True)
    application_number: Mapped[Optional[str]] = mapped_column(String(60), index=True)
    institution_id: Mapped[int] = mapped_column(ForeignKey("institutions.id"), index=True)
    institution_uuid: Mapped[Optional[str]] = mapped_column(String(36), index=True)
    academic_year: Mapped[str] = mapped_column(String(20))
    application_type: Mapped[Optional[str]] = mapped_column(String(50))
    category: Mapped[str] = mapped_column(String(100))
    ter_charges_in_lakhs: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    ter_transaction_id: Mapped[Optional[str]] = mapped_column(String(50))
    ter_payment_status: Mapped[Optional[str]] = mapped_column(String(30), default="PAID")
    submission_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime)
    submitted_on: Mapped[date] = mapped_column(Date)
    processing_status: Mapped[Optional[str]] = mapped_column(String(50), default="APPROVED_EOA")
    is_multi_year_eligible: Mapped[bool] = mapped_column(Boolean, default=False)
    multi_year_duration_years: Mapped[Optional[int]] = mapped_column(Integer, default=1)
    
    reviewer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("demo_users.id"))
    status: Mapped[str] = mapped_column(String(40), default="Pending Scrutiny")
    review_status: Mapped[str] = mapped_column(String(30), default="Pending")
    payment_applicable: Mapped[Optional[bool]] = mapped_column(Boolean, default=True)
    declared: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now, onupdate=now)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    assigned_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    review_started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    institution: Mapped[Institution] = relationship(back_populates="applications")
    reviewer: Mapped[Optional[DemoUser]] = relationship()
    documents: Mapped[List["Document"]] = relationship(back_populates="application")
    intake_capacities: Mapped[List["IntakeCapacity"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    cross_validations: Mapped[List["CrossDocumentValidation"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    compliance_assessment: Mapped[Optional["ComplianceAssessment"]] = relationship(back_populates="application", uselist=False, cascade="all, delete-orphan")

class IntakeCapacity(Base):
    __tablename__ = "intake_capacities"
    id: Mapped[int] = mapped_column(primary_key=True)
    intake_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    application_uuid: Mapped[str] = mapped_column(String(36), index=True)
    course_id: Mapped[Optional[str]] = mapped_column(String(36))
    academic_year: Mapped[str] = mapped_column(String(20))
    shift_type: Mapped[Optional[str]] = mapped_column(String(30), default="REGULAR")
    division_count: Mapped[int] = mapped_column(Integer, default=1)
    intake_per_division: Mapped[int] = mapped_column(Integer, default=60)
    approved_intake: Mapped[int] = mapped_column(Integer, default=60)
    applied_intake: Mapped[int] = mapped_column(Integer, default=60)
    tfw_supernumerary_seats: Mapped[int] = mapped_column(Integer, default=0)
    fn_oci_ciwg_seats: Mapped[int] = mapped_column(Integer, default=0)
    lateral_entry_seats: Mapped[int] = mapped_column(Integer, default=0)
    working_prof_supernumerary_seats: Mapped[int] = mapped_column(Integer, default=0)
    enrolled_students_current_year: Mapped[int] = mapped_column(Integer, default=0)

    application: Mapped[Application] = relationship(back_populates="intake_capacities")

class Faculty(Base):
    __tablename__ = "faculty"
    id: Mapped[int] = mapped_column(primary_key=True)
    faculty_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    institution_id: Mapped[int] = mapped_column(ForeignKey("institutions.id"), index=True)
    institution_uuid: Mapped[str] = mapped_column(String(36), index=True)
    course_id: Mapped[Optional[str]] = mapped_column(String(36))
    aicte_faculty_id: Mapped[str] = mapped_column(String(50), index=True)
    full_name: Mapped[str] = mapped_column(String(150))
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date)
    designation: Mapped[str] = mapped_column(String(50))
    cadre_type: Mapped[Optional[str]] = mapped_column(String(50))
    highest_qualification: Mapped[Optional[str]] = mapped_column(String(50))
    has_phd: Mapped[bool] = mapped_column(Boolean, default=False)
    phd_specialization: Mapped[Optional[str]] = mapped_column(String(150))
    pan_number: Mapped[Optional[str]] = mapped_column(String(20))
    is_aadhaar_seeded: Mapped[bool] = mapped_column(Boolean, default=True)
    biometric_attendance_enrolled: Mapped[bool] = mapped_column(Boolean, default=True)
    salary_payment_mode: Mapped[Optional[str]] = mapped_column(String(50))
    gross_salary_monthly: Mapped[Optional[float]] = mapped_column(Float)
    appointment_date: Mapped[Optional[date]] = mapped_column(Date)
    scopus_wos_papers_3yrs: Mapped[int] = mapped_column(Integer, default=0)

    institution: Mapped[Institution] = relationship(back_populates="faculty_members")

class Document(Base):
    __tablename__ = "document_metadata"
    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    application_uuid: Mapped[Optional[str]] = mapped_column(String(36), index=True)
    institution_id: Mapped[Optional[int]] = mapped_column(ForeignKey("institutions.id"), index=True)
    institution_uuid: Mapped[Optional[str]] = mapped_column(String(36), index=True)
    document_type: Mapped[str] = mapped_column(String(50))
    doc_type: Mapped[str] = mapped_column(String(50))  # synonym for doc_type
    document_category: Mapped[Optional[str]] = mapped_column(String(50), default="STATUTORY_CERTIFICATE")
    file_name: Mapped[str] = mapped_column(String(255))
    original_name: Mapped[str] = mapped_column(String(255))  # synonym for original_name
    file_format: Mapped[Optional[str]] = mapped_column(String(20), default="PDF")
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)  # synonym
    sha256_hash: Mapped[str] = mapped_column(String(64))
    sha256: Mapped[str] = mapped_column(String(64))  # synonym
    upload_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime, default=now)
    uploaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=now)
    issue_date: Mapped[Optional[date]] = mapped_column(Date)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date)
    issuing_authority: Mapped[Optional[str]] = mapped_column(String(150))
    verification_status: Mapped[Optional[str]] = mapped_column(String(50), default="VERIFIED")
    ocr_status: Mapped[Optional[str]] = mapped_column(String(50), default="COMPLETED")
    extraction_status: Mapped[str] = mapped_column(String(30), default="Completed")
    storage_path: Mapped[Optional[str]] = mapped_column(String(255))
    stored_path: Mapped[Optional[str]] = mapped_column(String(255))  # synonym
    version: Mapped[int] = mapped_column(Integer, default=1)
    page_count: Mapped[int] = mapped_column(Integer, default=1)
    superseded: Mapped[bool] = mapped_column(Boolean, default=False)
    page_text: Mapped[dict] = mapped_column(JSON, default=dict)
    has_signature_field: Mapped[bool] = mapped_column(Boolean, default=False)

    application: Mapped[Application] = relationship(back_populates="documents")
    fields: Mapped[List["ExtractedField"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    ocr_results: Mapped[List["OCRResult"]] = relationship(back_populates="document", cascade="all, delete-orphan")

DocumentMetadata = Document  # Alias for specification 3NF naming

class OCRResult(Base):
    __tablename__ = "ocr_results"
    id: Mapped[int] = mapped_column(primary_key=True)
    ocr_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    document_id: Mapped[int] = mapped_column(ForeignKey("document_metadata.id"), index=True)
    document_uuid: Mapped[str] = mapped_column(String(36), index=True)
    extracted_text: Mapped[str] = mapped_column(Text)
    ocr_lines_json: Mapped[str] = mapped_column(Text)  # stores json array of bbox, text, confidence
    confidence_score: Mapped[float] = mapped_column(Float, default=0.98)
    language_detected: Mapped[Optional[str]] = mapped_column(String(20), default="en")
    processing_time_ms: Mapped[int] = mapped_column(Integer, default=650)
    quality_score: Mapped[Optional[float]] = mapped_column(Float, default=0.95)
    ocr_status: Mapped[Optional[str]] = mapped_column(String(50), default="COMPLETED")
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=now)

    document: Mapped[Document] = relationship(back_populates="ocr_results")

class CrossDocumentValidation(Base):
    __tablename__ = "cross_document_validations"
    id: Mapped[int] = mapped_column(primary_key=True)
    discrepancy_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    application_uuid: Mapped[str] = mapped_column(String(36), index=True)
    discrepancy_type: Mapped[str] = mapped_column(String(50))
    source_document_id_1: Mapped[Optional[str]] = mapped_column(String(36))
    source_document_id_2: Mapped[Optional[str]] = mapped_column(String(36))
    source_value_1: Mapped[Optional[str]] = mapped_column(Text)
    source_value_2: Mapped[Optional[str]] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20))
    resolution_status: Mapped[str] = mapped_column(String(30), default="OPEN")
    remarks: Mapped[Optional[str]] = mapped_column(Text)

    application: Mapped[Application] = relationship(back_populates="cross_validations")

class ComplianceAssessment(Base):
    __tablename__ = "compliance_assessments"
    id: Mapped[int] = mapped_column(primary_key=True)
    assessment_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=gen_uuid)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), unique=True, index=True)
    application_uuid: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    overall_compliance_score: Mapped[float] = mapped_column(Float)
    compliance_category: Mapped[str] = mapped_column(String(50))  # FULLY_COMPLIANT, MINOR_NON_COMPLIANT, etc.
    critical_issues_count: Mapped[int] = mapped_column(Integer, default=0)
    major_issues_count: Mapped[int] = mapped_column(Integer, default=0)
    minor_issues_count: Mapped[int] = mapped_column(Integer, default=0)
    missing_documents_count: Mapped[int] = mapped_column(Integer, default=0)
    overall_recommendation: Mapped[str] = mapped_column(String(50))  # RECOMMENDED, RE_SCRUTINY_REQUIRED, REJECTED
    speaking_order_summary: Mapped[str] = mapped_column(Text)
    generated_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime, default=now)

    application: Mapped[Application] = relationship(back_populates="compliance_assessment")

class ExtractedField(Base):
    __tablename__ = "extracted_fields"
    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("document_metadata.id"))
    name: Mapped[str] = mapped_column(String(40))
    value: Mapped[str] = mapped_column(String(300))
    corrected_value: Mapped[Optional[str]] = mapped_column(String(300))
    page: Mapped[int] = mapped_column(Integer)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    method: Mapped[str] = mapped_column(String(30), default="text-layer")
    document: Mapped[Document] = relationship(back_populates="fields")
    @property
    def effective(self): return self.corrected_value if self.corrected_value else self.value

class Rule(Base):
    __tablename__ = "rules"
    id: Mapped[int] = mapped_column(primary_key=True)
    rule_id: Mapped[str] = mapped_column(String(20), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    doc_type: Mapped[Optional[str]] = mapped_column(String(40))
    versions: Mapped[List["RuleVersion"]] = relationship(back_populates="rule")

class RuleVersion(Base):
    __tablename__ = "rule_versions"
    __table_args__ = (UniqueConstraint("rule_id_fk", "version"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    rule_id_fk: Mapped[int] = mapped_column(ForeignKey("rules.id"))
    version: Mapped[str] = mapped_column(String(10))
    handbook_version: Mapped[str] = mapped_column(String(80))
    clause: Mapped[str] = mapped_column(String(160))
    printed_page: Mapped[Optional[int]] = mapped_column(Integer)
    source_text: Mapped[str] = mapped_column(Text)
    effective_ay: Mapped[list] = mapped_column(JSON)
    categories: Mapped[list] = mapped_column(JSON)
    applicability: Mapped[str] = mapped_column(String(20))
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    rule: Mapped[Rule] = relationship(back_populates="versions")

class ScrutinyRun(Base):
    __tablename__ = "scrutiny_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    run_no: Mapped[int] = mapped_column(Integer)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    run_by: Mapped[str] = mapped_column(String(80))
    rule_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    summary: Mapped[dict] = mapped_column(JSON, default=dict)
    finalized: Mapped[bool] = mapped_column(Boolean, default=False)
    finalized_by: Mapped[Optional[str]] = mapped_column(String(80))
    application: Mapped[Application] = relationship()
    findings: Mapped[List["Finding"]] = relationship(back_populates="run", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(30), unique=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("scrutiny_runs.id"))
    rule_version_id: Mapped[Optional[int]] = mapped_column(ForeignKey("rule_versions.id"))
    rule_code: Mapped[str] = mapped_column(String(20))
    check: Mapped[str] = mapped_column(String(40))
    document_id: Mapped[Optional[int]] = mapped_column(ForeignKey("document_metadata.id"))
    doc_page: Mapped[Optional[int]] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30))
    original_status: Mapped[str] = mapped_column(String(30))
    severity: Mapped[str] = mapped_column(String(10))
    extracted_value: Mapped[Optional[str]] = mapped_column(String(300))
    expected: Mapped[str] = mapped_column(String(300))
    reason: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    uncertainty: Mapped[str] = mapped_column(String(300), default="")
    next_action: Mapped[str] = mapped_column(String(300))
    comments: Mapped[list] = mapped_column(JSON, default=list)
    override_reason: Mapped[Optional[str]] = mapped_column(Text)
    resolved_by: Mapped[Optional[str]] = mapped_column(String(80))
    run: Mapped[ScrutinyRun] = relationship(back_populates="findings")
    rule_version: Mapped[Optional[RuleVersion]] = relationship()
    document: Mapped[Optional[Document]] = relationship()

class ReviewEvent(Base):
    __tablename__ = "review_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[Optional[int]] = mapped_column(ForeignKey("applications.id"))
    actor: Mapped[str] = mapped_column(String(80))
    action: Mapped[str] = mapped_column(String(60))
    details: Mapped[str] = mapped_column(Text, default="")
    at: Mapped[datetime] = mapped_column(DateTime, default=now)

class Report(Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    run_id: Mapped[int] = mapped_column(ForeignKey("scrutiny_runs.id"))
    file_name: Mapped[str] = mapped_column(String(120))
    status_label: Mapped[str] = mapped_column(String(40))
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    generated_by: Mapped[str] = mapped_column(String(80))

class ApplicationTracking(Base):
    __tablename__ = "application_tracking"
    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    event: Mapped[str] = mapped_column(String(40))
    from_status: Mapped[Optional[str]] = mapped_column(String(30))
    to_status: Mapped[Optional[str]] = mapped_column(String(30))
    officer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("demo_users.id"), index=True)
    actor: Mapped[str] = mapped_column(String(80))
    remark: Mapped[str] = mapped_column(Text, default="")
    at: Mapped[datetime] = mapped_column(DateTime, default=now)
    officer: Mapped[Optional[DemoUser]] = relationship()
