import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from './uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useUiStore()
    expect(store.isDarkMode).toBe(false)
  })

  it('allows toggling dark mode', () => {
    const store = useUiStore()

    store.isDarkMode = true

    expect(store.isDarkMode).toBe(true)
  })

  describe('isTouchDevice getter', () => {
    it('returns true when window.matchMedia indicates a coarse pointer', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(pointer: coarse)',
      }))
      const store = useUiStore()

      expect(store.isTouchDevice).toBe(true)
    })

    it('returns false when window.matchMedia indicates a fine pointer', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
      }))
      const store = useUiStore()

      expect(store.isTouchDevice).toBe(false)
    })
  })
})
