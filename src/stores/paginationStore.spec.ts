import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePaginationStore } from './paginationStore'
import { useImageStore } from './imageStore'
import { ITEMS_PER_PAGE_DESKTOP } from '@/config/constants'

const mockImageStore = {
  fetchImageList: vi.fn(),
}

vi.mock('@/stores/imageStore', () => ({
  useImageStore: () => mockImageStore,
}))

const MOCK_IMAGES_PAGE_1 = Array.from({ length: 20 }, (_, i) => ({ id: `${i + 1}` }))

describe('paginationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const store = usePaginationStore()
    expect(store.currentPage).toBe(1)
    expect(store.totalPages).toBe(null)
    expect(store.pages).toEqual({})
  })

  it('changePage updates currentPage and triggers a fetch for a new page', async () => {
    const store = usePaginationStore()
    mockImageStore.fetchImageList.mockResolvedValue(MOCK_IMAGES_PAGE_1)

    await store.changePage(5)

    expect(store.currentPage).toBe(5)
    expect(mockImageStore.fetchImageList).toHaveBeenCalledOnce()
    expect(mockImageStore.fetchImageList).toHaveBeenCalledWith(5, ITEMS_PER_PAGE_DESKTOP)
  })

  it('fetchPage calls imageStore.fetchImageList and populates state on success', async () => {
    const store = usePaginationStore()
    mockImageStore.fetchImageList.mockResolvedValue(MOCK_IMAGES_PAGE_1)

    await store.fetchPage(1)

    expect(mockImageStore.fetchImageList).toHaveBeenCalledOnce()
    expect(mockImageStore.fetchImageList).toHaveBeenCalledWith(1, ITEMS_PER_PAGE_DESKTOP)
    expect(store.pages[1].ids).toEqual(MOCK_IMAGES_PAGE_1.map((img) => img.id))
  })

  it('fetchPage sets totalPages when a partial page is returned', async () => {
    const store = usePaginationStore()
    const partialPage = MOCK_IMAGES_PAGE_1.slice(0, 10)
    mockImageStore.fetchImageList.mockResolvedValue(partialPage)

    await store.fetchPage(3)

    expect(store.totalPages).toBe(3)
  })
})
