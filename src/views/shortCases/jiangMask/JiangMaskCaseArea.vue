<script setup lang="ts">
import { computed } from 'vue';
import type { PlayableCaseDefinition } from '../../../case-engine/types';
import { imageAssets } from '../../../utils/cosAssets';

const props = defineProps<{
  playableCase: PlayableCaseDefinition;
}>();

const emit = defineEmits<{
  completeAndGo: [areaId: 'case', nextAreaId: 'survey'];
}>();

const introByTitle = computed(() =>
  (props.playableCase.introBlocks ?? []).reduce(
    (result, block) => ({
      ...result,
      [block.title]: block.body,
    }),
    {} as Record<string, string>,
  ),
);

const heJingshanIdImage = imageAssets.heJingshanId;
const jiangMaskBackEvidenceImage = imageAssets.jiangMaskBackEvidence;
const jiangMaskEvidenceImage = imageAssets.jiangMaskEvidence;
</script>

<template>
  <section class="jiang-case-area">
    <div class="case-intro-layout">
      <article class="mask-evidence">
        <p class="eyebrow">EVIDENCE OBJECT</p>
        <div class="mask-image-pair">
          <figure>
            <div class="mask-visual-frame">
              <img class="mask-image" :src="jiangMaskEvidenceImage" alt="黑姜面正面证物图" />
              <div class="mask-placeholder">项目素材 A</div>
            </div>
            <figcaption>正面</figcaption>
          </figure>
          <figure>
            <div class="mask-visual-frame">
              <img class="mask-image" :src="jiangMaskBackEvidenceImage" alt="黑姜面背面铁钉证物图" />
              <div class="mask-placeholder">项目素材 B</div>
            </div>
            <figcaption>背面铁钉</figcaption>
          </figure>
        </div>
        <h3>黑姜面</h3>
        <p>{{ introByTitle['当地禁忌'] }}</p>
      </article>

      <article class="case-story">
        <p class="eyebrow">CASE STORY</p>
        <p>{{ introByTitle['案发地点'] }}</p>
        <p>{{ introByTitle['当地禁忌'] }}</p>
        <p>冬祭结束后，后台没有立刻开灯。馆里的人等了很久，才发现何敬山倒在梁架下面。黑姜面压在他脸上，地上有雪水和泥印，唯独死者周围干净得不自然。</p>
        <p>镇民把这件事说成“姜面落地，要换一张脸”。但案件区只记录故事开端：一个人死在后台，一张黑色面具成了所有人恐惧的中心。</p>
        <el-button type="danger" @click="emit('completeAndGo', 'case', 'survey')">
          开始调查
        </el-button>
      </article>

      <article class="victim-file">
        <header class="id-card-header">
          <div class="id-card-photo-frame">
            <img
              class="id-card-photo"
              :src="heJingshanIdImage"
              alt="何敬山证件照"
            />
            <div class="id-card-placeholder">ID</div>
          </div>
          <div>
            <p class="eyebrow">IDENTITY FILE</p>
            <h3>何敬山</h3>
            <span>百溪民俗馆馆长</span>
          </div>
        </header>
        <dl>
          <div>
            <dt>身份</dt>
            <dd>百溪民俗馆馆长</dd>
          </div>
          <div>
            <dt>死亡地点</dt>
            <dd>冬祭戏台后台</dd>
          </div>
          <div>
            <dt>死亡时间</dt>
            <dd>冬祭结束后</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>

<style scoped lang="less">
.jiang-case-area {
  min-height: 0;
}

.case-intro-layout {
  display: grid;
  grid-template-columns: minmax(420px, 1.12fr) minmax(340px, 0.88fr);
  grid-template-rows: minmax(220px, 1fr) minmax(180px, 1fr);
  gap: 18px;
  align-items: stretch;
  min-height: min(520px, calc(100dvh - 210px));
}

.mask-evidence,
.victim-file {
  min-width: 0;
  border: 1px solid #dccab7;
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 250, 244, 0.96)),
    #fffaf2;
  box-shadow: 0 16px 36px rgba(69, 42, 24, 0.08);
  padding: 22px;
}

.case-story {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
  min-height: 0;
  border: 1px solid #d8b36f;
  border-radius: 8px 8px 18px 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.45), transparent 32%),
    #fff0a8;
  box-shadow:
    0 18px 34px rgba(95, 65, 24, 0.14),
    inset 0 -18px 0 rgba(152, 105, 34, 0.05);
  padding: 24px 28px 22px;
  transform: rotate(-0.35deg);
}

