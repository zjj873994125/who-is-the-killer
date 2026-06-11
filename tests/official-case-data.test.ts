import { describe, expect, it } from 'vitest';
import {
  officialChapterById,
  officialChapters,
  officialClues,
  officialPrologueBriefing,
  officialReplayQuestions,
  officialResolutionStories,
  officialStoryArcs,
} from '../src/data/officialCase';
import {
  officialChapterOneOriginalStory,
  officialChapterOneReasoningStory,
} from '../src/data/officialStoryText';

describe('official case data', () => {
  it('keeps the formal story separate from the playable demo case', () => {
    expect(officialChapters.map((chapter) => chapter.id)).toEqual([
      'official-prologue',
      'official-chapter-1',
      'official-chapter-2',
      'official-chapter-3',
      'official-chapter-4',
      'official-chapter-5',
    ]);

    expect(officialChapterById['official-prologue'].nextChapterId).toBe(
      'official-chapter-1',
    );
    expect(officialChapters.slice(2).every((chapter) => chapter.locked)).toBe(true);
  });

  it('uses the local article as the formal prologue background', () => {
    expect(officialPrologueBriefing.title).toContain('序');
    expect(officialPrologueBriefing.sections).toHaveLength(4);
    expect(
      officialPrologueBriefing.sections.map((section) => section.title),
    ).toEqual([
      '深夜回到四十楼',
      '闹鬼传言',
      '四十一楼的异常',
      '门打开之前',
    ]);
    expect(officialPrologueBriefing.sections[2].body).toContain('41楼');

    for (const section of officialPrologueBriefing.sections) {
      expect(section.imageKey).toMatch(/^official-prologue-/);
      expect(section.imageAlt.length).toBeGreaterThan(12);
      expect(section.sceneText.length).toBeGreaterThan(20);
    }
  });

  it('builds formal chapter one from the source chapter six story', () => {
    const chapter = officialChapterById['official-chapter-1'];
    const replay = officialReplayQuestions['official-replay-chapter-1'];

    expect(chapter.title).toBe('第一章：尸体痉挛');
    expect(chapter.sourceChapterTitle).toBe('第六章 尸体痉挛');
    expect(chapter.requiredClueIds).toEqual(chapter.clueIds);
    expect(chapter.clueIds).toHaveLength(12);
    expect(replay.chapterId).toBe(chapter.id);
    expect(replay.correctClueIds).toEqual([
      'official-clue-standing-corpse',
      'official-clue-no-rope',
      'official-clue-falling-test',
    ]);
  });

  it('keeps formal chapter one clues searchable and backed by the story', () => {
    const chapter = officialChapterById['official-chapter-1'];
    const clueKeywords = new Set<string>();

    for (const clueId of chapter.clueIds) {
      const clue = officialClues[clueId];

      expect(clue.chapterId).toBe(chapter.id);
      expect(clue.title.length).toBeGreaterThan(4);
      expect(clue.summary.length).toBeGreaterThan(20);
      expect(clue.detail.length).toBeGreaterThan(40);
      expect(clue.keywords.length).toBeGreaterThanOrEqual(2);

      for (const keyword of clue.keywords) {
        const normalized = keyword.trim().toLowerCase();
        expect(clueKeywords.has(normalized)).toBe(false);
        clueKeywords.add(normalized);
      }
    }
  });

  it('uses clue keywords that are visible before search', () => {
    const visibleBeforeSearchText = [
      officialChapterById['official-chapter-1'].title,
      officialChapterById['official-chapter-1'].summary,
      officialChapterById['official-chapter-1'].objective,
      '40楼电梯口 母子报警 头颅滚出 门槛外圆形物',
      '站着的尸体 没有倒下 无头身体 鬼站在电梯里',
      '丝巾反绑 双臂绕在身后 没有绳索 没有吊具',
      '四壁血迹 人体遮挡 头颅被扯断 颈部撕裂',
      '42楼公司 顶楼 没有站在地上 悬空状态',
      '死亡瞬间僵直 尸体痉挛 急坠异常 制停反应 焦糊味 设备故障',
    ].join(' ');

    for (const clueId of officialChapterById['official-chapter-1'].clueIds) {
      for (const keyword of officialClues[clueId].keywords) {
        expect(visibleBeforeSearchText).toContain(keyword);
      }
    }
  });

  it('keeps pre-replay official chapter text free of reasoning spoilers', () => {
    const preReplayTexts = [
      officialChapterById['official-chapter-1'].objective,
      officialReplayQuestions['official-replay-chapter-1'].prompt,
      ...officialChapterById['official-chapter-1'].clueIds.map(
        (clueId) => officialClues[clueId].detail,
      ),
    ];
    const spoilerFragments = [
      '机关起点',
      '为后续推导',
      '线索埋下基础',
      '最终答案',
      '真正可疑',
      '远程机关',
      '电梯就是凶器',
      '电梯本身是杀人凶器',
      '从“现场里找凶器”推进到',
    ];

    for (const text of preReplayTexts) {
      for (const fragment of spoilerFragments) {
        expect(text).not.toContain(fragment);
      }
    }
  });

  it('defines formal story arcs from chapter six to chapter ten', () => {
    expect(officialStoryArcs.map((arc) => arc.sourceChapterTitle)).toEqual([
      '第六章 尸体痉挛',
      '第七章 悬空女尸',
      '第八章 电梯十忌',
      '第九章 见鬼十法',
      '第十章 墙上之门',
    ]);

    for (const arc of officialStoryArcs) {
      expect(arc.playGoal.length).toBeGreaterThan(16);
      expect(arc.unlockCondition.length).toBeGreaterThan(10);
    }
  });

  it('defines official chapter one story from chapter six and early chapter seven', () => {
    const story = officialResolutionStories['official-chapter-1'];

    expect(story.subtitle).toContain('第六章主体');
    expect(story.subtitle).toContain('第七章前半段');
    expect(story.title).toContain('电梯就是凶器');
    expect(officialChapterOneOriginalStory[0].title).toBe('第六章 尸体痉挛');
    expect(officialChapterOneOriginalStory[0].paragraphs[0]).toContain('2008年10月17日');
    expect(officialChapterOneOriginalStory[1].title).toContain('第七章 悬空女尸');
    expect(officialChapterOneOriginalStory[1].paragraphs.join('')).toContain('凶手的作案时间还是一个谜');
    expect(officialChapterOneOriginalStory[1].paragraphs.join('')).not.toContain('一根奇怪的香蕉');
    expect(story.fullStory).toEqual([...officialChapterOneReasoningStory]);
    expect(story.fullStory.join('')).toContain('死亡原因');
    expect(story.images.length).toBeGreaterThanOrEqual(4);
    expect(story.imageKey).toBe('officialPrologueFloor41');
    expect(story.images.map((image) => image.imageKey)).toEqual([
      'officialPrologueFloor41',
      'wenXiaowanIdPhoto',
      'officialChapterOneScene',
      'storyCctvControlRoom',
      'officialChapterOneScene',
    ]);
    expect(story.images.map((image) => image.imageKey)).not.toEqual(
      expect.arrayContaining([
        'storyFieldInvestigation',
        'storyEvidenceTable',
        'storyTeamResolution',
      ]),
    );
    expect(story.beats.length).toBeGreaterThanOrEqual(6);

    for (const beat of story.beats) {
      expect(beat.body.length).toBeGreaterThan(40);
      expect(beat.clueIds.length).toBeGreaterThan(0);

      for (const clueId of beat.clueIds) {
        expect(officialClues[clueId]?.chapterId).toBe('official-chapter-1');
      }
    }
  });

  it('keeps replay reasoning questions nuanced enough for deduction', () => {
    const questions = officialReplayQuestions['official-replay-chapter-1'].reasoningQuestions;

    expect(questions.map((question) => question.title)).toEqual([
      '机械力来源',
      '站立尸体',
    ]);

    for (const question of questions) {
      expect(question.prompt.length).toBeGreaterThan(24);
      expect(question.options).toHaveLength(4);
      expect(question.correctOptionId).toBe('a');

      for (const option of question.options) {
        expect(option.label.length).toBeGreaterThan(34);
        expect(option.label).not.toContain('所有');
        expect(option.label).not.toContain('直接定为');
      }
    }
  });
});
