<template>
  <form
      class="bg-white p-6 rounded-lg shadow w-full md:w-1/3"
      @submit.prevent="handleSubmit"
  >
    <h2 class="text-xl font-semibold text-slate-900 mt-0 mb-4">
      Submit a new vacation request
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label for="startDate" class="block mb-1 font-medium text-slate-700">
          Start Date <span class="text-red-600">*</span>
        </label>
        <input
            id="startDate"
            v-model="startDate"
            type="date"
            required
            :min="today"
            class="w-full px-3 py-2 border border-slate-300 rounded text-base focus:outline-none focus:border-brand cursor-pointer"
        />
      </div>

      <div>
        <label for="endDate" class="block mb-1 font-medium text-slate-700">
          End Date <span class="text-red-600">*</span>
        </label>
        <input
            id="endDate"
            v-model="endDate"
            type="date"
            required
            :min="startDate || today"
            class="w-full px-3 py-2 border border-slate-300 rounded text-base focus:outline-none focus:border-brand cursor-pointer"
        />
      </div>
    </div>

    <div class="mb-4">
      <label for="reason" class="block mb-1 font-medium text-slate-700">
        Reason (optional)
      </label>
      <textarea
          id="reason"
          v-model="reason"
          rows="3"
          placeholder="e.g., Summer holiday with family"
          class="w-full px-3 py-2 border border-slate-300 rounded text-base font-sans focus:outline-none focus:border-brand"
      />
    </div>

    <div
        v-if="error"
        class="bg-red-50 text-red-700 px-3 py-3 rounded mb-4"
    >
      {{ error }}
    </div>
    <div
        v-if="success"
        class="bg-green-50 text-green-700 px-3 py-3 rounded mb-4"
    >
      {{ success }}
    </div>

    <button
        type="submit"
        :disabled="submitting"
        class="inline-flex items-center gap-2 bg-brand text-white px-6 py-2 rounded text-base cursor-pointer hover:bg-brand-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
    >
      <Send class="w-4 h-4" />
      <span>{{ submitting ? "Submitting..." : "Submit request" }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Send } from "@lucide/vue";
import { vacationRequestApi } from "../services/api";

const props = defineProps<{ userId: number }>();
const emit = defineEmits<{ submitted: [] }>();

const startDate = ref("");
const endDate = ref("");
const reason = ref("");
const submitting = ref(false);
const error = ref("");
const success = ref("");

const today = computed(() => new Date().toISOString().split("T")[0]);

let successTimer: ReturnType<typeof setTimeout> | null = null;

function showSuccess(message: string) {
  success.value = message;
  if (successTimer) clearTimeout(successTimer);
  successTimer = setTimeout(() => {
    success.value = "";
    successTimer = null;
  }, 3000);
}

async function handleSubmit() {
  error.value = "";
  success.value = "";
  if (successTimer) {
    clearTimeout(successTimer);
    successTimer = null;
  }

  if (new Date(startDate.value) > new Date(endDate.value)) {
    error.value = "End date must be after start date";
    return;
  }

  submitting.value = true;
  try {
    await vacationRequestApi.create({
      userId: props.userId,
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value || undefined,
    });
    showSuccess("Request submitted successfully!");
    startDate.value = "";
    endDate.value = "";
    reason.value = "";
    emit("submitted");
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to submit request";
  } finally {
    submitting.value = false;
  }
}
</script>