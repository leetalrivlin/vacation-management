<template>
  <div class="flex items-center gap-2">
    <label for="status-filter" class="font-medium text-slate-700">
      Status
    </label>
    <select
        id="status-filter"
        :value="modelValue ?? ''"
        class="px-3 py-2 border border-slate-300 rounded text-base bg-white focus:outline-none focus:border-brand"
        @change="onChange(($event.target as HTMLSelectElement).value)"
    >
      <option
          v-for="option in options"
          :key="option.value ?? 'all'"
          :value="option.value ?? ''"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { RequestStatus } from "../types";

defineProps<{ modelValue: RequestStatus | undefined }>();
const emit = defineEmits<{
  "update:modelValue": [value: RequestStatus | undefined];
}>();

const options: { label: string; value: RequestStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: RequestStatus.PENDING },
  { label: "Approved", value: RequestStatus.APPROVED },
  { label: "Rejected", value: RequestStatus.REJECTED },
];

function onChange(value: string) {
  emit("update:modelValue", value === "" ? undefined : (value as RequestStatus));
}
</script>
