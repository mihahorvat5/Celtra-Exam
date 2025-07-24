<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useGalleryStore } from '@/stores/galleryStore';
import { useUiStore } from '@/stores/uiStore';
import ImageCard from './components/ImageCard.vue';
import GalleryControls from './components/GalleryControls.vue';

const ITEMS_PER_PAGE = 20;
const TRIGGER_CARD_INDEX = 13;

//50% visible da šteje v counter - manj bo štelo prej, več bo štelo kasneje
const VISIBILITY_THRESHOLD = 0.5;

const galleryStore = useGalleryStore();
const { currentImages, currentPage, isLoading, error, isLastPage, totalPages, isFetchingMore } = storeToRefs(galleryStore);

const uiStore = useUiStore();
const { isTouchDevice } = storeToRefs(uiStore);

const galleryGridEl = ref<HTMLElement | null>(null);
let cardObserver: IntersectionObserver | null = null;
const triggeredIndices = ref(new Set<number>());

const setupObserver = () => {
  if (cardObserver) cardObserver.disconnect();

  cardObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement;
      const id = target.dataset.imageId;
      const index = parseInt(target.dataset.imageIndex || '-1', 10);
      if (!id || index === -1) continue;

      if (entry.intersectionRatio > VISIBILITY_THRESHOLD) {
        galleryStore.setCardVisibility(id, true);
      } else {
        galleryStore.setCardVisibility(id, false);
      }
      if (isTouchDevice.value && entry.isIntersecting) {
        const isTriggerCard = (index + 1) % ITEMS_PER_PAGE === TRIGGER_CARD_INDEX;
        if (isTriggerCard && !triggeredIndices.value.has(index)) {
          triggeredIndices.value.add(index);
          galleryStore.fetchMoreEndlessImages();
        }
      }
    }
  }, {
    root: null,
    threshold: [0, 0.25, 0.5, VISIBILITY_THRESHOLD, 0.75, 1.0],
  });

  nextTick(() => {
    if (galleryGridEl.value) {
      const cards = galleryGridEl.value.querySelectorAll('.card-shell');
      cards.forEach(card => cardObserver?.observe(card));
    }
  });
};

onMounted(() => {
  galleryStore.initialize();
  setupObserver();
});

onUnmounted(() => {
  if (cardObserver) cardObserver.disconnect();
});

watch(currentImages, () => {
  setupObserver();
}, { deep: true });
</script>

<template>
  <div class="gallery-view">
    <GalleryControls
      :current-page="currentPage"
      :is-last-page="isLastPage"
      :total-pages="totalPages"
      @change-page="galleryStore.changePage"
      @preload-page="galleryStore.preloadPage"
    />

    <div v-if="error" class="state-indicator error">
      <h2>Something went wrong</h2>
      <p>{{ error }}</p>
    </div>

    <div class="gallery-grid-holder">
      <div ref="galleryGridEl" class="gallery-grid">
        <template v-if="isLoading && currentImages.length === 0">
          <ImageCard v-for="n in 20" :key="`skeleton-${n}`" :image="null" :index="n-1" />
        </template>
        <template v-else>
          <ImageCard
            v-for="(image, index) in currentImages"
            :key="image.id"
            :image="image"
            :index="index"
          />
        </template>
      </div>
      <div v-if="isTouchDevice && isFetchingMore" class="loading-indicator">
        <span>Loading more...</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.gallery-view {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-grid-holder {
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.gallery-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  @media (min-width: 576px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 992px) { grid-template-columns: repeat(4, 1fr); }
  @media (min-width: 1400px) { grid-template-columns: repeat(5, 1fr); }
}
.state-indicator,
.loading-indicator {
  text-align: center;
  padding: 1rem;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  &.error { color: #dc3545; }
}
</style>