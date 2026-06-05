<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gsap } from 'gsap';
import {
  Document,
  Files,
  Location,
  Reading,
  RefreshLeft,
  Search,
  Warning,
} from '@element-plus/icons-vue';
import { chapterById } from '../data/case';
import { useGameContext } from '../context/gameContext';

const route = useRoute();
const router = useRouter();
const { state, reset } = useGameContext();
const workspaceRef = ref<HTMLElement | null>(null);
let animationContext: gsap.Context | undefined;

const activeRoute = computed(() => route.path);
const currentChapter = computed(() => chapterById[state.value.currentChapterId]);

const navItems = computed(() => [
  {
    path: '/case',
    label: '案件区',
    desc: '立案与章节入口',
    icon: Document,
    disabled: false,
  },
  {
    path: '/survey',
    label: '勘查区',
    desc: '现场与监控证据',
    icon: Search,
    disabled: !state.value.unlockedChapterIds.includes('chapter-1'),
  },
  {
    path: '/clues',
    label: '线索区',
    desc: '自动归档证据',
    icon: Files,
    disabled: !state.value.unlockedChapterIds.includes('chapter-1'),
  },
  {
    path: '/replay',
    label: '复盘区',
    desc: '验证电梯矛盾',
    icon: Location,
    disabled: !state.value.unlockedChapterIds.includes('chapter-1'),
  },
  {
    path: '/story',
    label: '故事区',
    desc: '结案复盘故事',
    icon: Reading,
    disabled: !state.value.solvedReplayQuestionIds.includes('replay-chapter-1'),
  },
  {
    path: '/locked',
    label: '后续档案',
    desc: '第二章占位',
    icon: Warning,
    disabled: !state.value.unlockedChapterIds.includes('chapter-2'),
  },
]);

function navigate(path: string, disabled: boolean) {
  if (disabled) {
    return;
  }

  void router.push(path);
}

onMounted(() => {
  if (
    !workspaceRef.value ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  animationContext = gsap.context(() => {
    gsap.from('.workspace-nav-card', {
      autoAlpha: 0,
      y: 10,
      stagger: 0.035,
      duration: 0.22,
      ease: 'power2.out',
    });
    gsap.from('.workspace-content', {
      autoAlpha: 0,
      y: 12,
      duration: 0.24,
      ease: 'power2.out',
    });
  }, workspaceRef.value);
});

onUnmounted(() => {
  animationContext?.revert();
});
</script>

<template>
  <el-container ref="workspaceRef" class="workspace-shell">
    <el-aside class="workspace-aside" width="clamp(280px, 24vw, 316px)">
      <div class="workspace-aside-body">
      <section class="workspace-brand">
        <span class="brand-mark">E-09</span>
        <div>
          <p>市局刑侦档案系统</p>
          <h1>有诡电梯</h1>
        </div>
      </section>

      <section class="chapter-status">
        <el-tag type="info" effect="plain">当前章节</el-tag>
        <h2>{{ currentChapter.title }}</h2>
        <p>{{ currentChapter.objective }}</p>
      </section>

      <nav class="workspace-nav" aria-label="调查工作区">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="workspace-nav-card"
          :class="{ active: activeRoute === item.path, disabled: item.disabled }"
          type="button"
          :disabled="item.disabled"
          @click="navigate(item.path, item.disabled)"
        >
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
          <span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.disabled ? '待解锁' : item.desc }}</small>
          </span>
        </button>
      </nav>

      <el-button class="reset-button" :icon="RefreshLeft" plain @click="reset">
        清空存档
      </el-button>
      </div>
    </el-aside>

    <el-container class="workspace-main">
      <el-header class="workspace-header" height="76px">
        <div>
          <p class="eyebrow">INVESTIGATION DESK</p>
          <strong>{{ currentChapter.title }}</strong>
        </div>
        <el-space :size="12">
          <el-tag effect="plain" type="danger">
            {{ state.collectedEvidenceIds.length }} 条证据已归档
          </el-tag>
          <el-tag effect="plain">
            本地存档
          </el-tag>
        </el-space>
      </el-header>
      <el-main class="workspace-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
