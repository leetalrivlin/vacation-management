<template>
  <div
      v-if="open"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="$emit('cancel')"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-semibold text-slate-900 mt-0 mb-4">
        Reject vacation request
      </h3>
      <p class="text-slate-600 mb-4">
        Please provide a reason for rejecting this request. The requester will see this comment.
      </p>

      <textarea
          v-model="comment"
          rows="4"
          placeholder="e.g., Team is short-staffed during this period"
          class="w-full px-3 py-2 border border-slate-300 rounded text-base font-sans focus:outline-none focus:border-slate-900 mb-2"
          ref="textareaRef"
      />

      <div v-if="error" class="text-sm text-red-600 mb-3">
        {{ error }}
      </div>

      <div class="flex justify-end gap-2">
        <button
            type="button"
            class="px-4 py-2 rounded text-slate-700 border border-slate-300 bg-white hover:bg-slate-100 cursor-pointer"
            @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
            type="button"
            class="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
            :disabled="submitting"
            @click="handleConfirm"
        >
          {{ submitting ? "Rejecting..." : "Reject" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = defineProps<{ open: boolean; submitting: boolean }>();
const emit = defineEmits<{
  cancel: [];
  confirm: [comment: string];
}>();

const comment = ref("");
const error = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);

function handleConfirm() {
  if (!comment.value.trim()) {
    error.value = "A comment is required to reject a request";
    return;
  }
  emit("confirm", comment.value.trim());
}

watch(
    () => props.open,
    async (isOpen) => {
      if (isOpen) {
        comment.value = "";
        error.value = "";
        await nextTick();
        textareaRef.value?.focus();
      }
    }
);
</script>