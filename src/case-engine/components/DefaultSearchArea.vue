<script setup lang="ts">
import { computed, ref } from 'vue';
import { Document, Search, Warning } from '@element-plus/icons-vue';
import type { CaseClueSearchResult } from '../flow';
import type { CaseClue, CaseFlowState, PlayableCaseDefinition } from '../types';

const props = defineProps<{
  playableCase: PlayableCaseDefinition;
  state: CaseFlowState;
  search: (keyword: string) => CaseClue[];
  searchWithMeta?: (keyword: string) => CaseClueSearchResult;
}>();

const emit = defineEmits<{
  archiveClue: [clueId: string];
  completeArea: [];
  useHint: [];
}>();

const keyword = ref('');
const resultClues = ref<CaseClue[]>([]);
const selectedClueId = ref<string | null>(props.state.activeClueId);
const message = ref('');
const hintVisible = ref(false);
const hintInput = ref('');
const hintMessage = ref('');

const searchHintPrompts = [
  '我是废物，求求伟大的杰哥给我点提示吧。',
  '我脑子真的特别垃圾，再求求杰哥了。',
  '杰哥别走杰哥别走，最后给我一次机会，我真求求你了。',
] as const;

const archivedClues = computed(() =>
  props.state.archivedClueIds
    .map((clueId) => props.playableCase.clues.find((clue) => clue.id === clueId))
    .filter((clue): clue is CaseClue => Boolean(clue)),
);

const hasArchivedAllRequiredClues = computed(() =>
  props.playableCase.replay.requiredClueIds.every((clueId) =>
    props.state.archivedClueIds.includes(clueId),
  ),
);

const selectedClue = computed(() =>
  props.playableCase.clues.find((clue) => clue.id === selectedClueId.value) ?? null,
);

const pendingResultClue = computed(() =>
  resultClues.value.find((clue) => !props.state.archivedClueIds.includes(clue.id)) ?? null,
);

const currentHintPrompt = computed(() => searchHintPrompts[props.state.hintCount] ?? null);
const remainingHintCount = computed(() =>
  Math.max(0, searchHintPrompts.length - props.state.hintCount),
);
const nextHintClue = computed(() =>
  props.playableCase.clues.find((clue) => {
    if (props.state.archivedClueIds.includes(clue.id)) {
      return false;
    }

    return clue.keywords.some((item) => {
      const matchedClues = props.searchWithMeta?.(item).clues ?? props.search(item);

      return matchedClues.some((matchedClue) => matchedClue.id === clue.id);
    });
  }) ?? null,
);

function runSearch() {
  if (pendingResultClue.value) {
    selectedClueId.value = pendingResultClue.value.id;
    message.value = '先归档当前检索结果，再继续检索下一条档案。';
    return;
  }

  const result = props.searchWithMeta?.(keyword.value) ?? {
    clues: props.search(keyword.value),
    locked: false,
  };

  resultClues.value = result.clues.filter(
    (clue) => !props.state.archivedClueIds.includes(clue.id),
  ).slice(0, 1);
  selectedClueId.value = resultClues.value[0]?.id ?? selectedClueId.value;
  message.value = resultClues.value.length
    ? '检索命中档案。'
    : result.locked
      ? '检索词已进入系统索引，但当前权限不足。继续归档已发现材料后再查。'
      : '没有匹配档案。';
}

function archive(clueId: string) {
  emit('archiveClue', clueId);
  selectedClueId.value = clueId;
  resultClues.value = resultClues.value.filter((clue) => clue.id !== clueId);
  message.value = '证据已归档，可以继续检索下一条档案。';

  const archivedAfterThis = new Set([...props.state.archivedClueIds, clueId]);
  if (props.playableCase.replay.requiredClueIds.every((id) => archivedAfterThis.has(id))) {
    emit('completeArea');
  }
}

function archiveAllRequiredClues() {
  const archivedAfterImport = new Set(props.state.archivedClueIds);

  for (const clueId of props.playableCase.replay.requiredClueIds) {
    if (!props.state.archivedClueIds.includes(clueId)) {
      emit('archiveClue', clueId);
      archivedAfterImport.add(clueId);
    }
  }

  const lastClueId =
    props.playableCase.replay.requiredClueIds[
      props.playableCase.replay.requiredClueIds.length - 1
    ];
  selectedClueId.value = lastClueId ?? selectedClueId.value;
  resultClues.value = [];
  message.value = '开发工具已导入全部复盘线索。';

  if (props.playableCase.replay.requiredClueIds.every((id) => archivedAfterImport.has(id))) {
    emit('completeArea');
  }
}

function normalizeHintText(text: string) {
  return text.replace(/\s/g, '');
}

function submitHint() {
  if (!currentHintPrompt.value) {
    hintMessage.value = '三次提示机会已经用完。';
    return;
  }

  if (normalizeHintText(hintInput.value) !== normalizeHintText(currentHintPrompt.value)) {
    hintMessage.value = '口令不对。照着上面的句子完整输入。';
    return;
  }

  hintMessage.value = nextHintClue.value
    ? `提示已开启：试试搜索：${nextHintClue.value.keywords[0]}`
    : '你已经归档了当前提示池里的全部线索。';
  emit('useHint');
  hintInput.value = '';
}

function blockHintPaste(event: ClipboardEvent) {
  event.preventDefault();
  hintMessage.value = '不能复制粘贴，只能打字输入。';
}
</script>

