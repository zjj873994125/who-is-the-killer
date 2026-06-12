import { describe, expect, it } from 'vitest';
import {
  archiveClue,
  completeArea,
  createInitialCaseFlowState,
  getUnlockedAreaId,
  isAreaAccessible,
  searchCaseClues,
  searchCaseCluesWithMeta,
  submitReplay,
} from '../src/case-engine/flow';
import type { CaseAreaId, PlayableCaseDefinition } from '../src/case-engine/types';

const testCase: PlayableCaseDefinition = {
  id: 'test-case',
  title: '测试案件',
  subtitle: '流程测试',
  theme: 'folk',
  startAreaId: 'case',
  areas: [
    { id: 'case', label: '案件区', routeSegment: 'case' },
    { id: 'survey', label: '勘查区', routeSegment: 'survey', requiresCompletedAreaId: 'case' },
    { id: 'search', label: '检索区', routeSegment: 'search', requiresCompletedAreaId: 'survey' },
    { id: 'replay', label: '复盘区', routeSegment: 'replay', requiresCompletedAreaId: 'search' },
    { id: 'story', label: '故事区', routeSegment: 'story', requiresCompletedAreaId: 'replay' },
  ],
  clues: [
    {
      id: 'clue-a',
      title: '红绳机关',
      summary: '梁上红绳连接面具。',
      detail: '红绳经过梁架，能让面具从高处落下。',
      keywords: ['红绳'],
    },
    {
      id: 'clue-b',
      title: '旧毡布',
      summary: '旧毡布吸走泥水。',
      detail: '旧毡布解释了后台没有脚印的异常。',
      keywords: ['毡布'],
      stage: 'middle',
    },
    {
      id: 'clue-c',
      title: '后期档案',
      summary: '后期才可见。',
      detail: '后期才可检索。',
      keywords: ['后期'],
      stage: 'late',
    },
    {
      id: 'clue-d',
      title: '依赖档案',
      summary: '上一条归档后才可见。',
      detail: '上一条归档后才可检索。',
      keywords: ['依赖'],
      stage: 'early',
      requiresArchivedClueIds: ['clue-a'],
    },
    {
      id: 'clue-e',
      title: '房间档案',
      summary: '房间打开后才可见。',
      detail: '房间打开后才可检索。',
      keywords: ['房间'],
      stage: 'early',
      requiresUnlockedRoomIds: ['room-a'],
    },
  ],
  replay: {
    id: 'replay-test',
    requiredClueIds: ['clue-a', 'clue-b'],
    correctClueIds: ['clue-a', 'clue-b'],
    clueSelectionLimit: 2,
    questions: [
      {
        id: 'q1',
        title: '机关来源',
        prompt: '面具为什么能落到死者脸上？',
        options: [
          { id: 'a', label: '红绳机关从梁上释放面具' },
          { id: 'b', label: '有人直接把面具戴上' },
        ],
        correctOptionId: 'a',
      },
    ],
  },
  story: {
    title: '结案故事',
    lead: '案件复盘完成。',
    paragraphs: ['真相成立。'],
  },
};

