import { chapterById, replayQuestions } from '../data/case';

export interface SaveState {
  currentChapterId: string;
  unlockedChapterIds: string[];
  collectedEvidenceIds: string[];
  discoveredKeywords: string[];
  solvedReplayQuestionIds: string[];
  hintLevelsByChapter: Record<string, number>;
}

const STORAGE_KEY = 'haunted-elevator-save-v1';

export function createInitialState(): SaveState {
  return {
    currentChapterId: 'prologue',
    unlockedChapterIds: ['prologue'],
    collectedEvidenceIds: [],
    discoveredKeywords: [],
    solvedReplayQuestionIds: [],
    hintLevelsByChapter: {},
  };
}

export function collectEvidence(state: SaveState, evidenceId: string): SaveState {
  if (state.collectedEvidenceIds.includes(evidenceId)) {
    return state;
  }

  return {
    ...state,
    collectedEvidenceIds: [...state.collectedEvidenceIds, evidenceId],
  };
}

export function discoverKeyword(state: SaveState, keyword: string): SaveState {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword || state.discoveredKeywords.includes(normalizedKeyword)) {
    return state;
  }

  return {
    ...state,
    discoveredKeywords: [...state.discoveredKeywords, normalizedKeyword],
  };
}

export function canSolveReplay(state: SaveState, replayQuestionId: string): boolean {
  const replay = replayQuestions[replayQuestionId];

  if (!replay) {
    return false;
  }

  const chapter = chapterById[replay.chapterId];

  if (!chapter) {
    return false;
  }

  return chapter.requiredEvidenceIds.every((evidenceId) =>
    state.collectedEvidenceIds.includes(evidenceId),
  );
}

export function canAdvanceChapter(state: SaveState, chapterId: string): boolean {
  const chapter = chapterById[chapterId];

  if (!chapter) {
    return false;
  }

  return chapter.requiredEvidenceIds.every((evidenceId) =>
    state.collectedEvidenceIds.includes(evidenceId),
  );
}

export function advanceChapter(state: SaveState, chapterId: string): SaveState {
  const chapter = chapterById[chapterId];

  if (!chapter?.nextChapterId || !canAdvanceChapter(state, chapterId)) {
    return state;
  }

  const unlockedChapterIds = state.unlockedChapterIds.includes(
    chapter.nextChapterId,
  )
    ? state.unlockedChapterIds
    : [...state.unlockedChapterIds, chapter.nextChapterId];

  return {
    ...state,
    currentChapterId: chapter.nextChapterId,
    unlockedChapterIds,
  };
}

export function solveReplay(
  state: SaveState,
  replayQuestionId: string,
): SaveState {
  if (!canSolveReplay(state, replayQuestionId)) {
    return state;
  }

  const replay = replayQuestions[replayQuestionId];
  const chapter = chapterById[replay.chapterId];
  const nextChapterId = chapter?.nextChapterId;
  const solvedReplayQuestionIds = state.solvedReplayQuestionIds.includes(
    replayQuestionId,
  )
    ? state.solvedReplayQuestionIds
    : [...state.solvedReplayQuestionIds, replayQuestionId];
  const unlockedChapterIds =
    nextChapterId && !state.unlockedChapterIds.includes(nextChapterId)
      ? [...state.unlockedChapterIds, nextChapterId]
      : state.unlockedChapterIds;

  return {
    ...state,
    unlockedChapterIds,
    solvedReplayQuestionIds,
  };
}

export function getNextHintLevel(
  state: SaveState,
  chapterId: string,
): SaveState {
  const currentLevel = state.hintLevelsByChapter[chapterId] ?? 0;
  const nextLevel = Math.min(currentLevel + 1, 3);

  return {
    ...state,
    hintLevelsByChapter: {
      ...state.hintLevelsByChapter,
      [chapterId]: nextLevel,
    },
  };
}

export function setCurrentChapter(
  state: SaveState,
  chapterId: string,
): SaveState {
  if (!state.unlockedChapterIds.includes(chapterId)) {
    return state;
  }

  return {
    ...state,
    currentChapterId: chapterId,
  };
}

export function serializeState(state: SaveState): string {
  return JSON.stringify(state);
}

export function parseState(raw: string | null): SaveState {
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    const fallback = createInitialState();

    return {
      currentChapterId: parsed.currentChapterId ?? fallback.currentChapterId,
      unlockedChapterIds:
        parsed.unlockedChapterIds ?? fallback.unlockedChapterIds,
      collectedEvidenceIds:
        parsed.collectedEvidenceIds ?? fallback.collectedEvidenceIds,
      discoveredKeywords:
        parsed.discoveredKeywords ?? fallback.discoveredKeywords,
      solvedReplayQuestionIds:
        parsed.solvedReplayQuestionIds ?? fallback.solvedReplayQuestionIds,
      hintLevelsByChapter:
        parsed.hintLevelsByChapter ?? fallback.hintLevelsByChapter,
    };
  } catch {
    return createInitialState();
  }
}

export function loadState(): SaveState {
  if (typeof localStorage === 'undefined') {
    return createInitialState();
  }

  return parseState(localStorage.getItem(STORAGE_KEY));
}

export function persistState(state: SaveState): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, serializeState(state));
}

export function clearPersistedState(): SaveState {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }

  return createInitialState();
}
