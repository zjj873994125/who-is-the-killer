<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from 'vue';
import { gsap } from 'gsap';
import { evidences } from '../data/case';
import type { ReplayQuestion } from '../data/case';
import type { SaveState } from '../stores/gameState';

const props = defineProps<{
  question: ReplayQuestion;
  state: SaveState;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  solveReplay: [replayQuestionId: string];
}>();

const selectedEvidenceIds = ref<string[]>([]);
const resultMessage = ref('');
const replayRef = ref<HTMLElement | null>(null);
const carRef = ref<HTMLElement | null>(null);
let replayTimeline: gsap.core.Timeline | undefined;

const candidates = computed(() =>
  props.question.candidateEvidenceIds.map((id) => evidences[id]).filter(Boolean),
);

const hasSolved = computed(() =>
  props.state.solvedReplayQuestionIds.includes(props.question.id),
);

function hasCollectedEvidence(evidenceId: string) {
  return props.state.collectedEvidenceIds.includes(evidenceId);
}

function toggleEvidence(evidenceId: string) {
  if (props.disabled) {
    resultMessage.value = '线索尚未收齐。请先回到线索区完成第一章全部归档。';
    return;
  }

  if (!hasCollectedEvidence(evidenceId)) {
    resultMessage.value = '这个证据位还没有解锁。先去勘查区观察，再到线索区检索归档。';
    return;
  }

  if (selectedEvidenceIds.value.includes(evidenceId)) {
    selectedEvidenceIds.value = selectedEvidenceIds.value.filter(
      (id) => id !== evidenceId,
    );
    return;
  }

  if (selectedEvidenceIds.value.length >= 3) {
    resultMessage.value = '本次复盘只需要选择 3 条证据。';
    return;
  }

  selectedEvidenceIds.value = [...selectedEvidenceIds.value, evidenceId];
}

async function playReplayAnimation() {
  await nextTick();

  if (
    !replayRef.value ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  replayTimeline?.kill();
  replayTimeline = gsap.timeline({
    defaults: { duration: 0.24, ease: 'power2.out' },
  });
  const scopedSelector = gsap.utils.selector(replayRef.value);

  replayTimeline
    .fromTo(
      replayRef.value,
      { autoAlpha: 0.8 },
      { autoAlpha: 1, duration: 0.16, ease: 'power1.out' },
    )
    .to(carRef.value, {
      y: -112,
      duration: 0.44,
      ease: 'power2.inOut',
    })
    .to(scopedSelector('.replay-floor-alert'), {
      autoAlpha: 1,
      scale: 1.04,
      duration: 0.18,
      ease: 'power2.out',
    })
    .to(carRef.value, {
      y: -74,
      duration: 0.24,
      ease: 'power2.out',
    });
}

async function verifyReplay() {
  if (props.disabled) {
    resultMessage.value = '线索尚未收齐。请先回到线索区完成第一章全部归档。';
    return;
  }

  const expected = [...props.question.correctEvidenceIds].sort();
  const selected = [...selectedEvidenceIds.value].sort();
  const isCorrect =
    selected.length === expected.length &&
    selected.every((id, index) => id === expected[index]);

  if (!isCorrect) {
    resultMessage.value = props.question.failureHint;
    return;
  }

  resultMessage.value = props.question.successSummary;
  emit('solveReplay', props.question.id);
  await playReplayAnimation();
}

onUnmounted(() => {
  replayTimeline?.kill();
});
</script>

<template>
  <section ref="replayRef" class="replay-panel" aria-labelledby="replay-title">
    <div>
      <p class="eyebrow">引导式电梯复盘</p>
      <h2 id="replay-title">{{ question.prompt }}</h2>
      <p>
        从已查看证据中选择 3 条。操作没有惩罚，系统只验证证据组合是否能解释矛盾。
      </p>
    </div>

    <div class="replay-content">
      <div class="elevator-shaft" aria-label="电梯复盘动画">
        <span class="shaft-floor replay-floor-alert">9F 显示异常</span>
        <span class="shaft-floor">5F</span>
        <span class="shaft-floor">B1 检修模式</span>
        <div ref="carRef" class="elevator-car">
          <span>CAR</span>
        </div>
      </div>

      <div v-if="disabled" class="replay-locked-panel">
        <strong>复盘选择暂未开放</strong>
        <p>需要先检索并归档第一章全部 15 条线索，系统才会开放证据组合验证。</p>
      </div>

      <div v-else class="candidate-list">
        <button
          v-for="evidence in candidates"
          :key="evidence.id"
          type="button"
          class="candidate-button"
          :aria-label="
            hasCollectedEvidence(evidence.id)
              ? `复盘候选证据：${evidence.title}`
              : '复盘候选证据：未解锁'
          "
          :class="{
            selected: selectedEvidenceIds.includes(evidence.id),
            disabled: !hasCollectedEvidence(evidence.id),
          }"
          @click="toggleEvidence(evidence.id)"
        >
          <span>
            {{
              hasCollectedEvidence(evidence.id)
                ? evidence.title
                : '证据位未解锁'
            }}
          </span>
          <small>
            {{
              hasCollectedEvidence(evidence.id)
                ? selectedEvidenceIds.includes(evidence.id)
                  ? '已选择'
                  : '可选择'
                : '去线索区检索归档后显示'
            }}
          </small>
        </button>
      </div>
    </div>

    <div class="replay-actions">
      <button class="primary-action" type="button" @click="verifyReplay">
        {{ disabled ? '线索未收齐' : hasSolved ? '重新播放复盘' : '验证复盘' }}
      </button>
      <p v-if="resultMessage" class="result-message">{{ resultMessage }}</p>
      <p v-else-if="hasSolved" class="result-message">
        复盘已完成。第二章入口已解锁，可从左侧章节目录进入。
      </p>
    </div>
  </section>
</template>
