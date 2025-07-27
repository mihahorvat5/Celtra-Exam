import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useImageObserver } from './useImageObserver'
import { useGalleryViewStore } from '@/stores/galleryViewStore'
import { useInfiniteScrollStore } from '@/stores/infiniteScrollStore'
import { useUiStore } from '@/stores/uiStore'
import type { PicsumImage } from '@/types/Image'
import type { Ref } from 'vue'

const mockGalleryViewStore = { setCardVisibility: vi.fn(), isAutoScrolling: ref(false) }
const mockInfiniteScrollStore = { fetchMore: vi.fn() }
const mockUiStore = { isTouchDevice: ref(false) }

vi.mock('@/stores/galleryViewStore', () => ({ useGalleryViewStore: () => mockGalleryViewStore }))
vi.mock('@/stores/infiniteScrollStore', () => ({
  useInfiniteScrollStore: () => mockInfiniteScrollStore,
}))
vi.mock('@/stores/uiStore', () => ({ useUiStore: () => mockUiStore }))

let observerCallback: IntersectionObserverCallback | undefined
const mockObserver = { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn((callback) => {
    observerCallback = callback
    return mockObserver
  }),
)

const MOCK_PICSUM_IMAGE: PicsumImage = {
  id: '0',
  author: 'Mock Author',
  width: 100,
  height: 100,
  url: 'url',
  download_url: 'download_url',
}

const TestHarness = defineComponent({
  props: {
    imagesRef: { type: Object as () => Ref<(PicsumImage | undefined)[]>, required: true },
    scrollContainerRef: { type: Object as () => Ref<HTMLElement | null>, required: true },
  },
  setup(props) {
    useImageObserver(props.scrollContainerRef, props.imagesRef)
    return {}
  },
  template: '<div></div>',
})

describe('useImageObserver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    observerCallback = undefined
    mockUiStore.isTouchDevice.value = false
    mockGalleryViewStore.isAutoScrolling.value = false
  })

  it('sets up an observer on mount', async () => {
    mount(TestHarness, {
      props: { imagesRef: ref([]), scrollContainerRef: ref(document.createElement('div')) },
    })
    await nextTick()
    expect(IntersectionObserver).toHaveBeenCalledOnce()
  })

  it('calls setCardVisibility when an element becomes visible', async () => {
    mount(TestHarness, {
      props: {
        imagesRef: ref([{ ...MOCK_PICSUM_IMAGE, id: '1' }]),
        scrollContainerRef: ref(document.createElement('div')),
      },
    })
    await nextTick()
    const mockEntry = {
      isIntersecting: true,
      intersectionRatio: 1,
      target: { dataset: { imageId: '1', imageIndex: '0' } },
    } as unknown as IntersectionObserverEntry

    expect(observerCallback).toBeDefined()
    observerCallback?.([mockEntry], mockObserver as any)

    expect(mockGalleryViewStore.setCardVisibility).toHaveBeenCalledWith('1', true)
  })

  it('calls fetchMore when a trigger card is intersected on a touch device', async () => {
    mockUiStore.isTouchDevice.value = true
    const triggerIndex = 12
    const images = Array.from({ length: 15 }, (_, i) => ({ ...MOCK_PICSUM_IMAGE, id: `${i}` }))

    mount(TestHarness, {
      props: { imagesRef: ref(images), scrollContainerRef: ref(document.createElement('div')) },
    })
    await nextTick()

    const mockEntry = {
      isIntersecting: true,
      intersectionRatio: 1,
      target: { dataset: { imageId: `${triggerIndex}`, imageIndex: `${triggerIndex}` } },
    } as unknown as IntersectionObserverEntry

    observerCallback?.([mockEntry], mockObserver as any)

    expect(mockInfiniteScrollStore.fetchMore).toHaveBeenCalledOnce()
  })

  it('does NOT call fetchMore on desktop', async () => {
    mockUiStore.isTouchDevice.value = false
    const triggerIndex = 12
    const images = Array.from({ length: 15 }, (_, i) => ({ ...MOCK_PICSUM_IMAGE, id: `${i}` }))

    mount(TestHarness, {
      props: { imagesRef: ref(images), scrollContainerRef: ref(document.createElement('div')) },
    })
    await nextTick()

    const mockEntry = {
      isIntersecting: true,
      intersectionRatio: 1,
      target: { dataset: { imageId: `${triggerIndex}`, imageIndex: `${triggerIndex}` } },
    } as unknown as IntersectionObserverEntry

    observerCallback?.([mockEntry], mockObserver as any)

    expect(mockInfiniteScrollStore.fetchMore).not.toHaveBeenCalled()
  })
})
