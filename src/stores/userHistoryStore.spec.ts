import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserHistoryStore } from './userHistoryStore';

describe('userHistoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with an empty history', () => {
    const store = useUserHistoryStore();

    expect(store.seenImages).toBeInstanceOf(Set);
    expect(store.seenImages.size).toBe(0);
    expect(store.latestSeenImageId).toBe(null);
  });

  it('markAsSeen adds a new image ID correctly', () => {
    const store = useUserHistoryStore();
    const imageId = '10';

    store.markAsSeen(imageId);

    expect(store.seenImages.has(imageId)).toBe(true);
    expect(store.seenImages.size).toBe(1);
    expect(store.latestSeenImageId).toBe(imageId);
  });

  it('markAsSeen updates the latestSeenImageId on subsequent calls', () => {
    const store = useUserHistoryStore();

    store.markAsSeen('10');
    store.markAsSeen('25');

    expect(store.seenImages.has('10')).toBe(true);
    expect(store.seenImages.has('25')).toBe(true);
    expect(store.seenImages.size).toBe(2);
    expect(store.latestSeenImageId).toBe('25');
  });

  it('markAsSeen does not add duplicate IDs to the Set', () => {
    const store = useUserHistoryStore();

    store.markAsSeen('10');
    store.markAsSeen('10');

    expect(store.seenImages.size).toBe(1);
    expect(store.latestSeenImageId).toBe('10');
  });
});