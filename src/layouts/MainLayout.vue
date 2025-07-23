<script setup lang="ts">
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/uiStore';
import MainHeader from './components/MainHeader.vue';

const uiStore = useUiStore();
const { viewMode } = storeToRefs(uiStore);
</script>

<template>
  <div class="main-layout">
    <MainHeader />
    <!--
      We add a dynamic class binding here.
      If viewMode is 'DIFF', it will add the class "content--diff-mode".
      Otherwise, it adds nothing.
    -->
    <main
      class="content"
      :class="{ 'content--diff-mode': viewMode === 'DIFF' }"
    >
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
}

.content {
  flex-grow: 1;
  width: 100%;
  margin: 0 auto;
  background-color: var(--color-surface);
  border-radius: 8px 8px 0 0;
}

.content--diff-mode {
  border-radius: 8px;
}
</style>