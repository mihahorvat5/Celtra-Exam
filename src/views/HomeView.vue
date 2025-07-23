<script setup lang="ts">
import { ref, watch } from 'vue';

const isDarkMode = ref(false);

watch(isDarkMode, (newVal) => {
  const rootHtmlElement = document.documentElement;

  if (newVal) {
    rootHtmlElement.setAttribute('data-theme', 'dark');
  } else {
    rootHtmlElement.removeAttribute('data-theme');
  }
});
</script>

<template>
  <div class="home-view">
    <h1>July 2025</h1>
    <p>Initial commit</p>

    <button @click="isDarkMode = !isDarkMode" class="theme-toggle">
      Switch to {{ isDarkMode ? 'Light' : 'Dark' }} Mode
    </button>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: var(--color-text-secondary);

  h1 {
    color: var(--color-text-primary);
    font-weight: 300;
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .theme-toggle {
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }
}
</style>