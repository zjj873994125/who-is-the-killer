<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Document, FolderOpened, Location, Search } from '@element-plus/icons-vue';
import {
  chapterById,
  evidenceBriefings,
  evidences,
  searchArchive,
  squadMembers,
  type Evidence,
  type ArchiveSearchEntry,
} from '../data/case';
import { useGameContext } from '../context/gameContext';
import { getSquadAvatarStyle } from '../utils/squadAvatars';

const router = useRouter();
const { state, collectEvidence } = useGameContext();
const query = ref('');
const hasSearched = ref(false);
const matchedEntries = ref<ArchiveSearchEntry[]>([]);
const activeEvidence = ref<Evidence | null>(null);

const collected = computed(() =>
  state.value.collectedEvidenceIds.map((id) => evidences[id]).filter(Boolean),
);

const firstChapterEvidenceIds = computed(() => chapterById['chapter-1'].evidenceIds);

const hasArchivedAllFirstChapterClues = computed(() =>
  firstChapterEvidenceIds.value.every((evidenceId) =>
    state.value.collectedEvidenceIds.includes(evidenceId),
  ),
);

function runSearch(keyword = query.value) {
  query.value = keyword;
  hasSearched.value = true;
  matchedEntries.value = searchArchive(keyword);
}

function archiveEvidence(entry: ArchiveSearchEntry) {
  collectEvidence(entry.evidenceId);
  activeEvidence.value = evidences[entry.evidenceId] ?? null;
}

function archiveAllFirstChapterEvidence() {
  for (const evidenceId of firstChapterEvidenceIds.value) {
    collectEvidence(evidenceId);
  }

  const lastEvidenceId =
    firstChapterEvidenceIds.value[firstChapterEvidenceIds.value.length - 1];
  activeEvidence.value = evidences[lastEvidenceId] ?? null;
}

function isArchived(entry: ArchiveSearchEntry) {
  return state.value.collectedEvidenceIds.includes(entry.evidenceId);
}

function openEvidence(evidence: Evidence) {
  activeEvidence.value = evidence;
}

function getBriefing(evidence: Evidence) {
  const briefing = evidenceBriefings[evidence.id];

  if (!briefing) {
    return null;
  }

  return {
    ...briefing,
    speaker: squadMembers[briefing.speakerId],
  };
}
</script>

