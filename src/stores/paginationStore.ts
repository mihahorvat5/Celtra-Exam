import { defineStore } from 'pinia'
import { useImageStore } from './imageStore'
import { ITEMS_PER_PAGE_DESKTOP, CACHE_TTL_SECONDS } from '@/config/constants'

const CACHE_TTL = CACHE_TTL_SECONDS * 1000

export const usePaginationStore = defineStore('pagination', {
  state: () => ({
    pages: {} as Record<number, { ids: string[]; timestamp: number }>,
    currentPage: 1,
    totalPages: null as number | null,
    pendingFetches: new Set<number>(),
  }),

  getters: {
    currentImageIds(state): string[] {
      return state.pages[state.currentPage]?.ids || []
    },
    allImageIds(state): string[] {
      return Object.keys(state.pages)
        .sort((a, b) => Number(a) - Number(b))
        .flatMap((page) => state.pages[Number(page)]?.ids || [])
    },
    isLastPage(state): boolean {
      return state.totalPages !== null && state.currentPage >= state.totalPages
    },
  },

  actions: {
    async fetchPage(page: number) {
      if (
        page < 1 ||
        this.pendingFetches.has(page) ||
        (this.totalPages !== null && page > this.totalPages)
      )
        return

      const imageStore = useImageStore()
      this.pendingFetches.add(page)
      try {
        const images = await imageStore.fetchImageList(page, ITEMS_PER_PAGE_DESKTOP)

        if (images.length === 0 && page > 1) {
          this.totalPages = page - 1
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages
          }
          return
        }

        this.pages[page] = { ids: images.map((img) => img.id), timestamp: Date.now() }

        if (images.length < ITEMS_PER_PAGE_DESKTOP && this.totalPages === null) {
          this.totalPages = page
        }
      } finally {
        this.pendingFetches.delete(page)
      }
    },

    preloadPage(page: number) {
      if (page < 1 || (this.totalPages !== null && page > this.totalPages)) return
      const cachedPage = this.pages[page]
      if (!cachedPage || Date.now() - cachedPage.timestamp > CACHE_TTL) {
        setTimeout(() => {
          this.fetchPage(page)
        }, 100)
      }
    },

    changePage(page: number) {
      if (page < 1 || (this.totalPages !== null && page > this.totalPages)) return

      this.currentPage = page
      const cachedPage = this.pages[page]
      if (!cachedPage || Date.now() - cachedPage.timestamp > CACHE_TTL) {
        this.fetchPage(page)
      }
    },

    findPageOfImage(imageId: string): number {
      for (const page in this.pages) {
        if (this.pages[page].ids.includes(imageId)) return Number(page)
      }
      return -1
    },
  },
})
