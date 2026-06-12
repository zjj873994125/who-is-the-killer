<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  CaseFlowState,
  CaseSurveyHotspot,
  PlayableCaseDefinition,
} from '../../../case-engine/types';
import { imageAssets } from '../../../utils/cosAssets';

const props = defineProps<{
  playableCase: PlayableCaseDefinition;
  state: CaseFlowState;
}>();

const jiangMaskSurveyStageImage = imageAssets.jiangMaskSurveyStage;

const emit = defineEmits<{
  inspectHotspot: [hotspotId: string];
  unlockRoom: [roomId: string];
  completeAndGo: [areaId: 'survey', nextAreaId: 'search'];
}>();

const activeHotspotId = ref('');
const roomDialogVisible = ref(false);
const passwordDigits = ref([0, 0, 0, 0]);
const passwordError = ref('');
const activeHotspot = computed<CaseSurveyHotspot | null>(
  () => props.playableCase.survey?.hotspots.find((item) => item.id === activeHotspotId.value) ?? null,
);
const privateRoom = computed(() => props.playableCase.survey?.privateRoom ?? null);
const roomPassword = computed(() => passwordDigits.value.join(''));
const isPrivateRoomUnlocked = computed(
  () => Boolean(privateRoom.value && props.state.unlockedRoomIds.includes(privateRoom.value.id)),
);

function inspect(hotspot: CaseSurveyHotspot) {
  activeHotspotId.value = hotspot.id;
  emit('inspectHotspot', hotspot.id);

  if (hotspot.id === 'office-note' && privateRoom.value) {
    roomDialogVisible.value = true;
  }
}

function unlockPrivateRoom() {
  if (!privateRoom.value) {
    return;
  }

  if (roomPassword.value !== privateRoom.value.password) {
    passwordError.value = '密码错误。';
    return;
  }

  passwordError.value = '';
  emit('unlockRoom', privateRoom.value.id);
  roomDialogVisible.value = true;
}

function stepPasswordDigit(index: number, direction: 1 | -1) {
  passwordDigits.value[index] = (passwordDigits.value[index] + direction + 10) % 10;
  passwordError.value = '';
}
</script>

<template>
  <section class="jiang-survey-area">
    <div class="survey-stage">
      <header class="survey-stage-header">
        <div>
          <p class="eyebrow">FIELD SURVEY</p>
          <h2>{{ playableCase.survey?.title }}</h2>
        </div>
        <el-button type="danger" @click="emit('completeAndGo', 'survey', 'search')">
          前往检索区
        </el-button>
      </header>

      <div class="stage-illustration" :aria-label="playableCase.survey?.imageAlt">
        <img class="stage-scene-image" :src="jiangMaskSurveyStageImage" alt="冬祭后台现场图" />
        <div class="stage-fallback-scene">
          <div class="stage-beam"></div>
          <div class="stage-curtain"></div>
          <div class="stage-floor"></div>
          <div class="stage-altar">香案</div>
          <div class="stage-cabinet">面具柜</div>
          <div class="stage-body">何敬山</div>
        </div>
        <button
          v-for="hotspot in playableCase.survey?.hotspots"
          :key="hotspot.id"
          class="hotspot"
          :class="{ inspected: state.inspectedHotspotIds.includes(hotspot.id) }"
          :style="hotspot.style"
          type="button"
          @click="inspect(hotspot)"
        >
          <span>{{ hotspot.label }}</span>
        </button>
        <div v-if="activeHotspot" class="scene-observation-panel" aria-live="polite">
          <strong>{{ activeHotspot.label }}</strong>
          <p>{{ activeHotspot.observation }}</p>
        </div>
      </div>
    </div>

    <el-dialog
      v-if="privateRoom"
      v-model="roomDialogVisible"
      class="private-room-dialog"
      :title="privateRoom.title"
      width="520px"
    >
      <div class="private-room-card">
        <template v-if="!isPrivateRoomUnlocked">
          <p>{{ privateRoom.lockedText }}</p>
          <small v-if="privateRoom.passwordHint">{{ privateRoom.passwordHint }}</small>
          <div class="room-password-row">
            <div class="room-digit-selectors" aria-label="房间密码">
              <div
                v-for="(_, index) in passwordDigits"
                :key="index"
                class="digit-selector"
              >
                <button class="digit-up" type="button" @click="stepPasswordDigit(index, 1)">
                  +
                </button>
                <strong>{{ passwordDigits[index] }}</strong>
                <button class="digit-down" type="button" @click="stepPasswordDigit(index, -1)">
                  -
                </button>
              </div>
            </div>
            <el-button class="room-enter-button" type="danger" @click="unlockPrivateRoom">进入</el-button>
          </div>
          <p v-if="passwordError" class="room-error">{{ passwordError }}</p>
        </template>
        <template v-else>
          <h4 v-if="privateRoom.unlockedTitle">{{ privateRoom.unlockedTitle }}</h4>
          <p>{{ privateRoom.unlockedBody }}</p>
        </template>
      </div>
    </el-dialog>
  </section>
</template>

