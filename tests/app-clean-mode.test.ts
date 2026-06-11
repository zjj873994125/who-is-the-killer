import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.vue';

const replace = vi.fn();
const route = {
  path: '/',
};

vi.mock('vue-router', () => ({
  useRouter: () => ({
    currentRoute: {
      value: route,
    },
    replace,
  }),
  useRoute: () => route,
}));

describe('App clean mode', () => {
  beforeEach(() => {
    replace.mockClear();
    route.path = '/';
    localStorage.clear();
  });

  it('toggles clean mode and persists the setting', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          ContentWarning: true,
          AppWorkspace: true,
          RouterView: {
            template: '<main>router view</main>',
          },
        },
      },
    });

    expect(wrapper.find('.app-root').classes()).not.toContain('clean-mode');
    expect(wrapper.find('.clean-mode-toggle').text()).toBe('纯净模式');

    await wrapper.find('.clean-mode-toggle').trigger('click');

    expect(wrapper.find('.app-root').classes()).toContain('clean-mode');
    expect(wrapper.find('.clean-mode-toggle').text()).toBe('图片隐藏');
    expect(localStorage.getItem('haunted-elevator-clean-mode')).toBe('true');
  });

  it('restores clean mode from localStorage', async () => {
    localStorage.setItem('haunted-elevator-clean-mode', 'true');

    const wrapper = mount(App, {
      global: {
        stubs: {
          ContentWarning: true,
          AppWorkspace: true,
          RouterView: {
            template: '<main>router view</main>',
          },
        },
      },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.app-root').classes()).toContain('clean-mode');
    expect(wrapper.find('.clean-mode-toggle').text()).toBe('图片隐藏');
  });
});