<template>
  <section class="default-search-area">
    <div class="search-column search-console">
      <header>
        <p class="eyebrow">ARCHIVE SEARCH</p>
        <h2>检索档案</h2>
      </header>

      <div class="search-bar">
        <el-input
          v-model="keyword"
          size="large"
          placeholder="输入你从案件、通讯、勘查里记住的关键词"
          @keyup.enter="runSearch"
        />
        <el-button type="danger" size="large" :icon="Search" @click="runSearch">
          检索
        </el-button>
        <el-button plain size="large" :icon="Warning" @click="hintVisible = true">
          提示
        </el-button>
      </div>

      <div class="archive-panel">
        <div class="archive-panel-header">
          <h3>已归档证据</h3>
          <!-- 发布版暂时隐藏开发工具：需要调试时恢复这段按钮。 -->
          <!--
          <el-button
            class="archive-all-button"
            plain
            size="small"
            :disabled="hasArchivedAllRequiredClues"
            @click="archiveAllRequiredClues"
          >
            {{ hasArchivedAllRequiredClues ? '全部已导入' : '一键导入' }}
          </el-button>
          -->
        </div>
        <button
          v-for="clue in archivedClues"
          :key="clue.id"
          class="clue-title-row archived"
          type="button"
          @click="selectedClueId = clue.id"
        >
          <el-icon><Document /></el-icon>
          {{ clue.title }}
        </button>
        <el-empty v-if="!archivedClues.length" description="暂无归档证据" />
      </div>
    </div>

    <aside class="search-column search-inspector">
      <div class="result-panel">
        <h3>检索结果</h3>
        <p v-if="message" class="muted">{{ message }}</p>
        <button
          v-for="clue in resultClues"
          :key="clue.id"
          class="clue-title-row"
          type="button"
          @click="selectedClueId = clue.id"
        >
          {{ clue.title }}
        </button>
        <el-empty v-if="!resultClues.length" description="等待检索" />
      </div>

      <div class="clue-detail">
        <template v-if="selectedClue">
          <p class="eyebrow">CLUE DETAIL</p>
          <h2>{{ selectedClue.title }}</h2>
          <p>{{ selectedClue.summary }}</p>
          <article>{{ selectedClue.detail }}</article>
          <el-button
            v-if="!state.archivedClueIds.includes(selectedClue.id)"
            class="archive-action"
            type="danger"
            @click="archive(selectedClue.id)"
          >
            归档这条证据
          </el-button>
          <el-tag v-else class="archive-status" effect="plain">已归档</el-tag>
        </template>
        <el-empty v-else description="选择一条检索结果查看详情" />
      </div>
    </aside>

    <el-dialog
      v-model="hintVisible"
      width="520px"
      title="检索提示"
      destroy-on-close
    >
      <div class="search-hint-dialog">
        <p>剩余 {{ remainingHintCount }} 次。只能手动输入，不能复制粘贴。</p>
        <template v-if="currentHintPrompt">
          <p>在下方输入：</p>
          <strong>{{ currentHintPrompt }}</strong>
          <input
            v-model="hintInput"
            class="search-hint-input"
            type="text"
            placeholder="在这里手动输入上面的完整句子"
            @keyup.enter="submitHint"
            @paste="blockHintPaste"
          >
        </template>
        <strong v-else>3/3 已用完</strong>
        <p v-if="hintMessage" class="search-hint-result">{{ hintMessage }}</p>
      </div>
      <template #footer>
        <el-button class="search-hint-submit" type="danger" @click="submitHint">
          获取提示
        </el-button>
        <el-button @click="hintVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped lang="less">
.default-search-area {
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(460px, 1.18fr);
  gap: 18px;
  min-height: 0;
}

.search-column {
  min-width: 0;
  border: 1px solid var(--case-border);
  border-radius: var(--case-radius);
  background: var(--case-panel);
  box-shadow: var(--case-shadow);
}

.search-console {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
  padding: 18px;
}

.search-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
}

.result-panel,
.archive-panel {
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--case-border);
  border-radius: 8px;
  padding: 12px;
  background: #f8fafb;
}

.archive-panel {
  max-height: 100%;
}

.archive-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.archive-panel-header h3 {
  margin: 0;
}

.clue-title-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid var(--case-border);
  border-radius: 8px;
  background: #fff;
  color: var(--case-ink);
  text-align: left;
  cursor: pointer;
}

.clue-title-row:hover {
  border-color: var(--case-danger);
}

.search-inspector {
  display: grid;
  grid-template-rows: minmax(128px, auto) minmax(0, 1fr);
  gap: 14px;
  padding: 20px;
}

.search-inspector .result-panel {
  max-height: 190px;
}

.clue-detail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--case-border);
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.clue-detail article {
  flex: 1;
  min-height: 160px;
  overflow: auto;
  white-space: pre-line;
  line-height: 1.8;
  color: var(--case-ink);
}

.archive-action,
.archive-status {
  align-self: flex-start;
}

.eyebrow,
.muted {
  color: var(--case-muted);
}

.search-hint-dialog {
  display: grid;
  gap: 12px;
}

.search-hint-dialog p,
.search-hint-dialog strong {
  margin: 0;
}

.search-hint-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--case-border);
  border-radius: 8px;
  padding: 11px 12px;
  color: var(--case-ink);
}

.search-hint-result {
  color: var(--case-danger);
}

@media (max-width: 980px) {
  .default-search-area {
    grid-template-columns: 1fr;
  }
}
</style>
