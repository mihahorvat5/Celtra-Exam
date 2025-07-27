import { ref, onMounted, onUnmounted, watch, nextTick, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { PicsumImage } from '@/types/Image'

import { useGalleryViewStore } from '@/stores/galleryViewStore'
import { useInfiniteScrollStore } from '@/stores/infiniteScrollStore'
import { useUiStore } from '@/stores/uiStore'

import { TRIGGER_CARD_INDEX_OFFSET_MOBILE, VISIBILITY_THRESHOLD } from '@/config/constants'

export function useImageObserver(
  scrollContainerRef: Ref<HTMLElement | null>,
  imagesRef: Ref<(PicsumImage | undefined)[]>,
) {
  const galleryViewStore = useGalleryViewStore()
  const infiniteScrollStore = useInfiniteScrollStore()

  const { isTouchDevice } = storeToRefs(useUiStore())
  const { isAutoScrolling, isDetailViewActive } = storeToRefs(galleryViewStore)

  let observer: IntersectionObserver | null = null

  const setupObserver = () => {
    if (observer) observer.disconnect()

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          const id = target.dataset.imageId
          const index = parseInt(target.dataset.imageIndex || '-1', 10)
          if (!id || index === -1) continue

          galleryViewStore.setCardVisibility(id, entry.intersectionRatio > VISIBILITY_THRESHOLD)

          if (
            isTouchDevice.value &&
            entry.isIntersecting &&
            !isAutoScrolling.value &&
            !isDetailViewActive.value
          ) {
            const triggerIndex = imagesRef.value.length - (TRIGGER_CARD_INDEX_OFFSET_MOBILE + 1)

            if (index >= triggerIndex) {
              infiniteScrollStore.fetchMore()
            }
          }
        }
      },
      {
        root: scrollContainerRef.value,
        threshold: [0, VISIBILITY_THRESHOLD, 1.0],
      },
    )

    nextTick(() => {
      if (scrollContainerRef.value) {
        const cards = scrollContainerRef.value.querySelectorAll('.card-shell')
        cards.forEach((card) => observer?.observe(card))
      }
    })
  }

  onMounted(setupObserver)
  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
  watch(imagesRef, setupObserver, { deep: true })
}