<template>
  <section class="route-page clues-route">
    <div class="clues-workbench-grid">
      <el-card shadow="never" class="section-card clues-search-panel">
        <template #header>
          <div class="card-header">
            <div>
              <p class="eyebrow">线索区 / 档案检索</p>
              <h2>把现场观察变成可归档证据</h2>
            </div>
            <el-tag effect="plain" type="danger">
              {{ state.collectedEvidenceIds.length }} 条已归档
            </el-tag>
          </div>
        </template>

        <div class="search-console">
          <div class="search-row">
            <el-input
              v-model="query"
              class="terminal-input"
              size="large"
              placeholder="输入你从现场推断出的词"
              clearable
              @keyup.enter="runSearch()"
            />
            <el-button type="danger" size="large" :icon="Search" @click="runSearch()">
              检索
            </el-button>
          </div>
          <p class="search-helper">
            你需要回忆电梯现场的异常，再用自己的判断检索档案。
          </p>
        </div>

        <section class="archived-dossier">
          <div class="archived-dossier-header">
            <div>
              <strong>已归档证据</strong>
              <span>只显示标题，详情在右侧查看。</span>
            </div>
            <el-tag effect="plain">{{ collected.length }} 条</el-tag>
          </div>

          <el-empty
            v-if="!collected.length"
            description="尚未归档证据"
            :image-size="70"
          />
          <div v-else class="archived-stack">
            <button
              v-for="evidence in collected"
              :key="evidence.id"
              class="archived-evidence-item"
              type="button"
              @click="openEvidence(evidence)"
            >
              <span class="archive-file-icon">
                <el-icon><FolderOpened /></el-icon>
              </span>
              <span class="archive-file-main">
                <strong>{{ evidence.title }}</strong>
              </span>
            </button>
          </div>
        </section>

        <!-- <section class="developer-import-panel" aria-label="开发工具">
          <div>
            <strong>开发工具</strong>
            <span>跳过关键词检索，直接归档第一章全部线索。</span>
          </div>
          <el-button
            plain
            :disabled="hasArchivedAllFirstChapterClues"
            @click="archiveAllFirstChapterEvidence"
          >
            {{ hasArchivedAllFirstChapterClues ? '15 条线索已导入' : '一键导入全部线索' }}
          </el-button>
        </section> -->

        <el-button
          class="clues-replay-button"
          type="danger"
          :icon="Location"
          @click="router.push('/demo/replay')"
        >
          去复盘区验证
        </el-button>
      </el-card>

      <el-card shadow="never" class="section-card clues-results-panel">
        <div class="results-workspace">
          <section class="results-summary-panel">
            <div class="panel-title-row">
              <div>
                <p class="eyebrow">ARCHIVE MATCH</p>
                <h2>检索结果</h2>
              </div>
              <el-tag v-if="hasSearched" effect="plain">
                {{ matchedEntries.length }} 条命中
              </el-tag>
            </div>

            <div class="results-body compact">
              <el-empty
                v-if="hasSearched && !matchedEntries.length"
                description="未命中档案。换一个更具体的检索词。"
                :image-size="64"
              />
              <el-empty
                v-else-if="!hasSearched"
                description="等待输入检索词"
                :image-size="64"
              />
              <div v-else class="archive-result-list">
                <el-card
                  v-for="entry in matchedEntries"
                  :key="entry.id"
                  shadow="never"
                  class="archive-result-card"
                  role="button"
                  tabindex="0"
                  @click="openEvidence(evidences[entry.evidenceId])"
                  @keydown.enter="openEvidence(evidences[entry.evidenceId])"
                >
                  <div class="archive-result">
                    <div>
                      <p class="eyebrow">ARCHIVE MATCH</p>
                      <h3>{{ entry.title }}</h3>
                    </div>
                    <el-button
                      :type="isArchived(entry) ? 'success' : 'danger'"
                      :disabled="isArchived(entry)"
                      @click.stop="archiveEvidence(entry)"
                    >
                      {{ isArchived(entry) ? '已归档' : '归档证据' }}
                    </el-button>
                  </div>
                </el-card>
              </div>
            </div>
          </section>

          <section class="evidence-detail-panel">
            <div class="panel-title-row">
              <div>
                <p class="eyebrow">EVIDENCE DETAIL</p>
                <h2>线索详情</h2>
              </div>
            </div>

            <div v-if="activeEvidence" class="inline-evidence-detail">
              <div class="inline-detail-heading">
                <span class="archive-file-icon detail-icon">
                  <el-icon><Document /></el-icon>
                </span>
                <div>
                  <p class="eyebrow">EVIDENCE / {{ activeEvidence.type }}</p>
                  <h3>{{ activeEvidence.title }}</h3>
                </div>
              </div>
              <p class="drawer-primary">{{ activeEvidence.content }}</p>
              <div v-if="getBriefing(activeEvidence)" class="evidence-briefing-line">
                <span
                  class="briefing-mini-avatar squad-avatar"
                  :style="getSquadAvatarStyle(getBriefing(activeEvidence)?.speaker.id ?? '')"
                  :aria-label="getBriefing(activeEvidence)?.speaker.name"
                />
                <span>{{ getBriefing(activeEvidence)?.comment }}</span>
              </div>
            </div>
            <el-empty
              v-else
              description="点击左侧已归档证据，或点击上方检索结果查看详情。"
              :image-size="96"
            />
          </section>
        </div>
      </el-card>
    </div>
  </section>
</template>
