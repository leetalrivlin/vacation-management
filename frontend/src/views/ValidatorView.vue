<template>
  <div>
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900 m-0 mb-2">
        Validator Dashboard
      </h1>
      <p class="text-slate-600 m-0">
        Review and decide on vacation requests from your team.
      </p>
    </header>

    <div class="mb-4">
      <StatusFilter v-model="statusFilter" />
    </div>

    <div class="bg-white rounded-lg shadow">
      <div v-if="loading" class="p-8 text-center text-slate-500">
        Loading requests...
      </div>
      <div
          v-else-if="error"
          class="m-4 bg-red-50 text-red-700 p-4 rounded"
      >
        {{ error }}
      </div>
      <div
          v-else-if="requests.length === 0"
          class="p-8 text-center text-slate-500"
      >
        No requests {{ statusFilter ? `with status "${statusFilter}"` : "found" }}.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
          <tr>
            <th
                v-for="header in headers"
                :key="header"
                class="px-3 py-3 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wide"
            >
              {{ header }}
            </th>
          </tr>
          </thead>
          <tbody>
          <ValidatorRequestRow
              v-for="request in requests"
              :key="request.id"
              :request="request"
              :action-in-progress="actionInProgressId === request.id"
              @approve="handleApprove"
              @reject="openRejectModal"
          />
          </tbody>
        </table>
      </div>
    </div>

    <RejectModal
        :open="rejectModalOpen"
        :submitting="rejectSubmitting"
        @cancel="closeRejectModal"
        @confirm="handleRejectConfirm"
    />

    <div
        v-if="successMessage"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded shadow-lg"
    >
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import StatusFilter from "../components/StatusFilter.vue";
import ValidatorRequestRow from "../components/ValidatorRequestRow.vue";
import RejectModal from "../components/RejectModal.vue";
import { vacationRequestApi } from "../services/api";
import { RequestStatus, type VacationRequest } from "../types";

const headers = [
  "Requester",
  "Submitted",
  "Start",
  "End",
  "Reason",
  "Status",
  "Comment",
  "Actions",
];

const requests = ref<VacationRequest[]>([]);
const loading = ref(false);
const error = ref("");
const statusFilter = ref<RequestStatus | undefined>(undefined);

const actionInProgressId = ref<number | null>(null);
const rejectModalOpen = ref(false);
const rejectingId = ref<number | null>(null);
const rejectSubmitting = ref(false);

const successMessage = ref("");

async function loadRequests() {
  loading.value = true;
  error.value = "";
  try {
    requests.value = await vacationRequestApi.getAll(statusFilter.value);
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to load requests";
  } finally {
    loading.value = false;
  }
}

async function handleApprove(id: number) {
  actionInProgressId.value = id;
  try {
    await vacationRequestApi.approve(id);
    showSuccess("Request approved");
    await loadRequests();
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to approve request";
  } finally {
    actionInProgressId.value = null;
  }
}

function openRejectModal(id: number) {
  rejectingId.value = id;
  rejectModalOpen.value = true;
}

function closeRejectModal() {
  rejectModalOpen.value = false;
  rejectingId.value = null;
}

async function handleRejectConfirm(comment: string) {
  if (rejectingId.value === null) return;

  rejectSubmitting.value = true;
  actionInProgressId.value = rejectingId.value;
  try {
    await vacationRequestApi.reject(rejectingId.value, comment);
    showSuccess("Request rejected");
    closeRejectModal();
    await loadRequests();
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to reject request";
  } finally {
    rejectSubmitting.value = false;
    actionInProgressId.value = null;
  }
}

function showSuccess(message: string) {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
}

watch(statusFilter, () => loadRequests());

onMounted(() => loadRequests());
</script>