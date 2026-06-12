<script setup lang="ts">
import type { PlayableCaseDefinition } from '../../../case-engine/types';

defineProps<{
  playableCase: PlayableCaseDefinition;
}>();
</script>

<template>
  <section class="jiang-story-area">
    <article class="story-paper">
      <p class="eyebrow">CASE CLOSED</p>
      <h2>{{ playableCase.story.title }}</h2>
      <p class="lead">{{ playableCase.story.lead }}</p>

      <div class="story-body">
        <p v-for="paragraph in playableCase.story.paragraphs" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>
    </article>

    <aside class="story-side">
      <div class="seal">结</div>
      <h3>姜面不落地</h3>
      <p>真正落下的不是神罚，而是被人挂在梁上的杀人机关。</p>
    </aside>
  </section>
</template>

<style scoped lang="less">
.jiang-story-area {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 18px;
}

.story-paper,
.story-side {
  border: 1px solid #d9c8b4;
  border-radius: 10px;
  background: #fffaf2;
  box-shadow: 0 18px 42px rgba(69, 42, 24, 0.1);
  padding: 26px;
}

.story-paper h2 {
  font-size: 30px;
}

.lead {
  color: #6c5240;
  font-size: 17px;
}

.story-body {
  margin-top: 22px;
  display: grid;
  gap: 16px;
  line-height: 1.9;
}

.story-side {
  align-self: start;
  display: grid;
  justify-items: center;
  text-align: center;
}

.seal {
  width: 92px;
  height: 92px;
  display: grid;
  place-items: center;
  border: 4px solid #9f2c24;
  color: #9f2c24;
  font-size: 48px;
  font-weight: 900;
  transform: rotate(-8deg);
}

.eyebrow {
  color: #8a6d56;
}

@media (max-width: 840px) {
  .jiang-story-area {
    grid-template-columns: 1fr;
  }
}
</style>

