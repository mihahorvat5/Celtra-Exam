import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

const DARK_MODE_STORAGE_KEY = 'celtraExam-dark-mode';

export const useUiStore = defineStore('ui', () => {
  const isDarkMode = ref<boolean>(
    localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true'
  );

  const isTouchDevice = ref(window.matchMedia('(pointer: coarse)').matches);

  watch(isDarkMode, (newVal) => {
    const rootEl = document.documentElement;
    if (newVal) {
      rootEl.setAttribute('data-theme', 'dark');
      localStorage.setItem(DARK_MODE_STORAGE_KEY, 'true');
    } else {
      rootEl.removeAttribute('data-theme');
      localStorage.setItem(DARK_MODE_STORAGE_KEY, 'false');
    }
  }, { immediate: true });

  return {
    isDarkMode,
    isTouchDevice,
  };
});