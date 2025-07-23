<script setup lang="ts">
const model = defineModel<boolean>();
</script>

<template>
  <button
    class="toggle-switch"
    role="switch"
    :aria-checked="model"
    @click="model = !model"
  >
    <span class="track"></span>
    <span class="thumb">
      <slot v-if="model" name="on"></slot>
      <slot v-else name="off"></slot>
    </span>
  </button>
</template>

<style scoped lang="scss">
$track-width: 52px;
$track-height: 28px;
$thumb-size: 22px;
$padding: 3px;
$transition-speed: 0.2s;

.toggle-switch {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  width: $track-width;
  height: $track-height;
  flex-shrink: 0;
}

.track {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: $track-height;
  transition: background-color $transition-speed ease;
  background-color: var(--color-button-bg);
  border: 1px solid var(--color-border);
}

.thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $thumb-size;
  height: $thumb-size;
  border-radius: 50%;
  position: absolute;
  top: $padding;
  left: $padding;
  transition: transform $transition-speed ease;
  background-color: var(--color-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  :deep(svg) {
    width: 14px;
    height: 14px;
    color: var(--color-text-secondary);
  }
}

.toggle-switch[aria-checked='true'] {
  .track {
    background: var(--color-accent);
    border-color: var(--color-accent);
  }

  .thumb {
    transform: translateX($track-width - $thumb-size - (2 * $padding));
    
    :deep(svg) {
      color: var(--color-accent);
    }
  }
}
</style>