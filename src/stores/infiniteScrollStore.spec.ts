import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInfiniteScrollStore } from './infiniteScrollStore'
import { ITEMS_PER_PAGE_MOBILE } from '@/config/constants'

const mockImageStore = {
  fetchImageList: vi.fn(),
}

vi.mock('@/stores/imageStore', () => ({
  useImageStore: () => mockImageStore,
}))

const MOCK_IMAGES_PAGE_1 = Array.from({ length: 20 }, (_, i) => ({ id: `p1_${i}` }))

describe('infiniteScrollStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const store = useInfiniteScrollStore()
    expect(store.imageIds).toEqual([])
    expect(store.nextPage).toBe(1)
    expect(store.isFetching).toBe(false)
    expect(store.hasMore).toBe(true)
  })

  it('fetchMore appends new images and increments nextPage on success', async () => {
    const store = useInfiniteScrollStore()
    mockImageStore.fetchImageList.mockResolvedValue(MOCK_IMAGES_PAGE_1)

    await store.fetchMore()

    expect(mockImageStore.fetchImageList).toHaveBeenCalledOnce()
    expect(mockImageStore.fetchImageList).toHaveBeenCalledWith(1, ITEMS_PER_PAGE_MOBILE)
    expect(store.imageIds.length).toBe(20)
    expect(store.imageIds[0]).toBe('p1_0')
    expect(store.nextPage).toBe(2)
    expect(store.isFetching).toBe(false)
  })

  it('sets hasMore to false when fetch returns an empty array', async () => {
    const store = useInfiniteScrollStore()
    mockImageStore.fetchImageList.mockResolvedValue([])

    await store.fetchMore()

    expect(store.imageIds.length).toBe(0)
    expect(store.nextPage).toBe(1)
    expect(store.hasMore).toBe(false)
  })

  it('does not fetch if isFetching is already true', async () => {
    const store = useInfiniteScrollStore()
    store.isFetching = true

    await store.fetchMore()

    expect(mockImageStore.fetchImageList).not.toHaveBeenCalled()
  })
})
