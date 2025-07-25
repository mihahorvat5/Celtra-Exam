<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/uiStore';
import { useImageStore } from '@/stores/imageStore';
import { useGalleryViewStore } from '@/stores/galleryViewStore';
import { useUserHistoryStore } from '@/stores/userHistoryStore';
import ImageCard from './components/ImageCard.vue';
import GalleryControls from './components/GalleryControls.vue';

const ITEMS_PER_PAGE = 20;
const TRIGGER_CARD_INDEX = 13;
const VISIBILITY_THRESHOLD = 0.5;

const uiStore = useUiStore();
const imageStore = useImageStore();
const galleryViewStore = useGalleryViewStore();
const userHistoryStore = useUserHistoryStore();

const { isTouchDevice } = storeToRefs(uiStore);
const { isLoading, error } = storeToRefs(imageStore);
const { latestSeenImageId } = storeToRefs(userHistoryStore);
const { 
  currentImages, currentPage, isLastPage, totalPages, isFetchingMore,
  shouldScrollToLatest, isAutoScrolling
} = storeToRefs(galleryViewStore);

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

      galleryViewStore.setCardVisibility(id, entry.intersectionRatio > VISIBILITY_THRESHOLD);
      
      if (isTouchDevice.value && entry.isIntersecting && !isAutoScrolling.value) {
        const isPrimaryTrigger = (index + 1) % ITEMS_PER_PAGE === TRIGGER_CARD_INDEX;
        const isFallbackTrigger = (index === currentImages.value.length - 1);

        if (isPrimaryTrigger || isFallbackTrigger) {
          const batchNumber = Math.floor(index / ITEMS_PER_PAGE);
          const canonicalTriggerIndex = batchNumber * ITEMS_PER_PAGE + TRIGGER_CARD_INDEX;
          if (!triggeredIndices.value.has(canonicalTriggerIndex)) {
            triggeredIndices.value.add(canonicalTriggerIndex);
            galleryViewStore.fetchMoreEndlessImages();
          }
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

async function scrollToLatestSeenImage() {
  if (!latestSeenImageId.value) {
    galleryViewStore.setAutoScrolling(false);
    return;
  }
  
  await nextTick();
  
  const cardToScrollTo = galleryGridEl.value?.querySelector(
    `[data-image-id="${latestSeenImageId.value}"]`
  );

  if (cardToScrollTo) {
    const scrollEndObserver = new IntersectionObserver((entries, observer) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        galleryViewStore.setAutoScrolling(false);
        observer.disconnect();
      }
    }, { threshold: VISIBILITY_THRESHOLD });

    scrollEndObserver.observe(cardToScrollTo);

    cardToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    galleryViewStore.setAutoScrolling(false);
  }
}

onMounted(() => {
  galleryViewStore.initialize();
  setupObserver();

  if (shouldScrollToLatest.value) {
    scrollToLatestSeenImage();
    galleryViewStore.clearScrollToLatest();
  }
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
      @change-page="galleryViewStore.changePage"
      @preload-page="galleryViewStore.preloadPage"
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
            :key="image?.id || `skeleton-${index}`"
            :image="image || null"
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
  &::-webkit-scrollbar { display: none; }
}
.gallery-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  //različna porazdelitev grida glede na napravo
  @media (min-width: 576px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 992px) { grid-template-columns: repeat(4, 1fr); }
  @media (min-width: 1400px) { grid-template-columns: repeat(5, 1fr); }
}
.state-indicator, .loading-indicator {
  text-align: center;
  padding: 1rem;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  &.error { color: #dc3545; }
}
</style>