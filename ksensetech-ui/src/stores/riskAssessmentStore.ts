import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import type { DTO } from '@/modelling/interfaces/api/dto'
import type { Pagination } from '@/modelling/interfaces/api/pagination'
import type { BloodPressure } from '@/modelling/interfaces/vitals/bloodPressure'
import type { Temperature } from '@/modelling/interfaces/vitals/temperature'
import type { Age } from '@/modelling/interfaces/vitals/age'
import type { Patient } from '@/modelling/interfaces/patients/patient'
import type { VitalSignWrapper } from '@/modelling/interfaces/vitals/vitalSignWrapper'
import type { AssessmentResult } from '@/modelling/interfaces/api/assessmentResult'

export const useRiskAssessmentStore = defineStore('riskAssessmentStore', {
    state: () => ({
        API_KEY: 'ak_a9796a596ac8b8d4bc9ca425891b6268cb7b92ac4b903864',
        API_URL: '/api',
        MAX_RETRIES: 3 as number,
        errorMessage: '' as string,
        isError: false as boolean,
        currentPage: 1 as number,
        totalRecordCount: 0 as number,
        amountPerPage: 20 as number,
        patientsArray: [] as Patient[],
        invalidPatientArray: [] as Patient[],
        highRiskPatientsArray: [] as Patient[],
        feverPatientArray: [] as Patient[],
    }),
    getters: {
        getApiKey: (state) => state.API_KEY,
        getApiUrl: (state) => state.API_URL,
        getMaxRetries: (state) => state.MAX_RETRIES,
        getErrorMessage: (state) => state.errorMessage,
        getIsError: (state) => state.isError,
        getCurrentPage: (state) => state.currentPage,
        getTotalRecordCount: (state) => state.totalRecordCount,
        getAmountPerPage: (state) => state.amountPerPage,
        getPatientsArray: (state) => state.patientsArray,
        getInvalidPatientArray: (state) => state.invalidPatientArray,
        getHighRiskPatientsArray: (state) => state.highRiskPatientsArray,
        getFeverPatientArray: (state) => state.feverPatientArray,
    },
    actions: {
        async callAPI(dto: DTO, apiCallAttemptCount: number, page: number, limit: number): Promise<DTO | null> {
            for (let index = 0; index < this.getMaxRetries; index++) {
                try {
                    const data = await axios.get<any>(`${this.getApiUrl}/patients?page=${page}&limit=${limit}`, {
                        headers: {
                            'x-api-key': this.getApiKey,
                        },
                    })

                    if (data && data.data) {
                        dto = data.data as DTO
                        return dto
                    }
                } catch (error: any) {
                    this.$state.errorMessage = error.message
                    this.$state.isError = true
                    apiCallAttemptCount++
                }
            }

            return null
        },
        determineIsValidBloodPressure(bpFromAPI: string): BloodPressure {
            let result: BloodPressure = {
                isValid: false,
                systolic: 0,
                diastolic: 0,
            }

            if (!bpFromAPI || (bpFromAPI && bpFromAPI === '')) {
                return result
            }

            let vitalSignHolder = bpFromAPI.replace(/ /g, '').split('/')
            let systolicBP = parseInt(vitalSignHolder[0])
            let diastolicBP = parseInt(vitalSignHolder[1])

            if (isNaN(systolicBP) || isNaN(diastolicBP)) {
                return result
            }

            if (systolicBP < 1 || diastolicBP < 1) {
                return result
            }

            result.isValid = true
            result.systolic = systolicBP
            result.diastolic = diastolicBP

            return result
        },
        determineBloodPressure(bpObject: BloodPressure): number {
            const systolic = bpObject.systolic
            const diastolic = bpObject.diastolic

            if (systolic >= 140 || diastolic >= 90) return 4
            if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return 3
            if (systolic >= 120 && systolic <= 129 && diastolic < 80) return 2
            if (systolic < 120 && diastolic < 80) return 1

            return 0
        },
        determineIsValidTemperature(tempFromAPI: any): Temperature {
            let result: Temperature = {
                temperature: parseFloat(tempFromAPI),
                isValid: false,
            }

            if (isNaN(result.temperature)) {
                return result
            }

            result.isValid = true
            return result
        },
        determineTemperature(tempObj: Temperature): number {
            if (!tempObj.isValid) {
                return 0
            } else if (tempObj.temperature >= 100.1) {
                return 2
            } else {
                return 1
            }
        },
        determineIsValidAge(ageFromAPI: string): Age {
            let result: Age = {
                age: parseInt(ageFromAPI),
                isValid: false,
            }

            if (isNaN(result.age)) {
                return result
            }

            result.isValid = true
            return result
        },
        determineAge(ageObj: Age): number {
            if (ageObj.age > 65) {
                return 2
            } else {
                return 1
            }
        },
        determineIfValidData(patient: Patient): VitalSignWrapper {
            let vitalsWrapper: VitalSignWrapper = {
                ageObj: {
                    age: 0,
                    isValid: false,
                },
                bpObj: {
                    systolic: 0,
                    diastolic: 0,
                    isValid: false,
                },
                tempObj: {
                    temperature: undefined,
                    isValid: false,
                },
                isValid: false,
            }

            vitalsWrapper.ageObj = this.determineIsValidAge(patient.age)
            vitalsWrapper.bpObj = this.determineIsValidBloodPressure(patient.blood_pressure)
            vitalsWrapper.tempObj = this.determineIsValidTemperature(patient.temperature)

            if (
                vitalsWrapper.ageObj.isValid &&
                vitalsWrapper.bpObj.isValid &&
                vitalsWrapper.tempObj.isValid
            ) {
                vitalsWrapper.isValid = true
            }

            return vitalsWrapper
        },
        async performAssessment() {
            let apiCallAttemptCount = 0
            let dto: DTO = {
                data: [],
                pagination: {
                    hasNext: true,
                    page: 0,
                    totalPages: 0,
                },
            }

            this.isError = false
            this.errorMessage = ''

            const result = await this.callAPI(
                { data: [], pagination: { hasNext: false, page: 0, totalPages: 0 } },
                0,
                this.currentPage,
                this.amountPerPage
            )
            if (result && result.data) {
                this.patientsArray = result.data
                this.totalRecordCount = result.pagination.total;
                this.invalidPatientArray = []
                this.highRiskPatientsArray = []
                this.feverPatientArray = []

                result.data.forEach((patient: Patient) => {
                    const vitalSignWrapper = this.determineIfValidData(patient)
                    const ageScore = this.determineAge(vitalSignWrapper.ageObj)
                    const tempScore = this.determineTemperature(vitalSignWrapper.tempObj)
                    const bpScore = this.determineBloodPressure(vitalSignWrapper.bpObj)

                    if (!vitalSignWrapper.isValid) {
                        this.invalidPatientArray.push(patient)
                    }

                    if (ageScore + tempScore + bpScore >= 4) {
                        this.highRiskPatientsArray.push(patient)
                    }

                    if (tempScore > 0) {
                        this.feverPatientArray.push(patient)
                    }
                })

                return true
            } else {
                this.isError = true
                this.errorMessage = 'Failed to load patient data.'
                return false
            }
        },
        async changePage(newPage: number) {
            this.currentPage = newPage
            await this.performAssessment()
        }
    },
})
