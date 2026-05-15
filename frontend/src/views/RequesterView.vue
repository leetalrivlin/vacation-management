<template>
  <div>
    <header class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-3xl font-bold text-slate-900 m-0">
        Requester Interface
      </h1>
      <div class="flex items-center gap-2">
        <label for="user" class="font-medium text-slate-700">
          Acting as:
        </label>
        <select
            id="user"
            v-model.number="selectedUserId"
            class="px-3 py-2 border border-slate-300 rounded text-base"
        >
          <option v-for="user in requesters" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
    </header>

    <div v-if="loadingUsers" class="text-slate-500">Loading users...</div>
    <div
        v-else-if="userError"
        class="bg-red-50 text-red-700 p-4 rounded"
    >
      {{ userError }}
    </div>
    <template v-else-if="selectedUserId">
      <RequestForm :user-id="selectedUserId" @submitted="onSubmitted" />
      <RequestList :user-id="selectedUserId" :refresh-key="refreshKey" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import RequestForm from "../components/RequestForm.vue";
import RequestList from "../components/RequestList.vue";
import { userApi } from "../services/api";
import { UserRole, type User } from "../types";

const users = ref<User[]>([]);
const selectedUserId = ref<number | null>(null);
const refreshKey = ref(0);
const loadingUsers = ref(false);
const userError = ref("");

const requesters = computed(() =>
    users.value.filter((u) => u.role === UserRole.REQUESTER)
);

async function loadUsers() {
  loadingUsers.value = true;
  userError.value = "";
  try {
    users.value = await userApi.getAll();
    if (requesters.value.length > 0) {
      selectedUserId.value = requesters.value[0].id;
    }
  } catch (err: any) {
    userError.value = err.response?.data?.error || "Failed to load users";
  } finally {
    loadingUsers.value = false;
  }
}

function onSubmitted() {
  refreshKey.value++;
}

onMounted(() => loadUsers());
</script>