import type {
  CaseAreaId,
  CaseClue,
  CaseClueStage,
  CaseFlowState,
  PlayableCaseDefinition,
  ReplaySubmitResult,
} from './types';

export interface CaseClueSearchResult {
  clues: CaseClue[];
  locked: boolean;
}

export function getUnlockedClueStages(state: CaseFlowState): CaseClueStage[] {
  const archivedCount = state.archivedClueIds.length;

  if (archivedCount >= 10) {
    return ['early', 'middle', 'late'];
  }

  if (archivedCount >= 5) {
    return ['early', 'middle'];
  }

  return ['early'];
}

export function createInitialCaseFlowState(
  playableCase: PlayableCaseDefinition,
): CaseFlowState {
  return {
    version: 1,
    completedAreaIds: [],
    archivedClueIds: [],
    selectedClueIds: [],
    selectedAnswers: {},
    replaySolved: false,
    activeAreaId: playableCase.startAreaId,
    activeClueId: null,
    inspectedHotspotIds: [],
    unlockedRoomIds: [],
    hintCount: 0,
  };
}

export function completeArea(state: CaseFlowState, areaId: CaseAreaId): CaseFlowState {
  return {
    ...state,
    completedAreaIds: state.completedAreaIds.includes(areaId)
      ? state.completedAreaIds
      : [...state.completedAreaIds, areaId],
  };
}

export function archiveClue(state: CaseFlowState, clueId: string): CaseFlowState {
  return {
    ...state,
    archivedClueIds: state.archivedClueIds.includes(clueId)
      ? state.archivedClueIds
      : [...state.archivedClueIds, clueId],
    activeClueId: clueId,
  };
}

export function unlockRoom(state: CaseFlowState, roomId: string): CaseFlowState {
  return {
    ...state,
    unlockedRoomIds: state.unlockedRoomIds.includes(roomId)
      ? state.unlockedRoomIds
      : [...state.unlockedRoomIds, roomId],
  };
}

export function getUnlockedAreaId(
  playableCase: PlayableCaseDefinition,
  state: CaseFlowState,
): CaseAreaId {
  let unlockedAreaId = playableCase.startAreaId;

  for (const area of playableCase.areas) {
    if (area.isDisabled) {
      break;
    }

    if (!area.requiresCompletedAreaId) {
      unlockedAreaId = area.id;
      continue;
    }

    if (state.completedAreaIds.includes(area.requiresCompletedAreaId)) {
      unlockedAreaId = area.id;
      continue;
    }

    break;
  }

  return unlockedAreaId;
}

export function isAreaAccessible(
  playableCase: PlayableCaseDefinition,
  state: CaseFlowState,
  areaId: CaseAreaId,
) {
  const area = playableCase.areas.find((item) => item.id === areaId);

  if (!area) {
    return false;
  }

  if (area.isDisabled) {
    return false;
  }

  if (!area.requiresCompletedAreaId) {
    return true;
  }

  return state.completedAreaIds.includes(area.requiresCompletedAreaId);
}

export function searchCaseClues(
  playableCase: PlayableCaseDefinition,
  rawKeyword: string,
  state?: CaseFlowState,
): CaseClue[] {
  return searchCaseCluesWithMeta(playableCase, rawKeyword, state).clues;
}

function doesKeywordMatch(inputKeyword: string, clueKeyword: string) {
  const normalizedClueKeyword = clueKeyword.trim().toLowerCase();

  return (
    normalizedClueKeyword === inputKeyword ||
    normalizedClueKeyword.includes(inputKeyword) ||
    inputKeyword.includes(normalizedClueKeyword)
  );
}

export function searchCaseCluesWithMeta(
  playableCase: PlayableCaseDefinition,
  rawKeyword: string,
  state?: CaseFlowState,
): CaseClueSearchResult {
  const keyword = rawKeyword.trim().toLowerCase();

  if (!keyword) {
    return {
      clues: [],
      locked: false,
    };
  }

  const unlockedStages = state ? getUnlockedClueStages(state) : ['early', 'middle', 'late'];
  const matchedClues = playableCase.clues.filter((clue) =>
    clue.keywords.some((item) => doesKeywordMatch(keyword, item)),
  );

  const clues = matchedClues.filter((clue) => {
    const stage = clue.stage ?? 'early';
    const stageUnlocked = unlockedStages.includes(stage);
    const prerequisitesUnlocked =
      !state ||
      !clue.requiresArchivedClueIds?.length ||
      clue.requiresArchivedClueIds.every((clueId) => state.archivedClueIds.includes(clueId));
    const roomsUnlocked =
      !state ||
      !clue.requiresUnlockedRoomIds?.length ||
      clue.requiresUnlockedRoomIds.every((roomId) => state.unlockedRoomIds.includes(roomId));

    return stageUnlocked && prerequisitesUnlocked && roomsUnlocked;
  });

  return {
    clues,
    locked: clues.length === 0 && matchedClues.length > 0,
  };
}

export function submitReplay(
  playableCase: PlayableCaseDefinition,
  state: CaseFlowState,
  submission: {
    selectedClueIds: string[];
    selectedAnswers: Record<string, string>;
  },
): ReplaySubmitResult {
  const selectedClueSet = new Set(submission.selectedClueIds);
  const correctClueSet = new Set(playableCase.replay.correctClueIds);

  if (
    playableCase.replay.requiredClueIds.some(
      (clueId) => !state.archivedClueIds.includes(clueId) && !selectedClueSet.has(clueId),
    )
  ) {
    return {
      solved: false,
      reason: 'missing-required-clues',
    };
  }

  if (
    selectedClueSet.size !== correctClueSet.size ||
    [...selectedClueSet].some((clueId) => !correctClueSet.has(clueId))
  ) {
    return {
      solved: false,
      reason: 'wrong-clues',
    };
  }

  for (const question of playableCase.replay.questions) {
    const answer = submission.selectedAnswers[question.id];

    if (!answer) {
      return {
        solved: false,
        reason: 'missing-answer',
      };
    }

    if (answer !== question.correctOptionId) {
      return {
        solved: false,
        reason: 'wrong-answer',
      };
    }
  }

  return {
    solved: true,
    reason: 'correct',
  };
}
