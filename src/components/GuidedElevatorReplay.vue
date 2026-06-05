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
const hasPassedEvidenceSelection = ref(false);
const activeReasoningIndex = ref(0);
const selectedOptionIds = ref<Record<string, string>>({});
const replayRef = ref<HTMLElement | null>(null);
const carRef = ref<HTMLElement | null>(null);
let replayTimeline: gsap.core.Timeline | undefined;

const candidates = computed(() =>
  props.question.candidateEvidenceIds.map((id) => evidences[id]).filter(Boolean),
);

const hasSolved = computed(() =>
  props.state.solvedReplayQuestionIds.includes(props.question.id),
);

const activeReasoningQuestion = computed(
  () => props.question.reasoningQuestions[activeReasoningIndex.value],
);

const isLastReasoningQuestion = computed(
  () => activeReasoningIndex.value === props.question.reasoningQuestions.length - 1,
);

const reasoningProgressText = computed(
  () =>
    `${Math.min(activeReasoningIndex.value + 1, props.question.reasoningQuestions.length)}/${props.question.reasoningQuestions.length}`,
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

  hasPassedEvidenceSelection.value = true;
  resultMessage.value = '核心证据成立。请完成全部复盘题，提交前系统不会判断对错。';
}

function goToPreviousReasoningQuestion() {
  resultMessage.value = '';
  activeReasoningIndex.value = Math.max(activeReasoningIndex.value - 1, 0);
}

async function submitReasoningAnswer() {
  if (!hasPassedEvidenceSelection.value) {
    return;
  }

  if (!activeReasoningQuestion.value) {
    return;
  }

  if (!selectedOptionIds.value[activeReasoningQuestion.value.id]) {
    resultMessage.value = '先选择一个判断，再继续。';
    return;
  }

  if (!isLastReasoningQuestion.value) {
    resultMessage.value = '';
    activeReasoningIndex.value += 1;
    return;
  }

  const unansweredQuestion = props.question.reasoningQuestions.find(
    (question) => !selectedOptionIds.value[question.id],
  );

  if (unansweredQuestion) {
    resultMessage.value = '还有复盘题没有作答。请完成全部判断后再统一提交。';
    return;
  }

  const wrongQuestion = props.question.reasoningQuestions.find(
    (question) =>
      selectedOptionIds.value[question.id] !== question.correctOptionId,
  );

  if (wrongQuestion) {
    resultMessage.value =
      '复盘链条还不成立。请重新检查时间窗口、运行模式、监控断帧和阶段结论之间是否互相支撑。';
    return;
  }

  resultMessage.value = props.question.successSummary;
  emit('solveReplay', props.question.id);
  await playReplayAnimation();
}

function resetEvidenceSelection() {
  hasPassedEvidenceSelection.value = false;
  activeReasoningIndex.value = 0;
  selectedOptionIds.value = {};
  resultMessage.value = '';
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
        先从 15 条归档线索里筛出 3 条核心证据，再完成推理题。操作没有惩罚，错误只会给出方向提示。
      </p>
    </div>

    <el-steps
      class="replay-phase-steps"
      :active="hasSolved ? 3 : hasPassedEvidenceSelection ? 2 : disabled ? 0 : 1"
      finish-status="success"
      simple
    >
      <el-step title="收齐 15 条" />
      <el-step title="15 选 3" />
      <el-step title="复盘做题" />
    </el-steps>

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

      <section v-else-if="!hasPassedEvidenceSelection" class="evidence-selection-panel">
        <div class="candidate-list">
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
      </section>

      <section v-else class="reasoning-panel">
        <article v-if="activeReasoningQuestion" class="reasoning-question-card">
          <div class="reasoning-header">
            <div>
              <p class="eyebrow">
                {{ String(activeReasoningIndex + 1).padStart(2, '0') }} / {{ activeReasoningQuestion.title }}
              </p>
              <h3>{{ activeReasoningQuestion.prompt }}</h3>
            </div>
            <el-tag effect="plain">{{ reasoningProgressText }}</el-tag>
          </div>

          <el-radio-group
            v-model="selectedOptionIds[activeReasoningQuestion.id]"
            class="reasoning-options"
          >
            <el-radio
              v-for="option in activeReasoningQuestion.options"
              :key="option.id"
              :value="option.id"
              border
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </article>
      </section>
    </div>

    <div class="replay-actions">
      <button
        v-if="!hasPassedEvidenceSelection || disabled"
        class="primary-action"
        type="button"
        @click="verifyReplay"
      >
        {{ disabled ? '线索未收齐' : hasSolved ? '重新筛选证据' : '验证核心证据' }}
      </button>
      <button
        v-else
        class="primary-action"
        type="button"
        @click="submitReasoningAnswer"
      >
        {{
          hasSolved
            ? '重新播放复盘'
            : isLastReasoningQuestion
              ? '提交全部复盘题'
              : '下一题'
        }}
      </button>
      <button
        v-if="hasPassedEvidenceSelection && !hasSolved && activeReasoningIndex > 0"
        class="replay-back-button"
        type="button"
        @click="goToPreviousReasoningQuestion"
      >
        上一题
      </button>
      <button
        v-if="hasPassedEvidenceSelection && !hasSolved"
        class="replay-back-button"
        type="button"
        @click="resetEvidenceSelection"
      >
        返回重选 3 条证据
      </button>
      <p v-if="resultMessage" class="result-message">{{ resultMessage }}</p>
      <p v-else-if="hasSolved" class="result-message">
        复盘已完成。第二章入口已解锁，可从左侧章节目录进入。
      </p>
    </div>
  </section>
</template>
