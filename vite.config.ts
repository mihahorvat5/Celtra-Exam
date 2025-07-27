/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    svgLoader({
      defaultImport: 'component',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',

    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },

    setupFiles: 'src/tests/setup.ts',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src'],
      exclude: [
        'src/main.ts',
        'src/router/index.ts',
        'src/App.vue',
        'src/types',
        'src/config',
        'src/tests/setup.ts',
        '**/*.d.ts'
      ]
    }
  },
})