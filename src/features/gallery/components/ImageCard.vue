<script setup lang="ts">
import { computed, toRef } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserHistoryStore } from '@/stores/userHistoryStore';
import { useImageDownloader } from '@/composables/useImageDownloader';
import type { PicsumImage } from '@/types/Image';
import DownloadButton from '@/components/ui/DownloadButton.vue';

const props = defineProps<{
  image: PicsumImage | null;
  index: number;
}>();

const imageRef = toRef(props, 'image');
const { isDownloading, handleDownload } = useImageDownloader(imageRef);

const userHistoryStore = useUserHistoryStore();
const { seenImages, latestSeenImageId } = storeToRefs(userHistoryStore);

const isLatestSeen = computed(() => props.image?.id === latestSeenImageId.value);
const isSeen = computed(() => 
  !isLatestSeen.value && 
  props.image?.id && 
  seenImages.value.has(props.image.id)
);

const thumbnailUrl = computed(() => {
  if (!props.image) return '';
  const urlParts = props.image.download_url.split('/');
  urlParts[urlParts.length - 2] = '600';
  urlParts[urlParts.length - 1] = '400';
  return urlParts.join('/');
});

const isSkeleton = computed(() => !props.image);
</script>

<template>
  <div class="card-shell" :data-image-id="image?.id" :data-image-index="index">
    <RouterLink
      v-if="!isSkeleton"
      :to="`/card-info/${image?.id}`"
      class="card-link-overlay"
      aria-label="View details"
    >
      <!-- seen / last mark -->
      <div class="status-indicator-wrapper">
        <span v-if="isLatestSeen" class="status-indicator latest">LATEST SEEN</span>
        <span v-else-if="isSeen" class="status-indicator seen">SEEN</span>
      </div>
    </RouterLink>

    <figure class="card-figure">
      <img v-if="!isSkeleton" :src="thumbnailUrl" :alt="`Photograph by ${image?.author}`" class="card-img" loading="lazy" />
      <div v-else class="skeleton-animated skeleton-image-bg"></div>
    </figure>

    <div class="card-info">
      <div class="card-author">
        <span class="author-name" :class="{ 'is-skeleton': isSkeleton }">
          {{ isSkeleton ? 'Generic Author' : image?.author }}
        </span>
      </div>
      <div class="card-download">
        <DownloadButton 
          :is-loading="isSkeleton"
          :is-downloading="isDownloading"
          @download="handleDownload"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }
}
.card-link-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
}
.card-figure {
  margin: 0;
  line-height: 0;
  aspect-ratio: 4 / 3;
  background-color: var(--color-skeleton-start, #e9ecef);
}
.card-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  border-top: 1px solid var(--color-border);
}
.card-author {
  min-height: calc(0.9rem * 1.2);
}
.card-download {
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.card-img {
  width: 100%; height: 100%; object-fit: cover;
}
.author-name {
  font-size: 0.9rem;
  line-height: 1.2;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
}

@keyframes pulse {
  0% { background-color: var(--color-skeleton-start); }
  50% { background-color: var(--color-skeleton-mid); }
  100% { background-color: var(--color-skeleton-end); }
}

.skeleton-animated {
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-image-bg {
  width: 100%;
  height: 100%;
  @extend .skeleton-animated;
}

.is-skeleton {
  @extend .skeleton-animated;
  color: transparent !important;
  user-select: none;
  border-radius: 4px;
}

.status-indicator-wrapper {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  pointer-events: none;
}
.status-indicator {
  display: block;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 4px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  &.seen {
    background-color: rgba(97, 97, 97, 1.0);
  }
  &.latest {
    background-color: rgba(0, 123, 255, 1.0);
  }
}
</style>