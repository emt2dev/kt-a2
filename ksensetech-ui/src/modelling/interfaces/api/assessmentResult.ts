import type { Patient } from "../patients/patient";

export interface AssessmentResult {
    high_risk_patients: Patient[];
    fever_patients: Patient[];
    data_quality_issues: Patient[];
}