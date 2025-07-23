<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useUiStore } from '@/stores/uiStore';
import IconToggle from '@/components/ui/IconToggle.vue';

import LogoLight from '@/assets/logos/logo.svg?component';
import LogoDark from '@/assets/logos/logo-dark.svg?component';

import OneToOneIcon from '@/assets/icons/1_1.svg?component';
import DiffIcon from '@/assets/icons/diff.svg?component';
import MoonIcon from '@/assets/icons/moon.svg?component';
import SunIcon from '@/assets/icons/sun.svg?component';

const uiStore = useUiStore();
const { isDarkMode, isDiffMode } = storeToRefs(uiStore);

const currentLogoComponent = computed(() => {
  return isDarkMode.value ? LogoDark : LogoLight;
});
</script>

<template>
  <header class="main-header">
    <div class="header-content">
      <div class="header-left">
        <RouterLink to="/" class="logo-link" aria-label="Homepage">
          <component :is="currentLogoComponent" class="logo-svg" />
        </RouterLink>
      </div>

      <div class="header-right">
        <div class="actions-container">
          <div class="action-item">
            <IconToggle v-model="isDiffMode" aria-label="Toggle View Mode">
              <template #on><DiffIcon /></template>
              <template #off><OneToOneIcon /></template>
            </IconToggle>
          </div>
          <div class="action-item">
            <IconToggle v-model="isDarkMode" aria-label="Toggle Dark Mode">
              <template #on><MoonIcon /></template>
              <template #off><SunIcon /></template>
            </IconToggle>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.main-header {
  width: 100%;
  height: 3rem;
  display: flex;
  align-items: center;
}
.header-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0rem 0.6rem;
}
.actions-container {
  display: flex;
  flex-direction: row;
  gap: 0.6rem;
}

</style>