<script setup lang="ts">
import { computed } from 'vue';
import type { Chapter } from '../data/case';
import type { SaveState } from '../stores/gameState';

const props = defineProps<{
  chapter: Chapter;
  state: SaveState;
}>();

const emit = defineEmits<{
  requestHint: [];
}>();

const hintLevel = computed(
  () => props.state.hintLevelsByChapter[props.chapter.id] ?? 0,
);

const hintText = computed(() => {
  if (props.chapter.id === 'chapter-1') {
    return [
      '先查看技术队标注的现场点。',
      '运行记录、监控帧、楼层显示是同一个时间段的矛盾。',
      '复盘需要同时解释：检修模式、轿厢断帧、楼层显示异常。',
    ][Math.max(hintLevel.value - 1, 0)];
  }

  return [
    '先阅读报案摘要。',
    '异常监控是进入现场调查的关键。',
    '序章只需要确认案件具有立案价值。',
  ][Math.max(hintLevel.value - 1, 0)];
});
</script>

<template>
  <section class="objective-card" aria-labelledby="objective-title">
    <p class="eyebrow">当前目标</p>
    <h2 id="objective-title">{{ chapter.objective }}</h2>
    <button class="secondary-action" type="button" @click="emit('requestHint')">
      查看提示 {{ hintLevel }}/3
    </button>
    <p v-if="hintLevel > 0" class="hint-text">{{ hintText }}</p>
  </section>
</template>
