//currently these are developer settings, (in future version of app they could become own persistent store so user has control over different settings -- mainly used for "low performance devices mode")

export const CACHE_TTL_SECONDS = 10 //higher number -> less frequent page preloads

export const ITEMS_PER_PAGE_DESKTOP = 20 //images per page on desktop

export const ITEMS_PER_PAGE_MOBILE = 20 //images per page for mobile

export const IMAGE_PRELOAD_OFFSET_DESKTOP = 5 //for desktop view, dictates how much until the last element of the page until new page preload (recommended 5 -> first 5 for prev and last 5 for next)

export const TRIGGER_CARD_INDEX_OFFSET_MOBILE = 7 //for mobile view, dictates how much until the last element of the page until new page preload (infinite scroll - higher number -> faster preload)

export const VISIBILITY_THRESHOLD = 0.5 //0-1, higher number -> more sensitive counter (what images are visible)
