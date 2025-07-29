import type { Pagination } from "./pagination";
import type { Patient } from "../patients/patient";

export interface DTO {
    data: Patient[];
    pagination: Pagination
}