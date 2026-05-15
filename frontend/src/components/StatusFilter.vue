<template>
  <div class="flex gap-2 flex-wrap">
    <button
        v-for="option in options"
        :key="option.value ?? 'all'"
        type="button"
        :class="buttonClasses(option.value)"
        @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { RequestStatus } from "../types";

const props = defineProps<{ modelValue: RequestStatus | undefined }>();
defineEmits<{ "update:modelValue": [value: RequestStatus | undefined] }>();

const options: { label: string; value: RequestStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: RequestStatus.PENDING },
  { label: "Approved", value: RequestStatus.APPROVED },
  { label: "Rejected", value: RequestStatus.REJECTED },
];

function buttonClasses(value: RequestStatus | undefined): string {
  const base = "px-4 py-2 rounded text-sm font-medium border transition-colors cursor-pointer";
  return props.modelValue === value
      ? `${base} bg-slate-900 text-white border-slate-900`
      : `${base} bg-white text-slate-700 border-slate-300 hover:bg-slate-100`;
}
</script>