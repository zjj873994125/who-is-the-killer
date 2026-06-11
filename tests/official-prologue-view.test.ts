import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OfficialPrologueView from '../src/views/OfficialPrologueView.vue';

const push = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}));

describe('OfficialPrologueView', () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
    vi.useRealTimers();
  });

  function mountOfficialPrologueView() {
    return mount(OfficialPrologueView, {
      global: {
        stubs: {
          ElIcon: {
            template: '<span><slot /></span>',
          },
        },
      },
    });
  }

  it('shows a formal entry loading gate before the prologue story', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.useFakeTimers();

    const wrapper = mountOfficialPrologueView();

    expect(wrapper.find('.official-prologue-entry-screen').exists()).toBe(true);
    expect(wrapper.find('.official-entry-scene-frame img').attributes('src')).toContain(
      'official-chapter-1-survey-elevator-v7.png',
    );
    expect(wrapper.find('.official-entry-scene-frame img').attributes('alt')).toBe(
      '案发货梯内部局部监控截帧',
    );
    expect(wrapper.find('.entry-loading').exists()).toBe(false);
    expect(wrapper.text()).toContain('确认进入正式篇序章');
    expect(wrapper.text()).not.toContain('进入第一章');

    await wrapper.find('.entry-action').trigger('click');

    expect(wrapper.find('.entry-loading').exists()).toBe(true);
    expect(wrapper.text()).toContain('接入完成');

    vi.advanceTimersByTime(180);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.official-prologue-screen').exists()).toBe(true);
    expect(wrapper.text()).toContain('进入第一章');
  });

  it('marks the formal prologue as completed before entering chapter one', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.useFakeTimers();

    const wrapper = mountOfficialPrologueView();

    await wrapper.find('.entry-action').trigger('click');
    vi.advanceTimersByTime(180);
    await wrapper.vm.$nextTick();

    await wrapper.find('.official-prologue-action').trigger('click');

    expect(localStorage.getItem('haunted-elevator-official-prologue-complete')).toBe('true');
    expect(push).toHaveBeenCalledWith('/official/chapter-1/case');
  });
});
