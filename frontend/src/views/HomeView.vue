<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
      <img
          :src="heroGif"
          alt="Vacation"
          class="w-full h-90 object-cover"
      />
      <div class="p-6">
        <h1 class="text-3xl font-bold text-slate-900 m-0 mb-2 flex items-center justify-center gap-0 md:gap-3 flex-wrap">
          <span>Welcome to</span>
          <img
              :src="logoBlack"
              alt="Requesy"
              class="h-18 w-auto md:pt-2"
          />
        </h1>
        <p class="text-slate-600 text-center mb-6">
          Sign in to request time off or review pending requests.
        </p>

        <div class="max-w-sm mx-auto">
          <label
              for="login-identity"
              class="block mb-1 font-medium text-slate-700"
          >
            Sign in as
          </label>
          <select
              id="login-identity"
              v-model="selected"
              class="w-full px-3 py-2 border border-slate-300 rounded text-base mb-4 focus:outline-none focus:border-brand"
          >
            <option value="" disabled>Select a user</option>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
            <option value="Admin">Admin</option>
          </select>

          <button
              type="button"
              :disabled="submitting || !selected"
              class="w-full bg-brand text-white px-6 py-2 rounded text-base cursor-pointer hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="handleLogin"
          >
            {{ submitting ? "Signing in..." : "Sign in" }}
          </button>

          <div
              v-if="error"
              class="mt-4 bg-red-50 text-red-700 px-3 py-3 rounded"
          >
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import heroGif from "../assets/vacation_1.gif";
import logoBlack from "../assets/requesty_logo_black_green.png";
import { login, type AuthIdentity } from "../composables/useAuth";
import { UserRole } from "../types";

const router = useRouter();
const selected = ref<AuthIdentity | "">("");
const submitting = ref(false);
const error = ref("");

async function handleLogin() {
  if (!selected.value) return;
  error.value = "";
  submitting.value = true;
  try {
    const user = await login(selected.value);
    const target = user.role === UserRole.VALIDATOR ? "/admin" : "/user";
    await router.push(target);
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || "Sign in failed";
  } finally {
    submitting.value = false;
  }
}
</script>
