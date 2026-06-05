<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <section class="route-page locked-route">
    <el-card shadow="never" class="locked-workspace">
      <el-result
        icon="info"
        title="第二章：见鬼十法"
        sub-title="第一章闭环完成。这里将接入授权章节梗概、传闻对照和第二章证据链。"
      >
        <template #extra>
          <el-button @click="router.push('/case')">返回案件区</el-button>
        </template>
      </el-result>
    </el-card>
  </section>
</template>
