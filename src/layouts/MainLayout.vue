<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainHeader from './components/MainHeader.vue'
</script>

<template>
  <div class="main-layout">
    <MainHeader />
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: var(--color-background);
  overflow: auto;
}

.content {
  flex-grow: 1;
  width: 100%;
  margin: 0 auto;
  background-color: var(--color-surface);
  border-radius: 8px;

  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
