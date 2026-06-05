<script setup lang="ts">
import type { Evidence } from '../data/case';

defineProps<{
  evidence: Evidence | null;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <el-drawer
    :model-value="Boolean(evidence)"
    direction="rtl"
    size="420px"
    title="证据详情"
    @close="emit('close')"
  >
    <template v-if="evidence">
      <el-space direction="vertical" alignment="stretch" :size="16" fill>
        <div>
          <p class="eyebrow">EVIDENCE / {{ evidence.type }}</p>
          <h2 class="drawer-title">{{ evidence.title }}</h2>
        </div>
        <el-alert
          v-if="evidence.severity !== 'normal'"
          :title="evidence.severity === 'critical' ? '高强度案卷内容' : '不适线索提示'"
          type="warning"
          show-icon
          :closable="false"
        />
        <p class="drawer-primary">{{ evidence.content }}</p>
        <p class="drawer-secondary">{{ evidence.detail }}</p>
      </el-space>
    </template>
  </el-drawer>
</template>
