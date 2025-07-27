import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ImageDetailControls from './ImageDetailControls.vue';

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot/></a>',
};

describe('ImageDetailControls.vue', () => {
  it('renders author name correctly', () => {
    const wrapper = mount(ImageDetailControls, {
      props: {
        author: 'Test Author',
        prevImageId: '1',
        nextImageId: '3',
        isLoading: false,
        isDownloading: false,
      },
      global: { stubs: { RouterLink: RouterLinkStub } }
    });
    expect(wrapper.find('.author-name').text()).toBe('Test Author');
  });

  it('shows skeleton text for author when loading', () => {
    const wrapper = mount(ImageDetailControls, {
      props: {
        author: undefined,
        prevImageId: null,
        nextImageId: null,
        isLoading: true,
        isDownloading: false,
      },
      global: { stubs: { RouterLink: RouterLinkStub } }
    });
    expect(wrapper.find('.author-name.skeleton-text').exists()).toBe(true);
  });

  it('disables the "previous" link when prevImageId is null', () => {
    const wrapper = mount(ImageDetailControls, {
      props: {
        author: 'Test Author',
        prevImageId: null,
        nextImageId: '3',
        isLoading: false,
        isDownloading: false,
      },
      global: { stubs: { RouterLink: RouterLinkStub } }
    });
    const prevLink = wrapper.find('a[aria-label="Previous image"]');
    expect(prevLink.classes()).toContain('disabled');
  });

  it('emits "navigate-back" event when back button is clicked', async () => {
    const wrapper = mount(ImageDetailControls, {
      props: { author: 'Test', prevImageId: '1', nextImageId: '3', isLoading: false, isDownloading: false },
      global: { stubs: { RouterLink: RouterLinkStub } }
    });

    await wrapper.find('button[aria-label="Back to gallery"]').trigger('click');

    expect(wrapper.emitted()['navigate-back']).toHaveLength(1);
  });
});