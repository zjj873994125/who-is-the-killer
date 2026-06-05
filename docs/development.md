# 开发说明

## 项目结构

```text
src/
  App.vue
  main.ts
  router.ts
  components/
    AppWorkspace.vue
    ContentWarning.vue
    EvidenceDetailDrawer.vue
    GuidedElevatorReplay.vue
  context/
    gameContext.ts
  data/
    case.ts
  stores/
    gameState.ts
  styles/
    theme.less
  views/
    CaseView.vue
    SurveyView.vue
    CluesView.vue
    ReplayView.vue
    LockedView.vue
tests/
  case-data.test.ts
  game-state.test.ts
  router.test.ts
```

## 核心模块

### `src/data/case.ts`

维护静态案件数据：

- 章节列表
- 证据数据
- 复盘题
- 章节 id 到章节对象的映射

新增章节或证据时，优先更新这里。

### `src/stores/gameState.ts`

维护纯状态逻辑：

- 初始存档
- 收集证据
- 章节推进
- 复盘验证
- 提示层级
- localStorage 序列化

这里尽量保持纯函数，方便测试。

### `src/context/gameContext.ts`

用 Vue provide/inject 向路由页面提供游戏状态和操作函数，避免在每个页面重复传深层 props。

### `src/router.ts`

定义工作区路由：

- `/case`
- `/survey`
- `/clues`
- `/replay`
- `/story`
- `/locked`

## 动画规范

动画使用 GSAP。

要求：

- Vue 组件内使用 `onMounted` 后创建动画。
- 使用 `gsap.context()` 限定选择器作用域。
- 在 `onUnmounted` 里调用 `ctx.revert()` 或 `timeline.kill()`。
- 优先动画 `transform` 和 `autoAlpha`。
- 不动画 `width`、`height`、`top`、`left`。
- 尊重 `prefers-reduced-motion`。

## 测试

当前测试覆盖：

- 案件数据完整性
- 状态推进和复盘解锁
- 路由工作区拆分

运行：

```bash
npm test
```

## 构建

```bash
npm run build
```

Element Plus 会带来较大的首包体积，当前构建可能出现 chunk size warning。首版本地 demo 可接受；如果后续需要发布，应考虑按需导入 Element Plus 或拆分路由 chunk。
