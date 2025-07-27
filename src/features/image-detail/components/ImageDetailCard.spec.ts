import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageDetailCard from './ImageDetailCard.vue'
import type { PicsumImage } from '@/types/Image'

const MOCK_IMAGE: PicsumImage = {
  id: '101',
  author: 'Test Photographer',
  width: 1920,
  height: 1080,
  url: 'http://example.com/url',
  download_url: 'http://example.com/download_url',
}

describe('ImageDetailCard.vue', () => {
  it('renders in the loading state correctly', () => {
    const wrapper = mount(ImageDetailCard, {
      props: { image: null, isLoading: true },
    })
    expect(wrapper.find('.skeleton-image').exists()).toBe(true)
    expect(wrapper.find('.image-holder').exists()).toBe(false)
  })

  it('renders the final image and data when not loading', () => {
    const wrapper = mount(ImageDetailCard, {
      props: { image: MOCK_IMAGE, isLoading: false },
    })
    expect(wrapper.find('.skeleton-image').exists()).toBe(false)
    const img = wrapper.find('.main-image')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(MOCK_IMAGE.download_url)
    expect(wrapper.find('.image-dimensions').text()).toBe('1920 x 1080')
  })

  it('renders an empty state if not loading and image is null', () => {
    const wrapper = mount(ImageDetailCard, {
      props: {
        image: null,
        isLoading: false,
      },
    })

    expect(wrapper.find('.skeleton-image').exists()).toBe(false)
    expect(wrapper.find('.main-image').exists()).toBe(false)
  })
})
