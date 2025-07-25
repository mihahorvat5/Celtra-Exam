<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useImageStore } from '@/stores/imageStore';
import { useGalleryViewStore } from '@/stores/galleryViewStore';
import { useUserHistoryStore } from '@/stores/userHistoryStore';
import { useImageDownloader } from '@/composables/useImageDownloader';
import ImageDetailControls from './components/ImageDetailControls.vue';
import ImageDetailCard from './components/ImageDetailCard.vue';

const route = useRoute();
const router = useRouter();

const imageStore = useImageStore();
const galleryViewStore = useGalleryViewStore();
const userHistoryStore = useUserHistoryStore();

const { isLoading, error } = storeToRefs(imageStore);
const imageId = computed(() => route.params.id as string);
const image = computed(() => imageStore.findImageById(imageId.value) || null);
const neighboringIds = computed(() => galleryViewStore.getNeighboringImageIds(imageId.value));

const { isDownloading, handleDownload } = useImageDownloader(image);

async function loadImageData(id: string) {
  await imageStore.fetchImageDetail(id);
  userHistoryStore.markAsSeen(id);
}

function handleNavigateBack() {
  galleryViewStore.navigateToLatestSeenImage();
  router.push({ name: 'gallery' });
}

watch(imageId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadImageData(newId);
  }
}, { immediate: true });

onMounted(() => {
  galleryViewStore.setDetailViewActive(true);
  galleryViewStore.clearDetailViewPreloadCache();

  if (!image.value) {
    loadImageData(imageId.value);
  } else {
    //seen mark
    userHistoryStore.markAsSeen(imageId.value);
  }
});

onUnmounted(() => {
  galleryViewStore.setDetailViewActive(false);
  galleryViewStore.clearDetailViewPreloadCache();
});
</script>

<template>
  <div class="detail-view">
    <ImageDetailControls
      :author="image?.author"
      :prev-image-id="neighboringIds.prev"
      :next-image-id="neighboringIds.next"
      :is-loading="isLoading && !image"
      :is-downloading="isDownloading"
      @navigate-back="handleNavigateBack"
      @download="handleDownload"
    />

    <div v-if="error && !image" class="state-indicator error">
      <h2>Something went wrong</h2>
      <p>{{ error }}</p>
    </div>
    
    <ImageDetailCard
      v-else
      :image="image"
      :is-loading="isLoading && !image"
    />
  </div>
</template>

<style scoped lang="scss">
.detail-view {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.state-indicator {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  &.error { color: #dc3545; }
}
</style>