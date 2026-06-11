<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppWorkspace from './components/AppWorkspace.vue';
import ContentWarning from './components/ContentWarning.vue';
import { provideGameContext } from './context/gameContext';
import {
  advanceChapter,
  clearPersistedState,
  collectEvidence,
  createInitialState,
  discoverKeyword,
  getNextHintLevel,
  loadState,
  persistState,
  setCurrentChapter,
  solveReplay,
  type SaveState,
} from './stores/gameState';

const router = useRouter();
const route = useRoute();
const hasAcceptedWarning = ref(false);
const state = ref<SaveState>(createInitialState());

const showSystem = computed(() => hasAcceptedWarning.value);
const isDemoRoute = computed(() => route.path.startsWith('/demo'));
const shouldShowWarning = computed(() => !showSystem.value && isDemoRoute.value);

function acceptWarning() {
  hasAcceptedWarning.value = true;
  localStorage.setItem('haunted-elevator-warning-accepted', 'true');
  void router.replace('/demo/case');
}

function handleCollectEvidence(evidenceId: string) {
  state.value = collectEvidence(state.value, evidenceId);
}

function handleDiscoverKeyword(keyword: string) {
  state.value = discoverKeyword(state.value, keyword);
}

function handleSolveReplay(replayQuestionId: string) {
  state.value = solveReplay(state.value, replayQuestionId);
}

function handleAdvanceChapter(chapterId: string) {
  state.value = advanceChapter(state.value, chapterId);
}

function handleRequestHint(chapterId: string) {
  state.value = getNextHintLevel(state.value, chapterId);
}

function handleReset() {
  state.value = clearPersistedState();
  hasAcceptedWarning.value = false;
  localStorage.removeItem('haunted-elevator-warning-accepted');
  void router.replace('/demo/case');
}

function syncCurrentChapterFromRoute(path: string) {
  if (path === '/demo/case') {
    state.value = setCurrentChapter(state.value, 'prologue');
  }

  if (
    path === '/demo/survey' ||
    path === '/demo/clues' ||
    path === '/demo/replay' ||
    path === '/demo/story'
  ) {
    state.value = setCurrentChapter(state.value, 'chapter-1');
  }

  if (path === '/demo/locked') {
    state.value = setCurrentChapter(state.value, 'chapter-2');
  }
}

provideGameContext({
  state,
  collectEvidence: handleCollectEvidence,
  discoverKeyword: handleDiscoverKeyword,
  advanceChapter: handleAdvanceChapter,
  solveReplay: handleSolveReplay,
  requestHint: handleRequestHint,
  reset: handleReset,
});

onMounted(() => {
  state.value = loadState();
  hasAcceptedWarning.value =
    localStorage.getItem('haunted-elevator-warning-accepted') === 'true';
  syncCurrentChapterFromRoute(router.currentRoute.value.path);
});

watch(
  state,
  (nextState) => {
    persistState(nextState);
  },
  { deep: true },
);

watch(
  () => router.currentRoute.value.path,
  (path) => {
    syncCurrentChapterFromRoute(path);
  },
);
</script>

<template>
  <ContentWarning v-if="shouldShowWarning" @accept="acceptWarning" />
  <AppWorkspace v-else-if="isDemoRoute" />
  <router-view v-else />
</template>
