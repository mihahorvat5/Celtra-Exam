<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useUiStore } from '@/stores/uiStore';
import IconToggle from '@/components/ui/IconToggle.vue';

import Logo from '@/assets/logos/logo.svg?component';

import MoonIcon from '@/assets/icons/moon.svg?component';
import SunIcon from '@/assets/icons/sun.svg?component';

const uiStore = useUiStore();
const { isDarkMode } = storeToRefs(uiStore);

</script>

<template>
  <header class="main-header">
    <div class="header-content">
      <div class="header-left">
        <RouterLink to="/" class="logo-link" aria-label="Homepage">
          <Logo class="logo-svg" />
        </RouterLink>
      </div>

      <div class="header-right">
        <div class="actions-container">
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
.logo-svg {
  color: var(--color-logo);
}
</style>