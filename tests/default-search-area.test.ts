import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createInitialCaseFlowState, searchCaseCluesWithMeta } from '../src/case-engine/flow';
import DefaultSearchArea from '../src/case-engine/components/DefaultSearchArea.vue';
import type { CaseFlowState, PlayableCaseDefinition } from '../src/case-engine/types';

const searchCase: PlayableCaseDefinition = {
  id: 'search-test',
  title: '检索测试',
  subtitle: '短篇',
  theme: 'folk',
  startAreaId: 'search',
  areas: [{ id: 'search', label: '检索区', routeSegment: 'search' }],
  clues: [
    {
      id: 'clue-a',
      title: '第一条档案',
      summary: '第一条摘要。',
      detail: '第一条详情。',
      keywords: ['第一条'],
    },
    {
      id: 'clue-b',
      title: '第二条档案',
      summary: '第二条摘要。',
      detail: '第二条详情。',
      keywords: ['第二条'],
    },
  ],
  replay: {
    id: 'replay',
    requiredClueIds: ['clue-a', 'clue-b'],
    correctClueIds: ['clue-a'],
    clueSelectionLimit: 1,
    questions: [],
  },
  story: {
    title: '故事',
    lead: '故事',
    paragraphs: [],
  },
};

function mountSearchArea(state: CaseFlowState = createInitialCaseFlowState(searchCase)) {

  return mount(DefaultSearchArea, {
    props: {
      playableCase: searchCase,
      state,
      search: (keyword: string) => searchCaseCluesWithMeta(searchCase, keyword, state).clues,
      searchWithMeta: (keyword: string) => searchCaseCluesWithMeta(searchCase, keyword, state),
    },
    global: {
      stubs: {
        ElButton: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
        ElDialog: {
          props: ['modelValue', 'title'],
          template:
            '<section v-if="modelValue" class="search-hint-dialog-shell"><h2>{{ title }}</h2><slot /><footer><slot name="footer" /></footer></section>',
        },
        ElEmpty: {
          props: ['description'],
          template: '<div class="el-empty">{{ description }}</div>',
        },
        ElIcon: {
          template: '<span><slot /></span>',
        },
        ElInput: {
          inheritAttrs: false,
          props: ['modelValue'],
          emits: ['update:modelValue', 'keyup'],
          template:
            '<input class="search-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup="$emit(\'keyup\', $event)" />',
        },
        ElTag: {
          template: '<span><slot /></span>',
        },
      },
    },
  });
}

describe('DefaultSearchArea', () => {
  it('requires archiving the current hit before searching the next clue', async () => {
    const wrapper = mountSearchArea();

    await wrapper.find('.search-input').setValue('第一条');
    await wrapper.find('.search-bar button').trigger('click');

    expect(wrapper.find('.search-console .result-panel').exists()).toBe(false);
    expect(wrapper.find('.search-inspector .result-panel').exists()).toBe(true);
    expect(wrapper.findAll('.result-panel .clue-title-row')).toHaveLength(1);
    expect(wrapper.find('.clue-detail').text()).toContain('第一条详情');
    expect(wrapper.find('.complete-button').exists()).toBe(false);
    expect(wrapper.find('.archive-action').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('进入复盘区');

    await wrapper.find('.search-input').setValue('第二条');
    await wrapper.find('.search-bar button').trigger('click');

    expect(wrapper.find('.result-panel').text()).toContain('先归档当前检索结果');
    expect(wrapper.find('.clue-detail').text()).toContain('第一条详情');
    expect(wrapper.emitted('archiveClue')).toBeUndefined();

    await wrapper.find('.clue-detail button').trigger('click');

    expect(wrapper.emitted('archiveClue')).toEqual([['clue-a']]);
    expect(wrapper.emitted('completeArea')).toBeUndefined();
    expect(wrapper.find('.result-panel').text()).toContain('可以继续检索下一条档案');
    expect(wrapper.findAll('.result-panel .clue-title-row')).toHaveLength(0);
  });

  it('opens the same three-chance manual search hint flow as chapter one', async () => {
    const wrapper = mountSearchArea();

    await wrapper.find('.search-bar button:last-child').trigger('click');

    expect(wrapper.find('.search-hint-dialog-shell').text()).toContain(
      '我是废物，求求伟大的杰哥给我点提示吧。',
    );
    expect(wrapper.find('.search-hint-dialog-shell').text()).toContain('剩余 3 次');

    await wrapper.find('.search-hint-input').setValue('我是废物，求求伟大的杰哥给我点提示吧。');
    await wrapper.find('.search-hint-submit').trigger('click');

    expect(wrapper.find('.search-hint-result').text()).toContain('试试搜索：第一条');
    expect(wrapper.emitted('useHint')).toEqual([[]]);
  });

  it('skips archived clues when giving short-case search hints and blocks paste', async () => {
    const wrapper = mountSearchArea({
      ...createInitialCaseFlowState(searchCase),
      archivedClueIds: ['clue-a'],
    });

    await wrapper.find('.search-bar button:last-child').trigger('click');
    await wrapper.find('.search-hint-input').trigger('paste');

    expect(wrapper.find('.search-hint-result').text()).toContain('不能复制粘贴');

    await wrapper.find('.search-hint-input').setValue('我是废物，求求伟大的杰哥给我点提示吧。');
    await wrapper.find('.search-hint-submit').trigger('click');

    expect(wrapper.find('.search-hint-result').text()).not.toContain('第一条');
    expect(wrapper.find('.search-hint-result').text()).toContain('试试搜索：第二条');
  });

  it('hides the development import button for release builds', async () => {
    const wrapper = mountSearchArea();

    expect(wrapper.find('.archive-all-button').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('一键导入');
  });

  it('completes the search area after manually archiving the last required clue', async () => {
    const wrapper = mountSearchArea({
      ...createInitialCaseFlowState(searchCase),
      archivedClueIds: ['clue-a'],
    });

    await wrapper.find('.search-input').setValue('第二条');
    await wrapper.find('.search-bar button').trigger('click');
    await wrapper.find('.clue-detail button').trigger('click');

    expect(wrapper.emitted('archiveClue')).toEqual([['clue-b']]);
    expect(wrapper.emitted('completeArea')).toEqual([[]]);
  });
});
