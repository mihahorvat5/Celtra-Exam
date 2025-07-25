import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

const SEEN_IMAGES_KEY = 'celtraExam-seen-images';
const LATEST_SEEN_KEY = 'celtraExam-latest-seen';

export const useUserHistoryStore = defineStore('user-history', () => {
  const seenImages = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem(SEEN_IMAGES_KEY) || '[]')));
  const latestSeenImageId = ref<string | null>(localStorage.getItem(LATEST_SEEN_KEY));

  watch(seenImages, (newSet) => {
    localStorage.setItem(SEEN_IMAGES_KEY, JSON.stringify(Array.from(newSet)));
  }, { deep: true });

  watch(latestSeenImageId, (newId) => {
    if (newId) {
      localStorage.setItem(LATEST_SEEN_KEY, newId);
    } else {
      localStorage.removeItem(LATEST_SEEN_KEY);
    }
  });

  function markAsSeen(id: string) {
    seenImages.value.add(id);
    latestSeenImageId.value = id;
  }

  return {
    seenImages,
    latestSeenImageId,
    markAsSeen,
  };
});