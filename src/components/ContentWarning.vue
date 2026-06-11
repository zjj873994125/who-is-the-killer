<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { gsap } from 'gsap';
import { imageAssets } from '../utils/cosAssets';

const prologueCctvUrl = imageAssets.prologueCctvFrame;

const emit = defineEmits<{
  accept: [];
}>();

const panelRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const loadingProgress = ref(0);
const loadingText = ref('等待接入专案系统');
let animationContext: gsap.Context | undefined;
let loadingTween: gsap.core.Tween | undefined;

const loadingSteps = [
  '正在进入犯罪现场',
  '正在加载案情档案',
  '正在同步监控断帧',
  '正在接入特案组通讯',
  '正在建立本地存档',
];

onMounted(() => {
  if (
    !panelRef.value ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  animationContext = gsap.context(() => {
    gsap.from('.entry-animate', {
      autoAlpha: 0,
      y: 18,
      duration: 0.32,
      ease: 'power2.out',
      stagger: 0.06,
    });

    gsap.fromTo(
      '.entry-scan-line',
      { yPercent: -120 },
      {
        yPercent: 120,
        duration: 2.8,
        ease: 'none',
        repeat: -1,
      },
    );

    gsap.to('.entry-floor-number', {
      opacity: 0.45,
      duration: 0.22,
      ease: 'steps(1)',
      repeat: -1,
      yoyo: true,
      repeatDelay: 2.6,
    });
  }, panelRef.value);
});

onUnmounted(() => {
  loadingTween?.kill();
  animationContext?.revert();
});

function beginEntry() {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loadingProgress.value = 100;
    loadingText.value = '接入完成';
    window.setTimeout(() => emit('accept'), 180);
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
      gsap.delayedCall(0.24, () => emit('accept'));
    },
  });
}
</script>

<template>
  <main class="warning-screen">
    <section ref="panelRef" class="entry-shell" aria-labelledby="warning-title">
      <div class="entry-brief entry-animate">
        <div class="entry-brand-row">
          <span class="entry-case-mark">E-09</span>
          <div>
            <p class="eyebrow">市局刑侦档案系统 / LIMITED ACCESS</p>
            <h1 id="warning-title">有诡电梯</h1>
          </div>
        </div>

        <p class="entry-lead">
          你将以随案记录员身份接入银港大厦货梯异常死亡案。
          所有现场观察、通讯记录和证据检索都会被写入本地档案。
        </p>

        <div class="entry-status-grid" aria-label="专案接入状态">
          <div>
            <span>CASE</span>
            <strong>E-09</strong>
          </div>
          <div>
            <span>LEVEL</span>
            <strong>首次出现场</strong>
          </div>
          <div>
            <span>MODE</span>
            <strong>本地存档</strong>
          </div>
        </div>

        <div class="entry-warning-note">
          <strong>内容确认</strong>
          <p>
            本 demo 含命案、尸检、成人猎奇行为与心理犯罪相关案卷描述。
            页面不会展示露骨图像，但文本和证据会保留案件压迫感。
          </p>
        </div>

        <div class="entry-access-panel" :class="{ loading: isLoading }">
          <button
            v-if="!isLoading"
            class="primary-action entry-action"
            type="button"
            @click="beginEntry"
          >
            确认进入档案系统
          </button>
          <div
            v-else
            class="entry-loading"
            role="status"
            aria-live="polite"
            :aria-label="`系统接入进度 ${loadingProgress}%`"
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

      <aside class="entry-monitor entry-animate" aria-label="电梯监控接入预览">
        <div class="entry-monitor-header">
          <span>CAM-B / 货梯上行</span>
          <strong>00:11:48</strong>
        </div>
        <figure class="entry-monitor-frame">
          <img :src="prologueCctvUrl" alt="货梯异常监控帧，楼层显示停在 09" />
          <span class="entry-scan-line" aria-hidden="true"></span>
          <span class="entry-floor-number">09</span>
        </figure>
      </aside>
    </section>
  </main>
</template>
