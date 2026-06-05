import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  collectEvidence,
  advanceChapter,
  canSolveReplay,
  solveReplay,
  getNextHintLevel,
  discoverKeyword,
  serializeState,
  parseState,
} from '../src/stores/gameState';
import { chapterById, replayQuestions } from '../src/data/case';

describe('game state', () => {
  it('starts from prologue with only prologue unlocked', () => {
    const state = createInitialState();

    expect(state.currentChapterId).toBe('prologue');
    expect(state.unlockedChapterIds).toEqual(['prologue']);
    expect(state.collectedEvidenceIds).toEqual([]);
  });

  it('collects evidence once and keeps insertion order', () => {
    const state = createInitialState();
    const first = collectEvidence(state, 'building-brief');
    const second = collectEvidence(first, 'building-brief');
    const third = collectEvidence(second, 'opening-monitor');

    expect(third.collectedEvidenceIds).toEqual([
      'building-brief',
      'opening-monitor',
    ]);
  });

  it('discovers observation keywords without collecting evidence', () => {
    let state = createInitialState();
    state = discoverKeyword(state, '手动检修');
    state = discoverKeyword(state, '手动检修');
    state = discoverKeyword(state, '00:11');

    expect(state.discoveredKeywords).toEqual(['手动检修', '00:11']);
    expect(state.collectedEvidenceIds).toEqual([]);
  });

  it('blocks replay until all required evidence is collected', () => {
    const state = createInitialState();
    const question = replayQuestions['replay-chapter-1'];
    const partial = question.correctEvidenceIds.reduce(
      (currentState, evidenceId) => collectEvidence(currentState, evidenceId),
      state,
    );

    expect(canSolveReplay(partial, 'replay-chapter-1')).toBe(false);
  });

  it('requires every first-chapter clue before replay can be solved', () => {
    const requiredEvidenceIds = chapterById['chapter-1'].requiredEvidenceIds;
    const almostComplete = requiredEvidenceIds
      .slice(0, -1)
      .reduce(
        (currentState, evidenceId) => collectEvidence(currentState, evidenceId),
        createInitialState(),
      );
    const complete = collectEvidence(
      almostComplete,
      requiredEvidenceIds[requiredEvidenceIds.length - 1],
    );

    expect(requiredEvidenceIds).toHaveLength(15);
    expect(canSolveReplay(almostComplete, 'replay-chapter-1')).toBe(false);
    expect(canSolveReplay(complete, 'replay-chapter-1')).toBe(true);
  });

  it('advances a chapter without replay after required evidence is present', () => {
    let state = createInitialState();
    state = collectEvidence(state, 'building-brief');
    state = collectEvidence(state, 'opening-monitor');

    const advanced = advanceChapter(state, 'prologue');

    expect(advanced.unlockedChapterIds).toContain('chapter-1');
    expect(advanced.currentChapterId).toBe('chapter-1');
  });

  it('solves replay and unlocks the second chapter without navigating away', () => {
    let state = chapterById['chapter-1'].requiredEvidenceIds.reduce(
      (currentState, evidenceId) => collectEvidence(currentState, evidenceId),
      createInitialState(),
    );

    const solved = solveReplay(state, 'replay-chapter-1');

    expect(solved.solvedReplayQuestionIds).toContain('replay-chapter-1');
    expect(solved.unlockedChapterIds).toContain('chapter-2');
    expect(solved.currentChapterId).toBe('prologue');
  });

  it('advances hint levels up to the third hint', () => {
    let state = createInitialState();
    state = getNextHintLevel(state, 'chapter-1');
    state = getNextHintLevel(state, 'chapter-1');
    state = getNextHintLevel(state, 'chapter-1');
    state = getNextHintLevel(state, 'chapter-1');

    expect(state.hintLevelsByChapter['chapter-1']).toBe(3);
  });

  it('round trips save state safely', () => {
    const state = discoverKeyword(
      collectEvidence(createInitialState(), 'building-brief'),
      '雪花',
    );
    const restored = parseState(serializeState(state));

    expect(restored).toEqual(state);
  });
});
