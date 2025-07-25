<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/uiStore';
import { useGalleryViewStore } from '@/stores/galleryViewStore';

import ArrowLeftIcon from '@/components/ui/ArrowLeftIcon.vue';
import ArrowRightIcon from '@/components/ui/ArrowRightIcon.vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number | null;
  isLastPage: boolean;
}>();

const emit = defineEmits(['change-page', 'preload-page']);

const uiStore = useUiStore();
const galleryViewStore = useGalleryViewStore();

const { isTouchDevice } = storeToRefs(uiStore);
const { visibilityStatusText } = storeToRefs(galleryViewStore);

const isHoveringPrev = ref(false);
const isHoveringNext = ref(false);

watch(() => props.currentPage, (newPage, oldPage) => {
  if (newPage === oldPage) return;
  if (isHoveringNext.value) emit('preload-page', newPage + 1);
  if (isHoveringPrev.value) emit('preload-page', newPage - 1);
});

const pagesToDisplay = computed(() => {
  const pages = [];
  const currentPage = props.currentPage;
  const total = props.totalPages;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = startPage + 4;
  if (total !== null) endPage = Math.min(endPage, total);
  if (currentPage <= 3) {
    startPage = 1;
    endPage = total === null ? 5 : Math.min(5, total);
  }
  if (total !== null && currentPage > total - 2) {
    startPage = Math.max(1, total - 4);
  }
  for (let i = startPage; i <= endPage; i++) pages.push(i);
  return pages;
});
</script>

<template>
  <div class="gallery-controls">
    <div class="status-indicator">
      {{ visibilityStatusText }}
    </div>

    <template v-if="!isTouchDevice">
      <div class="pagination-controls">
        <button
          @click="emit('change-page', props.currentPage - 1)"
          @mouseenter="isHoveringPrev = true; emit('preload-page', props.currentPage - 1)"
          @mouseleave="isHoveringPrev = false"
          :disabled="props.currentPage === 1"
          class="pagination-button"
          aria-label="Previous Page"
        >
          <ArrowLeftIcon />
        </button>

        <button
          v-for="page in pagesToDisplay"
          :key="page"
          @click="emit('change-page', page)"
          @mouseenter="emit('preload-page', page)"
          :class="{ 'is-active': page === props.currentPage }"
          class="pagination-button page-number"
          :aria-label="`Go to page ${page}`"
          :aria-current="page === props.currentPage ? 'page' : undefined"
        >
          {{ page }}
        </button>

        <button
          @click="emit('change-page', props.currentPage + 1)"
          @mouseenter="isHoveringNext = true; emit('preload-page', props.currentPage + 1)"
          @mouseleave="isHoveringNext = false"
          :disabled="props.isLastPage"
          class="pagination-button"
          aria-label="Next Page"
        >
          <ArrowRightIcon />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.gallery-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--color-button-bg);
}

.status-indicator {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.pagination-button {
  width: 2rem;
  height: 2rem;
  background-color: transparent;
  border: 1px solid var(--color-border);
  /*background-color: var(--color-surface);*/
  color: var(--color-text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  &.page-number {
    border-radius: 8px;
  }
  &:not(.page-number) {
    border: none;
  }
  &:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &.is-active {
    /*background-color: var(--color-accent);*/
    color: var(--color-accent);
    border-color: var(--color-accent);
    font-weight: 700;
  }
  &:not(.is-active) {
    /*background-color: var(--color-accent);*/
    border: none;
  }
}
</style>