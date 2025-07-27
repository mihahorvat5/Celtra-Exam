import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { PicsumImage } from '@/types/Image'

export function useImageDownloader(image: Ref<PicsumImage | null>) {
  const isDownloading = ref(false)

  const downloadFilename = computed(() => {
    if (!image.value) return ''
    const author = image.value.author.replace(/\s+/g, '-')
    return `photo-by-${author}-${image.value.id}.jpg`
  })

  async function handleDownload() {
    if (isDownloading.value || !image.value) return
    isDownloading.value = true
    try {
      const response = await fetch(image.value.download_url)
      const imageBlob = await response.blob()
      const blobUrl = URL.createObjectURL(imageBlob)
      const tempLink = document.createElement('a')
      tempLink.href = blobUrl
      tempLink.download = downloadFilename.value
      document.body.appendChild(tempLink)
      tempLink.click()
      document.body.removeChild(tempLink)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    downloadFilename,
    handleDownload,
  }
}
