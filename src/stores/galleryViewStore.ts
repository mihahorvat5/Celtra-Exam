import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useUiStore } from './uiStore'
import { useImageStore } from './imageStore'
import { useUserHistoryStore } from './userHistoryStore'

import { usePaginationStore } from './paginationStore'
import { useInfiniteScrollStore } from './infiniteScrollStore'
import type { PicsumImage } from '@/types/Image'

import { IMAGE_PRELOAD_OFFSET_DESKTOP } from '@/config/constants'

export const useGalleryViewStore = defineStore('gallery-view', () => {
  const uiStore = useUiStore()
  const imageStore = useImageStore()
  const userHistoryStore = useUserHistoryStore()

  const visibleCardIds = ref(new Set<string>())
  const isDetailViewActive = ref(false)
  const preloadedInDetailView = ref(new Set<number>())
  const isAutoScrolling = ref(false)
  const shouldScrollToLatest = ref(false)

  const allImageIds = computed(() => {
    const paginationStore = usePaginationStore()
    const infiniteScrollStore = useInfiniteScrollStore()
    return uiStore.isTouchDevice ? infiniteScrollStore.allImageIds : paginationStore.allImageIds
  })

  const getNeighboringImageIds = computed(() => {
    return (currentId: string): { prev: string | null; next: string | null } => {
      const sourceIds = allImageIds.value
      const currentIndex = sourceIds.findIndex((id) => id === currentId)
      if (currentIndex === -1) return { prev: null, next: null }
      const prev = currentIndex > 0 ? sourceIds[currentIndex - 1] : null
      const next = currentIndex < sourceIds.length - 1 ? sourceIds[currentIndex + 1] : null
      return { prev, next }
    }
  })

  const visibilityStatusText = computed(() => {
    const paginationStore = usePaginationStore()
    const infiniteScrollStore = useInfiniteScrollStore()

    const imageIds = uiStore.isTouchDevice
      ? infiniteScrollStore.imageIds
      : paginationStore.currentImageIds

    const currentImages = imageIds
      .map((id) => imageStore.findImageById(id))
      .filter(Boolean) as PicsumImage[]
    if (visibleCardIds.value.size === 0 || currentImages.length === 0) return ''

    const indices = Array.from(visibleCardIds.value)
      .map((id) => currentImages.findIndex((img) => img.id === id))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b)

    if (indices.length === 0) return ''

    const firstVisible = indices[0] + 1
    const lastVisible = indices[indices.length - 1] + 1
    const range =
      firstVisible === lastVisible ? `${firstVisible}` : `${firstVisible}–${lastVisible}`
    const total = currentImages.length

    return `${range} of ${total}`
  })

  function initialize() {
    const paginationStore = usePaginationStore()
    const infiniteScrollStore = useInfiniteScrollStore()
    if (uiStore.isTouchDevice) {
      if (infiniteScrollStore.imageIds.length === 0) infiniteScrollStore.fetchMore()
    } else {
      if (!paginationStore.pages[paginationStore.currentPage]) {
        paginationStore.fetchPage(paginationStore.currentPage)
      }
    }
  }

  function preloadNeighboringImages(currentId: string) {
    if (!isDetailViewActive.value) return

    if (uiStore.isTouchDevice) {
      const infiniteScrollStore = useInfiniteScrollStore()
      const currentIndex = infiniteScrollStore.allImageIds.findIndex((id) => id === currentId)
      if (currentIndex !== -1 && currentIndex >= infiniteScrollStore.allImageIds.length - 5) {
        infiniteScrollStore.fetchMore()
      }
    } else {
      const paginationStore = usePaginationStore()
      const pageOfCurrentImage = paginationStore.findPageOfImage(currentId)
      if (pageOfCurrentImage === -1) return

      const indexOnPage = paginationStore.pages[pageOfCurrentImage]?.ids.findIndex(
        (id) => id === currentId,
      )
      if (indexOnPage === -1) return

      if (
        indexOnPage >=
        paginationStore.pages[pageOfCurrentImage].ids.length - IMAGE_PRELOAD_OFFSET_DESKTOP
      ) {
        const nextPage = pageOfCurrentImage + 1
        if (
          (!paginationStore.totalPages || nextPage <= paginationStore.totalPages) &&
          !preloadedInDetailView.value.has(nextPage)
        ) {
          paginationStore.preloadPage(nextPage)
          preloadedInDetailView.value.add(nextPage)
        }
      }

      if (indexOnPage < IMAGE_PRELOAD_OFFSET_DESKTOP) {
        const prevPage = pageOfCurrentImage - 1
        if (prevPage >= 1 && !preloadedInDetailView.value.has(prevPage)) {
          paginationStore.preloadPage(prevPage)
          preloadedInDetailView.value.add(prevPage)
        }
      }
    }
  }

  function navigateToLatestSeenImage() {
    const id = userHistoryStore.latestSeenImageId
    if (!id) return
    if (uiStore.isTouchDevice) {
      isAutoScrolling.value = true
      shouldScrollToLatest.value = true
    } else {
      const paginationStore = usePaginationStore()
      const foundPage = paginationStore.findPageOfImage(id)
      if (foundPage !== -1) {
        paginationStore.changePage(foundPage)
        shouldScrollToLatest.value = true
      }
    }
  }

  function setCardVisibility(id: string, isVisible: boolean) {
    isVisible ? visibleCardIds.value.add(id) : visibleCardIds.value.delete(id)
  }
  function setDetailViewActive(isActive: boolean) {
    isDetailViewActive.value = isActive
  }
  function clearDetailViewPreloadCache() {
    preloadedInDetailView.value.clear()
  }

  return {
    isAutoScrolling,
    shouldScrollToLatest,
    visibleCardIds,
    getNeighboringImageIds,
    visibilityStatusText,
    initialize,
    setCardVisibility,
    setDetailViewActive,
    clearDetailViewPreloadCache,
    navigateToLatestSeenImage,
    preloadNeighboringImages,
  }
})
