import { describe, expect, it } from 'vitest';
import { archiveClue, createInitialCaseFlowState, searchCaseCluesWithMeta } from '../src/case-engine/flow';
import { jiangMaskCase } from '../src/data/shortCases/jiangMask';

describe('short case data', () => {
  it('defines Jiang Mask as the first short case on the reusable flow', () => {
    expect(jiangMaskCase.id).toBe('jiang-mask');
    expect(jiangMaskCase.title).toBe('姜面不落地');
    expect(jiangMaskCase.areas.map((area) => area.id)).toEqual([
      'case',
      'survey',
      'search',
      'replay',
      'story',
    ]);
    expect(jiangMaskCase.areas.find((area) => area.id === 'replay')?.isDisabled).toBe(true);
    expect(jiangMaskCase.contacts?.length).toBeGreaterThanOrEqual(3);
    expect(jiangMaskCase.survey?.hotspots.length).toBeGreaterThanOrEqual(6);
  });

  it('includes a townspeople chat for local Jiang God rumors', () => {
    const villagerThread = jiangMaskCase.contacts?.find((thread) => thread.id === 'townspeople');

    expect(villagerThread?.name).toBe('百溪镇民');
    expect(villagerThread?.messages.map((message) => message.text).join('')).toContain(
      '姜神换脸',
    );
    expect(villagerThread?.messages.map((message) => message.text).join('')).toContain(
      '何敬山坏了规矩',
    );
  });

  it('keeps squad chat focused on early scene process and physical evidence', () => {
    const squadText = (jiangMaskCase.contacts ?? [])
      .filter((thread) => ['bao', 'su', 'hua'].includes(thread.id))
      .flatMap((thread) => thread.messages.map((message) => message.text))
      .join('');
    const prematureFragments = [
      '姜浩',
      '祭田',
      '掌祭家族',
      '四十年前旧火灾',
      '老舞台工',
      '林守义',
      '传承造假',
      '动机',
      '机关',
    ];

    expect(squadText).toContain('黑钉');
    expect(squadText).toContain('香灰');

    for (const fragment of prematureFragments) {
      expect(squadText).not.toContain(fragment);
    }
  });

  it('keeps clue keywords useful and requires every clue before replay', () => {
    const keywords = new Set<string>();

    expect(jiangMaskCase.clues.length).toBeGreaterThanOrEqual(14);
    expect(jiangMaskCase.replay.requiredClueIds).toEqual(
      jiangMaskCase.clues.map((clue) => clue.id),
    );

    for (const clue of jiangMaskCase.clues) {
      expect(clue.keywords.length).toBeGreaterThanOrEqual(1);

      for (const keyword of clue.keywords) {
        expect(keywords.has(keyword)).toBe(false);
        keywords.add(keyword);
      }
    }
  });

  it('supports natural fuzzy search words without bypassing clue locks', () => {
    const initialState = createInitialCaseFlowState(jiangMaskCase);
    const roomUnlockedState = {
      ...initialState,
      unlockedRoomIds: ['he-jingshan-room'],
    };
    const lateState = {
      ...initialState,
      archivedClueIds: Array.from({ length: 10 }, (_, index) => `archived-${index}`),
    };
    const paperUnlockedState = archiveClue(
      {
        ...initialState,
        archivedClueIds: Array.from({ length: 5 }, (_, index) => `archived-${index}`),
      },
      'jiang-clue-unpublished-paper',
    );

    expect(searchCaseCluesWithMeta(jiangMaskCase, '火灾', initialState)).toEqual({
      clues: [],
      locked: true,
    });
    expect(searchCaseCluesWithMeta(jiangMaskCase, '未公开论文袋', initialState)).toEqual({
      clues: [],
      locked: true,
    });
    expect(
      searchCaseCluesWithMeta(jiangMaskCase, '未公开论文袋', roomUnlockedState).clues[0]?.id,
    ).toBe('jiang-clue-unpublished-paper');
    expect(searchCaseCluesWithMeta(jiangMaskCase, '火灾', paperUnlockedState).clues[0]?.id).toBe(
      'jiang-clue-public-paper',
    );
    expect(searchCaseCluesWithMeta(jiangMaskCase, '火灾档案', lateState).clues[0]?.id).toBe(
      'jiang-clue-old-fire',
    );
    expect(searchCaseCluesWithMeta(jiangMaskCase, '铁钉', initialState).clues[0]?.id).toBe(
      'jiang-clue-black-mask',
    );
  });

  it('only uses clue keywords that are visible from public material or prerequisite clues', () => {
    const visibleText = [
      jiangMaskCase.title,
      jiangMaskCase.subtitle,
      ...(jiangMaskCase.introBlocks ?? []).flatMap((block) => [block.title, block.body]),
      ...(jiangMaskCase.contacts ?? []).flatMap((thread) =>
        thread.messages.map((message) => message.text),
      ),
      jiangMaskCase.survey?.title,
      jiangMaskCase.survey?.lead,
      jiangMaskCase.survey?.imageAlt,
      jiangMaskCase.survey?.privateRoom?.title,
      jiangMaskCase.survey?.privateRoom?.lockedText,
      jiangMaskCase.survey?.privateRoom?.unlockedTitle,
      jiangMaskCase.survey?.privateRoom?.unlockedBody,
      ...(jiangMaskCase.survey?.hotspots ?? []).flatMap((hotspot) => [
        hotspot.label,
        hotspot.observation,
      ]),
    ].join('');

    for (const clue of jiangMaskCase.clues) {
      const prerequisiteText = (clue.requiresArchivedClueIds ?? [])
        .map((clueId) => jiangMaskCase.clues.find((item) => item.id === clueId))
        .filter((item): item is (typeof jiangMaskCase.clues)[number] => Boolean(item))
        .map((item) => `${item.title}${item.summary}${item.detail}`)
        .join('');
      const availableText = `${visibleText}${prerequisiteText}`;

      expect(clue.keywords.some((keyword) => availableText.includes(keyword))).toBe(true);
    }
  });

  it('uses three key clues for the final reconstruction', () => {
    expect(jiangMaskCase.replay.clueSelectionLimit).toBe(3);
    expect(jiangMaskCase.replay.correctClueIds).toEqual([
      'jiang-clue-black-mask',
      'jiang-clue-red-rope',
      'jiang-clue-felt-cloth',
    ]);
    expect(jiangMaskCase.replay.questions).toHaveLength(2);
  });

  it('keeps Lin Shouyi hidden until the old stage worker clue is searched', () => {
    const preSearchText = [
      ...(jiangMaskCase.introBlocks ?? []).flatMap((block) => [block.title, block.body]),
      ...(jiangMaskCase.contacts ?? []).flatMap((thread) =>
        thread.messages.map((message) => message.text),
      ),
      ...(jiangMaskCase.survey?.hotspots ?? []).flatMap((hotspot) => [
        hotspot.label,
        hotspot.observation,
      ]),
    ].join('');
    const stageWorkerClue = jiangMaskCase.clues.find(
      (clue) => clue.id === 'jiang-clue-stage-worker',
    );

    expect(preSearchText).not.toContain('老舞台工');
    expect(preSearchText).not.toContain('林守义');
    expect(stageWorkerClue?.detail).toContain('林守义');
  });

  it('keeps searchable clues as raw materials instead of final conclusions', () => {
    const spoilerFragments = [
      '追查传承造假',
      '传承造假',
      '现实利益冲突',
      '杀人动机',
      '证明',
      '机关',
      '只要',
      '就能让',
      '解释了为什么',
      '更现实',
      '非单纯意外',
      '维护家族传承的动机',
      '掌祭家族',
      '林守义',
    ];

    for (const clue of jiangMaskCase.clues.filter((item) => item.stage === 'early')) {
      const clueText = `${clue.summary}${clue.detail}`;

      for (const fragment of spoilerFragments) {
        expect(clueText).not.toContain(fragment);
      }
    }
  });

  it('unlocks truth in stages instead of putting every clue at the same depth', () => {
    const stageCounts = jiangMaskCase.clues.reduce(
      (result, clue) => ({
        ...result,
        [clue.stage ?? 'early']: result[clue.stage ?? 'early'] + 1,
      }),
      {
        early: 0,
        middle: 0,
        late: 0,
      },
    );
    const lateClueText = jiangMaskCase.clues
      .filter((clue) => clue.stage === 'late')
      .map((clue) => `${clue.summary}${clue.detail}`)
      .join('');

    expect(stageCounts.early).toBeGreaterThanOrEqual(5);
    expect(stageCounts.middle).toBeGreaterThanOrEqual(4);
    expect(stageCounts.late).toBeGreaterThanOrEqual(4);
    expect(lateClueText).toContain('动机');
  });

  it('builds Jiang Mask clue chain without exposing the old stage worker too early', () => {
    const unpublishedPaperClue = jiangMaskCase.clues.find(
      (clue) => clue.id === 'jiang-clue-unpublished-paper',
    );
    const publicPaperClue = jiangMaskCase.clues.find(
      (clue) => clue.id === 'jiang-clue-public-paper',
    );
    const maskKeeperClue = jiangMaskCase.clues.find(
      (clue) => clue.id === 'jiang-clue-mask-keeper-role',
    );
    const currentMaskKeeperClue = jiangMaskCase.clues.find(
      (clue) => clue.id === 'jiang-clue-current-mask-keeper',
    );
    const uncleFileClue = jiangMaskCase.clues.find(
      (clue) => clue.id === 'jiang-clue-uncle-file',
    );
    const stageWorkerClue = jiangMaskCase.clues.find(
      (clue) => clue.id === 'jiang-clue-stage-worker',
    );

    expect(jiangMaskCase.survey?.privateRoom).toMatchObject({
      id: 'he-jingshan-room',
      password: '0420',
    });
    expect(unpublishedPaperClue?.keywords).toContain('未公开论文袋');
    expect(unpublishedPaperClue?.requiresUnlockedRoomIds).toEqual(['he-jingshan-room']);
    expect(publicPaperClue?.keywords).toContain('公开论文');
    expect(maskKeeperClue?.keywords).toContain('祭祀掌面人');
    expect(currentMaskKeeperClue?.keywords).toContain('现任祭祀掌面人');
    expect(uncleFileClue?.keywords).toContain('何景川');
    expect(stageWorkerClue?.keywords).toContain('何景山');

    expect(publicPaperClue?.requiresArchivedClueIds).toEqual(['jiang-clue-unpublished-paper']);
    expect(maskKeeperClue?.requiresArchivedClueIds).toEqual(['jiang-clue-public-paper']);
    expect(currentMaskKeeperClue?.requiresArchivedClueIds).toEqual([
      'jiang-clue-mask-keeper-role',
    ]);
    expect(uncleFileClue?.requiresArchivedClueIds).toEqual([
      'jiang-clue-current-mask-keeper',
    ]);
    expect(stageWorkerClue?.requiresArchivedClueIds).toEqual(['jiang-clue-uncle-file']);
    expect(publicPaperClue?.detail).toContain('不是天灾');
    expect(publicPaperClue?.detail).toContain('真正的掌面人');
  });
});
