<script setup lang="ts">
import { watch } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
const { isDarkMode } = storeToRefs(uiStore);

watch(isDarkMode, (newVal) => {
  const rootEl = document.documentElement;
  if (newVal) {
    rootEl.setAttribute('data-theme', 'dark');
  } else {
    rootEl.removeAttribute('data-theme');
  }
}, { immediate: true });
</script>

<template>
  <RouterView />
</template>