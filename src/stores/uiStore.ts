import { defineStore } from 'pinia';
import type { PersistenceOptions } from 'pinia-plugin-persistedstate';

export const useUiStore = defineStore('ui', {
  state: () => ({
    isDarkMode: false,
  }),

  getters: {
    isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches,
  },

  persist: {
    paths: ['isDarkMode'],
  } as PersistenceOptions,
});