describe('case engine flow', () => {
  it('unlocks areas by completed area order', () => {
    let state = createInitialCaseFlowState(testCase);

    expect(getUnlockedAreaId(testCase, state)).toBe('case');
    expect(isAreaAccessible(testCase, state, 'survey')).toBe(false);

    state = completeArea(state, 'case');

    expect(getUnlockedAreaId(testCase, state)).toBe('survey');
    expect(isAreaAccessible(testCase, state, 'survey')).toBe(true);
    expect(isAreaAccessible(testCase, state, 'search')).toBe(false);
  });

  it('keeps disabled areas inaccessible even after prerequisites are complete', () => {
    const disabledCase = {
      ...testCase,
      areas: testCase.areas.map((area) =>
        area.id === 'replay' ? { ...area, isDisabled: true } : area,
      ),
    };
    const state = {
      ...createInitialCaseFlowState(disabledCase),
      completedAreaIds: ['case', 'survey', 'search'] satisfies CaseAreaId[],
    };

    expect(getUnlockedAreaId(disabledCase, state)).toBe('search');
    expect(isAreaAccessible(disabledCase, state, 'replay')).toBe(false);
  });

  it('searches clues by fuzzy keyword and archives details explicitly', () => {
    let state = createInitialCaseFlowState(testCase);

    expect(searchCaseClues(testCase, '红绳')).toEqual([testCase.clues[0]]);
    expect(searchCaseClues(testCase, '绳')).toEqual([testCase.clues[0]]);
    expect(searchCaseClues(testCase, '机关')).toEqual([]);
    expect(state.archivedClueIds).toEqual([]);

    state = archiveClue(state, 'clue-a');

    expect(state.archivedClueIds).toEqual(['clue-a']);
  });

  it('unlocks clue stages by archive progress', () => {
    const earlyState = createInitialCaseFlowState(testCase);
    const middleState = {
      ...earlyState,
      archivedClueIds: ['1', '2', '3', '4', '5'],
    };
    const lateState = {
      ...earlyState,
      archivedClueIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    };

    expect(searchCaseClues(testCase, '毡布', earlyState)).toEqual([]);
    expect(searchCaseCluesWithMeta(testCase, '毡布', earlyState)).toEqual({
      clues: [],
      locked: true,
    });
    expect(searchCaseClues(testCase, '毡布', middleState)).toEqual([testCase.clues[1]]);
    expect(searchCaseClues(testCase, '后期', middleState)).toEqual([]);
    expect(searchCaseCluesWithMeta(testCase, '后', middleState)).toEqual({
      clues: [],
      locked: true,
    });
    expect(searchCaseClues(testCase, '后期', lateState)).toEqual([testCase.clues[2]]);
    expect(searchCaseClues(testCase, '后', lateState)).toEqual([testCase.clues[2]]);
    expect(searchCaseCluesWithMeta(testCase, '不存在', earlyState)).toEqual({
      clues: [],
      locked: false,
    });
  });

  it('keeps dependent clues locked until prerequisite clues are archived', () => {
    const initialState = createInitialCaseFlowState(testCase);
    const unlockedState = archiveClue(initialState, 'clue-a');

    expect(searchCaseCluesWithMeta(testCase, '依赖', initialState)).toEqual({
      clues: [],
      locked: true,
    });
    expect(searchCaseCluesWithMeta(testCase, '依赖', unlockedState)).toEqual({
      clues: [testCase.clues[3]],
      locked: false,
    });
  });

  it('keeps room clues locked until the room is unlocked', () => {
    const initialState = createInitialCaseFlowState(testCase);
    const unlockedState = {
      ...initialState,
      unlockedRoomIds: ['room-a'],
    };

    expect(searchCaseCluesWithMeta(testCase, '房间', initialState)).toEqual({
      clues: [],
      locked: true,
    });
    expect(searchCaseCluesWithMeta(testCase, '房间', unlockedState)).toEqual({
      clues: [testCase.clues[4]],
      locked: false,
    });
  });

  it('requires all replay clues and final answers before solving replay', () => {
    const state = createInitialCaseFlowState(testCase);

    expect(
      submitReplay(testCase, state, {
        selectedClueIds: ['clue-a'],
        selectedAnswers: { q1: 'a' },
      }),
    ).toEqual({
      solved: false,
      reason: 'missing-required-clues',
    });

    expect(
      submitReplay(testCase, state, {
        selectedClueIds: ['clue-a', 'clue-b'],
        selectedAnswers: { q1: 'b' },
      }),
    ).toEqual({
      solved: false,
      reason: 'wrong-answer',
    });

    expect(
      submitReplay(testCase, state, {
        selectedClueIds: ['clue-a', 'clue-b'],
        selectedAnswers: { q1: 'a' },
      }),
    ).toEqual({
      solved: true,
      reason: 'correct',
    });
  });
});
