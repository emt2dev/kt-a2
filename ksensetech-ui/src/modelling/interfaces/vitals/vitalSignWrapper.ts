import type { Age } from "./age";
import type { BloodPressure } from "./bloodPressure";
import type { Temperature } from "./temperature";
import type { VitalSignBase } from "./vitalSignBase";

export interface VitalSignWrapper extends VitalSignBase {
    ageObj: Age;
    bpObj: BloodPressure;
    tempObj: Temperature;
}