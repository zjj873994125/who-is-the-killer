<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  Check,
  Document,
  FolderOpened,
  Lock,
  Location,
  RefreshLeft,
  Search,
} from '@element-plus/icons-vue';
import { completeArea } from '../flow';
import { useCaseFlow } from '../useCaseFlow';
import type { CaseAreaId, PlayableCaseDefinition, ReplaySubmitResult } from '../types';
import DefaultSearchArea from './DefaultSearchArea.vue';
import DefaultReplayArea from './DefaultReplayArea.vue';
import FloatingPhoneMessages from './FloatingPhoneMessages.vue';

const props = defineProps<{
  playableCase: PlayableCaseDefinition;
  basePath: string;
  areaComponents?: Partial<Record<CaseAreaId, Component>>;
}>();

const router = useRouter();
const route = useRoute();
const replayAreaRef = ref<{ setSubmitResult?: (result: ReplaySubmitResult) => void } | null>(null);

const flow = useCaseFlow(props.playableCase);

const iconByAreaId = {
  case: Document,
  survey: Location,
  search: Search,
  replay: FolderOpened,
  story: Document,
} satisfies Record<CaseAreaId, Component>;

const routeByAreaId = computed(() =>
  props.playableCase.areas.reduce(
    (result, area) => ({
      ...result,
      [area.id]: `${props.basePath}/${area.routeSegment}`,
    }),
    {} as Record<CaseAreaId, string>,
  ),
);

const areaBySegment = computed(() =>
  props.playableCase.areas.reduce(
    (result, area) => ({
      ...result,
      [area.routeSegment]: area.id,
    }),
    {} as Record<string, CaseAreaId>,
  ),
);

const activeAreaId = computed(() => {
  const segment = String(route.params.area ?? props.playableCase.startAreaId);

  return areaBySegment.value[segment] ?? props.playableCase.startAreaId;
});

const activeArea = computed(() =>
  props.playableCase.areas.find((area) => area.id === activeAreaId.value),
);

const activeComponent = computed(() => {
  if (activeAreaId.value === 'search') {
    return props.areaComponents?.search ?? DefaultSearchArea;
  }

  if (activeAreaId.value === 'replay') {
    return props.areaComponents?.replay ?? DefaultReplayArea;
  }

  return props.areaComponents?.[activeAreaId.value] ?? null;
});

const activeAreaIndex = computed(() =>
  Math.max(0, props.playableCase.areas.findIndex((area) => area.id === activeAreaId.value)),
);

const progressPercent = computed(() => {
  if (props.playableCase.areas.length <= 1) {
    return 100;
  }

  return Math.round((activeAreaIndex.value / (props.playableCase.areas.length - 1)) * 100);
});

function isAreaCompleted(areaId: CaseAreaId) {
  return flow.state.value.completedAreaIds.includes(areaId);
}

function goHome() {
  void router.push('/');
}

function resetCase() {
  flow.reset();
  void router.push(routeByAreaId.value[props.playableCase.startAreaId]);
}

function goArea(areaId: CaseAreaId) {
  if (!flow.isAreaAccessible(areaId)) {
    return;
  }

  void router.push(routeByAreaId.value[areaId]);
}

function completeAndGo(areaId: CaseAreaId, nextAreaId?: CaseAreaId) {
  flow.markAreaComplete(areaId);

  if (nextAreaId) {
    void router.push(routeByAreaId.value[nextAreaId]);
  }
}

function completeSearchArea() {
  completeAndGo('search', 'replay');
}

function submitReplay() {
  const result = flow.runReplaySubmit();
  replayAreaRef.value?.setSubmitResult?.(result);

  if (result.solved) {
    flow.state.value = completeArea(flow.state.value, 'story');
  }
}

watch(
  activeAreaId,
  (areaId) => {
    flow.setActiveArea(areaId);

    if (!flow.isAreaAccessible(areaId)) {
      const fallbackArea = [...props.playableCase.areas]
        .reverse()
        .find((area) => flow.isAreaAccessible(area.id));
      void router.replace(routeByAreaId.value[fallbackArea?.id ?? props.playableCase.startAreaId]);
    }
  },
  { immediate: true },
);
</script>

