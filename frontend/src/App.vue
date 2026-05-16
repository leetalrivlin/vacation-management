<template>
  <div class="h-screen flex flex-col bg-slate-50">
    <header class="shrink-0 px-8 py-4 bg-menu text-white shadow-md">
      <nav class="flex items-center justify-between">
        <router-link
            :to="logoTarget"
            class="flex items-center no-underline"
        >
          <img
              :src="logoWhite"
              alt="Requesy"
              class="h-12 w-auto"
          />
        </router-link>

        <div v-if="currentUser" class="relative" ref="menuRef">
          <button
              type="button"
              class="flex items-center gap-3 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              @click="menuOpen = !menuOpen"
          >
            <span
                class="w-9 h-9 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-semibold"
            >
              {{ initials }}
            </span>
            <span>Hello {{ currentUser.displayName }}</span>
          </button>

          <div
              v-if="menuOpen"
              class="absolute right-0 mt-2 w-40 bg-white text-slate-900 rounded-lg shadow-lg overflow-hidden z-10"
          >
            <button
                type="button"
                class="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-slate-100 cursor-pointer"
                @click="handleLogout"
            >
              <LogOut class="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
    <main class="flex-1 overflow-y-auto">
      <div class="p-8 max-w-6xl mx-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "./composables/useAuth";
import { UserRole } from "./types";
import { LogOut } from "@lucide/vue";
import logoWhite from "./assets/requesty_logo_white_green.png";

const router = useRouter();
const { currentUser, logout } = useAuth();

const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const initials = computed(() => {
  const name = currentUser.value?.displayName ?? "";
  return name.slice(0, 1).toUpperCase();
});

const logoTarget = computed(() => {
  if (!currentUser.value) return "/";
  return currentUser.value.role === UserRole.VALIDATOR ? "/admin" : "/user";
});

function handleLogout() {
  menuOpen.value = false;
  logout();
  router.push("/");
}

function handleClickOutside(event: MouseEvent) {
  if (!menuRef.value) return;
  if (!menuRef.value.contains(event.target as Node)) {
    menuOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>
