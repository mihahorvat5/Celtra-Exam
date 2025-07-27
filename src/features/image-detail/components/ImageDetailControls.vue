<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ArrowBackIcon from '@/components/ui/ArrowBackIcon.vue';
import ArrowLeftIcon from '@/components/ui/ArrowLeftIcon.vue';
import ArrowRightIcon from '@/components/ui/ArrowRightIcon.vue';
import DownloadButton from '@/components/ui/DownloadButton.vue';

defineProps<{
  author: string | undefined;
  prevImageId: string | null;
  nextImageId: string | null;
  isLoading: boolean;
  isDownloading: boolean;
}>();

defineEmits(['navigate-back', 'download']);
</script>

<template>
  <div class="detail-controls">
    <div class="controls-left-holder">
    <div class="controls-left">
      <button @click="$emit('navigate-back')" class="control-button back-button" aria-label="Back to gallery">
        <ArrowBackIcon />
      </button>
      <span v-if="!isLoading" class="author-name">{{ author }}</span>
      <span v-else class="author-name skeleton-text">Loading Author...</span>
    </div>
    </div>
    <div class="controls-right-holder">
    <div class="controls-center">
      <RouterLink
        :to="`/card-info/${prevImageId}`"
        :class="{ disabled: !prevImageId }"
        class="control-button nav-button"
        aria-label="Previous image"
      >
        <ArrowLeftIcon />
      </RouterLink>
      <RouterLink
        :to="`/card-info/${nextImageId}`"
        :class="{ disabled: !nextImageId }"
        class="control-button nav-button"
        aria-label="Next image"
      >
        <ArrowRightIcon />
      </RouterLink>
    </div>

    <div class="controls-right">
       <DownloadButton 
          :is-loading="isLoading"
          :is-downloading="isDownloading"
          @download="$emit('download')"
        />
    </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes pulse { 
  0% { background-color: var(--color-skeleton-start); } 
  50% { background-color: var(--color-skeleton-mid); } 
  100% { background-color: var(--color-skeleton-end); } 
}

.controls-left-holder { 
  display: flex; 
  flex: 1;
}
.controls-right-holder { 
  display: flex; 
  flex: 2;
}
.detail-controls { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0.5rem 2rem; 
  border-bottom: 1px solid var(--color-button-bg); 
  flex-shrink: 0; 
}
.controls-left, .controls-center, .controls-right { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
}
.controls-left { flex: 1 1 0; justify-content: flex-start; }
.controls-center { flex: 1 1 0; justify-content: center; }
.controls-right { flex: 1 1 0; justify-content: flex-end; }

@media (max-width: 768px) {
  .controls-left-holder {
    flex: 2;
  }
  .controls-right-holder {
    flex: 1;
  } 
  .controls-right-holder {
    flex-direction: column;
    gap: 0.3rem;
  }
  .controls-center, .controls-right { 
  justify-content: flex-end;
}
}

.author-name { 
  font-weight: 500; 
  color: var(--color-text-primary); 

  text-overflow: ellipsis;
  white-space: break-spaces;
  overflow: hidden;
}
.skeleton-text { 
  color: transparent; 
  background-color: var(--color-skeleton-start); 
  border-radius: 4px; 
  user-select: none; 
  animation: pulse 1.5s infinite ease-in-out; 
  padding: 0rem 3rem; 
}


.control-button {
  width: 2rem;
  height: 2rem;
  background-color: transparent;
  border: 1px solid var(--color-border);
  /*background-color: var(--color-surface);*/
  color: var(--color-text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  &.page-number {
    border-radius: 8px;
  }
  &:not(.page-number) {
    border: none;
  }
  &:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &.is-active {
    /*background-color: var(--color-accent);*/
    color: var(--color-accent);
    border-color: var(--color-accent);
    font-weight: 700;
  }
  &:not(.is-active) {
    /*background-color: var(--color-accent);*/
    border: none;
  }
}

svg {
    height: 100%;
}

.nav-button.disabled { 
  pointer-events: none; 
  opacity: 0.4; 
}
</style>