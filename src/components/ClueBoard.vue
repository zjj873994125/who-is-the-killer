<script setup lang="ts">
import { computed } from 'vue';
import type { Evidence } from '../data/case';

const props = defineProps<{
  evidences: Evidence[];
}>();

const buckets = computed(() => [
  {
    id: 'fact',
    title: '已确认事实',
    items: props.evidences.filter((evidence) => evidence.clueBucket === 'fact'),
  },
  {
    id: 'doubt',
    title: '存疑证词 / 痕迹',
    items: props.evidences.filter((evidence) => evidence.clueBucket === 'doubt'),
  },
  {
    id: 'unknown',
    title: '无法解释',
    items: props.evidences.filter((evidence) => evidence.clueBucket === 'unknown'),
  },
]);
</script>

<template>
  <aside class="clue-board" aria-label="自动线索板">
    <div class="board-heading">
      <p class="eyebrow">自动线索板</p>
      <strong>{{ evidences.length }} 条证据</strong>
    </div>

    <section v-for="bucket in buckets" :key="bucket.id" class="clue-bucket">
      <h2>{{ bucket.title }}</h2>
      <ul v-if="bucket.items.length">
        <li
          v-for="evidence in bucket.items"
          :key="evidence.id"
          :class="`severity-${evidence.severity}`"
        >
          <span>{{ evidence.title }}</span>
        </li>
      </ul>
      <p v-else class="empty-line">暂无归档</p>
    </section>
  </aside>
</template>
