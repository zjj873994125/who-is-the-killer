<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Files, Search } from '@element-plus/icons-vue';
import {
  chapterById,
  sceneObservationPoints,
  squadMembers,
  type SceneObservationPoint,
} from '../data/case';
import { useGameContext } from '../context/gameContext';
import elevatorSceneUrl from '../assets/elevator-scene.png';
import { getSquadAvatarStyle } from '../utils/squadAvatars';

const router = useRouter();
const { state, discoverKeyword } = useGameContext();
const chapter = chapterById['chapter-1'];
const activePoint = ref<SceneObservationPoint | null>(null);

const discoveredPointIds = computed(() =>
  sceneObservationPoints
    .filter((point) =>
      point.discoveredKeywords.every((keyword) =>
        state.value.discoveredKeywords.includes(keyword),
      ),
    )
    .map((point) => point.id),
);

const inspectedPointCount = computed(() => discoveredPointIds.value.length);

function inspectPoint(point: SceneObservationPoint) {
  activePoint.value = point;

  for (const keyword of point.discoveredKeywords) {
    discoverKeyword(keyword);
  }
}

function isPointInspected(point: SceneObservationPoint) {
  return discoveredPointIds.value.includes(point.id);
}
</script>

<template>
  <section class="route-page survey-route">
    <el-card shadow="never" class="section-card scene-arrival-card">
      <div class="arrival-briefing">
        <div
          class="briefing-avatar squad-avatar"
          :style="getSquadAvatarStyle(squadMembers.hualong.id)"
          :aria-label="squadMembers.hualong.name"
        />
        <div>
          <p class="eyebrow">银港大厦 B 座 / 货梯封锁线外</p>
          <h2>你抵达现场，货梯门还开着</h2>
          <p>
            {{ squadMembers.hualong.name }}在通讯里压低声音：先别碰案卷。
            看门、看按钮、看显示屏。你找到的每个异常，都会变成档案终端里的检索方向。
          </p>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="hero-card survey-workbench-card">
      <template #header>
        <div class="card-header">
          <div>
            <p class="eyebrow">勘查区 / 现场模拟</p>
            <h2>不要查案卷，先观察现场异常</h2>
          </div>
          <el-space>
            <el-tag effect="plain" type="danger">
              已观察 {{ inspectedPointCount }}/{{ sceneObservationPoints.length }}
            </el-tag>
            <el-button :icon="Files" @click="router.push('/clues')">
              打开档案检索
            </el-button>
          </el-space>
        </div>
      </template>

      <el-row :gutter="18">
        <el-col :span="16">
          <div class="scene-stage" aria-label="电梯现场模拟勘查">
            <div class="monitor-noise"></div>
            <img
              class="scene-background"
              :src="elevatorSceneUrl"
              alt="电梯轿厢现场，包含楼层显示、按钮面板、摄像头、检修口与遮挡轮廓"
            />

            <button
              v-for="point in sceneObservationPoints"
              :key="point.id"
              class="scene-hotspot"
              :class="{
                inspected: isPointInspected(point),
                critical: point.severity === 'critical',
              }"
              type="button"
              :style="{ left: `${point.x}%`, top: `${point.y}%` }"
              :aria-label="`勘查现场点位：${point.title}`"
              @click="inspectPoint(point)"
            >
              <span class="hotspot-dot" aria-hidden="true"></span>
              <span class="hotspot-label">
                <strong>{{ point.locationLabel }}</strong>
                <span>{{ point.title }}</span>
              </span>
            </button>
          </div>
        </el-col>

        <el-col :span="8">
          <el-space direction="vertical" alignment="stretch" :size="14" fill>
            <el-alert
              title="你现在只是在现场观察。正式证据需要根据观察内容去线索区检索归档。"
              type="warning"
              show-icon
              :closable="false"
            />
            <el-descriptions :column="1" border>
              <el-descriptions-item label="勘查目标">
                {{ chapter.objective }}
              </el-descriptions-item>
              <el-descriptions-item label="苏眉提醒">
                死者姿态和门缝痕迹要分开看，不要先套结论。
              </el-descriptions-item>
              <el-descriptions-item label="当前规则">
                现场观察异常，档案终端查证据。
              </el-descriptions-item>
              <el-descriptions-item label="复盘条件">
                检索归档第一章全部线索后进入复盘。
              </el-descriptions-item>
            </el-descriptions>

            <el-card shadow="never" class="keyword-panel">
              <template #header>
                <div class="clue-column-header">
                  <strong>观察记录</strong>
                  <el-tag effect="plain">{{ inspectedPointCount }} 处</el-tag>
                </div>
              </template>
              <el-empty
                v-if="!discoveredPointIds.length"
                description="尚未观察现场"
                :image-size="68"
              />
              <el-space v-else direction="vertical" alignment="stretch" fill>
                <button
                  v-for="point in sceneObservationPoints.filter((item) =>
                    discoveredPointIds.includes(item.id),
                  )"
                  :key="point.id"
                  class="observation-card"
                  type="button"
                  @click="activePoint = point"
                >
                  <strong>{{ point.locationLabel }} / {{ point.title }}</strong>
                  <span>{{ point.description }}</span>
                </button>
              </el-space>
            </el-card>

            <el-button type="danger" :icon="Search" @click="router.push('/clues')">
              去档案终端检索
            </el-button>
          </el-space>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog
      :model-value="Boolean(activePoint)"
      width="520px"
      title="现场观察记录"
      destroy-on-close
      @close="activePoint = null"
    >
      <template v-if="activePoint">
        <el-space direction="vertical" alignment="stretch" :size="14" fill>
          <div>
            <p class="eyebrow">{{ activePoint.locationLabel }} / SCENE NOTE</p>
            <h2 class="drawer-title">{{ activePoint.title }}</h2>
          </div>
          <p class="drawer-primary">{{ activePoint.description }}</p>
          <p class="drawer-secondary">
            记录已同步到档案终端。请根据观察内容自行输入检索词。
          </p>
        </el-space>
      </template>
      <template #footer>
        <el-button @click="activePoint = null">继续勘查</el-button>
        <el-button type="danger" @click="router.push('/clues')">
          去检索
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>
