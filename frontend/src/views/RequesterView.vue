<template>
  <div>
    <header class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-3xl font-bold text-slate-900 m-0">
        User Interface
      </h1>
    </header>

    <div v-if="!userId" class="bg-red-50 text-red-700 p-4 rounded">
      Could not resolve your user account.
    </div>
    <template v-else>
      <div class="flex flex-col md:flex-row gap-6 items-start mb-8">
        <RequestForm :user-id="userId" @submitted="onSubmitted" />
        <DotLottieVue
            autoplay
            loop
            src="https://lottie.host/3dcc9766-926e-4d58-bd8d-068787c5ed48/5Ty4Lo4mW6.lottie"
            aria-hidden="true"
            class="hidden md:block md:flex-1 max-h-96"
        />
      </div>
      <RequestList :user-id="userId" :refresh-key="refreshKey" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";
import RequestForm from "../components/RequestForm.vue";
import RequestList from "../components/RequestList.vue";
import { useAuth } from "../composables/useAuth";

const { currentUser } = useAuth();
const refreshKey = ref(0);

const userId = computed(() => currentUser.value?.userId ?? null);

function onSubmitted() {
  refreshKey.value++;
}
</script>
