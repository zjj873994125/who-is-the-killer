<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowLeft, ChatLineRound, Close } from '@element-plus/icons-vue';
import type { CaseContactThread } from '../types';
import { getSquadAvatarStyle } from '../../utils/squadAvatars';

const props = defineProps<{
  contacts?: CaseContactThread[];
}>();

const isOpen = ref(false);
const activeThreadId = ref<string | null>(null);

const activeThread = computed(
  () => props.contacts?.find((thread) => thread.id === activeThreadId.value) ?? null,
);
const messageBadgeCount = computed(
  () =>
    props.contacts?.reduce(
      (total, thread) =>
        total + thread.messages.filter((message) => message.from === 'other').length,
      0,
    ) ?? 0,
);
const messageBadgeText = computed(() =>
  messageBadgeCount.value > 99 ? '99+' : String(messageBadgeCount.value),
);
const phoneButtonLabel = computed(() => {
  if (isOpen.value) {
    return '关闭手机通讯';
  }

  return messageBadgeCount.value > 0
    ? `打开手机通讯，${messageBadgeText.value} 条消息`
    : '打开手机通讯';
});

function togglePhone() {
  isOpen.value = !isOpen.value;

  if (!isOpen.value) {
    activeThreadId.value = null;
  }
}

function closePhone() {
  isOpen.value = false;
  activeThreadId.value = null;
}

function avatarStyle(thread?: CaseContactThread | null) {
  return thread?.avatarId ? getSquadAvatarStyle(thread.avatarId) : undefined;
}
</script>

<template>
  <button
    v-if="contacts?.length"
    class="phone-fab"
    type="button"
    :aria-label="phoneButtonLabel"
    :aria-pressed="isOpen"
    @click="togglePhone"
  >
    <el-icon><ChatLineRound /></el-icon>
    <span v-if="messageBadgeCount" class="phone-fab-badge">{{ messageBadgeText }}</span>
  </button>

  <Transition name="phone-panel">
    <section v-if="isOpen" class="phone-shell" aria-label="手机通讯">
      <div class="phone-device">
        <header class="phone-status">
          <span>22:17</span>
          <i></i>
          <button type="button" aria-label="关闭手机通讯" @click="closePhone">
            <el-icon><Close /></el-icon>
          </button>
        </header>

        <section v-if="!activeThread" class="phone-screen">
          <header class="phone-title">
            <h2>通讯</h2>
            <span>{{ contacts?.length ?? 0 }} 个联系人</span>
          </header>

          <button
            v-for="thread in contacts"
            :key="thread.id"
            class="phone-thread"
            type="button"
            @click="activeThreadId = thread.id"
          >
            <span class="phone-avatar" :style="avatarStyle(thread)">
              {{ thread.avatarId ? '' : thread.avatarText }}
            </span>
            <span class="phone-thread-copy">
              <strong>{{ thread.name }}</strong>
              <small>{{ thread.messages[thread.messages.length - 1]?.text }}</small>
            </span>
            <em>{{ thread.role }}</em>
          </button>
        </section>

        <section v-else class="phone-screen chat-screen">
          <header class="chat-header">
            <button type="button" aria-label="返回聊天列表" @click="activeThreadId = null">
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <span>
              <strong>{{ activeThread.name }}</strong>
              <small>{{ activeThread.role }}</small>
            </span>
          </header>

          <div class="phone-bubbles">
            <article
              v-for="(message, index) in activeThread.messages"
              :key="`${activeThread.id}-${index}`"
              class="phone-bubble-row"
              :class="message.from"
            >
              <span
                class="phone-avatar small"
                :class="{ self: message.from === 'self' }"
                :style="message.from === 'self' ? undefined : avatarStyle(activeThread)"
              >
                {{ message.from === 'self' ? '我' : activeThread.avatarId ? '' : activeThread.avatarText }}
              </span>
              <p>{{ message.text }}</p>
            </article>
          </div>
        </section>
      </div>
    </section>
  </Transition>
</template>

<style scoped lang="less">
.phone-fab {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 30;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(159, 44, 36, 0.3);
  border-radius: 18px;
  background: #201916;
  color: #fff7ee;
  box-shadow: 0 16px 38px rgba(40, 25, 17, 0.26);
  cursor: pointer;
}

.phone-fab-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  display: grid;
  min-width: 22px;
  height: 22px;
  place-items: center;
  padding: 0 6px;
  border: 2px solid #f3f5f7;
  border-radius: 999px;
  background: #e22b2b;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 8px 18px rgba(226, 43, 43, 0.32);
}

.phone-fab:hover {
  background: var(--case-danger);
}

.phone-shell {
  position: fixed;
  right: 24px;
  bottom: 92px;
  z-index: 31;
}

.phone-device {
  width: min(360px, calc(100vw - 32px));
  height: min(680px, calc(100vh - 118px));
  display: grid;
  grid-template-rows: auto 1fr;
  border: 10px solid #161210;
  border-radius: 34px;
  background: #161210;
  box-shadow: 0 28px 70px rgba(24, 16, 12, 0.34);
  overflow: hidden;
}

.phone-status {
  height: 42px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 12px;
  background: #161210;
  color: #f8eee4;
  font-size: 12px;
}

.phone-status i {
  width: 86px;
  height: 22px;
  border-radius: 999px;
  background: #050505;
}

.phone-status button,
.chat-header button {
  justify-self: end;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.phone-screen {
  min-height: 0;
  overflow: auto;
  background: #f2eee8;
}

.phone-title,
.chat-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 16px;
  background: rgba(246, 242, 235, 0.96);
  border-bottom: 1px solid #dfd4c8;
}

.phone-title h2 {
  margin: 0 0 4px;
}

.phone-title span,
.chat-header small {
  color: #7c6b5a;
}

.phone-thread {
  width: calc(100% - 24px);
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin: 10px 12px;
  padding: 12px;
  border: 1px solid #e2d7ca;
  border-radius: 14px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.phone-avatar {
  width: 46px;
  height: 46px;
  display: grid;
  overflow: hidden;
  place-items: center;
  border-radius: 15px;
  background: #2b211d;
  background-repeat: no-repeat;
  background-size: 200% 200%;
  color: #f8eee4;
  font-weight: 800;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    0 8px 18px rgba(46, 31, 22, 0.12);
}

.phone-avatar.small {
  width: 32px;
  height: 32px;
  border-radius: 11px;
  flex: 0 0 auto;
}

.phone-avatar.self {
  background: #7b2f28;
}

.phone-thread-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.phone-thread-copy small {
  overflow: hidden;
  color: #7c6b5a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phone-thread em {
  color: var(--case-danger);
  font-size: 12px;
  font-style: normal;
}

.chat-header {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 8px;
  align-items: center;
}

.chat-header span {
  display: grid;
  gap: 2px;
}

.phone-bubbles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.phone-bubble-row {
  display: flex;
  gap: 8px;
  max-width: 88%;
}

.phone-bubble-row.self {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.phone-bubble-row p {
  margin: 0;
  border-radius: 15px;
  padding: 10px 12px;
  background: #fff;
  line-height: 1.65;
  box-shadow: 0 8px 18px rgba(46, 31, 22, 0.06);
}

.phone-bubble-row.self p {
  background: #dcefd6;
}

.phone-panel-enter-active,
.phone-panel-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.phone-panel-enter-from,
.phone-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

@media (max-width: 640px) {
  .phone-shell {
    right: 12px;
    left: 12px;
  }

  .phone-device {
    width: 100%;
  }
}
</style>
