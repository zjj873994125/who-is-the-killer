import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { jiangMaskCase } from '../src/data/shortCases/jiangMask';
import JiangMaskCaseArea from '../src/views/shortCases/jiangMask/JiangMaskCaseArea.vue';

describe('JiangMaskCaseArea', () => {
  it('presents a focused case intro with mask, story and victim identity', async () => {
    const wrapper = mount(JiangMaskCaseArea, {
      props: {
        playableCase: jiangMaskCase,
      },
      global: {
        stubs: {
          ElButton: {
            emits: ['click'],
            template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    });

    expect(wrapper.find('.case-story').text()).not.toContain('姜面不落地');
    expect(wrapper.find('.case-story').text()).toContain('冬祭后台');
    expect(wrapper.find('.victim-file').text()).toContain('何敬山');
    expect(wrapper.find('.victim-file').text()).toContain('百溪民俗馆馆长');
    expect(wrapper.find<HTMLImageElement>('img.id-card-photo').attributes('src')).toContain(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/he-jingshan-id.png',
    );
    expect(wrapper.find('.id-card-placeholder').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('林守义');
    expect(wrapper.text()).not.toContain('关系人档案：老舞台工');
    expect(wrapper.find('.mask-evidence').text()).toContain('黑姜面');
    expect(wrapper.find<HTMLImageElement>('img.mask-image').attributes('src')).toContain(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/jiang-mask-evidence.png',
    );
    expect(wrapper.findAll<HTMLImageElement>('img.mask-image')).toHaveLength(2);
    expect(wrapper.findAll('.mask-placeholder')).toHaveLength(2);
    expect(wrapper.findAll<HTMLImageElement>('img.mask-image')[1].attributes('src')).toContain(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/jiang-mask-back-evidence.png',
    );
    expect(wrapper.find('.victim-file').text()).not.toContain('关联材料');
    expect(wrapper.find('.victim-file').text()).not.toContain('姜浩');
    expect(wrapper.find('.victim-file').text()).not.toContain('无口将军');
    expect(wrapper.find('.victim-file').text()).not.toContain('祭田');
    expect(wrapper.find('.mask-evidence').classes()).toContain('mask-evidence');
    expect(wrapper.findAll('.timeline-item')).toHaveLength(0);
    expect(wrapper.find('.lead-file').exists()).toBe(false);
    expect(wrapper.find('.task-card').exists()).toBe(false);

    await wrapper.find('.case-story button').trigger('click');

    expect(wrapper.emitted('completeAndGo')).toEqual([[ 'case', 'survey' ]]);
  });

  it('does not stack every intro block as separate board panels', () => {
    const wrapper = mount(JiangMaskCaseArea, {
      props: {
        playableCase: jiangMaskCase,
      },
      global: {
        stubs: {
          ElButton: true,
        },
      },
    });

    expect(wrapper.findAll('.folk-note')).toHaveLength(0);
    expect(wrapper.findAll('.case-intro-layout > article')).toHaveLength(3);
  });
});
