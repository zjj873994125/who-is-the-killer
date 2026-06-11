<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowDown, ArrowRight, ArrowUp, Document, Lock, Reading } from '@element-plus/icons-vue';
import { officialChapters, officialPrologueBriefing } from '../data/officialCase';
import { hasCompletedOfficialPrologue } from '../utils/officialProgress';

const router = useRouter();
const isFormalExpanded = ref(false);
const hasFinishedFormalPrologue = ref(hasCompletedOfficialPrologue());

const officialGameCards = officialChapters
  .map((chapter) => {
    if (chapter.id === 'official-prologue') {
      return {
        id: chapter.id,
        title: '序章',
        source: chapter.sourceChapterTitle,
        summary: officialPrologueBriefing.lead,
        locked: false,
        path: '/official/prologue',
      };
    }

    return {
      id: chapter.id,
      title: chapter.title,
      source: chapter.sourceChapterTitle,
      summary:
        chapter.id === 'official-chapter-1' && !hasFinishedFormalPrologue.value
          ? '先完成序章，再进入第一章调查。'
          : chapter.summary,
      locked:
        chapter.locked ||
        (chapter.id === 'official-chapter-1' && !hasFinishedFormalPrologue.value),
      path: chapter.id === 'official-chapter-1' ? '/official/chapter-1/case' : '',
    };
  });

</script>

<template>
  <main class="game-select-screen">
    <section class="game-select-hero">
      <p class="eyebrow">CASE E-09 / GAME SELECT</p>
      <h1>有诡电梯</h1>
      <p>
        选择一个独立案件游戏进入。试玩 Demo 和正式篇互不混用流程；
        正式篇内部再按游戏章节逐章展开。
      </p>
    </section>

    <section class="game-select-grid" aria-label="游戏入口">
      <article class="game-series-card demo-series">
        <div class="game-series-header">
          <span class="game-entry-icon">
            <el-icon><Document /></el-icon>
          </span>
          <span>
            <small>PLAYABLE DEMO</small>
            <strong>试玩 Demo</strong>
          </span>
        </div>
        <p>保留现有完整流程：序章、勘查、检索、复盘、故事区。</p>
        <button class="game-series-action" type="button" @click="router.push('/demo/case')">
          进入试玩
          <el-icon><ArrowRight /></el-icon>
        </button>
      </article>

      <article class="game-series-card formal-series">
        <div class="game-series-header">
          <span class="game-entry-icon">
            <el-icon><Reading /></el-icon>
          </span>
          <span>
            <small>FORMAL STORY</small>
            <strong>正式篇</strong>
          </span>
        </div>
        <p>
          正式篇从游戏第一章开始推进。原文第六到第十章只作为内容来源，
          不直接作为游戏章节编号。
        </p>

        <button
          class="game-series-action"
          type="button"
          :aria-expanded="isFormalExpanded"
          aria-controls="formal-chapter-list"
          @click="isFormalExpanded = !isFormalExpanded"
        >
          选择游玩篇章
          <el-icon>
            <ArrowUp v-if="isFormalExpanded" />
            <ArrowDown v-else />
          </el-icon>
        </button>

        <Transition name="formal-chapter-expand">
          <div
            v-if="isFormalExpanded"
            id="formal-chapter-list"
            class="formal-chapter-list"
            aria-label="正式篇章节"
          >
          <button
            v-for="card in officialGameCards"
            :key="card.id"
            class="formal-chapter-row"
            :class="{ locked: card.locked }"
            type="button"
            :disabled="card.locked"
            @click="card.path && router.push(card.path)"
          >
            <span class="formal-chapter-index">{{ card.title.split('：')[0] }}</span>
            <span>
              <strong>{{ card.title.split('：')[1] ?? '开头故事' }}</strong>
              <small>{{ card.locked ? `待制作：${card.summary}` : card.summary }}</small>
            </span>
            <el-icon>
              <Lock v-if="card.locked" />
              <ArrowRight v-else />
            </el-icon>
          </button>
          </div>
        </Transition>
      </article>
    </section>
  </main>
</template>
