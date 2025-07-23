import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';

export type ViewMode = '1:1' | 'DIFF';

const DARK_MODE_STORAGE_KEY = 'celtraExam-dark-mode';
const VIEW_MODE_STORAGE_KEY = 'celtraExam-view-mode';

export const useUiStore = defineStore('ui', () => {
  const isDarkMode = ref<boolean>(
    localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true'
  );
  
  //default mode 1:1
  const viewMode = ref<ViewMode>(
    (localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode) || '1:1'
  );

  const isDiffMode = computed({
    get: () => viewMode.value === 'DIFF',
    
    set: (isDiff) => {
      viewMode.value = isDiff ? 'DIFF' : '1:1';
    }
  });

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

  watch(viewMode, (newVal, oldVal) => {
    const rootEl = document.documentElement;
    if (oldVal) {
      rootEl.classList.remove(`view-mode--${oldVal.toLowerCase()}`);
    }
    rootEl.classList.add(`view-mode--${newVal.toLowerCase()}`);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, newVal);
  }, { immediate: true });

  return {
    isDarkMode,
    viewMode,
    isDiffMode,
  };
});