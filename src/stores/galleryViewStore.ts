import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useUiStore } from './uiStore';
import { useImageStore } from './imageStore';
import { useUserHistoryStore } from './userHistoryStore';

interface PageCacheEntry {
  ids: string[];
  timestamp: number;
}

const ITEMS_PER_PAGE = 20;
const CACHE_TTL = 10 * 1000;

export const useGalleryViewStore = defineStore('gallery-view', () => {
  const uiStore = useUiStore();
  const imageStore = useImageStore();
  const userHistoryStore = useUserHistoryStore();

  const desktopPages = ref<Record<number, PageCacheEntry>>({});
  const currentPage = ref(1);
  const totalPages = ref<number | null>(null);
  const pendingPageFetches = ref(new Set<number>());

  const endlessImageIds = ref<string[]>([]);
  const endlessNextPage = ref(1);
  const isFetchingMore = ref(false);
  const hasMoreEndless = ref(true);

  const visibleCardIds = ref(new Set<string>());
  const isDetailViewActive = ref(false);
  const preloadedInDetailView = ref(new Set<number>());
  const isAutoScrolling = ref(false);
  const shouldScrollToLatest = ref(false);

  const currentImageIds = computed((): string[] => {
    return uiStore.isTouchDevice
      ? endlessImageIds.value
      : (desktopPages.value[currentPage.value]?.ids || []);
  });

  const currentImages = computed(() => {
    return currentImageIds.value.map(id => imageStore.findImageById(id)).filter(Boolean);
  });

  const allDesktopImageIds = computed(() => {
    return Object.keys(desktopPages.value)
      .sort((a, b) => Number(a) - Number(b))
      .flatMap(page => desktopPages.value[Number(page)]?.ids || []);
  });
  
  const allImageIds = computed(() => {
    return uiStore.isTouchDevice ? endlessImageIds.value : allDesktopImageIds.value;
  });

  const isLastPage = computed(() => totalPages.value !== null && currentPage.value >= totalPages.value);

  const visibilityStatusText = computed(() => {
    if (visibleCardIds.value.size === 0 || currentImages.value.length === 0) return '';
    const indices = Array.from(visibleCardIds.value).map(id => currentImages.value.findIndex(img => img && img.id === id)).filter(index => index !== -1).sort((a, b) => a - b);
    if (indices.length === 0) return '';
    const firstVisible = indices[0] + 1;
    const lastVisible = indices[indices.length - 1] + 1;
    const range = firstVisible === lastVisible ? `${firstVisible}` : `${firstVisible}–${lastVisible}`;
    const total = uiStore.isTouchDevice ? currentImages.value.length : ITEMS_PER_PAGE;
    return `${range} of ${total}`;
  });

  const getNeighboringImageIds = computed(() => {
    return (currentId: string): { prev: string | null; next: string | null } => {
      const sourceIds = allImageIds.value;
      const currentIndex = sourceIds.findIndex(id => id === currentId);
      if (currentIndex === -1) return { prev: null, next: null };
      
      if (isDetailViewActive.value) {
        if (uiStore.isTouchDevice) {
          if (currentIndex >= sourceIds.length - 5) fetchMoreEndlessImages();
        } else {
          const pageOfCurrentImage = findPageOfImage(currentId);
          if (pageOfCurrentImage !== -1) {
            const indexOnPage = desktopPages.value[pageOfCurrentImage]?.ids.findIndex(id => id === currentId);
            if (indexOnPage !== -1 && indexOnPage >= ITEMS_PER_PAGE - 5) {
              const nextPage = pageOfCurrentImage + 1;
              if ((!totalPages.value || nextPage <= totalPages.value) && !preloadedInDetailView.value.has(nextPage)) {
                preloadPage(nextPage);
                preloadedInDetailView.value.add(nextPage);
              }
            }
            if (indexOnPage !== -1 && indexOnPage < 5) {
              const prevPage = pageOfCurrentImage - 1;
              if (prevPage >= 1 && !preloadedInDetailView.value.has(prevPage)) {
                preloadPage(prevPage);
                preloadedInDetailView.value.add(prevPage);
              }
            }
          }
        }
      }
      
      const prev = currentIndex > 0 ? sourceIds[currentIndex - 1] : null;
      const next = currentIndex < sourceIds.length - 1 ? sourceIds[currentIndex + 1] : null;
      return { prev, next };
    };
  });

  async function fetchImagesForPage(page: number) {
    if (page < 1 || pendingPageFetches.value.has(page) || (totalPages.value !== null && page > totalPages.value)) return;
    pendingPageFetches.value.add(page);
    try {
      const freshImages = await imageStore.fetchImageList(page, ITEMS_PER_PAGE);
      if (freshImages.length === 0 && page > 1) {
        totalPages.value = page - 1;
      } else {
        desktopPages.value[page] = { ids: freshImages.map(img => img.id), timestamp: Date.now() };
        if (freshImages.length < ITEMS_PER_PAGE) totalPages.value = page;
      }
    } finally {
      pendingPageFetches.value.delete(page);
    }
  }

  function changePage(page: number) {
    if (totalPages.value !== null && page > totalPages.value) return;
    if (page < 1) return;
    visibleCardIds.value.clear();
    currentPage.value = page;
    const cachedPage = desktopPages.value[page];
    const isCacheFresh = cachedPage && (Date.now() - cachedPage.timestamp < CACHE_TTL);
    if (!isCacheFresh) fetchImagesForPage(page);
  }

  let preloadTimer: number | undefined;
  function preloadPage(page: number) {
    clearTimeout(preloadTimer);
    if (page < 1 || (totalPages.value !== null && page > totalPages.value)) return;
    const cachedPage = desktopPages.value[page];
    const isCacheStale = cachedPage && (Date.now() - cachedPage.timestamp > CACHE_TTL);
    if (!cachedPage || isCacheStale) {
      preloadTimer = setTimeout(() => { fetchImagesForPage(page); }, 100);
    }
  }
  
  async function fetchMoreEndlessImages() {
    if (isFetchingMore.value || !hasMoreEndless.value) return;
    isFetchingMore.value = true;
    try {
      const newImages = await imageStore.fetchImageList(endlessNextPage.value, ITEMS_PER_PAGE);
      if (newImages.length > 0) {
        endlessImageIds.value.push(...newImages.map(img => img.id));
        endlessNextPage.value++;
      } else {
        hasMoreEndless.value = false;
      }
    } finally {
      isFetchingMore.value = false;
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

  function findPageOfImage(imageId: string): number {
    for (const page in desktopPages.value) {
      if (desktopPages.value[page].ids.includes(imageId)) return Number(page);
    }
    return -1;
  }
  
  function navigateToLatestSeenImage() {
    const id = userHistoryStore.latestSeenImageId;
    if (!id) return;

    if (uiStore.isTouchDevice) {
      setAutoScrolling(true);
      shouldScrollToLatest.value = true;
    } else {
      const foundPage = findPageOfImage(id);
      if (foundPage !== -1) {
        changePage(foundPage);
        shouldScrollToLatest.value = true;
      }
    }
  }

  function setCardVisibility(id: string, isVisible: boolean) { isVisible ? visibleCardIds.value.add(id) : visibleCardIds.value.delete(id); }
  function setDetailViewActive(isActive: boolean) { isDetailViewActive.value = isActive; }
  function clearDetailViewPreloadCache() { preloadedInDetailView.value.clear(); }
  function setAutoScrolling(status: boolean) { isAutoScrolling.value = status; }
  function clearScrollToLatest() { shouldScrollToLatest.value = false; }

  return {
    currentPage,
    totalPages,
    currentImages,
    isLastPage,
    isFetchingMore,
    hasMoreEndless,
    visibilityStatusText,
    getNeighboringImageIds,
    isAutoScrolling,
    shouldScrollToLatest,
    changePage,
    preloadPage,
    fetchMoreEndlessImages,
    initialize,
    setCardVisibility,
    setDetailViewActive,
    clearDetailViewPreloadCache,
    setAutoScrolling,
    clearScrollToLatest,
    navigateToLatestSeenImage,
  };
});