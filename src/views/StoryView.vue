<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { DocumentChecked, Location } from '@element-plus/icons-vue';
import {
  chapterResolutionStories,
  evidences,
} from '../data/case';
import { useGameContext } from '../context/gameContext';
import { imageAssets } from '../utils/cosAssets';

const chapterOneResolutionUrl = imageAssets.chapterOneResolution;

const router = useRouter();
const { state } = useGameContext();
const story = chapterResolutionStories['chapter-1'];
const fullStoryVisible = ref(false);

const hasSolvedChapterOne = computed(() =>
  state.value.solvedReplayQuestionIds.includes('replay-chapter-1'),
);

const storyImageUrls: Record<string, string> = {
  'rumor-chat': imageAssets.storyRumorChat,
  'field-investigation': imageAssets.storyFieldInvestigation,
  'cctv-control': imageAssets.storyCctvControlRoom,
  'evidence-table': imageAssets.storyEvidenceTable,
  'team-resolution': imageAssets.storyTeamResolution,
};

function evidenceTitles(evidenceIds: string[]) {
  return evidenceIds
    .map((evidenceId) => evidences[evidenceId]?.title)
    .filter(Boolean);
}
</script>

<template>
  <section class="route-page story-route">
    <el-card v-if="!hasSolvedChapterOne" shadow="never" class="locked-workspace">
      <el-result
        icon="warning"
        title="故事区尚未解锁"
        sub-title="完成第一章复盘后，系统会生成完整的结案故事和图片卷宗。"
      >
        <template #extra>
          <el-button type="danger" :icon="Location" @click="router.push('/demo/replay')">
            前往复盘区
          </el-button>
        </template>
      </el-result>
    </el-card>

    <template v-else>
      <el-card shadow="never" class="story-hero-card">
        <div class="story-hero-grid">
          <div class="story-copy">
            <p class="eyebrow">{{ story.subtitle }}</p>
            <h2>{{ story.title }}</h2>
            <p>{{ story.lead }}</p>
            <el-button type="danger" :icon="DocumentChecked" @click="router.push('/demo/locked')">
              解锁第二章档案
            </el-button>
          </div>
          <figure class="story-visual">
            <img :src="chapterOneResolutionUrl" :alt="story.imageAlt" />
            <figcaption>结案图像 / 电梯、监控断帧、控制柜与现场痕迹</figcaption>
          </figure>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card story-gallery-card">
        <template #header>
          <div class="card-header">
            <div>
              <p class="eyebrow">CASE IMAGE DOSSIER</p>
              <h2>图像卷宗</h2>
            </div>
            <el-tag effect="plain">{{ story.images.length }} 张图片</el-tag>
          </div>
        </template>

        <div class="story-gallery">
          <figure
            v-for="image in story.images"
            :key="image.id"
            class="story-gallery-item"
          >
            <img :src="storyImageUrls[image.id]" :alt="image.alt" loading="lazy" />
            <figcaption>
              <strong>{{ image.title }}</strong>
              <span>{{ image.caption }}</span>
            </figcaption>
          </figure>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card story-timeline-card">
        <template #header>
          <div class="card-header">
            <div>
              <p class="eyebrow">RESOLUTION TIMELINE</p>
              <h2>第一章完整复盘</h2>
            </div>
            <el-tag type="success" effect="plain">复盘成立</el-tag>
          </div>
        </template>

        <div class="story-timeline">
          <article
            v-for="beat in story.beats"
            :key="beat.id"
            class="story-beat"
          >
            <div class="story-beat-time">{{ beat.time }}</div>
            <div class="story-beat-body">
              <h3>{{ beat.title }}</h3>
              <p>{{ beat.body }}</p>
              <div class="story-evidence-strip">
                <span
                  v-for="title in evidenceTitles(beat.evidenceIds)"
                  :key="title"
                >
                  {{ title }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card story-closing-card">
        <p class="eyebrow">BAOZHAN / FINAL NOTE</p>
        <blockquote>{{ story.closing }}</blockquote>
        <el-button type="danger" :icon="DocumentChecked" @click="fullStoryVisible = true">
          查看完整故事
        </el-button>
      </el-card>

      <el-dialog
        v-model="fullStoryVisible"
        class="full-story-dialog"
        title="第一章完整故事"
        width="760px"
        destroy-on-close
      >
        <div class="full-story-body">
          <p
            v-for="paragraph in story.fullStory"
            :key="paragraph"
          >
            {{ paragraph }}
          </p>
        </div>
        <template #footer>
          <el-button @click="fullStoryVisible = false">关闭</el-button>
          <el-button type="danger" @click="router.push('/demo/locked')">
            查看第二章占位
          </el-button>
        </template>
      </el-dialog>
    </template>
  </section>
</template>
