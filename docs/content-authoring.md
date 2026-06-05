# 内容接入说明

## 内容来源

用户声明已获得《十宗罪2·有诡电梯》的正式授权。当前项目保留了适合接入授权梗概的结构，但仓库内文本仍以结构化占位和游戏化改写为主。

## 推荐接入方式

优先提供章节梗概，而不是直接粘贴大段原文。

每章建议整理为：

```text
章节名：
剧情目标：
关键人物：
现场空间：
关键证据：
误导线索：
推理问题：
正确证据组合：
章节结尾：
```

## 第一章字段映射

第一章内容主要映射到 `src/data/case.ts`。

### 章节信息

更新 `chapters` 中 `chapter-1`：

- `title`
- `summary`
- `objective`
- `evidenceIds`
- `requiredEvidenceIds`
- `replayQuestionId`

### 证据信息

更新 `evidences`：

- `title`：证据标题
- `type`：证据类型
- `content`：玩家第一眼看到的案卷摘要
- `detail`：线索详情区展示的补充说明
- `severity`：内容强度
- `clueBucket`：线索归档分类
- `isCritical`：是否为关键证据

### 复盘题

更新 `replayQuestions['replay-chapter-1']`：

- `prompt`
- `candidateEvidenceIds`
- `correctEvidenceIds`
- `successSummary`
- `failureHint`

## 内容强度规范

- 可保留原作强度的成人、猎奇、心理犯罪线索。
- 页面默认用警方案卷、证词摘要、遮挡说明呈现。
- 不建议加入露骨插画、动图或无关冲击素材。
- 高强度证据应设置 `severity: 'disturbing'` 或 `severity: 'critical'`。

## 文案原则

- 每条证据只承载一个推理作用。
- 不把答案直接写进证据标题。
- 玩家需要通过多个证据之间的矛盾得出结论。
- 交互提示可以明确，但推理结论要留给复盘区验证。