<template>
  <main class="case-flow-view" :class="`case-theme-${playableCase.theme}`">
    <aside class="case-flow-sidebar">
      <header class="case-flow-title">
        <p class="eyebrow">SHORT CASE</p>
        <h1>{{ playableCase.title }}</h1>
        <span>{{ playableCase.subtitle }}</span>
      </header>

      <nav class="case-flow-nav" aria-label="短篇案件区域">
        <div class="case-flow-progress">
          <span>调查进度</span>
          <strong>{{ activeAreaIndex + 1 }}/{{ playableCase.areas.length }}</strong>
          <i :style="{ width: `${progressPercent}%` }"></i>
        </div>

        <button
          v-for="(area, index) in playableCase.areas"
          :key="area.id"
          class="case-flow-nav-item"
          :class="{
            active: area.id === activeAreaId,
            completed: isAreaCompleted(area.id),
            locked: !flow.isAreaAccessible(area.id),
          }"
          type="button"
          :disabled="!flow.isAreaAccessible(area.id)"
          @click="goArea(area.id)"
        >
          <span class="nav-step-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="nav-step-icon">
            <el-icon>
              <component :is="iconByAreaId[area.id]" />
            </el-icon>
          </span>
          <span class="nav-step-copy">
            <strong>{{ area.label }}</strong>
            <small v-if="area.id === activeAreaId">正在调查</small>
            <small v-else-if="isAreaCompleted(area.id)">已完成</small>
            <small v-else-if="!flow.isAreaAccessible(area.id)">待解锁</small>
            <small v-else>可进入</small>
          </span>
          <span class="nav-step-status">
            <el-icon v-if="isAreaCompleted(area.id)"><Check /></el-icon>
            <el-icon v-else-if="!flow.isAreaAccessible(area.id)"><Lock /></el-icon>
          </span>
        </button>
      </nav>

      <div class="case-flow-actions">
        <el-button :icon="ArrowLeft" @click="goHome">返回首页</el-button>
        <el-button :icon="RefreshLeft" @click="resetCase">清空存档</el-button>
      </div>
    </aside>

    <section class="case-flow-main">
      <header class="case-flow-main-header">
        <p class="eyebrow">{{ activeArea?.label }}</p>
        <h2>{{ playableCase.title }}</h2>
      </header>

      <component
        :is="activeComponent"
        v-if="activeComponent"
        ref="replayAreaRef"
        :playable-case="playableCase"
        :state="flow.state.value"
        :search="flow.runSearch"
        :search-with-meta="flow.runSearchWithMeta"
        @complete-area="completeAndGo(activeAreaId)"
        @complete-and-go="completeAndGo"
        @archive-clue="flow.markClueArchived"
        @use-hint="flow.markHintUsed"
        @inspect-hotspot="flow.markHotspotInspected"
        @unlock-room="flow.markRoomUnlocked"
        @select-clues="flow.setSelectedClues"
        @answer-question="flow.setSelectedAnswer"
        @submit-replay="submitReplay"
        @go-area="goArea"
        @complete-search-area="completeSearchArea"
      />
      <el-empty v-else description="这个区域还没有定制内容" />
    </section>

    <FloatingPhoneMessages :contacts="playableCase.contacts" />
  </main>
</template>

<style scoped lang="less">
.case-flow-view {
  height: 100dvh;
  min-height: 0;
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(177, 37, 44, 0.05), transparent 30%),
    var(--case-bg);
  color: var(--case-ink);
}

.case-flow-sidebar {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  min-height: 0;
  padding: 20px;
  border-right: 1px solid var(--case-border);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 247, 243, 0.94)),
    #fff;
}

.case-flow-title h1 {
  margin: 6px 0;
  font-size: 24px;
}

.case-flow-title span,
.eyebrow {
  color: var(--case-muted);
}

.case-flow-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.case-flow-progress {
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  padding: 12px;
  border: 1px solid #e6d8c8;
  border-radius: 10px;
  background: rgba(255, 252, 247, 0.96);
  color: #6d5846;
}

.case-flow-progress span {
  font-size: 13px;
}

.case-flow-progress strong {
  color: var(--case-danger);
}

.case-flow-progress i {
  grid-column: 1 / -1;
  height: 4px;
  border-radius: 999px;
  background: var(--case-danger);
  box-shadow: 0 0 0 1px rgba(159, 44, 36, 0.08);
}

.case-flow-nav-item {
  position: relative;
  min-height: 70px;
  display: grid;
  grid-template-columns: 34px 38px minmax(0, 1fr) 22px;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e7d9ca;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.76);
  color: var(--case-ink);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.case-flow-nav-item:hover:not(:disabled),
.case-flow-nav-item.active {
  border-color: var(--case-danger);
  background: #fff;
  color: var(--case-danger);
  box-shadow: 0 12px 28px rgba(93, 55, 33, 0.09);
}

.case-flow-nav-item:hover:not(:disabled) {
  transform: translateY(-1px);
}

.case-flow-nav-item.active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 12px;
  bottom: 12px;
  width: 4px;
  border-radius: 0 999px 999px 0;
  background: var(--case-danger);
}

.case-flow-nav-item.completed {
  border-color: rgba(159, 44, 36, 0.36);
}

.case-flow-nav-item.locked {
  background: rgba(248, 248, 248, 0.58);
}

.case-flow-nav-item:disabled {
  color: #a7a19b;
  cursor: not-allowed;
}

.nav-step-index {
  color: #a88d75;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.nav-step-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #f5ede4;
  color: #6d5846;
}

.case-flow-nav-item.active .nav-step-icon,
.case-flow-nav-item.completed .nav-step-icon {
  background: var(--case-danger-soft);
  color: var(--case-danger);
}

.nav-step-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.nav-step-copy strong,
.nav-step-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-step-copy strong {
  font-size: 15px;
}

.nav-step-copy small {
  color: var(--case-muted);
  font-size: 12px;
}

.nav-step-status {
  color: var(--case-danger);
}

.case-flow-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.case-flow-main {
  min-width: 0;
  min-height: 0;
  height: 100dvh;
  padding: 22px;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.case-flow-main-header {
  margin-bottom: 16px;
}

.case-flow-main-header h2 {
  margin: 4px 0 0;
  font-size: 22px;
}

.case-theme-folk {
  --case-danger: #9f2c24;
  --case-danger-soft: #fff2ee;
}

@media (max-width: 900px) {
  .case-flow-view {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .case-flow-sidebar {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--case-border);
  }

  .case-flow-main {
    height: auto;
    min-height: 0;
  }

  .case-flow-nav {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    overflow: visible;
  }

  .case-flow-progress {
    grid-column: 1 / -1;
  }
}

@media (max-width: 620px) {
  .case-flow-nav,
  .case-flow-actions {
    grid-template-columns: 1fr;
  }
}
</style>
