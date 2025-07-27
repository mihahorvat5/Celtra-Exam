import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import GalleryControls from './GalleryControls.vue';

vi.mock('@/stores/galleryViewStore', () => ({
  useGalleryViewStore: () => ({
    visibilityStatusText: '1-20 of 20'
  })
}));

describe('GalleryControls.vue', () => {
  it('does not render pagination controls for touch devices', () => {
    const wrapper = mount(GalleryControls, {
      props: {
        isTouchDevice: true,
        currentPage: 1,
        totalPages: 10,
        isLastPage: false,
      }
    });
    expect(wrapper.find('.pagination-controls').exists()).toBe(false);
  });

  it('renders pagination controls for desktop devices', () => {
    const wrapper = mount(GalleryControls, {
      props: {
        isTouchDevice: false,
        currentPage: 5,
        totalPages: 10,
        isLastPage: false,
      }
    });
    expect(wrapper.find('.pagination-controls').exists()).toBe(true);
  });

  it('highlights the current page number and disables the correct buttons', () => {
    const wrapper = mount(GalleryControls, {
      props: {
        isTouchDevice: false,
        currentPage: 1,
        totalPages: 5,
        isLastPage: false,
      }
    });

    const prevButton = wrapper.find('.pagination-button[aria-label="Previous Page"]');
    const activeButton = wrapper.find('.pagination-button.is-active');

    expect(prevButton.attributes('disabled')).toBeDefined();
    expect(activeButton.text()).toBe('1');
  });

  it('emits a "change-page" event with the correct page number when a page button is clicked', async () => {
    const wrapper = mount(GalleryControls, {
      props: {
        isTouchDevice: false,
        currentPage: 1,
        totalPages: 10,
        isLastPage: false,
      }
    });

    const page3Button = wrapper.find('.pagination-button[aria-label="Go to page 3"]');
    await page3Button.trigger('click');

    expect(wrapper.emitted()['change-page']).toHaveLength(1);
    expect(wrapper.emitted()['change-page'][0]).toEqual([3]);
  });
});