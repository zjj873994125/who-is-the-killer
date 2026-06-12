import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createInitialCaseFlowState, unlockRoom } from '../src/case-engine/flow';
import { jiangMaskCase } from '../src/data/shortCases/jiangMask';
import JiangMaskSurveyArea from '../src/views/shortCases/jiangMask/JiangMaskSurveyArea.vue';

function mountSurvey(state = createInitialCaseFlowState(jiangMaskCase)) {
  return mount(JiangMaskSurveyArea, {
    props: {
      playableCase: jiangMaskCase,
      state,
    },
    global: {
      stubs: {
        ElButton: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
        ElInput: {
          props: ['modelValue'],
          emits: ['update:modelValue', 'keyup'],
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup="$emit(\'keyup\', $event)" />',
        },
        ElDialog: {
          props: ['modelValue', 'title'],
          template: '<section v-if="modelValue" class="private-room-dialog"><h2>{{ title }}</h2><slot /></section>',
        },
      },
    },
  });
}

describe('JiangMaskSurveyArea', () => {
  it('renders the generated survey image while keeping the fallback scene divs', () => {
    const wrapper = mountSurvey();

    expect(wrapper.find('.survey-observation').exists()).toBe(false);
    expect(wrapper.find('.inspected-list').exists()).toBe(false);
    expect(wrapper.find('.survey-stage-header').text()).toContain('前往检索区');
    expect(wrapper.find<HTMLImageElement>('img.stage-scene-image').attributes('src')).toContain(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/jiang-mask-survey-stage.png',
    );
    expect(wrapper.find('.stage-fallback-scene').exists()).toBe(true);
    expect(wrapper.find('.stage-beam').exists()).toBe(true);
    expect(wrapper.find('.stage-curtain').exists()).toBe(true);
    expect(wrapper.find('.stage-floor').exists()).toBe(true);
  });

  it('keeps He Jingshan room locked until the password is entered', async () => {
    const wrapper = mountSurvey();

    expect(wrapper.find('.private-room-dialog').exists()).toBe(false);
    expect(wrapper.find('.scene-observation-panel').exists()).toBe(false);

    await wrapper.findAll('.hotspot')[0].trigger('click');

    expect(wrapper.find('.scene-observation-panel').text()).toContain(
      '何敬山倒在后台梁架下方',
    );
    expect(wrapper.find('.scene-observation-panel strong').text()).toBe('死者位置');
    expect(wrapper.find('.scene-observation-panel').text()).not.toContain('观察详情');

    await wrapper
      .findAll('.hotspot')
      .find((item) => item.text().includes('何敬山房间'))
      ?.trigger('click');

    expect(wrapper.find('.private-room-dialog').text()).toContain('何敬山房间');
    expect(wrapper.find('.private-room-card').text()).toContain(
      '房门锁紧着，门边只有一个血字：“火”',
    );
    expect(wrapper.find('.private-room-card').text()).not.toContain('旧火，四月二十');
    expect(wrapper.findAll('.digit-selector')).toHaveLength(4);
    expect(wrapper.find('input.room-password-input').exists()).toBe(false);

    await wrapper.find('.room-enter-button').trigger('click');

    expect(wrapper.emitted('unlockRoom')).toBeUndefined();
    expect(wrapper.find('.room-error').text()).toContain('密码错误');

    const digitSelectors = wrapper.findAll('.digit-selector');
    for (let index = 0; index < 4; index += 1) {
      const upButton = digitSelectors[1].find('.digit-up');
      await upButton.trigger('click');
    }
    for (let index = 0; index < 2; index += 1) {
      const upButton = digitSelectors[2].find('.digit-up');
      await upButton.trigger('click');
    }
    await wrapper.find('.room-enter-button').trigger('click');

    expect(wrapper.emitted('unlockRoom')).toEqual([['he-jingshan-room']]);
  });

  it('shows only the unpublished paper note after the room is unlocked', async () => {
    const unlockedState = unlockRoom(createInitialCaseFlowState(jiangMaskCase), 'he-jingshan-room');
    const wrapper = mountSurvey(unlockedState);

    expect(wrapper.find('.private-room-dialog').exists()).toBe(false);
    await wrapper
      .findAll('.hotspot')
      .find((item) => item.text().includes('何敬山房间'))
      ?.trigger('click');

    expect(wrapper.find('.private-room-card').text()).toContain(
      '抽屉里有一只未公开论文袋。封面夹着《姜神祭传承考》的删页。',
    );
    expect(wrapper.find('.room-keyword').exists()).toBe(false);
    expect(wrapper.find('.private-room-card').text()).not.toContain('可检索关键词');
  });
});
