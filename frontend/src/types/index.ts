export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface AppRow {
  id: number;
  application_id?: string;
  app_no: string;
  institution: string;
  code: string;
  academic_year: string;
  category: string;
  submitted_on: string;
  reviewer: string;
  completeness: number;
  status: string;
  updated_at: string;
  review_status: string;
  reviewer_id: number | null;
  assigned_at: string | null;
  compliance_score?: number | null;
  compliance_category?: string | null;
  overall_recommendation?: string | null;
  is_multi_year_eligible?: boolean;
  multi_year_duration_years?: number;
}

export interface IntakeCapacityItem {
  intake_id: string;
  course_id?: string;
  academic_year: string;
  shift_type: string;
  division_count: number;
  intake_per_division: number;
  approved_intake: number;
  applied_intake: number;
  tfw_supernumerary_seats: number;
  fn_oci_ciwg_seats: number;
  lateral_entry_seats: number;
  working_prof_supernumerary_seats: number;
  enrolled_students_current_year: number;
}

export interface CrossValidationItem {
  discrepancy_id: string;
  discrepancy_type: string;
  source_document_id_1?: string | null;
  source_document_id_2?: string | null;
  source_value_1?: string | null;
  source_value_2?: string | null;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  resolution_status: "RESOLVED" | "OPEN";
  remarks?: string | null;
}

export interface ComplianceAssessmentItem {
  assessment_id: string;
  overall_compliance_score: number;
  compliance_category: string;
  critical_issues_count: number;
  major_issues_count: number;
  minor_issues_count: number;
  missing_documents_count: number;
  overall_recommendation: string;
  speaking_order_summary: string;
  generated_timestamp: string;
}

export type Any = any;
