/// <reference types="vite/client" />
/// <reference types="pinia-plugin-persistedstate" />

declare module '*.svg?component' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}