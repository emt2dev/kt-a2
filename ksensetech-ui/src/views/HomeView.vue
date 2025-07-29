<template>
  <div>
    <div v-if="loading" class="loader">
      <ProgressSpinner />
    </div>
    <div class="table">
      <DataTable
        :value="store.patientsArray"
        tableStyle="min-width: 50rem"
        scrollable
        scrollHeight="768px"
      >
        <Column field="patient_id" header="Id"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="age" header="Age"></Column>
        <Column field="gender" header="Gender"></Column>
        <Column field="blood_pressure" header="BP"></Column>
        <Column field="temperature" header="Temp."></Column>
        <Column field="visit_date" header="Vist"></Column>
        <Column field="diagnosis" header="Diagnosis"></Column>
        <Column field="medications" header="Medications"></Column>
      </DataTable>
    </div>

    <Paginator
      :first="(store.currentPage - 1) * store.amountPerPage"
      :rows="store.amountPerPage"
      :totalRecords="store.totalRecordCount"
      @page="onPageChange"
      style="margin-top: 1rem"
    />
  </div>
</template>

<script setup>
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Paginator from 'primevue/paginator'
import Column from 'primevue/column'
import { ref, onMounted } from 'vue'
import { useRiskAssessmentStore } from '@/stores/riskAssessmentStore'

const loading = ref()
const store = useRiskAssessmentStore()

onMounted(async () => {
  loading.value = true
  await store.performAssessment()
  loading.value = false
})

function onPageChange(event) {
  loading.value = true
  store.changePage(event.page + 1).finally(() => {
    loading.value = false
  })
}
</script>

<style>
.table {
  overflow-y: scroll;
  margin-left: 5rem;
  margin-top: 5rem;
  margin-right: 5rem;
}

.loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.3); /* semi-transparent white overlay */
  backdrop-filter: blur(5px); /* blur the background */
  -webkit-backdrop-filter: blur(5px); /* Safari support */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
