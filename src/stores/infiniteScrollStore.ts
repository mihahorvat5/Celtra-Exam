import { defineStore } from 'pinia';
import { useImageStore } from './imageStore';
import { ITEMS_PER_PAGE_MOBILE } from '@/config/constants';

export const useInfiniteScrollStore = defineStore('infinite-scroll', {
  state: () => ({
    imageIds: [] as string[],
    nextPage: 1,
    isFetching: false,
    hasMore: true,
  }),
  getters: {
    allImageIds(state): string[] {
      return state.imageIds;
    },
  },
  actions: {
    async fetchMore() {
      if (this.isFetching || !this.hasMore) return;
      
      const imageStore = useImageStore();
      this.isFetching = true;
      try {
        const newImages = await imageStore.fetchImageList(this.nextPage, ITEMS_PER_PAGE_MOBILE);
        if (newImages.length > 0) {
          this.imageIds.push(...newImages.map(img => img.id));
          this.nextPage++;
        } else {
          this.hasMore = false;
        }
      } finally {
        this.isFetching = false;
      }
    },
  },
});