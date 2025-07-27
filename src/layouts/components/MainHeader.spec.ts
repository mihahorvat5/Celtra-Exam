import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, type Pinia } from 'pinia'
import { useUiStore } from '@/stores/uiStore'
import MainHeader from './MainHeader.vue'
import IconToggle from '@/components/ui/IconToggle.vue'

const RouterLinkStub = { template: '<a><slot /></a>' }
const LogoStub = { template: '<div>Logo</div>' }

describe('MainHeader.vue', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
  })

  it('passes the correct dark mode state to IconToggle', () => {
    const uiStore = useUiStore(pinia)
    uiStore.isDarkMode = true

    const wrapper = mount(MainHeader, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterLink: RouterLinkStub,
          Logo: LogoStub,
        },
      },
    })

    const iconToggle = wrapper.findComponent(IconToggle)

    expect(iconToggle.props('modelValue')).toBe(true)
  })
})
