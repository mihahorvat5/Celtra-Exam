import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { picsumService } from '@/services/picsumService';
import type { PicsumImage } from '@/types/Image';
import { useUiStore } from './uiStore';

interface PageCacheEntry {
  images: PicsumImage[];
  timestamp: number;
}

const ITEMS_PER_PAGE = 20;
const CACHE_TTL = 10 * 1000;

export const useGalleryStore = defineStore('gallery', () => {
  const uiStore = useUiStore();

  const imagesByPage = ref<Record<number, PageCacheEntry>>({});
  const currentPage = ref(1);
  const totalPages = ref<number | null>(null);
  const pendingPageFetches = ref(new Set<number>());

  const endlessImages = ref<PicsumImage[]>([]);
  const endlessNextPage = ref(1);
  const isFetchingMore = ref(false);
  const hasMoreEndless = ref(true);

  const visibleCardIds = ref(new Set<string>());

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const currentImages = computed((): PicsumImage[] => {
    return uiStore.isTouchDevice
      ? endlessImages.value
      : (imagesByPage.value[currentPage.value]?.images || []);
  });

  const isLastPage = computed(() => totalPages.value !== null && currentPage.value >= totalPages.value);

  const visibilityStatusText = computed(() => {
    const images = currentImages.value;
    if (visibleCardIds.value.size === 0 || images.length === 0) return '';
    const indices = Array.from(visibleCardIds.value)
      .map(id => images.findIndex(img => img.id === id))
      .filter(index => index !== -1)
      .sort((a, b) => a - b);
    if (indices.length === 0) return '';
    const firstVisible = indices[0] + 1;
    const lastVisible = indices[indices.length - 1] + 1;
    const range = firstVisible === lastVisible ? `${firstVisible}` : `${firstVisible}–${lastVisible}`;
    const total = uiStore.isTouchDevice ? images.length : ITEMS_PER_PAGE;
    return `${range} of ${total}`;
  });

  async function fetchImagesForPage(page: number) {
    if (page < 1 || pendingPageFetches.value.has(page) || (totalPages.value !== null && page > totalPages.value)) return;
    if (!imagesByPage.value[page]) isLoading.value = true;
    error.value = null;
    try {
      pendingPageFetches.value.add(page);
      const freshImages = await picsumService.fetchImageList(page, ITEMS_PER_PAGE);
      if (freshImages.length === 0 && page > 1) {
        totalPages.value = page - 1;
      } else {
        imagesByPage.value[page] = { images: freshImages, timestamp: Date.now() };
        if (freshImages.length < ITEMS_PER_PAGE) totalPages.value = page;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An unknown error occurred.';
    } finally {
      pendingPageFetches.value.delete(page);
      isLoading.value = false;
    }
  }

  function changePage(page: number) {
    if (totalPages.value !== null && page > totalPages.value) return;
    if (page < 1) return;
    visibleCardIds.value.clear();
    currentPage.value = page;
    const cachedPage = imagesByPage.value[page];
    const isCacheFresh = cachedPage && (Date.now() - cachedPage.timestamp < CACHE_TTL);
    if (!isCacheFresh) fetchImagesForPage(page);
  }

  let preloadTimer: number | undefined;
  function preloadPage(page: number) {
    clearTimeout(preloadTimer);
    if (page < 1 || (totalPages.value !== null && page > totalPages.value)) return;
    const cachedPage = imagesByPage.value[page];
    const isCacheStale = cachedPage && (Date.now() - cachedPage.timestamp > CACHE_TTL);
    if (!cachedPage || isCacheStale) {
      preloadTimer = setTimeout(() => { fetchImagesForPage(page); }, 100);
    }
  }
  
  async function fetchMoreEndlessImages() {
    if (isFetchingMore.value || !hasMoreEndless.value) return;
    isFetchingMore.value = true;
    if (endlessImages.value.length === 0) isLoading.value = true;
    try {
      const newImages = await picsumService.fetchImageList(endlessNextPage.value, ITEMS_PER_PAGE);
      if (newImages.length > 0) {
        endlessImages.value.push(...newImages);
        endlessNextPage.value++;
      } else {
        hasMoreEndless.value = false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An unknown error occurred.';
    } finally {
      isFetchingMore.value = false;
      isLoading.value = false;
    }
  }

  function setCardVisibility(id: string, isVisible: boolean) {
    if (isVisible) {
      visibleCardIds.value.add(id);
    } else {
      visibleCardIds.value.delete(id);
    }
  }

  function initialize() {
    if (currentImages.value.length > 0) return;
    if (uiStore.isTouchDevice) {
      fetchMoreEndlessImages();
    } else {
      fetchImagesForPage(currentPage.value);
    }
  }
  
  return {
    currentPage, isLoading, error, totalPages, currentImages, isLastPage,
    changePage, preloadPage, fetchImagesForPage,
    isFetchingMore, hasMoreEndless,
    fetchMoreEndlessImages,
    setCardVisibility,
    visibilityStatusText,
    initialize,
  };
});