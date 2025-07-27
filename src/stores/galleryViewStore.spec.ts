import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGalleryViewStore } from './galleryViewStore';

const mockUiStore = { isTouchDevice: false };
const mockPaginationStore = { fetchPage: vi.fn(), pages: {}, currentPage: 1 };
const mockInfiniteScrollStore = { fetchMore: vi.fn(), imageIds: [] };
vi.mock('@/stores/uiStore', () => ({ useUiStore: () => mockUiStore }));
vi.mock('@/stores/paginationStore', () => ({ usePaginationStore: () => mockPaginationStore }));
vi.mock('@/stores/infiniteScrollStore', () => ({ useInfiniteScrollStore: () => mockInfiniteScrollStore }));
describe('galleryViewStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });
    describe('Action: initialize', () => {
        it('calls fetchPage on paginationStore when on a desktop device and page is not loaded', () => {
            mockUiStore.isTouchDevice = false;
            mockPaginationStore.pages = {};
            const store = useGalleryViewStore();
            store.initialize();

            expect(mockPaginationStore.fetchPage).toHaveBeenCalledOnce();
            expect(mockInfiniteScrollStore.fetchMore).not.toHaveBeenCalled();
        });

        it('calls fetchMore on infiniteScrollStore when on a touch device and no images are loaded', () => {
            mockUiStore.isTouchDevice = true;
            mockInfiniteScrollStore.imageIds = [];
            const store = useGalleryViewStore();

            store.initialize();

            expect(mockInfiniteScrollStore.fetchMore).toHaveBeenCalledOnce();
            expect(mockPaginationStore.fetchPage).not.toHaveBeenCalled();
        });

        it('does NOT call fetchPage if on desktop and page is already loaded', () => {
            mockUiStore.isTouchDevice = false;
            mockPaginationStore.pages = { '1': { ids: ['1'], timestamp: Date.now() } };
            mockPaginationStore.currentPage = 1;
            const store = useGalleryViewStore();

            store.initialize();

            expect(mockPaginationStore.fetchPage).not.toHaveBeenCalled();
        });
    });
});