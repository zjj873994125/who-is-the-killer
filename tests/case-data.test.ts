import { describe, expect, it } from 'vitest';
import {
  archiveSearchEntries,
  chapters,
  evidenceBriefings,
  evidences,
  chapterResolutionStories,
  investigatorProfile,
  prologueCaseFile,
  prologueBeats,
  replayQuestions,
  sceneObservationPoints,
  searchArchive,
  squadMembers,
} from '../src/data/case';

describe('case data', () => {
  it('defines a playable prologue and first chapter with a locked second chapter', () => {
    expect(chapters.map((chapter) => chapter.id)).toEqual([
      'prologue',
      'chapter-1',
      'chapter-2',
    ]);

    expect(chapters[0].nextChapterId).toBe('chapter-1');
    expect(chapters[1].nextChapterId).toBe('chapter-2');
    expect(chapters[2].locked).toBe(true);
  });

  it('keeps chapter required evidence inside each chapter evidence list', () => {
    for (const chapter of chapters) {
      for (const evidenceId of chapter.requiredEvidenceIds) {
        expect(chapter.evidenceIds).toContain(evidenceId);
        expect(evidences[evidenceId]?.chapterId).toBe(chapter.id);
      }
    }
  });

  it('requires the first chapter critical evidence to solve the replay question', () => {
    const replay = replayQuestions['replay-chapter-1'];
    const firstChapter = chapters.find((chapter) => chapter.id === 'chapter-1');

    expect(replay.correctEvidenceIds).toEqual([
      'elevator-run-record',
      'monitor-missing-frame',
      'floor-display-mark',
    ]);
    expect(replay.candidateEvidenceIds).toEqual(firstChapter?.evidenceIds);
    expect(replay.candidateEvidenceIds).toEqual(
      expect.arrayContaining(replay.correctEvidenceIds),
    );
  });

  it('defines a reasoning quiz after the first-chapter evidence selection', () => {
    const replay = replayQuestions['replay-chapter-1'];
    const weakOptionPatterns = [
      '确实有鬼',
      '一定有人',
      '一定是错',
      '可以结案',
      '没有调查价值',
      '只可能',
    ];

    expect(replay.reasoningQuestions).toHaveLength(4);
    expect(replay.reasoningQuestions.map((question) => question.id)).toEqual([
      'time-window',
      'run-mode',
      'monitor-gap',
      'chapter-conclusion',
    ]);

    for (const question of replay.reasoningQuestions) {
      expect(question.options).toHaveLength(4);
      expect(question.options.map((option) => option.id)).toContain(
        question.correctOptionId,
      );
      expect(question.failureHint.length).toBeGreaterThan(10);
      expect(question.successFeedback.length).toBeGreaterThan(10);

      for (const option of question.options) {
        expect(option.label.length).toBeGreaterThan(24);
        for (const pattern of weakOptionPatterns) {
          expect(option.label).not.toContain(pattern);
        }
      }
    }
  });

  it('expands the first chapter to fifteen searchable clues without changing the replay answer', () => {
    const firstChapter = chapters.find((chapter) => chapter.id === 'chapter-1');
    const firstChapterArchiveEntries = archiveSearchEntries.filter(
      (entry) => evidences[entry.evidenceId]?.chapterId === 'chapter-1',
    );

    expect(firstChapter?.evidenceIds).toHaveLength(15);
    expect(firstChapterArchiveEntries).toHaveLength(15);
    expect(replayQuestions['replay-chapter-1'].correctEvidenceIds).toHaveLength(3);
  });

  it('maps scene observation keywords to searchable archive evidence', () => {
    expect(sceneObservationPoints.map((point) => point.id)).toEqual([
      'floor-display',
      'button-panel',
      'door-gap',
      'camera',
      'body-outline',
      'inspection-port',
    ]);

    expect(searchArchive('手动检修').map((entry) => entry.evidenceId)).toEqual([
      'elevator-run-record',
    ]);
    expect(searchArchive('雪花断帧').map((entry) => entry.evidenceId)).toEqual([
      'monitor-missing-frame',
    ]);
    expect(searchArchive('缺亮').map((entry) => entry.evidenceId)).toEqual([
      'floor-display-mark',
    ]);
    expect(searchArchive('机房').map((entry) => entry.evidenceId)).toEqual([
      'access-card-machine-room',
    ]);
    expect(searchArchive('清洁车轮印').map((entry) => entry.evidenceId)).toEqual([
      'cleaning-cart-track',
    ]);
  });

  it('returns at most one archive result per search keyword', () => {
    for (const entry of archiveSearchEntries) {
      for (const keyword of entry.keywords) {
        expect(searchArchive(keyword)).toHaveLength(1);
      }
    }

    expect(searchArchive('9F')).toHaveLength(0);
    expect(searchArchive('门缝')).toHaveLength(1);
  });

  it('keeps archive keywords unique across evidence entries', () => {
    const seenKeywords = new Set<string>();

    for (const entry of archiveSearchEntries) {
      for (const keyword of entry.keywords) {
        const normalizedKeyword = keyword.trim().toLowerCase();

        expect(seenKeywords.has(normalizedKeyword)).toBe(false);
        seenKeywords.add(normalizedKeyword);
      }
    }
  });

  it('keeps archive search entries backed by real evidence', () => {
    for (const entry of archiveSearchEntries) {
      expect(evidences[entry.evidenceId]?.chapterId).toBe('chapter-1');
      expect(entry.keywords.length).toBeGreaterThan(0);
    }
  });

  it('defines a first-person prologue briefing with valid squad references', () => {
    expect(investigatorProfile.role).toContain('随案记录员');
    expect(prologueBeats.length).toBeGreaterThanOrEqual(4);

    for (const beat of prologueBeats) {
      expect(squadMembers[beat.speakerId]).toBeDefined();
      expect(beat.content.length).toBeGreaterThan(20);
      expect(beat.messages.length).toBeGreaterThanOrEqual(3);
      expect(beat.messages.some((message) => message.from === 'squad')).toBe(true);
      expect(beat.messages.some((message) => Boolean(message.time))).toBe(true);

      if (beat.evidenceId) {
        expect(evidences[beat.evidenceId]?.chapterId).toBe('prologue');
      }
    }
  });

  it('lets Baozhan send a readable case background file before investigation', () => {
    const baozhanBeat = prologueBeats.find((beat) => beat.speakerId === 'baozhan');
    const attachment = baozhanBeat?.messages.find(
      (message) => message.attachment,
    )?.attachment;

    expect(attachment?.fileId).toBe(prologueCaseFile.id);
    expect(prologueCaseFile.sections.length).toBeGreaterThanOrEqual(4);
    expect(prologueCaseFile.sections.every((section) => section.body.length > 30))
      .toBe(true);
  });

  it('keeps evidence briefings backed by real squad members and evidence', () => {
    for (const briefing of Object.values(evidenceBriefings)) {
      expect(evidences[briefing.evidenceId]?.chapterId).toBe('chapter-1');
      expect(squadMembers[briefing.speakerId]).toBeDefined();
      expect(briefing.comment.length).toBeGreaterThan(10);
    }
  });

  it('defines the first chapter resolution story with backed evidence references', () => {
    const story = chapterResolutionStories['chapter-1'];
    const storyImageIds = story.images.map((image) => image.id);

    expect(story.title).toContain('第一章');
    expect(story.fullStory.length).toBeGreaterThanOrEqual(5);
    expect(story.fullStory.every((paragraph) => paragraph.length > 40)).toBe(true);
    expect(story.images.length).toBeGreaterThanOrEqual(5);
    expect(story.beats.length).toBeGreaterThanOrEqual(5);

    for (const beat of story.beats) {
      expect(beat.body.length).toBeGreaterThan(30);
      expect(storyImageIds).toContain(beat.imageId);
      for (const evidenceId of beat.evidenceIds) {
        expect(evidences[evidenceId]?.chapterId).toBe('chapter-1');
      }
    }
  });
});
