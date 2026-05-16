<template>
  <div>
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900 m-0 mb-2">
        Admin Dashboard
      </h1>
      <p class="text-slate-600 m-0">
        Review and decide on vacation requests from your team.
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-4">
      <StatusFilter v-model="statusFilter" />
      <div class="flex items-center gap-2 flex-1 min-w-[16rem]">
        <label for="search" class="font-medium text-slate-700">
          Search
        </label>
        <input
            id="search"
            v-model="searchQuery"
            type="search"
            placeholder="Name, reason, or comment"
            class="flex-1 px-3 py-2 border border-slate-300 rounded text-base bg-white focus:outline-none focus:border-brand"
        />
      </div>
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
          v-else-if="items.length === 0"
          class="p-8 text-center text-slate-500"
      >
        No requests match your filters.
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
              v-for="request in items"
              :key="request.id"
              :request="request"
              :action-in-progress="actionInProgressId === request.id"
              @approve="handleApprove"
              @reject="openRejectModal"
          />
          </tbody>
        </table>
      </div>

      <div
          v-if="!loading && !error && total > 0"
          class="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-slate-200 text-sm"
      >
        <div class="text-slate-600">
          Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }}
        </div>
        <div class="flex items-center gap-2">
          <label for="pageSize" class="text-slate-600">Rows per page</label>
          <select
              id="pageSize"
              v-model.number="pageSize"
              class="px-2 py-1 border border-slate-300 rounded bg-white focus:outline-none focus:border-brand"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
          <button
              type="button"
              class="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              :disabled="page <= 1"
              @click="page--"
          >
            Prev
          </button>
          <span class="text-slate-700">
            Page {{ page }} of {{ totalPages }}
          </span>
          <button
              type="button"
              class="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              :disabled="page >= totalPages"
              @click="page++"
          >
            Next
          </button>
        </div>
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
import { ref, computed, watch, onMounted } from "vue";
import StatusFilter from "../components/StatusFilter.vue";
import ValidatorRequestRow from "../components/ValidatorRequestRow.vue";
import RejectModal from "../components/RejectModal.vue";
import { vacationRequestApi } from "../services/api";
import { RequestStatus, type VacationRequest } from "../types";

const headers = [
  "User",
  "Submitted",
  "Start",
  "End",
  "Reason",
  "Status",
  "Comment",
  "Actions",
];

const pageSizeOptions = [5, 10, 25, 50];

const items = ref<VacationRequest[]>([]);
const total = ref(0);
const totalPages = ref(1);
const page = ref(1);
const pageSize = ref(5);

const loading = ref(false);
const error = ref("");
const statusFilter = ref<RequestStatus | undefined>(undefined);
const searchQuery = ref("");

const rangeStart = computed(() =>
    total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1
);
const rangeEnd = computed(() =>
    Math.min(page.value * pageSize.value, total.value)
);

const actionInProgressId = ref<number | null>(null);
const rejectModalOpen = ref(false);
const rejectingId = ref<number | null>(null);
const rejectSubmitting = ref(false);

const successMessage = ref("");

async function loadRequests() {
  loading.value = true;
  error.value = "";
  try {
    const result = await vacationRequestApi.getAll({
      status: statusFilter.value,
      search: searchQuery.value.trim() || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    items.value = result.items;
    total.value = result.total;
    totalPages.value = result.totalPages;
    if (page.value > result.totalPages) {
      page.value = result.totalPages;
    }
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

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadRequests();
  }, 300);
});

watch([statusFilter, pageSize], () => {
  page.value = 1;
  loadRequests();
});

watch(page, () => loadRequests());

onMounted(() => loadRequests());
</script>