.case-story p,
.victim-file p,
.victim-file dd {
  color: #5f4b3c;
  line-height: 1.55;
}

.case-story p {
  margin: 0 0 10px;
  color: #4b382b;
  font-size: 15px;
}

.case-story .el-button {
  align-self: flex-start;
  margin-top: auto;
}

.victim-file dl {
  display: grid;
  gap: 7px;
  margin: 10px 0 0;
}

.victim-file dl > div {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 10px;
  border-top: 1px solid #eadfce;
  padding-top: 7px;
}

.victim-file dt {
  color: #8a6d56;
  font-size: 13px;
}

.victim-file dd {
  margin: 0;
  font-weight: 700;
}

.mask-evidence {
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  grid-row: 1 / span 2;
  background:
    radial-gradient(circle at 50% 38%, rgba(126, 35, 29, 0.25), transparent 30%),
    linear-gradient(180deg, #261d19, #181310);
}

.mask-evidence h3,
.mask-evidence p,
.mask-evidence .eyebrow {
  color: #fff1df;
}

.mask-evidence h3 {
  margin: 6px 0 10px;
  font-size: 28px;
}

.mask-evidence p {
  max-width: 260px;
  line-height: 1.8;
}

.mask-image-pair {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0 18px;
}

.mask-image-pair figure {
  min-width: 0;
  margin: 0;
}

.mask-visual-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 0.72;
}

.mask-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  border: 1px solid rgba(139, 47, 39, 0.62);
  border-radius: 14px;
  box-shadow:
    inset 0 0 40px rgba(0, 0, 0, 0.4),
    0 20px 42px rgba(0, 0, 0, 0.26);
}

.mask-placeholder {
  position: absolute;
  inset: 0;
  display: none;
  place-items: center;
  border: 1px dashed rgba(105, 119, 131, 0.34);
  border-radius: 14px;
  background:
    repeating-linear-gradient(
      -28deg,
      transparent 0 24px,
      rgba(105, 119, 131, 0.1) 24px 25px,
      transparent 25px 48px
    ),
    linear-gradient(rgba(31, 41, 51, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(31, 41, 51, 0.035) 1px, transparent 1px),
    #f6f8fa;
  background-size: 22px 22px;
  color: #7a8791;
  font-size: 13px;
  font-weight: 800;
}

.mask-image-pair figcaption {
  margin-top: 7px;
  color: rgba(255, 241, 223, 0.78);
  font-size: 12px;
  font-weight: 800;
}

.victim-file {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  overflow: hidden;
  border-color: #c7d2dd;
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(209, 226, 238, 0.5), transparent 36%),
    linear-gradient(180deg, #ffffff, #eef5f8);
}

.victim-file::after {
  content: "";
  position: absolute;
  right: -24px;
  bottom: -24px;
  width: 120px;
  height: 120px;
  border: 1px solid rgba(52, 78, 94, 0.12);
  border-radius: 50%;
}

.victim-file h3 {
  margin: 2px 0 2px;
  color: #2d211b;
  font-size: 28px;
}

.victim-file > p {
  margin: 10px 0 0;
  font-size: 14px;
}

.id-card-header {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
}

.id-card-header span {
  color: #567083;
  font-size: 14px;
  font-weight: 800;
}

.id-card-photo-frame {
  z-index: 1;
  width: 86px;
  aspect-ratio: 0.78;
  position: relative;
}

.id-card-photo {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center top;
  border: 1px solid #a9bbc8;
  border-radius: 8px;
  background:
    linear-gradient(160deg, rgba(86, 112, 131, 0.18), transparent 48%),
    #dce8ef;
}

.id-card-placeholder {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: none;
  place-items: center;
  border: 1px dashed rgba(105, 119, 131, 0.34);
  border-radius: 8px;
  background:
    linear-gradient(rgba(31, 41, 51, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(31, 41, 51, 0.035) 1px, transparent 1px),
    #f6f8fa;
  background-size: 16px 16px;
  color: #7a8791;
  font-size: 13px;
  font-weight: 900;
}

.eyebrow {
  margin: 0;
  color: #8a6d56;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

@media (max-width: 1180px) {
  .case-intro-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    min-height: 0;
  }

  .mask-evidence,
  .victim-file {
    grid-column: auto;
    grid-row: auto;
  }

  .case-story {
    min-height: auto;
  }
}

@media (max-width: 520px) {
  .mask-image-pair {
    grid-template-columns: 1fr;
  }
}
</style>
