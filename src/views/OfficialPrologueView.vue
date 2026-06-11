<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight, Reading } from '@element-plus/icons-vue';
import { gsap } from 'gsap';
import { officialPrologueBriefing } from '../data/officialCase';
import { imageAssets } from '../utils/cosAssets';
import { completeOfficialPrologue } from '../utils/officialProgress';

const router = useRouter();
const entrySceneUrl = imageAssets.officialChapterOneSurveyElevator;
const hasEnteredPrologue = ref(false);
const isLoading = ref(false);
const loadingProgress = ref(0);
const loadingText = ref('等待接入正式篇档案');
let loadingTween: gsap.core.Tween | undefined;
let loadingDelay: gsap.core.Tween | undefined;

const loadingSteps = [
  '正在进入银港大厦',
  '正在加载序章档案',
  '正在同步报警记录',
  '正在调取41楼监控',
  '正在建立正式篇存档',
];

const prologueImageUrls: Record<string, string> = {
  'official-prologue-01-building': imageAssets.officialPrologue01Building,
  'official-prologue-02-corridor': imageAssets.officialPrologue02Corridor,
  'official-prologue-03-floor41': imageAssets.officialPrologue03Floor41,
  'official-prologue-04-door': imageAssets.officialPrologue04Door,
};

onUnmounted(() => {
  loadingTween?.kill();
  loadingDelay?.kill();
});

function beginOfficialPrologueEntry() {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loadingProgress.value = 100;
    loadingText.value = '接入完成';
    window.setTimeout(() => {
      hasEnteredPrologue.value = true;
    }, 180);
    return;
  }

  const progressState = { value: 0 };

  loadingTween = gsap.to(progressState, {
    value: 100,
    duration: 2.65,
    ease: 'power2.inOut',
    onUpdate: () => {
      loadingProgress.value = Math.round(progressState.value);
      const stepIndex = Math.min(
        loadingSteps.length - 1,
        Math.floor((progressState.value / 100) * loadingSteps.length),
      );
      loadingText.value = loadingSteps[stepIndex];
    },
    onComplete: () => {
      loadingProgress.value = 100;
      loadingText.value = '接入完成';
      loadingDelay = gsap.delayedCall(0.24, () => {
        hasEnteredPrologue.value = true;
      });
    },
  });
}

function enterOfficialChapterOne() {
  completeOfficialPrologue();
  void router.push('/official/chapter-1/case');
}
</script>

<template>
  <main v-if="!hasEnteredPrologue" class="warning-screen official-prologue-entry-screen">
    <section class="entry-shell official-prologue-entry-shell" aria-labelledby="official-entry-title">
      <div class="entry-brief">
        <div class="entry-brand-row">
          <span class="entry-case-mark">E-09</span>
          <div>
            <p class="eyebrow">正式篇档案系统 / FORMAL ACCESS</p>
            <h1 id="official-entry-title">有诡电梯</h1>
          </div>
        </div>

        <p class="entry-lead">
          你将进入正式篇序章，先以随案调查员身份阅读银港大厦货梯异常死亡案的开端。
          序章完成后，第一章调查流程才会解锁。
        </p>

        <div class="entry-status-grid" aria-label="正式篇接入状态">
          <div>
            <span>CASE</span>
            <strong>E-09</strong>
          </div>
          <div>
            <span>PHASE</span>
            <strong>序章</strong>
          </div>
          <div>
            <span>MODE</span>
            <strong>正式篇</strong>
          </div>
        </div>

        <div class="entry-warning-note">
          <strong>内容确认</strong>
          <p>
            正式篇会以图文方式展开案件背景，并在后续章节进入现场勘查、通讯、检索和复盘。
            当前进度会保存在本地浏览器。
          </p>
        </div>

        <div class="entry-access-panel" :class="{ loading: isLoading }">
          <button
            v-if="!isLoading"
            class="primary-action entry-action"
            type="button"
            @click="beginOfficialPrologueEntry"
          >
            确认进入正式篇序章
          </button>
          <div
            v-else
            class="entry-loading"
            role="status"
            aria-live="polite"
            :aria-label="`正式篇接入进度 ${loadingProgress}%`"
          >
            <div class="entry-progress-track">
              <span
                class="entry-progress-fill"
                :style="{ width: `${loadingProgress}%` }"
              ></span>
            </div>
            <div class="entry-loading-row">
              <span>{{ loadingText }}</span>
              <strong>{{ loadingProgress }}%</strong>
            </div>
          </div>
        </div>
      </div>

      <aside class="entry-monitor" aria-label="正式篇序章监控接入预览">
        <div class="entry-monitor-header">
          <span>CAM-B / 货梯异常</span>
          <strong>00:11:48</strong>
        </div>
        <figure class="entry-monitor-frame official-entry-scene-frame">
          <img :src="entrySceneUrl" alt="案发货梯内部局部监控截帧" />
          <span class="entry-scan-line" aria-hidden="true"></span>
        </figure>
      </aside>
    </section>
  </main>

  <main v-else class="official-prologue-screen">
    <section class="official-prologue-shell">
      <div class="official-prologue-head">
        <button class="plain-back-button" type="button" @click="router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </button>
        <p class="eyebrow">FORMAL STORY / PROLOGUE</p>
        <h1>{{ officialPrologueBriefing.title }}</h1>
        <p>{{ officialPrologueBriefing.lead }}</p>
      </div>

      <div class="official-prologue-story-board">
        <article
          v-for="section in officialPrologueBriefing.sections"
          :key="section.title"
          class="official-prologue-story-frame"
        >
          <img
            :src="prologueImageUrls[section.imageKey]"
            :alt="section.imageAlt"
            loading="lazy"
          />
          <div class="official-prologue-caption">
            <span>{{ section.title }}</span>
            <p class="scene-line">{{ section.sceneText }}</p>
            <p>{{ section.body }}</p>
          </div>
        </article>
      </div>

      <button
        class="game-series-action official-prologue-action"
        type="button"
        @click="enterOfficialChapterOne"
      >
        <el-icon><Reading /></el-icon>
        进入第一章
        <el-icon><ArrowRight /></el-icon>
      </button>
    </section>
  </main>
</template>
