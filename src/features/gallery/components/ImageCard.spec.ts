import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { useUserHistoryStore } from '@/stores/userHistoryStore';
import ImageCard from './ImageCard.vue';
import type { PicsumImage } from '@/types/Image';

const RouterLinkStub = {
  template: '<a><slot /></a>',
};

const MOCK_IMAGE: PicsumImage = {
  id: '42',
  author: 'Deep Thought',
  width: 800,
  height: 600,
  url: 'https://picsum.photos/id/42/800/600',
  download_url: 'https://picsum.photos/id/42/800/600',
};

describe('ImageCard.vue', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders in skeleton state when image prop is null', () => {
    const wrapper = mount(ImageCard, {
      props: { image: null, index: 0 },
      global: { plugins: [pinia] }
    });

    expect(wrapper.find('.skeleton-image-bg').exists()).toBe(true);
    expect(wrapper.find('.author-name.is-skeleton').exists()).toBe(true);
  });

  it('renders image and author correctly when data is provided', () => {
    const wrapper = mount(ImageCard, {
      props: { image: MOCK_IMAGE, index: 0 },
      global: { plugins: [pinia], stubs: { RouterLink: RouterLinkStub } }
    });

    const img = wrapper.find('.card-img');
    const expectedUrl = 'https://picsum.photos/id/42/600/400';
    expect(img.attributes('src')).toBe(expectedUrl);
    expect(wrapper.find('.author-name').text()).toBe(MOCK_IMAGE.author);
  });

  it('shows "SEEN" indicator if image is in history but not latest', () => {
    const historyStore = useUserHistoryStore();
    historyStore.seenImages.add(MOCK_IMAGE.id);
    historyStore.latestSeenImageId = '99';

    const wrapper = mount(ImageCard, {
      props: { image: MOCK_IMAGE, index: 0 },
      global: { plugins: [pinia], stubs: { RouterLink: RouterLinkStub } }
    });

    const indicator = wrapper.find('.status-indicator');
    expect(indicator.exists()).toBe(true);
    expect(indicator.text()).toBe('SEEN');
    expect(indicator.classes()).toContain('seen');
  });

  it('shows "LATEST SEEN" indicator if image is the latest seen', () => {
    const historyStore = useUserHistoryStore();
    historyStore.markAsSeen(MOCK_IMAGE.id);

    const wrapper = mount(ImageCard, {
      props: { image: MOCK_IMAGE, index: 0 },
      global: { plugins: [pinia], stubs: { RouterLink: RouterLinkStub } }
    });

    const indicator = wrapper.find('.status-indicator');
    expect(indicator.exists()).toBe(true);
    expect(indicator.text()).toBe('LATEST SEEN');
    expect(indicator.classes()).toContain('latest');
  });
});