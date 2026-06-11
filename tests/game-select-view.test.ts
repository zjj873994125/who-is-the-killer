import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GameSelectView from '../src/views/GameSelectView.vue';

const push = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}));

describe('GameSelectView', () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
  });

  it('keeps formal chapters collapsed until the player chooses the formal story', async () => {
    const wrapper = mount(GameSelectView, {
      global: {
        stubs: {
          ElIcon: {
            template: '<span><slot /></span>',
          },
        },
      },
    });

    expect(wrapper.find('#formal-chapter-list').exists()).toBe(false);
    expect(wrapper.findAll('.game-series-card')).toHaveLength(2);

    const expandButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('选择游玩篇章'));

    expect(expandButton).toBeTruthy();
    await expandButton?.trigger('click');

    expect(wrapper.find('#formal-chapter-list').exists()).toBe(true);
    expect(wrapper.findAll('.formal-chapter-row')).toHaveLength(6);
  });

  it('locks formal chapter one until the prologue has been completed', async () => {
    const wrapper = mount(GameSelectView, {
      global: {
        stubs: {
          ElIcon: {
            template: '<span><slot /></span>',
          },
        },
      },
    });

    const expandButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('选择游玩篇章'));
    await expandButton?.trigger('click');

    const chapterOneButton = wrapper
      .findAll('.formal-chapter-row')
      .find((button) => button.text().includes('尸体痉挛'));
    await chapterOneButton?.trigger('click');

    expect(chapterOneButton?.attributes('disabled')).toBeDefined();
    expect(chapterOneButton?.text()).toContain('先完成序章');
    expect(push).not.toHaveBeenCalled();
  });

  it('opens formal chapter one after the prologue is completed', async () => {
    localStorage.setItem('haunted-elevator-official-prologue-complete', 'true');

    const wrapper = mount(GameSelectView, {
      global: {
        stubs: {
          ElIcon: {
            template: '<span><slot /></span>',
          },
        },
      },
    });

    const expandButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('选择游玩篇章'));
    await expandButton?.trigger('click');

    const chapterOneButton = wrapper
      .findAll('.formal-chapter-row')
      .find((button) => button.text().includes('尸体痉挛'));
    await chapterOneButton?.trigger('click');

    expect(push).toHaveBeenCalledWith('/official/chapter-1/case');
  });
});
