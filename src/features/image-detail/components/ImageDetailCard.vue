<script setup lang="ts">
import type { PicsumImage } from '@/types/Image'

defineProps<{
  image: PicsumImage | null
  isLoading: boolean
}>()
</script>

<template>
  <div class="card-content-area-holder">
    <div class="card-content-area">
      <div v-if="image" class="image-dimensions">{{ image.width }} x {{ image.height }}</div>
      <div v-else class="image-dimensions skeleton-text">1 x 1</div>

      <div v-if="isLoading" class="skeleton-image"></div>
      <div v-else-if="image" class="image-holder">
        <img :src="image.download_url" :alt="`Photograph by ${image.author}`" class="main-image" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes pulse {
  0% {
    background-color: var(--color-skeleton-start);
  }
  50% {
    background-color: var(--color-skeleton-mid);
  }
  100% {
    background-color: var(--color-skeleton-end);
  }
}

.card-content-area-holder {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.card-content-area {
  position: relative;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-background);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-holder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-image {
  object-fit: contain;
  border-radius: 8px;
  max-width: 100%;
  max-height: 75vh;
}

.skeleton-image {
  display: none;
}

.image-dimensions {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  color: var(--color-text-secondary);
  pointer-events: none;
}
.skeleton-text {
  color: transparent;
  background-color: var(--color-skeleton-start);
  border-radius: 4px;
  user-select: none;
  animation: pulse 1.5s infinite ease-in-out;
  padding: 0rem 3rem;
}
</style>
