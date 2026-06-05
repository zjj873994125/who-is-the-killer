<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { chapterById, evidences, replayQuestions } from '../data/case';
import type { Chapter, Evidence } from '../data/case';
import type { SaveState } from '../stores/gameState';
import GuidedElevatorReplay from './GuidedElevatorReplay.vue';

const props = defineProps<{
  chapter: Chapter;
  state: SaveState;
}>();

const emit = defineEmits<{
  collectEvidence: [evidenceId: string];
  advanceChapter: [chapterId: string];
  solveReplay: [replayQuestionId: string];
}>();

const selectedEvidenceId = ref<string | null>(null);

const chapterEvidences = computed(() =>
  props.chapter.evidenceIds.map((id) => evidences[id]).filter(Boolean),
);

const selectedEvidence = computed(() =>
  selectedEvidenceId.value ? evidences[selectedEvidenceId.value] : null,
);

const replayQuestion = computed(() =>
  props.chapter.replayQuestionId
    ? replayQuestions[props.chapter.replayQuestionId]
    : null,
);

const canOpenNext = computed(() =>
  props.chapter.requiredEvidenceIds.every((id) =>
    props.state.collectedEvidenceIds.includes(id),
  ),
);

function isCollected(evidenceId: string) {
  return props.state.collectedEvidenceIds.includes(evidenceId);
}

function selectEvidence(evidence: Evidence) {
  selectedEvidenceId.value = evidence.id;
  emit('collectEvidence', evidence.id);
}

function continueFromPrologue() {
  emit('advanceChapter', props.chapter.id);
}

watch(
  () => props.chapter.id,
  () => {
    selectedEvidenceId.value = null;
  },
);
</script>

<template>
  <article class="evidence-viewer">
    <header class="case-header">
      <p class="eyebrow">CASE FILE / {{ chapter.id }}</p>
      <h1>{{ chapter.title }}</h1>
      <p>{{ chapter.summary }}</p>
    </header>

    <section v-if="chapter.locked" class="locked-chapter">
      <p class="eyebrow">档案待解锁</p>
      <h2>{{ chapter.title }}</h2>
      <p>
        第一章复盘完成。第二章将接入“见鬼十法”相关授权梗概和传闻对照玩法。
      </p>
    </section>

    <template v-else>
      <section class="evidence-layout">
        <div class="scene-panel">
          <div class="monitor-frame" aria-label="监控画面示意">
            <div class="monitor-noise"></div>
            <div class="elevator-door">
              <span class="floor-number">09</span>
              <span class="door-line"></span>
            </div>
            <p>{{ chapter.id === 'prologue' ? '00:11:48 / 货梯上行' : '00:12:00 / 轿厢现场' }}</p>
          </div>

          <div class="evidence-grid" aria-label="可调查证据">
            <button
              v-for="evidence in chapterEvidences"
              :key="evidence.id"
              type="button"
              class="evidence-hotspot"
              :aria-label="`查看现场证据：${evidence.title}`"
              :class="{
                collected: isCollected(evidence.id),
                critical: evidence.isCritical,
              }"
              @click="selectEvidence(evidence)"
            >
              <span>{{ evidence.title }}</span>
              <small>{{ isCollected(evidence.id) ? '已查看' : '点击查看' }}</small>
            </button>
          </div>
        </div>

        <aside class="detail-panel" aria-live="polite">
          <p class="eyebrow">证据详情</p>
          <template v-if="selectedEvidence">
            <h2>{{ selectedEvidence.title }}</h2>
            <p class="evidence-content">{{ selectedEvidence.content }}</p>
            <p class="evidence-detail">{{ selectedEvidence.detail }}</p>
          </template>
          <template v-else>
            <h2>请选择左侧高亮证据</h2>
            <p class="evidence-detail">
              所有可调查内容已明确标注。你不需要找隐藏像素，只需要判断证据之间的矛盾。
            </p>
          </template>
        </aside>
      </section>

      <button
        v-if="chapter.id === 'prologue'"
        class="fixed-primary"
        type="button"
        :disabled="!canOpenNext"
        @click="continueFromPrologue"
      >
        {{ canOpenNext ? `进入${chapterById[chapter.nextChapterId ?? 'chapter-1'].title}` : '查看必要档案后继续' }}
      </button>

      <GuidedElevatorReplay
        v-if="replayQuestion"
        :question="replayQuestion"
        :state="state"
        @solve-replay="emit('solveReplay', $event)"
      />
    </template>
  </article>
</template>
