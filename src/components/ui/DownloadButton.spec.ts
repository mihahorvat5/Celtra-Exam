import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DownloadButton from './DownloadButton.vue';

describe('DownloadButton.vue', () => {
  it('renders the default state correctly', () => {
    const wrapper = mount(DownloadButton, {
      props: { isLoading: false, isDownloading: false },
    });

    const button = wrapper.find('button');
    expect(button.text()).toBe('Download');
    expect(button.attributes('disabled')).toBeUndefined();
    expect(button.classes()).not.toContain('is-skeleton');
  });

  it('renders the "downloading" state correctly', () => {
    const wrapper = mount(DownloadButton, {
      props: { isLoading: false, isDownloading: true },
    });

    const button = wrapper.find('button');
    expect(button.text()).toBe('Downloading...');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('renders the "loading" (skeleton) state correctly', () => {
    const wrapper = mount(DownloadButton, {
      props: { isLoading: true, isDownloading: false },
    });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.classes()).toContain('is-skeleton');
  });

  it('emits a "download" event on click when enabled', async () => {
    const wrapper = mount(DownloadButton, {
      props: { isLoading: false, isDownloading: false },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted()).toHaveProperty('download');
    expect(wrapper.emitted().download).toHaveLength(1);
  });

  it('does NOT emit a "download" event on click when disabled', async () => {
    const wrapper = mount(DownloadButton, {
      props: { isLoading: true, isDownloading: false },
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted()).not.toHaveProperty('download');
  });
});