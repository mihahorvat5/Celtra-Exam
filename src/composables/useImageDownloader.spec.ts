import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useImageDownloader } from './useImageDownloader'
import type { PicsumImage } from '@/types/Image'
import type { Ref } from 'vue'

global.fetch = vi.fn()
window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-url')
window.URL.revokeObjectURL = vi.fn()

const MOCK_IMAGE: Ref<PicsumImage | null> = ref({
  id: '10',
  author: 'Test Author',
  download_url: 'http://example.com/download',
} as PicsumImage)

describe('useImageDownloader', () => {
  const mockLink = {
    href: '',
    download: '',
    click: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['mock-image-data'])),
    })

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({}) as any)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({}) as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with isDownloading as false', () => {
    const { isDownloading } = useImageDownloader(MOCK_IMAGE)
    expect(isDownloading.value).toBe(false)
  })

  it('computes a correct download filename', () => {
    const { downloadFilename } = useImageDownloader(MOCK_IMAGE)
    expect(downloadFilename.value).toBe('photo-by-Test-Author-10.jpg')
  })

  it('sets isDownloading to true during download and false after', async () => {
    const { isDownloading, handleDownload } = useImageDownloader(MOCK_IMAGE)
    const promise = handleDownload()
    expect(isDownloading.value).toBe(true)

    await promise
    expect(isDownloading.value).toBe(false)
  })

  it('creates, configures, and clicks an anchor tag to trigger download', async () => {
    const { handleDownload } = useImageDownloader(MOCK_IMAGE)

    await handleDownload()

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockLink.href).toBe('blob:http://localhost/mock-url')
    expect(mockLink.download).toBe('photo-by-Test-Author-10.jpg')
    expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
    expect(mockLink.click).toHaveBeenCalledOnce()
    expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
  })

  it('does not attempt to download if image is null', async () => {
    const nullImage: Ref<PicsumImage | null> = ref(null)
    const { handleDownload } = useImageDownloader(nullImage)

    await handleDownload()

    expect(fetch).not.toHaveBeenCalled()
    expect(mockLink.click).not.toHaveBeenCalled()
  })
})