<style scoped lang="less">
.jiang-survey-area {
  display: block;
}

.survey-stage {
  border: 1px solid var(--case-border);
  border-radius: var(--case-radius);
  background: var(--case-panel);
  box-shadow: var(--case-shadow);
}

.survey-stage {
  padding: 18px;
}

.survey-stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.survey-stage-header h2,
.survey-stage-header p {
  margin: 0;
}

.survey-stage-header :deep(.el-button) {
  flex: 0 0 auto;
}

.stage-illustration {
  position: relative;
  aspect-ratio: 16 / 9;
  min-height: min(520px, calc(100vh - 260px));
  margin-top: 14px;
  border-radius: 10px;
  overflow: hidden;
  background:
    radial-gradient(circle at 52% 58%, rgba(121, 26, 22, 0.18), transparent 12%),
    linear-gradient(180deg, #171310 0%, #30241e 54%, #4d382d 100%);
}

.stage-scene-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.stage-fallback-scene {
  position: absolute;
  inset: 0;
  display: none;
}

.stage-beam {
  position: absolute;
  left: 12%;
  right: 12%;
  top: 18%;
  height: 16px;
  background: #4e3528;
  box-shadow: 0 12px 0 #291d18;
}

.stage-curtain {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 0;
  height: 34%;
  background: repeating-linear-gradient(90deg, #421714, #421714 18px, #2a0d0b 20px);
  opacity: 0.55;
}

.stage-floor {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 34%;
  background: linear-gradient(160deg, #5a4638, #2a211d);
}

.stage-altar,
.stage-cabinet,
.stage-body {
  position: absolute;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 238, 214, 0.28);
  color: rgba(255, 238, 214, 0.86);
}

.stage-altar {
  left: 58%;
  top: 56%;
  width: 18%;
  height: 14%;
}

.stage-cabinet {
  right: 10%;
  top: 24%;
  width: 16%;
  height: 24%;
}

.stage-body {
  left: 40%;
  top: 52%;
  width: 18%;
  height: 20%;
  border-radius: 50% 50% 18% 18%;
}

.hotspot {
  position: absolute;
  z-index: 2;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: #ffd15c;
  box-shadow: 0 0 0 8px rgba(255, 209, 92, 0.18);
  cursor: pointer;
}

.hotspot.inspected {
  background: #e34d3d;
}

.hotspot span {
  position: absolute;
  left: 22px;
  top: -6px;
  display: none;
  white-space: nowrap;
  border-radius: 6px;
  background: rgba(21, 17, 15, 0.88);
  color: #fff;
  padding: 5px 8px;
}

.hotspot:hover span {
  display: block;
}

.scene-observation-panel {
  position: absolute;
  left: 50%;
  bottom: 20px;
  z-index: 3;
  width: min(620px, calc(100% - 144px));
  transform: translateX(-50%);
  border: 1px solid rgba(255, 229, 184, 0.16);
  border-radius: 28px;
  padding: 14px 26px 16px;
  background: rgba(0, 0, 0, 0.78);
  color: #fff8ed;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(12px);
}

.scene-observation-panel strong {
  display: block;
  margin-bottom: 5px;
  color: #e94b3d;
  font-size: 13px;
  line-height: 1.2;
}

.scene-observation-panel p {
  margin: 0;
  text-align: left;
  line-height: 1.7;
  font-size: 16px;
  font-weight: 650;
}

.private-room-card {
  display: grid;
  gap: 10px;
  margin-top: auto;
  border: 1px solid rgba(88, 66, 52, 0.18);
  border-radius: 10px;
  padding: 14px;
  background:
    linear-gradient(135deg, rgba(70, 42, 32, 0.06), rgba(177, 37, 44, 0.04)),
    #fffaf5;
}

.private-room-card h3,
.private-room-card h4,
.private-room-card p {
  margin: 0;
}

.private-room-card small {
  color: var(--case-muted);
}

.room-password-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.room-digit-selectors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.digit-selector {
  display: grid;
  grid-template-rows: 28px 46px 28px;
  align-items: center;
  justify-items: center;
  border: 1px solid rgba(88, 66, 52, 0.18);
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}

.digit-selector strong {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-block: 1px solid rgba(88, 66, 52, 0.12);
  color: #211916;
  font-size: 26px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.digit-selector button {
  width: 100%;
  height: 100%;
  border: 0;
  background: #f6eee6;
  color: #7a3a2c;
  cursor: pointer;
}

.digit-selector button:hover {
  background: #ead9cb;
}

.room-error {
  color: var(--case-danger);
}

.eyebrow {
  color: var(--case-muted);
}

@media (max-width: 980px) {
  .survey-stage-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stage-illustration {
    min-height: 430px;
  }

  .scene-observation-panel {
    left: 50%;
    width: calc(100% - 56px);
    border-radius: 22px;
  }
}

@media (max-width: 640px) {
  .room-password-row {
    grid-template-columns: 1fr;
  }

  .stage-illustration {
    min-height: 360px;
  }

  .scene-observation-panel {
    left: 50%;
    width: calc(100% - 20px);
    bottom: 10px;
  }
}
</style>
