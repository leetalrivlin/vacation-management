<template>
  <tr>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ displayName }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ formatDate(request.createdAt) }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ formatDate(request.startDate) }}
    </td>
    <td class="px-3 py-3 border-b border-slate-100">
      {{ formatDate(request.endDate) }}
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
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-approve text-white text-sm hover:bg-approve-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="actionInProgress"
            @click="$emit('approve', request.id)"
        >
          <Check class="w-4 h-4" :stroke-width="2.5" />
          <span>Approve</span>
        </button>
        <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-reject text-white text-sm hover:bg-reject-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="actionInProgress"
            @click="$emit('reject', request.id)"
        >
          <X class="w-4 h-4" :stroke-width="2.5" />
          <span>Reject</span>
        </button>
      </div>
      <span v-else class="text-slate-400 text-sm">—</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Check, X } from "@lucide/vue";
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

const displayName = computed(() => {
  const raw = props.request.user?.name;
  if (!raw) return `User #${props.request.userId}`;
  return raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
});

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
</script>