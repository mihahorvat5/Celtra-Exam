import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { picsumService } from '@/services/picsumService';
import type { PicsumImage } from '@/types/Image';

export const useImageStore = defineStore('image', () => {
  const imagesById = ref<Record<string, PicsumImage>>({});
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const findImageById = computed(() => {
    return (id: string): PicsumImage | undefined => imagesById.value[id];
  });

  function upsertImages(incomingImages: PicsumImage[]) {
    for (const newImage of incomingImages) {
      if (!newImage || !newImage.id) continue;
      const existingImage = imagesById.value[newImage.id] || {};
      imagesById.value[newImage.id] = { ...existingImage, ...newImage };
    }
  }

  async function fetchImageList(page: number, limit: number): Promise<PicsumImage[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const freshImages = await picsumService.fetchImageList(page, limit);
      upsertImages(freshImages);
      return freshImages;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An unknown error occurred while fetching image list.';
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchImageDetail(imageId: string) {
    if (!imagesById.value[imageId]) {
      isLoading.value = true;
    }
    error.value = null;
    try {
      const freshImage = await picsumService.fetchImageInfo(imageId);
      upsertImages([freshImage]);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch image details.';
      console.error(error.value);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    imagesById,
    isLoading,
    error,
    findImageById,
    fetchImageList,
    fetchImageDetail,
  };
});