import type { PicsumImage } from '@/types/Image'

//this needs .env to operate!
const API_BASE_URL = import.meta.env.VITE_PICSUM_API_BASE_URL

const ENDPOINTS = {
  LIST: '/v2/list',
  IMAGE_INFO: (id: string) => `/id/${id}/info`,
}

export const picsumService = {
  async fetchImageList(page: number, limit: number): Promise<PicsumImage[]> {
    const url = new URL(API_BASE_URL + ENDPOINTS.LIST)
    url.searchParams.append('page', String(page))
    url.searchParams.append('limit', String(limit))
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  },
  async fetchImageInfo(imageId: string): Promise<PicsumImage> {
    const url = API_BASE_URL + ENDPOINTS.IMAGE_INFO(imageId)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  },
}
