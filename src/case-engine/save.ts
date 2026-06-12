import type { CaseFlowState, PlayableCaseDefinition } from './types';
import { createInitialCaseFlowState } from './flow';

export function getCaseSaveKey(playableCase: PlayableCaseDefinition) {
  return `case-engine-save:${playableCase.id}`;
}

export function parseCaseFlowState(
  playableCase: PlayableCaseDefinition,
  raw: string | null,
): CaseFlowState {
  const fallback = createInitialCaseFlowState(playableCase);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CaseFlowState>;

    return {
      version: 1,
      completedAreaIds: Array.isArray(parsed.completedAreaIds)
        ? parsed.completedAreaIds.filter((areaId) =>
            playableCase.areas.some((area) => area.id === areaId),
          )
        : fallback.completedAreaIds,
      archivedClueIds: Array.isArray(parsed.archivedClueIds)
        ? parsed.archivedClueIds.filter((clueId) =>
            playableCase.clues.some((clue) => clue.id === clueId),
          )
        : fallback.archivedClueIds,
      selectedClueIds: Array.isArray(parsed.selectedClueIds)
        ? parsed.selectedClueIds.filter((clueId) =>
            playableCase.clues.some((clue) => clue.id === clueId),
          )
        : fallback.selectedClueIds,
      selectedAnswers:
        parsed.selectedAnswers && typeof parsed.selectedAnswers === 'object'
          ? parsed.selectedAnswers
          : fallback.selectedAnswers,
      replaySolved: parsed.replaySolved ?? fallback.replaySolved,
      activeAreaId:
        parsed.activeAreaId && playableCase.areas.some((area) => area.id === parsed.activeAreaId)
          ? parsed.activeAreaId
          : fallback.activeAreaId,
      activeClueId:
        parsed.activeClueId && playableCase.clues.some((clue) => clue.id === parsed.activeClueId)
          ? parsed.activeClueId
          : fallback.activeClueId,
      inspectedHotspotIds: Array.isArray(parsed.inspectedHotspotIds)
        ? parsed.inspectedHotspotIds
        : fallback.inspectedHotspotIds,
      unlockedRoomIds: Array.isArray(parsed.unlockedRoomIds)
        ? parsed.unlockedRoomIds
        : fallback.unlockedRoomIds,
      hintCount:
        typeof parsed.hintCount === 'number'
          ? Math.max(0, Math.min(3, parsed.hintCount))
          : fallback.hintCount,
    };
  } catch {
    return fallback;
  }
}

export function loadCaseFlowState(playableCase: PlayableCaseDefinition): CaseFlowState {
  if (typeof localStorage === 'undefined') {
    return createInitialCaseFlowState(playableCase);
  }

  return parseCaseFlowState(playableCase, localStorage.getItem(getCaseSaveKey(playableCase)));
}

export function persistCaseFlowState(
  playableCase: PlayableCaseDefinition,
  state: CaseFlowState,
) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(getCaseSaveKey(playableCase), JSON.stringify(state));
}

export function clearCaseFlowState(playableCase: PlayableCaseDefinition): CaseFlowState {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(getCaseSaveKey(playableCase));
  }

  return createInitialCaseFlowState(playableCase);
}
