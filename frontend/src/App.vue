<template>
  <div class="min-h-screen bg-slate-50">
    <header class="px-8 py-4 bg-slate-900 text-white">
      <nav class="flex gap-4">
        <router-link
            to="/"
            class="text-white no-underline hover:underline"
            active-class="font-bold underline"
        >
          Home
        </router-link>
        <router-link
            to="/requester"
            class="text-white no-underline hover:underline"
            active-class="font-bold underline"
        >
          Requester
        </router-link>
        <router-link
            to="/validator"
            class="text-white no-underline hover:underline"
            active-class="font-bold underline"
        >
          Validator
        </router-link>
      </nav>
    </header>
    <main class="p-8 max-w-6xl mx-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>