<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  Check,
  Connection,
  Files,
  VideoCamera,
} from '@element-plus/icons-vue';
import { gsap } from 'gsap';
import {
  chapterById,
  evidences,
  investigatorProfile,
  prologueCaseFile,
  prologueBeats,
  squadMembers,
  type PrologueChatMessage,
  type PrologueBeat,
} from '../data/case';
import { useGameContext } from '../context/gameContext';
import { imageAssets } from '../utils/cosAssets';
import { getSquadAvatarStyle } from '../utils/squadAvatars';

const prologueCctvUrl = imageAssets.prologueCctvFrame;

const router = useRouter();
const { state, collectEvidence, advanceChapter } = useGameContext();
const prologue = chapterById.prologue;
const caseRoot = ref<HTMLElement | null>(null);
const activeBeatId = ref(prologueBeats[0]?.id ?? '');
const isCaseFileOpen = ref(false);
let ctx: gsap.Context | undefined;

onMounted(() => {
  if (!caseRoot.value) {
    return;
  }

  ctx = gsap.context(() => {
    gsap.from('.intro-animate', {
      autoAlpha: 0,
      y: 18,
      duration: 0.32,
      ease: 'power2.out',
      stagger: 0.05,
      clearProps: 'opacity,visibility,transform',
    });
  }, caseRoot.value);
});

onUnmounted(() => {
  ctx?.revert();
});

const prologueEvidences = computed(() =>
  prologue.evidenceIds.map((id) => evidences[id]),
);

const activeBeat = computed(
  () =>
    prologueBeats.find((beat) => beat.id === activeBeatId.value) ??
    prologueBeats[0],
);

const activeSpeaker = computed(() => squadMembers[activeBeat.value.speakerId]);

const chatContacts = computed(() => {
  const speakerIds = Array.from(
    new Set(prologueBeats.map((beat) => beat.speakerId)),
  );

  return speakerIds.map((speakerId) => {
    const beats = prologueBeats.filter((beat) => beat.speakerId === speakerId);
    const completedCount = beats.filter((beat) => isBeatSynced(beat)).length;

    return {
      speaker: squadMembers[speakerId],
      beats,
      completedCount,
      isActive: activeSpeaker.value.id === speakerId,
    };
  });
});

const activeThreadBeats = computed(() =>
  prologueBeats.filter((beat) => beat.speakerId === activeSpeaker.value.id),
);

const completedBeatIds = computed(() =>
  prologueBeats
    .filter(
      (beat) =>
        beat.evidenceId &&
        state.value.collectedEvidenceIds.includes(beat.evidenceId),
    )
    .map((beat) => beat.id),
);

const syncableBeatCount = computed(
  () => prologueBeats.filter((beat) => beat.evidenceId).length,
);

const isActiveBeatSynced = computed(
  () =>
    Boolean(activeBeat.value.evidenceId) &&
    state.value.collectedEvidenceIds.includes(activeBeat.value.evidenceId ?? ''),
);

const primaryActionLabel = computed(() =>
  isActiveBeatSynced.value ? '继续通讯' : activeBeat.value.actionLabel,
);

const canEnterSurvey = computed(() =>
  prologue.requiredEvidenceIds.every((id) =>
    state.value.collectedEvidenceIds.includes(id),
  ),
);

function syncBeat() {
  if (activeBeat.value.evidenceId && !isActiveBeatSynced.value) {
    collectEvidence(activeBeat.value.evidenceId);
  }

  const currentIndex = prologueBeats.findIndex(
    (beat) => beat.id === activeBeat.value.id,
  );
  const nextBeat = prologueBeats[currentIndex + 1];

  if (nextBeat) {
    activeBeatId.value = nextBeat.id;
    return;
  }

  if (canEnterSurvey.value) {
    enterSurvey();
  }
}

function enterSurvey() {
  advanceChapter('prologue');
  void router.push('/demo/survey');
}

function isBeatSynced(beat: PrologueBeat) {
  return Boolean(
    beat.evidenceId && state.value.collectedEvidenceIds.includes(beat.evidenceId),
  );
}

