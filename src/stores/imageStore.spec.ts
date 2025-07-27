import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useImageStore } from './imageStore'
import { picsumService } from '@/services/picsumService'
import type { PicsumImage } from '@/types/Image'

vi.mock('@/services/picsumService', () => ({
  picsumService: {
    fetchImageList: vi.fn(),
    fetchImageInfo: vi.fn(),
  },
}))

const MOCK_IMAGE_1: PicsumImage = {
  id: '1',
  author: 'Author One',
  width: 100,
  height: 100,
  url: 'url1',
  download_url: 'download1',
}
const MOCK_IMAGE_2: PicsumImage = {
  id: '2',
  author: 'Author Two',
  width: 200,
  height: 200,
  url: 'url2',
  download_url: 'download2',
}

describe('imageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with a correct empty state', () => {
    const store = useImageStore()

    expect(store.imagesById).toEqual({})
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(null)
  })

  describe('Action: fetchImageList', () => {
    it('handles success: sets loading state, fetches data, and populates the store', async () => {
      const store = useImageStore()
      ;(picsumService.fetchImageList as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_IMAGE_1])

      const fetchPromise = store.fetchImageList(1, 10)

      expect(store.isLoading).toBe(true)

      const result = await fetchPromise

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.imagesById['1']).toEqual(MOCK_IMAGE_1)
      expect(result).toEqual([MOCK_IMAGE_1])
      expect(picsumService.fetchImageList).toHaveBeenCalledOnce()
      expect(picsumService.fetchImageList).toHaveBeenCalledWith(1, 10)
    })

    it('handles failure: sets loading state, and populates the error field', async () => {
      const store = useImageStore()
      const errorMessage = 'Network Failure'
      ;(picsumService.fetchImageList as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error(errorMessage),
      )

      await store.fetchImageList(1, 10)

      expect(store.isLoading).toBe(false)
      expect(store.imagesById).toEqual({})
      expect(store.error).toBe(errorMessage)
    })
  })

  describe('Function: findImageById', () => {
    it('returns an image if it exists in the store', () => {
      const store = useImageStore()
      store.imagesById = { '2': MOCK_IMAGE_2 }

      const image = store.findImageById('2')

      expect(image).toEqual(MOCK_IMAGE_2)
    })

    it('returns undefined if the image does not exist', () => {
      const store = useImageStore()
      store.imagesById = { '2': MOCK_IMAGE_2 }

      const image = store.findImageById('non_existent_id')

      expect(image).toBeUndefined()
    })
  })
})
