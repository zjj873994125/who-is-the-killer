import { inject, provide, type Ref } from 'vue';
import type { SaveState } from '../stores/gameState';

export interface GameContext {
  state: Ref<SaveState>;
  collectEvidence: (evidenceId: string) => void;
  discoverKeyword: (keyword: string) => void;
  advanceChapter: (chapterId: string) => void;
  solveReplay: (replayQuestionId: string) => void;
  requestHint: (chapterId: string) => void;
  reset: () => void;
}

const GAME_CONTEXT_KEY = Symbol('game-context');

export function provideGameContext(context: GameContext): void {
  provide(GAME_CONTEXT_KEY, context);
}

export function useGameContext(): GameContext {
  const context = inject<GameContext>(GAME_CONTEXT_KEY);

  if (!context) {
    throw new Error('Game context is not provided.');
  }

  return context;
}