function selectChat(speakerId: string) {
  const firstBeat = prologueBeats.find((beat) => beat.speakerId === speakerId);

  if (firstBeat) {
    activeBeatId.value = firstBeat.id;
  }
}

function getMessageLabel(message: PrologueChatMessage) {
  if (message.from === 'player') {
    return investigatorProfile.codeName;
  }

  if (message.from === 'system') {
    return '系统';
  }

  return activeSpeaker.value.name;
}

function openCaseFile(fileId: string) {
  if (fileId === prologueCaseFile.id) {
    isCaseFileOpen.value = true;
  }
}

</script>

<template>
  <section ref="caseRoot" class="route-page case-route case-intro-route">
    <el-row :gutter="18" class="case-intro-grid">
      <el-col :span="15">
        <el-card shadow="never" class="hero-card intro-animate dispatch-card">
          <div class="dispatch-header">
            <div>
              <p class="eyebrow">加密调令 / CASE E-09</p>
              <h2>你被接入《有诡电梯》专案</h2>
              <p>
                这不是资料库浏览任务。你将作为随案调查员进入银港大厦，
                由特案组成员通过通讯把现场、档案和复盘交给你。
              </p>
            </div>
            <el-tag type="danger" effect="dark">首次出现场</el-tag>
          </div>

          <el-descriptions :column="2" border class="investigator-card">
            <el-descriptions-item label="你的代号">
              {{ investigatorProfile.codeName }}
            </el-descriptions-item>
            <el-descriptions-item label="身份">
              {{ investigatorProfile.role }}
            </el-descriptions-item>
            <el-descriptions-item label="任务">
              {{ investigatorProfile.assignment }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              {{ investigatorProfile.status }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="section-card intro-animate briefing-card">
          <template #header>
            <div class="card-header">
              <div>
                <p class="eyebrow">特案组通讯</p>
                <h2>先听他们把你带进案子</h2>
              </div>
              <el-tag effect="plain" type="danger">
                {{ completedBeatIds.length }}/{{ syncableBeatCount }} 材料已同步
              </el-tag>
            </div>
          </template>

          <div class="comms-window" aria-label="特案组通讯记录">
            <aside class="chat-contact-list" aria-label="通讯联系人">
              <button
                v-for="contact in chatContacts"
                :key="contact.speaker.id"
                class="chat-contact"
                :class="{ active: contact.isActive }"
                type="button"
                @click="selectChat(contact.speaker.id)"
              >
                <span
                  class="speaker-avatar squad-avatar"
                  :style="getSquadAvatarStyle(contact.speaker.id)"
                  :aria-label="contact.speaker.name"
                />
                <span class="contact-copy">
                  <strong>{{ contact.speaker.name }}</strong>
                  <small>{{ contact.speaker.role }}</small>
                </span>
                <el-tag
                  v-if="contact.completedCount"
                  size="small"
                  type="success"
                  effect="plain"
                >
                  {{ contact.completedCount }}
                </el-tag>
              </button>
            </aside>

            <section class="chat-thread-panel">
              <div class="chat-thread-header">
                <div
                  class="speaker-avatar squad-avatar"
                  :style="getSquadAvatarStyle(activeSpeaker.id)"
                  :aria-label="activeSpeaker.name"
                />
                <div>
                  <p class="eyebrow">SECURE CHAT / {{ activeBeat.eyebrow }}</p>
                  <h3>{{ activeSpeaker.name }} / {{ activeSpeaker.role }}</h3>
                </div>
              </div>

              <div class="chat-records">
                <template v-for="beat in activeThreadBeats" :key="beat.id">
                  <div class="chat-date-line">
                    <span>{{ beat.eyebrow }}</span>
                    <el-tag
                      v-if="isBeatSynced(beat)"
                      size="small"
                      type="success"
                      effect="plain"
                    >
                      已同步
                    </el-tag>
                  </div>
                  <article
                    v-for="message in beat.messages"
                    :key="message.id"
                    class="chat-record"
                    :class="[`from-${message.from}`]"
                  >
                    <div
                      v-if="message.from === 'squad'"
                      class="speaker-avatar chat-avatar squad-avatar"
                      :style="getSquadAvatarStyle(activeSpeaker.id)"
                      :aria-label="activeSpeaker.name"
                    />
                    <div class="message-bubble">
                      <div class="message-meta">
                        <strong>{{ getMessageLabel(message) }}</strong>
                        <small v-if="message.time">{{ message.time }}</small>
                      </div>
                      <p>{{ message.text }}</p>
                      <button
                        v-if="message.attachment"
                        class="chat-attachment-card"
                        type="button"
                        @click="openCaseFile(message.attachment.fileId)"
                      >
                        <span class="attachment-icon">档</span>
                        <span>
                          <strong>{{ message.attachment.title }}</strong>
                          <small>{{ message.attachment.summary }}</small>
                        </span>
                      </button>
                    </div>
                    <div
                      v-if="message.from === 'player'"
                      class="speaker-avatar chat-avatar player-avatar"
                    >
                      我
                    </div>
                  </article>
                </template>
              </div>
            </section>

            <div class="transmission-actions">
              <div class="active-message-status">
                <el-icon>
                  <Check v-if="isActiveBeatSynced" />
                  <Connection v-else />
                </el-icon>
                <span>
                  {{
                    isActiveBeatSynced
                      ? '当前通讯材料已经同步到案件区'
                      : '当前通讯等待你确认同步'
                  }}
                </span>
              </div>
              <el-button
                type="danger"
                :icon="Files"
                @click="syncBeat"
              >
                {{ primaryActionLabel }}
              </el-button>
              <el-button
                :icon="ArrowRight"
                :disabled="!canEnterSurvey"
                @click="enterSurvey"
              >
                进入勘查区
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="9">
        <el-card shadow="never" class="section-card intro-animate monitor-briefing-card">
          <template #header>
            <div class="clue-column-header">
              <strong>首段异常监控</strong>
              <el-tag effect="plain" type="danger">00:11:48 断帧</el-tag>
            </div>
          </template>
          <div class="case-brief-panel">
            <div class="mini-monitor">
              <img
                class="cctv-preview-image"
                :src="prologueCctvUrl"
                alt="货梯异常监控帧，画面聚焦楼层显示 09"
              />
              <div class="monitor-noise"></div>
              <div class="cctv-static-burst"></div>
            </div>
          </div>
          <p class="monitor-caption">
            你第一次看到数字 09 时，通讯里安静了一秒。没人说“鬼”，但每个人都在等你指出哪里不对。
          </p>
        </el-card>

        <el-card shadow="never" class="section-card intro-animate synced-file-card">
          <template #header>
            <div class="clue-column-header">
              <strong>已同步材料</strong>
              <el-tag effect="plain">{{ state.collectedEvidenceIds.length }} 条</el-tag>
            </div>
          </template>
          <el-space direction="vertical" alignment="stretch" fill>
            <div
              v-for="evidence in prologueEvidences"
              :key="evidence.id"
              class="synced-file-row"
              :class="{ synced: state.collectedEvidenceIds.includes(evidence.id) }"
            >
              <el-icon>
                <Check v-if="state.collectedEvidenceIds.includes(evidence.id)" />
                <VideoCamera v-else />
              </el-icon>
              <div>
                <strong>{{ evidence.title }}</strong>
                <span>{{ evidence.content }}</span>
              </div>
            </div>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="isCaseFileOpen"
      width="720px"
      class="case-file-dialog"
      destroy-on-close
    >
      <template #header>
        <div>
          <p class="eyebrow">{{ prologueCaseFile.caseNo }}</p>
          <h2 class="drawer-title">{{ prologueCaseFile.title }}</h2>
        </div>
      </template>

      <el-alert
        :title="prologueCaseFile.warning"
        type="warning"
        show-icon
        :closable="false"
      />

      <div class="case-file-body">
        <section
          v-for="section in prologueCaseFile.sections"
          :key="section.title"
          class="case-file-section"
        >
          <h3>{{ section.title }}</h3>
          <p>{{ section.body }}</p>
        </section>
      </div>

      <template #footer>
        <el-button @click="isCaseFileOpen = false">关闭档案</el-button>
        <el-button type="danger" @click="isCaseFileOpen = false">
          已了解背景
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>
