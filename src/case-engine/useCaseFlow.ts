import { computed, ref, watch } from 'vue';
import {
  archiveClue,
  completeArea,
  createInitialCaseFlowState,
  isAreaAccessible,
  searchCaseClues,
  searchCaseCluesWithMeta,
  submitReplay,
  unlockRoom,
} from './flow';
import {
  clearCaseFlowState,
  loadCaseFlowState,
  persistCaseFlowState,
} from './save';
import type {
  CaseAreaId,
  CaseFlowState,
  PlayableCaseDefinition,
  ReplaySubmitResult,
} from './types';

export function useCaseFlow(playableCase: PlayableCaseDefinition) {
  const state = ref<CaseFlowState>(loadCaseFlowState(playableCase));

  const archivedClues = computed(() =>
    state.value.archivedClueIds
      .map((clueId) => playableCase.clues.find((clue) => clue.id === clueId))
      .filter((clue) => Boolean(clue)),
  );

  const isSearchComplete = computed(() =>
    playableCase.replay.requiredClueIds.every((clueId) =>
      state.value.archivedClueIds.includes(clueId),
    ),
  );

  function setActiveArea(areaId: CaseAreaId) {
    state.value = {
      ...state.value,
      activeAreaId: areaId,
    };
  }

  function markAreaComplete(areaId: CaseAreaId) {
    state.value = completeArea(state.value, areaId);
  }

  function markClueArchived(clueId: string) {
    state.value = archiveClue(state.value, clueId);
  }

  function markHotspotInspected(hotspotId: string) {
    state.value = {
      ...state.value,
      inspectedHotspotIds: state.value.inspectedHotspotIds.includes(hotspotId)
        ? state.value.inspectedHotspotIds
        : [...state.value.inspectedHotspotIds, hotspotId],
    };
  }

  function markRoomUnlocked(roomId: string) {
    state.value = unlockRoom(state.value, roomId);
  }

  function markHintUsed() {
    state.value = {
      ...state.value,
      hintCount: Math.min(3, state.value.hintCount + 1),
    };
  }

  function setSelectedClues(clueIds: string[]) {
    state.value = {
      ...state.value,
      selectedClueIds: clueIds,
    };
  }

  function setSelectedAnswer(questionId: string, optionId: string) {
    state.value = {
      ...state.value,
      selectedAnswers: {
        ...state.value.selectedAnswers,
        [questionId]: optionId,
      },
    };
  }

  function runSearch(keyword: string) {
    return searchCaseClues(playableCase, keyword, state.value);
  }

  function runSearchWithMeta(keyword: string) {
    return searchCaseCluesWithMeta(playableCase, keyword, state.value);
  }

  function runReplaySubmit(): ReplaySubmitResult {
    const result = submitReplay(playableCase, state.value, {
      selectedClueIds: state.value.selectedClueIds,
      selectedAnswers: state.value.selectedAnswers,
    });

    if (result.solved) {
      state.value = completeArea(
        {
          ...state.value,
          replaySolved: true,
        },
        'replay',
      );
    }

    return result;
  }

  function reset() {
    state.value = clearCaseFlowState(playableCase);
  }

  watch(
    state,
    (nextState) => {
      persistCaseFlowState(playableCase, nextState);
    },
    { deep: true },
  );

  return {
    state,
    archivedClues,
    isSearchComplete,
    isAreaAccessible: (areaId: CaseAreaId) => isAreaAccessible(playableCase, state.value, areaId),
    setActiveArea,
    markAreaComplete,
    markClueArchived,
    markHotspotInspected,
    markRoomUnlocked,
    markHintUsed,
    setSelectedClues,
    setSelectedAnswer,
    runSearch,
    runSearchWithMeta,
    runReplaySubmit,
    reset,
    createInitialState: () => createInitialCaseFlowState(playableCase),
  };
}
