<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useUiStore } from '@/stores/uiStore';
import { useImageStore } from '@/stores/imageStore';
import { useGalleryViewStore } from '@/stores/galleryViewStore';
import { useUserHistoryStore } from '@/stores/userHistoryStore';

import { usePaginationStore } from '@/stores/paginationStore';
import { useInfiniteScrollStore } from '@/stores/infiniteScrollStore';

import { useImageObserver } from './composables/useImageObserver';

import ImageCard from './components/ImageCard.vue';
import GalleryControls from './components/GalleryControls.vue';

const uiStore = useUiStore();
const imageStore = useImageStore();
const galleryViewStore = useGalleryViewStore();
const userHistoryStore = useUserHistoryStore();
const paginationStore = usePaginationStore();
const infiniteScrollStore = useInfiniteScrollStore();

const { isTouchDevice } = storeToRefs(uiStore);
const { isLoading, error } = storeToRefs(imageStore);
const { latestSeenImageId } = storeToRefs(userHistoryStore);
const { shouldScrollToLatest, isAutoScrolling } = storeToRefs(galleryViewStore);
const { currentPage, isLastPage, totalPages } = storeToRefs(paginationStore);
const { isFetching: isFetchingMore, imageIds: mobileImageIds } = storeToRefs(infiniteScrollStore);

const currentImages = computed(() => {
  const imageIds = isTouchDevice.value ? mobileImageIds.value : paginationStore.currentImageIds;
  return imageIds.map(id => imageStore.findImageById(id));
});

const scrollContainerRef = ref<HTMLElement | null>(null);

useImageObserver(scrollContainerRef, currentImages);

async function scrollToLatestSeenImage() {
  if (!latestSeenImageId.value) {
    galleryViewStore.isAutoScrolling = false;
    return;
  }
  await nextTick();
  const cardToScrollTo = scrollContainerRef.value?.querySelector(`[data-image-id="${latestSeenImageId.value}"]`);
  if (cardToScrollTo) {
    galleryViewStore.isAutoScrolling = true;
    cardToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { galleryViewStore.isAutoScrolling = false; }, 1000);
  } else {
    galleryViewStore.isAutoScrolling = false;
  }
}

watch(currentPage, () => {
  if (!isTouchDevice.value && scrollContainerRef.value) {
    scrollContainerRef.value.scrollTo({ top: 0, behavior: 'smooth' });
    galleryViewStore.visibleCardIds.clear();
  }
});

onMounted(() => {
  galleryViewStore.initialize();
  if (shouldScrollToLatest.value) {
    scrollToLatestSeenImage();
    galleryViewStore.shouldScrollToLatest = false;
  }
});
</script>

<template>
  <div class="gallery-view">
    <GalleryControls
      :is-touch-device="isTouchDevice"
      :current-page="currentPage"
      :is-last-page="isLastPage"
      :total-pages="totalPages"
      @change-page="paginationStore.changePage"
      @preload-page="paginationStore.preloadPage"
    />
    <div v-if="error" class="state-indicator error">
      <h2>Something went wrong</h2>
      <p>{{ error }}</p>
    </div>
    <div ref="scrollContainerRef" class="gallery-grid-holder">
      <div class="gallery-grid">
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