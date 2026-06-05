<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { chapterById, replayQuestions } from '../data/case';
import { useGameContext } from '../context/gameContext';
import GuidedElevatorReplay from '../components/GuidedElevatorReplay.vue';

const router = useRouter();
const { state, solveReplay } = useGameContext();
const chapter = chapterById['chapter-1'];
const question = replayQuestions['replay-chapter-1'];

const collectedRequiredCount = computed(
  () =>
    chapter.requiredEvidenceIds.filter((id) =>
      state.value.collectedEvidenceIds.includes(id),
    ).length,
);

const ready = computed(() =>
  collectedRequiredCount.value === chapter.requiredEvidenceIds.length,
);
</script>

<template>
  <section class="route-page replay-route">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <div>
            <p class="eyebrow">复盘区</p>
            <h2>只验证一个问题：电梯运行逻辑哪里不成立</h2>
          </div>
          <el-tag :type="ready ? 'success' : 'warning'" effect="plain">
            {{ ready ? '线索已齐' : `已归档 ${collectedRequiredCount}/${chapter.requiredEvidenceIds.length}` }}
          </el-tag>
        </div>
      </template>

      <el-alert
        v-if="!ready"
        title="需要先检索并归档第一章全部线索，才能进入复盘选择。"
        type="warning"
        show-icon
        :closable="false"
      >
        <template #default>
          <el-button size="small" @click="router.push('/clues')">
            返回线索区
          </el-button>
        </template>
      </el-alert>

      <el-row :gutter="18" class="replay-grid">
        <el-col :span="19">
          <GuidedElevatorReplay
            :question="question"
            :state="state"
            :disabled="!ready"
            @solve-replay="solveReplay"
          />
        </el-col>
        <el-col :span="5">
          <el-card shadow="never" class="replay-side-card">
            <template #header>
              <strong>复盘规则</strong>
            </template>
            <el-steps direction="vertical" :active="ready ? 2 : 1">
              <el-step title="现场观察" description="在电梯现场点击可疑点，记录异常。" />
              <el-step title="档案检索" description="检索并归档第一章全部 15 条线索。" />
              <el-step title="验证矛盾" description="系统播放电梯运行复盘。" />
            </el-steps>
          </el-card>
        </el-col>
      </el-row>

      <el-result
        v-if="state.solvedReplayQuestionIds.includes(question.id)"
        icon="success"
        title="第一章复盘完成"
        sub-title="第二章入口已解锁，可进入后续档案占位。"
      >
        <template #extra>
          <el-button type="danger" @click="router.push('/locked')">
            查看第二章占位
          </el-button>
        </template>
      </el-result>
    </el-card>
  </section>
</template>
