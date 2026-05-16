<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-xl font-semibold text-slate-900 mt-0 mb-4">
      Your requests
    </h2>

    <div v-if="loading" class="p-4 text-center text-slate-500">
      Loading...
    </div>
    <div
        v-else-if="error"
        class="bg-red-50 text-red-700 px-3 py-3 rounded"
    >
      {{ error }}
    </div>
    <div
        v-else-if="requests.length === 0"
        class="p-4 text-center text-slate-500"
    >
      You haven't submitted any requests yet.
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
        <tr>
          <th class="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
            Submitted
          </th>
          <th class="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
            Start
          </th>
          <th class="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
            End
          </th>
          <th class="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
            Reason
          </th>
          <th class="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
            Status
          </th>
          <th class="px-3 py-2 text-left font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
            Manager comment
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="request in requests" :key="request.id">
          <td class="px-3 py-2 border-b border-slate-100">
            {{ formatDate(request.createdAt) }}
          </td>
          <td class="px-3 py-2 border-b border-slate-100">
            {{ formatDate(request.startDate) }}
          </td>
          <td class="px-3 py-2 border-b border-slate-100">
            {{ formatDate(request.endDate) }}
          </td>
          <td class="px-3 py-2 border-b border-slate-100">
            {{ request.reason || "—" }}
          </td>
          <td class="px-3 py-2 border-b border-slate-100">
              <span :class="statusClasses(request.status)">
                {{ request.status }}
              </span>
          </td>
          <td class="px-3 py-2 border-b border-slate-100">
            {{ request.comments || "—" }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { vacationRequestApi } from "../services/api";
import { RequestStatus, type VacationRequest } from "../types";

const props = defineProps<{ userId: number; refreshKey: number }>();

const requests = ref<VacationRequest[]>([]);
const loading = ref(false);
const error = ref("");

async function loadRequests() {
  loading.value = true;
  error.value = "";
  try {
    requests.value = await vacationRequestApi.getByUser(props.userId);
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to load requests";
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? dateString + "T00:00:00"
      : dateString;
  return new Date(dateOnly).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function statusClasses(status: RequestStatus): string {
  const base = "inline-block px-3 py-1 rounded-full text-sm font-medium";
  const variants: Record<RequestStatus, string> = {
    [RequestStatus.PENDING]: "bg-amber-100 text-amber-800",
    [RequestStatus.APPROVED]: "bg-green-100 text-green-800",
    [RequestStatus.REJECTED]: "bg-red-100 text-red-800",
  };
  return `${base} ${variants[status]}`;
}

watch(
    () => [props.userId, props.refreshKey],
    () => loadRequests(),
    { immediate: true }
);
</script>