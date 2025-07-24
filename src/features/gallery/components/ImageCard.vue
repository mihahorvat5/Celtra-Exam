<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { PicsumImage } from '@/types/Image';

const props = defineProps<{
  image: PicsumImage | null;
  index: number;
}>();

const isDownloading = ref(false);

const thumbnailUrl = computed(() => {
  if (!props.image) return '';
  const urlParts = props.image.download_url.split('/');
  urlParts[urlParts.length - 2] = '600';
  urlParts[urlParts.length - 1] = '400';
  return urlParts.join('/');
});

const downloadFilename = computed(() => {
  if (!props.image) return '';
  const author = props.image.author.replace(/\s+/g, '-');
  return `photo-by-${author}-${props.image.id}.jpg`;
});

async function handleDownload() {
  if (isDownloading.value || !props.image) return;
  isDownloading.value = true;
  try {
    const response = await fetch(props.image.download_url);
    const imageBlob = await response.blob();
    const blobUrl = URL.createObjectURL(imageBlob);
    const tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.download = downloadFilename.value;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
  } finally {
    isDownloading.value = false;
  }
}

const isSkeleton = computed(() => !props.image);
</script>

<template>
  <div class="card-shell" :data-image-id="image?.id" :data-image-index="index">
    <RouterLink
      v-if="!isSkeleton"
      :to="`/card-info/${image.id}`"
      class="card-link-overlay"
      aria-label="View details"
    ></RouterLink>

    <figure class="card-figure">
      <img v-if="!isSkeleton" :src="thumbnailUrl" :alt="`Photograph by ${image.author}`" class="card-img" loading="lazy" />
      <div v-else class="skeleton-animated skeleton-image-bg"></div>
    </figure>

    <div class="card-info">
      <div class="card-author">
        <span class="author-name" :class="{ 'is-skeleton': isSkeleton }">
          {{ isSkeleton ? 'Generic Author' : image.author }}
        </span>
      </div>
      <div class="card-download">
        <button
          class="download-button"
          :class="{ 'is-skeleton': isSkeleton }"
          :disabled="isSkeleton || isDownloading"
          @click.prevent.stop="handleDownload"
          aria-label="Download full resolution image"
        >
          {{ isSkeleton ? 'Download' : (isDownloading ? 'Downloading...' : 'Download') }}
        </button>
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
.download-button {
  position: relative;
  z-index: 2;
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-primary);
  background-color: var(--color-button-bg);
  border: 1px solid var(--color-border);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(.is-skeleton) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
}

@keyframes pulse {
  0% { background-color: var(--color-skeleton-start); }
  50% { background-color: var(--color-skeleton-end); }
  100% { background-color: var(--color-skeleton-start); }
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

  &.download-button {
    border-color: transparent !important;
  }
}
</style>