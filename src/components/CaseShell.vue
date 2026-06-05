<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { gsap } from 'gsap';
import { chapterById, chapters, evidences } from '../data/case';
import type { SaveState } from '../stores/gameState';
import ChapterObjective from './ChapterObjective.vue';
import ClueBoard from './ClueBoard.vue';
import EvidenceViewer from './EvidenceViewer.vue';

const props = defineProps<{
  state: SaveState;
}>();

const emit = defineEmits<{
  collectEvidence: [evidenceId: string];
  advanceChapter: [chapterId: string];
  solveReplay: [replayQuestionId: string];
  selectChapter: [chapterId: string];
  requestHint: [chapterId: string];
  reset: [];
}>();

const shellRef = ref<HTMLElement | null>(null);
let animationContext: gsap.Context | undefined;

const currentChapter = computed(() => chapterById[props.state.currentChapterId]);
const collectedEvidences = computed(() =>
  props.state.collectedEvidenceIds
    .map((id) => evidences[id])
    .filter(Boolean),
);

function isChapterUnlocked(chapterId: string) {
  return props.state.unlockedChapterIds.includes(chapterId);
}

onMounted(() => {
  if (
    !shellRef.value ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  animationContext = gsap.context(() => {
    gsap.from(shellRef.value, {
      autoAlpha: 0,
      y: 12,
      duration: 0.22,
      ease: 'power2.out',
    });
  }, shellRef.value);
});

onUnmounted(() => {
  animationContext?.revert();
});

watch(
  () => props.state.currentChapterId,
  () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
      '.case-main',
      { autoAlpha: 0.82, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      );
    }, shellRef.value ?? undefined);

    return () => context.revert();
  },
);
</script>

<template>
  <main ref="shellRef" class="case-shell">
    <aside class="case-sidebar" aria-label="章节目录">
      <div class="system-brand">
        <span class="brand-mark">E-09</span>
        <div>
          <p>市局刑侦档案</p>
          <strong>有诡电梯</strong>
        </div>
      </div>

      <nav class="chapter-nav">
        <button
          v-for="chapter in chapters"
          :key="chapter.id"
          type="button"
          class="chapter-tab"
          :class="{
            active: chapter.id === state.currentChapterId,
            locked: !isChapterUnlocked(chapter.id),
          }"
          :disabled="!isChapterUnlocked(chapter.id)"
          @click="emit('selectChapter', chapter.id)"
        >
          <span>{{ chapter.title }}</span>
          <small>{{ isChapterUnlocked(chapter.id) ? '已接入' : '待解锁' }}</small>
        </button>
      </nav>

      <ChapterObjective
        :chapter="currentChapter"
        :state="state"
        @request-hint="emit('requestHint', currentChapter.id)"
      />

      <button class="ghost-action" type="button" @click="emit('reset')">
        清空存档
      </button>
    </aside>

    <section class="case-main" aria-label="案件调查区">
      <EvidenceViewer
        :chapter="currentChapter"
        :state="state"
        @collect-evidence="emit('collectEvidence', $event)"
        @advance-chapter="emit('advanceChapter', $event)"
        @solve-replay="emit('solveReplay', $event)"
      />
    </section>

    <ClueBoard :evidences="collectedEvidences" />
  </main>
</template>
