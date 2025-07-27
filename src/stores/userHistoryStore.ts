import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserHistoryStore = defineStore(
  'user-history',
  () => {
    const seenImages = ref<Set<string>>(new Set())
    const latestSeenImageId = ref<string | null>(null)

    function markAsSeen(id: string) {
      seenImages.value.add(id)
      latestSeenImageId.value = id
    }

    return {
      seenImages,
      latestSeenImageId,
      markAsSeen,
    }
  },
  {
    persist: {
      key: 'celtraExam-user-history',
      serializer: {
        serialize: (state) => {
          const serializedState = {
            ...state,
            seenImages: Array.from(state.seenImages),
          }
          return JSON.stringify(serializedState)
        },
        deserialize: (str) => {
          const parsedState = JSON.parse(str)
          parsedState.seenImages = new Set(parsedState.seenImages)
          return parsedState
        },
      },
    },
  },
)
