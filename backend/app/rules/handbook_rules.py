"""Configurable handbook-linked rules. Each entry is stored in rules / rule_versions at seed time.
Clause numbers and printed page numbers were checked against APH 2024-2027 (printed page = PDF page - 16).
source_text is a short extract of the handbook wording. Anything not confirmed is flagged 'internal'."""
from ..config import HANDBOOK_VERSION as HV
CAT_SD = "EoA - Self-Disclosure (Existing Institution)"
CAT_SITE = "EoA - Change of Site / Location (Existing Institution)"
AYS = ["2024-25", "2025-26", "2026-27"]
ANX = "Annexure-2, Section 2.1"
INTERNAL = "Prototype internal check - not a handbook clause"

DOC_TYPES = {
 "affidavit2": "Affidavit 2", "payment_receipt": "Payment receipt (AICTE Web-Portal)",
 "occupancy_cert": "Occupancy / Completion Certificate / Building Licence / Form D",
 "structural_cert": "Structural Stability Certificate", "fire_cert": "Fire Safety Certificate",
 "satellite_map": "Satellite map with latitude/longitude", "audited_accounts": "Audited statement of accounts (previous year)"}

def R(rule_id, title, doc_type, clause, page, text, applic, config, cats=None):
    return dict(rule_id=rule_id, title=title, doc_type=doc_type, handbook_version=HV, clause=clause, printed_page=page,
                source_text=text, effective_ay=AYS, categories=cats or [CAT_SD], applicability=applic, config=config, version="1.0")

RULES = [
 R("R-EOA-001", "Affidavit 2 with digital signature", "affidavit2", f"{ANX}, item (i); Clause 2.3.4(a)-(b) (p.15)", 81,
   "An Affidavit 2 with digital signature of the Chairman/ Secretary ... on an e-stamp paper of Rs. 100/- duly sworn before a First Class Judicial Magistrate or Notary or an Oath Commissioner.",
   "required", {"checks": ["mandatory_fields", "signature"], "mandatory": ["institution_name", "issue_date"]}),
 R("R-EOA-002", "Payment receipt, if applicable", "payment_receipt", f"{ANX}, item (ii)", 81,
   "Copy of pay receipt print made on AICTE Web-Portal if any, in respect of Extension of Approval for the respective Academic Year.",
   "conditional", {"condition": "payment_applicable", "checks": ["mandatory_fields"], "mandatory": ["institution_name", "certificate_number"]}),
 R("R-EOA-003", "Occupancy / Completion Certificate / Building Licence / Form D", "occupancy_cert", f"{ANX}, item (iii); Clause 6.17(g) (p.57)", 81,
   "valid Occupancy/ Completion Certificate/ Building License/ Form D issued by the Competent Authority.",
   "required", {"checks": ["mandatory_fields", "expiry"], "mandatory": ["institution_name", "certificate_number", "issuing_authority", "issue_date"], "validity_optional": True}),
 R("R-EOA-004", "Structural Stability Certificate (building older than thirty years)", "structural_cert", f"{ANX}, item (iv); Clause 6.17(h) (p.57)", 81,
   "Valid Structural Stability Certificate from the registered Structural Engineer, if the Building is more than thirty years from the issue of Completion Certificate ... valid for a period of FIVE years from the date of issue.",
   "conditional", {"condition": "building_age_over_30", "checks": ["mandatory_fields", "expiry"], "mandatory": ["institution_name", "certificate_number", "issue_date"], "validity_years": 5}),
 R("R-EOA-005", "Valid Fire Safety Certificate", "fire_cert", f"{ANX}, item (v); Clause 6.17(i) (p.57)", 81,
   "A valid Fire Safety Certificate issued by the Competent Authority.",
   "required", {"checks": ["mandatory_fields", "expiry"], "mandatory": ["institution_name", "certificate_number", "issuing_authority", "issue_date"]}),
 R("R-EOA-006", "Satellite map with latitude and longitude at main building entrance", "satellite_map", f"{ANX}, item (vi)", 81,
   "Satellite map ... showing geographical location of the Land with latitude and longitude at the entrance of the main Building mentioned on it.",
   "required", {"checks": ["latlong"], "mandatory": []}),
 R("R-EOA-007", "Audited statement of accounts of Trust/Society/Company (previous year)", "audited_accounts", f"{ANX}, item (vii)", 81,
   "Audited statement of accounts of the Trust/ Society/ Company of the previous year.",
   "required", {"checks": ["mandatory_fields", "fy"], "mandatory": ["institution_name", "financial_year"]}),
 R("R-EOA-100", "Institution name consistent with application record", None, INTERNAL, None,
   "Compares the institution name extracted from each document with the application record.", "internal", {}),
 R("R-EOA-101", "Institution name consistent across documents", None, INTERNAL, None,
   "Compares institution names extracted from all uploaded documents.", "internal", {}),
 R("R-EOA-102", "Certificate number matches application declaration", None, INTERNAL, None,
   "Compares certificate numbers extracted from documents with those declared in the application record, where declared.", "internal", {}),
 R("R-EOA-103", "Document readability", None, INTERNAL, None,
   "Flags documents with no machine-readable text (after OCR fallback, if available).", "internal", {}),
 R("R-CFG-000", "Checklist configured for application category", None, INTERNAL, None,
   "No rules are configured for this application category; scrutiny must be performed manually.", "internal", {}, cats=[CAT_SITE]),
]
