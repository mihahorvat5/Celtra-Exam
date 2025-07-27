<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isLoading: boolean;
  isDownloading: boolean;
}>();

defineEmits(['download']);

const buttonText = computed(() => {
  if (props.isLoading) return 'Download';
  if (props.isDownloading) return 'Downloading...';
  return 'Download';
});
</script>

<template>
  <button
    class="download-button"
    :class="{ 'is-skeleton': isLoading }"
    :disabled="isLoading || isDownloading"
    @click.prevent.stop="$emit('download')"
    aria-label="Download full resolution image"
  >
    {{ buttonText }}
  </button>
</template>

<style scoped lang="scss">
@keyframes pulse {
  0% { background-color: var(--color-skeleton-start); }
  50% { background-color: var(--color-skeleton-mid); }
  100% { background-color: var(--color-skeleton-end); }
}

.download-button {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-primary);
  background-color: var(--color-button-bg);
  border: 1px solid var(--color-border);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  z-index: 20;

  &:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.is-skeleton {
  animation: pulse 1.5s infinite ease-in-out;
  color: transparent !important;
  user-select: none;
  border-radius: 4px;
  border-color: transparent !important;
}
</style>