<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CaseFlowState, PlayableCaseDefinition, ReplaySubmitResult } from '../types';

const props = defineProps<{
  playableCase: PlayableCaseDefinition;
  state: CaseFlowState;
}>();

const emit = defineEmits<{
  selectClues: [clueIds: string[]];
  answerQuestion: [questionId: string, optionId: string];
  submitReplay: [];
  completeStory: [];
}>();

const submitResult = ref<ReplaySubmitResult | null>(null);

const selectableClues = computed(() =>
  props.playableCase.clues.filter((clue) => props.state.archivedClueIds.includes(clue.id)),
);

const selectedClueSet = computed(() => new Set(props.state.selectedClueIds));

function toggleClue(clueId: string) {
  const next = new Set(props.state.selectedClueIds);

  if (next.has(clueId)) {
    next.delete(clueId);
  } else if (next.size < props.playableCase.replay.clueSelectionLimit) {
    next.add(clueId);
  }

  emit('selectClues', [...next]);
}

function setSubmitResult(result: ReplaySubmitResult) {
  submitResult.value = result;
}

defineExpose({
  setSubmitResult,
});
</script>

<template>
  <section class="default-replay-area">
    <header class="replay-question-card">
      <p class="eyebrow">RECONSTRUCTION</p>
      <h2>{{ playableCase.replay.prompt ?? '复盘题目' }}</h2>
      <p>
        从已归档线索中选择 {{ playableCase.replay.clueSelectionLimit }} 条关键证据，
        再完成下面的推理作答。错误只会在最终提交时统一提示。
      </p>
    </header>

    <section class="replay-card">
      <h3>证据筛选</h3>
      <div class="replay-clue-grid">
        <button
          v-for="clue in selectableClues"
          :key="clue.id"
          class="replay-clue"
          :class="{ selected: selectedClueSet.has(clue.id) }"
          type="button"
          @click="toggleClue(clue.id)"
        >
          {{ clue.title }}
        </button>
      </div>
      <el-empty v-if="!selectableClues.length" description="先去检索区归档证据" />
    </section>

    <section class="replay-card">
      <h3>推理作答</h3>
      <article
        v-for="question in playableCase.replay.questions"
        :key="question.id"
        class="reasoning-question"
      >
        <h4>{{ question.title }}</h4>
        <p>{{ question.prompt }}</p>
        <el-radio-group
          :model-value="state.selectedAnswers[question.id]"
          @update:model-value="emit('answerQuestion', question.id, String($event))"
        >
          <el-radio
            v-for="option in question.options"
            :key="option.id"
            :label="option.id"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>
      </article>
    </section>

    <footer class="replay-footer">
      <el-alert
        v-if="submitResult"
        :type="submitResult.solved ? 'success' : 'warning'"
        :title="
          submitResult.solved
            ? playableCase.replay.successSummary ?? '复盘成立'
            : playableCase.replay.failureHint ?? '复盘还不成立，重新检查证据和答案。'
        "
        show-icon
        :closable="false"
      />
      <el-button type="danger" @click="emit('submitReplay')">提交复盘</el-button>
    </footer>
  </section>
</template>

<style scoped lang="less">
.default-replay-area {
  display: grid;
  gap: 16px;
}

.replay-question-card,
.replay-card,
.replay-footer {
  border: 1px solid var(--case-border);
  border-radius: var(--case-radius);
  background: var(--case-panel);
  box-shadow: var(--case-shadow);
  padding: 18px;
}

.replay-clue-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.replay-clue {
  min-height: 48px;
  border: 1px solid var(--case-border);
  border-radius: 8px;
  background: #fff;
  color: var(--case-ink);
  cursor: pointer;
}

.replay-clue.selected {
  border-color: var(--case-danger);
  background: var(--case-danger-soft);
  color: var(--case-danger);
}

.reasoning-question {
  display: grid;
  gap: 8px;
  padding: 14px 0;
  border-top: 1px solid var(--case-border);
}

.reasoning-question:first-of-type {
  border-top: 0;
}

.replay-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  color: var(--case-muted);
}

@media (max-width: 760px) {
  .replay-clue-grid {
    grid-template-columns: 1fr;
  }

  .replay-footer {
    flex-direction: column;
  }
}
</style>

