import type { VitalSignBase } from "./vitalSignBase";

export interface BloodPressure extends VitalSignBase {
    systolic: number;
    diastolic: number;
}