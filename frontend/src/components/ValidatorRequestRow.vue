<template>
  <tr>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ request.user?.name ?? `User #${request.userId}` }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ formatDate(request.createdAt) }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ request.startDate }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ request.endDate }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ request.reason || "—" }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      <span :class="statusClasses(request.status)">
        {{ request.status }}
      </span>
    </td>
    <td class="px-3 py-3 border-b border-slate-100 text-slate-600 text-sm">
      {{ request.comments || "—" }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      <div v-if="isPending" class="flex gap-2">
        <button
            type="button"
            class="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 cursor-pointer disabled:bg-green-300 disabled:cursor-not-allowed"
            :disabled="actionInProgress"
            @click="$emit('approve', request.id)"
        >
          Approve
        </button>
        <button
            type="button"
            class="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
            :disabled="actionInProgress"
            @click="$emit('reject', request.id)"
        >
          Reject
        </button>
      </div>
      <span v-else class="text-slate-400 text-sm">—</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RequestStatus, type VacationRequest } from "../types";

const props = defineProps<{
  request: VacationRequest;
  actionInProgress: boolean;
}>();

defineEmits<{
  approve: [id: number];
  reject: [id: number];
}>();

const isPending = computed(() => props.request.status === RequestStatus.PENDING);

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
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
</script>