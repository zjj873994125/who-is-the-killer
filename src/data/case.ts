export type EvidenceType =
  | 'scene'
  | 'monitor'
  | 'record'
  | 'testimony'
  | 'autopsy'
  | 'route';

export interface Evidence {
  id: string;
  chapterId: string;
  title: string;
  type: EvidenceType;
  content: string;
  detail: string;
  severity: 'normal' | 'disturbing' | 'critical';
  clueBucket: 'fact' | 'doubt' | 'unknown';
  isCritical: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  objective: string;
  evidenceIds: string[];
  requiredEvidenceIds: string[];
  replayQuestionId?: string;
  nextChapterId?: string;
  locked?: boolean;
}

export interface ReplayQuestion {
  id: string;
  chapterId: string;
  prompt: string;
  candidateEvidenceIds: string[];
  correctEvidenceIds: string[];
  reasoningQuestions: ReplayReasoningQuestion[];
  successSummary: string;
  failureHint: string;
}

export interface ReplayReasoningQuestion {
  id: string;
  title: string;
  prompt: string;
  options: ReplayReasoningOption[];
  correctOptionId: string;
  successFeedback: string;
  failureHint: string;
}

export interface ReplayReasoningOption {
  id: string;
  label: string;
}

export interface SceneObservationPoint {
  id: string;
  title: string;
  locationLabel: string;
  description: string;
  discoveredKeywords: string[];
  severity: 'normal' | 'disturbing' | 'critical';
  x: number;
  y: number;
}

export interface ArchiveSearchEntry {
  id: string;
  evidenceId: string;
  keywords: string[];
  title: string;
  abstract: string;
}

export interface InvestigatorProfile {
  codeName: string;
  role: string;
  assignment: string;
  status: string;
}

export interface SquadMember {
  id: string;
  name: string;
  role: string;
  signature: string;
  tone: string;
}

export interface PrologueBeat {
  id: string;
  speakerId: string;
  eyebrow: string;
  title: string;
  content: string;
  messages: PrologueChatMessage[];
  actionLabel: string;
  evidenceId?: string;
}

export interface PrologueChatMessage {
  id: string;
  from: 'squad' | 'player' | 'system';
  text: string;
  time?: string;
  attachment?: PrologueCaseFileAttachment;
}

export interface PrologueCaseFileAttachment {
  fileId: string;
  title: string;
  summary: string;
}

export interface PrologueCaseFile {
  id: string;
  title: string;
  caseNo: string;
  warning: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
}

export interface EvidenceBriefing {
  evidenceId: string;
  speakerId: string;
  comment: string;
}

export interface StoryBeat {
  id: string;
  time: string;
  title: string;
  body: string;
  evidenceIds: string[];
  imageId: string;
}

export interface StoryImage {
  id: string;
  title: string;
  caption: string;
  alt: string;
}

export interface ChapterResolutionStory {
  id: string;
  chapterId: string;
  title: string;
  subtitle: string;
  imageAlt: string;
  lead: string;
  fullStory: string[];
  images: StoryImage[];
  beats: StoryBeat[];
  closing: string;
}

export const investigatorProfile: InvestigatorProfile = {
  codeName: '调查员 09',
  role: '特案组随案记录员',
  assignment: '银港大厦货梯异常死亡案',
  status: '首次接入现场调查',
};

export const squadMembers: Record<string, SquadMember> = {
  baozhan: {
    id: 'baozhan',
    name: '包斩',
    role: '组长 / 案件定调',
    signature: 'BZ',
    tone: '先别信鬼，先信证据。',
  },
  hualong: {
    id: 'hualong',
    name: '画龙',
    role: '现场行动',
    signature: 'HL',
    tone: '电梯不会撒谎，让它撒谎的一定是人。',
  },
  sumei: {
    id: 'sumei',
    name: '苏眉',
    role: '尸检与行为观察',
    signature: 'SM',
    tone: '恐惧会留下姿态，别只看血迹。',
  },
  professor: {
    id: 'professor',
    name: '梁教授',
    role: '心理侧写',
    signature: 'L',
    tone: '传言不是事实，但传言会改变人的行动。',
  },
};

export const prologueCaseFile: PrologueCaseFile = {
  id: 'case-file-e09-background',
  title: '有诡电梯：案情背景',
  caseNo: 'CASE E-09 / 有诡电梯',
  warning:
    '这份档案是包斩整理给你的案情背景，含死亡案件、成人异常行为和封闭空间恐惧描述。当前版本不展示露骨图像。',
  sections: [
    {
      title: '一、那栋楼先出了怪事',
      body:
        '银港大厦是座老写字楼，白天人来人往，到了后半夜，只剩保安、清洁工和几盏亮着的走廊灯。出事的是 B 座那部货梯，平时没人愿意坐，因为它又旧又闷，门合上的时候声音特别沉。',
    },
    {
      title: '二、货梯开始自己动',
      body:
        '最早是夜班保安发现不对劲。值班室没人按呼叫，货梯却会在午夜以后自己上上下下。有时候停在 9 楼，有时候又像是多停了一层。保安去看，电梯门开着，里面空空的，只有楼层数字还亮着。',
    },
    {
      title: '三、大家开始说里面有鬼',
      body:
        '怪事传了几晚以后，楼里的人越说越邪。有员工说半夜听见货梯井里有声音，也有人说看见电梯停在不该停的楼层。原本只是设备故障，传到最后，变成了“那部货梯不干净”。',
    },
    {
      title: '四、第四晚，电梯里有了尸体',
      body:
        '第四晚凌晨，值班人员再次听见货梯运行。他们赶到 B 座时，货梯门半开，里面躺着一个人。人已经死了。更麻烦的是，监控在关键时间断了一截，运行记录也对不上。包斩让你先记住一句话：鬼故事只是烟，真正要找的是烟后面的人。',
    },
  ],
};

export const prologueBeats: PrologueBeat[] = [
  {
    id: 'dispatch',
    speakerId: 'baozhan',
    eyebrow: '00:06 / 加密调令',
    title: '你被临时接入特案组',
    content:
      '银港大厦连续三晚出现货梯异常。第四晚，夜班人员在轿厢里发现死者。你不是旁观者，从现在开始，你负责把现场记录、档案检索和复盘证据串起来。',
    messages: [
      {
        id: 'dispatch-system',
        from: 'system',
        text: '特案组加密频道已建立，临时权限：CASE E-09。',
        time: '00:06',
      },
      {
        id: 'dispatch-1',
        from: 'squad',
        text: '你是今晚新接入的随案记录员？先别紧张，按我说的做。',
        time: '00:06',
      },
      {
        id: 'dispatch-player',
        from: 'player',
        text: '收到。当前任务是什么？',
        time: '00:07',
      },
      {
        id: 'dispatch-2',
        from: 'squad',
        text: '先别急着去现场。我把案子前面发生的事发你。你先把这栋楼、那部货梯，还有“闹鬼”的说法弄明白。',
        time: '00:07',
        attachment: {
          fileId: 'case-file-e09-background',
          title: '有诡电梯：案情背景',
          summary: '从货梯半夜自己动开始，到第四晚电梯里发现尸体。',
        },
      },
    ],
    actionLabel: '接入通讯',
    evidenceId: 'building-brief',
  },
  {
    id: 'monitor',
    speakerId: 'hualong',
    eyebrow: '00:11 / 首段监控',
    title: '先看电梯自己留下的东西',
    content:
      '别急着翻案卷。先盯住楼层数字、雪花断帧和无人呼叫记录。所谓闹鬼，通常从一个不肯对上的时间点开始。',
    messages: [
      {
        id: 'monitor-1',
        from: 'squad',
        text: '别急着翻案卷。先看监控，电梯自己留下的东西比人嘴可靠。',
        time: '00:11',
      },
      {
        id: 'monitor-player',
        from: 'player',
        text: '画面停在 09，之后有雪花。',
        time: '00:11',
      },
      {
        id: 'monitor-2',
        from: 'squad',
        text: '盯住楼层数字、雪花断帧和无人呼叫记录。所谓闹鬼，通常从一个不肯对上的时间点开始。',
        time: '00:12',
      },
      {
        id: 'monitor-system',
        from: 'system',
        text: '监控帧已加入待同步材料：无人呼叫的上行。',
        time: '00:12',
      },
    ],
    actionLabel: '标记监控异常',
    evidenceId: 'opening-monitor',
  },
  {
    id: 'rumor',
    speakerId: 'professor',
    eyebrow: '00:17 / 楼内传言',
    title: '鬼故事会污染证词',
    content:
      '员工群已经开始传播“货梯会自己停靠”。你要记住：传言可以解释恐惧，但不能解释电梯为什么进入异常状态。',
    messages: [
      {
        id: 'rumor-1',
        from: 'squad',
        text: '员工群已经炸了。有人说午夜后货梯会自己停靠。',
        time: '00:17',
      },
      {
        id: 'rumor-player',
        from: 'player',
        text: '需要把传言当线索吗？',
        time: '00:18',
      },
      {
        id: 'rumor-2',
        from: 'squad',
        text: '传言可以解释恐惧，但不能解释电梯为什么进入异常状态。你要防的是证词被鬼故事带偏。',
        time: '00:18',
      },
      {
        id: 'rumor-system',
        from: 'system',
        text: '楼内传言已记录为证词污染风险。',
        time: '00:19',
      },
    ],
    actionLabel: '记录传言风险',
    evidenceId: 'rumor-log',
  },
  {
    id: 'handoff',
    speakerId: 'sumei',
    eyebrow: '00:24 / 出现场前',
    title: '抵达后先看位置，不要先看结论',
    content:
      '死者姿态、门缝痕迹、按钮面板和控制柜日志会互相咬合。你到现场后，只做一件事：把每个异常点记下来，再去终端检索。',
    messages: [
      {
        id: 'handoff-1',
        from: 'squad',
        text: '你到现场以后，先看位置，不要先看结论。',
        time: '00:24',
      },
      {
        id: 'handoff-player',
        from: 'player',
        text: '先看尸体，还是先看电梯？',
        time: '00:24',
      },
      {
        id: 'handoff-2',
        from: 'squad',
        text: '死者姿态、门缝痕迹、按钮面板和控制柜日志会互相咬合。把每个异常点记下来，再去终端检索。',
        time: '00:25',
      },
      {
        id: 'handoff-system',
        from: 'system',
        text: '现场勘查权限已准备，等待你进入银港大厦。',
        time: '00:25',
      },
    ],
    actionLabel: '前往银港大厦',
  },
];

const chapterOneEvidenceIds = [
  'floor-display-mark',
  'button-panel-trace',
  'door-gap-fiber',
  'monitor-missing-frame',
  'body-position-note',
  'elevator-run-record',
  'guard-shift-gap',
  'access-card-machine-room',
  'maintenance-ticket-empty',
  'power-branch-normal',
  'cleaner-fluid-smell',
  'cleaning-cart-track',
  'corridor-witness-delay',
  'call-button-record',
  'floor-nine-rumor-note',
];

export const chapters: Chapter[] = [
  {
    id: 'prologue',
    title: '序章：闹鬼大厦',
    summary:
      '市局接入一份夜间电梯异常报案。物业称同一部电梯多次在无人呼叫时运行，员工群开始传播“电梯见鬼”的说法。',
    objective: '阅读报案摘要和首段异常监控，确认案件需要立案调查。',
    evidenceIds: ['building-brief', 'opening-monitor', 'rumor-log'],
    requiredEvidenceIds: ['building-brief', 'opening-monitor'],
    nextChapterId: 'chapter-1',
  },
  {
    id: 'chapter-1',
    title: '第一章：电梯里的尸体',
    summary:
      '尸体在凌晨被发现于货梯轿厢。现场没有复杂操作入口，所有可调查点已由技术队标注。',
    objective:
      '查看电梯现场证据，找出案发时间内电梯运行逻辑不成立的地方。',
    evidenceIds: chapterOneEvidenceIds,
    requiredEvidenceIds: chapterOneEvidenceIds,
    replayQuestionId: 'replay-chapter-1',
    nextChapterId: 'chapter-2',
  },
  {
    id: 'chapter-2',
    title: '第二章：见鬼十法',
    summary:
      '档案已解锁占位。下一章将把大厦流传的禁忌和现场痕迹逐条对照。',
    objective: '档案待解锁：等待补充授权章节梗概。',
    evidenceIds: [],
    requiredEvidenceIds: [],
    locked: true,
  },
];

export const evidences: Record<string, Evidence> = {
  'building-brief': {
    id: 'building-brief',
    chapterId: 'prologue',
    title: '报案摘要：银港大厦货梯异常',
    type: 'record',
    content:
      '物业在 00:17 报警：B 座货梯连续三晚在无人按键时自行停靠。第四晚，夜班人员在轿厢内发现死者。',
    detail:
      '系统备注：此处为授权内容占位。后续可替换为《有诡电梯》授权梗概中的大厦、报警人与案件开端。',
    severity: 'normal',
    clueBucket: 'fact',
    isCritical: true,
  },
  'opening-monitor': {
    id: 'opening-monitor',
    chapterId: 'prologue',
    title: '监控帧：无人呼叫的上行',
    type: 'monitor',
    content:
      '00:11:36，货梯显示从 B1 上行至 9F。值班台没有收到呼叫记录，画面在 00:11:48 出现雪花。',
    detail:
      '画面只有电梯门、楼层数字和空走廊。没有突然惊吓，恐怖感来自“无人操作”的记录矛盾。',
    severity: 'normal',
    clueBucket: 'unknown',
    isCritical: true,
  },
  'rumor-log': {
    id: 'rumor-log',
    chapterId: 'prologue',
    title: '员工群截图：别坐那部货梯',
    type: 'testimony',
    content:
      '员工群里有人提到“午夜后货梯会多停一层”，并把异常和楼内流传的电梯禁忌联系起来。',
    detail:
      '这条材料主要记录楼内传言，暂时只能作为调查背景参考。',
    severity: 'disturbing',
    clueBucket: 'unknown',
    isCritical: false,
  },
  'floor-display-mark': {
    id: 'floor-display-mark',
    chapterId: 'chapter-1',
    title: '楼层显示：停在 9F 的划痕',
    type: 'scene',
    content:
      '楼层显示面板边缘有新鲜划痕，停格照片显示数字 9 的右下角短暂缺亮。',
    detail:
      '技术队记录：楼层显示异常可能不是电梯真实停靠楼层，而是显示回路被短暂干扰。',
    severity: 'critical',
    clueBucket: 'doubt',
    isCritical: true,
  },
  'button-panel-trace': {
    id: 'button-panel-trace',
    chapterId: 'chapter-1',
    title: '按钮面板：B1 与 9F 指纹混杂',
    type: 'scene',
    content:
      'B1、9F、开门键附近均有擦拭痕，残留指纹不能直接锁定操作人。',
    detail:
      '这里让玩家知道按钮被处理过，但它不是复盘问题的必要答案。',
    severity: 'disturbing',
    clueBucket: 'doubt',
    isCritical: false,
  },
  'door-gap-fiber': {
    id: 'door-gap-fiber',
    chapterId: 'chapter-1',
    title: '门缝纤维：深色制服布料',
    type: 'scene',
    content:
      '轿厢门下沿夹有深色布料纤维，位置接近门缝右侧，不符合死者倒地后自然剐蹭方向。',
    detail:
      '纤维提示有人在门附近停留或操作，但第一章尚不直接指认身份。',
    severity: 'disturbing',
    clueBucket: 'doubt',
    isCritical: false,
  },
  'monitor-missing-frame': {
    id: 'monitor-missing-frame',
    chapterId: 'chapter-1',
    title: '监控断帧：缺失 12 秒',
    type: 'monitor',
    content:
      '00:11:48 至 00:12:00，货梯内监控连续雪花，外部走廊镜头没有同步断电。',
    detail:
      '同一时间段只有轿厢内画面异常，说明这不是整栋楼供电问题。',
    severity: 'critical',
    clueBucket: 'fact',
    isCritical: true,
  },
  'body-position-note': {
    id: 'body-position-note',
    chapterId: 'chapter-1',
    title: '尸体位置：背向门口',
    type: 'autopsy',
    content:
      '死者被发现时背向电梯门，右手靠近侧壁扶手。案卷照片已遮挡，仅保留姿态示意。',
    detail:
      '内容强度以警方案卷方式呈现，不使用露骨图像。',
    severity: 'critical',
    clueBucket: 'unknown',
    isCritical: false,
  },
  'elevator-run-record': {
    id: 'elevator-run-record',
    chapterId: 'chapter-1',
    title: '运行记录：00:11 手动检修模式',
    type: 'record',
    content:
      '控制柜日志显示 00:11:33 货梯短暂进入手动检修模式，00:12:05 自动恢复。',
    detail:
      '这条记录和监控断帧、楼层显示异常共同构成第一章复盘答案。',
    severity: 'critical',
    clueBucket: 'fact',
    isCritical: true,
  },
  'guard-shift-gap': {
    id: 'guard-shift-gap',
    chapterId: 'chapter-1',
    title: '值班交接：00:10 短暂空岗',
    type: 'testimony',
    content:
      '夜班交接表显示，00:10 至 00:14 值班台只有一名保安在岗，另一人以“巡楼确认异响”为由离开。',
    detail:
      '这条记录说明案发前后存在短暂视线空窗，但不能单独证明电梯被人为操作。',
    severity: 'disturbing',
    clueBucket: 'unknown',
    isCritical: false,
  },
  'access-card-machine-room': {
    id: 'access-card-machine-room',
    chapterId: 'chapter-1',
    title: '门禁记录：机房门被刷开',
    type: 'record',
    content:
      'B 座电梯机房门禁在 00:09:58 有一次刷卡记录，系统登记账号属于物业公共权限卡。',
    detail:
      '公共权限卡无法直接锁定个人，但它把调查范围从轿厢内部扩展到机房与控制柜。',
    severity: 'critical',
    clueBucket: 'doubt',
    isCritical: false,
  },
  'maintenance-ticket-empty': {
    id: 'maintenance-ticket-empty',
    chapterId: 'chapter-1',
    title: '维修工单：当晚没有报修',
    type: 'record',
    content:
      '物业维修系统显示，案发当晚没有登记货梯故障报修，也没有授权维修人员进入 B 座电梯机房。',
    detail:
      '如果电梯确实进入手动检修模式，就需要解释是谁绕过了正常维修流程。',
    severity: 'normal',
    clueBucket: 'fact',
    isCritical: false,
  },
  'power-branch-normal': {
    id: 'power-branch-normal',
    chapterId: 'chapter-1',
    title: '配电记录：轿厢支路未跳闸',
    type: 'record',
    content:
      '配电箱记录没有出现整梯断电或支路跳闸，走廊照明和外部镜头在同一时间段保持正常。',
    detail:
      '它进一步排除普通断电导致监控雪花的可能，和监控断帧形成互证。',
    severity: 'normal',
    clueBucket: 'fact',
    isCritical: false,
  },
  'cleaner-fluid-smell': {
    id: 'cleaner-fluid-smell',
    chapterId: 'chapter-1',
    title: '轿厢气味：清洁剂残留',
    type: 'scene',
    content:
      '现场记录提到轿厢内有明显清洁剂味道，门缝附近气味更重，和正常夜间保洁时间对不上。',
    detail:
      '气味只能说明现场可能被处理过，不能替代物证结论。',
    severity: 'disturbing',
    clueBucket: 'doubt',
    isCritical: false,
  },
  'cleaning-cart-track': {
    id: 'cleaning-cart-track',
    chapterId: 'chapter-1',
    title: '清洁车轮印：门口折返',
    type: 'route',
    content:
      '电梯门外地面有两道浅轮印，轨迹从走廊尽头靠近货梯，又在门口折返离开。',
    detail:
      '轮印提示有人携带工具或清洁设备靠近过货梯，但路线仍需要和门禁、监控对照。',
    severity: 'disturbing',
    clueBucket: 'doubt',
    isCritical: false,
  },
  'corridor-witness-delay': {
    id: 'corridor-witness-delay',
    chapterId: 'chapter-1',
    title: '走廊证词：先听见门响',
    type: 'testimony',
    content:
      '一名加班员工称，她先听见货梯门合上的闷响，过了十几秒才看到走廊灯下的楼层数字变化。',
    detail:
      '证词受“闹鬼”传言影响较大，但声音顺序和显示变化之间的延迟值得保留。',
    severity: 'disturbing',
    clueBucket: 'unknown',
    isCritical: false,
  },
  'call-button-record': {
    id: 'call-button-record',
    chapterId: 'chapter-1',
    title: '呼叫记录：9F 外呼为空',
    type: 'record',
    content:
      '楼层外呼记录显示，9F 在 00:11 前后没有有效按键输入，B1 呼叫记录也只有一条残缺日志。',
    detail:
      '这条记录让“无人呼叫却停靠”的说法更具体，但仍需结合运行模式判断。',
    severity: 'normal',
    clueBucket: 'fact',
    isCritical: false,
  },
  'floor-nine-rumor-note': {
    id: 'floor-nine-rumor-note',
    chapterId: 'chapter-1',
    title: '九楼传言：多停一层',
    type: 'testimony',
    content:
      '员工群里反复提到“货梯会多停一层”，其中最早一条消息来自九楼仓库临时工。',
    detail:
      '传言不能当事实，但它可能解释为什么现场人员都把注意力放在 9F 显示上。',
    severity: 'disturbing',
    clueBucket: 'unknown',
    isCritical: false,
  },
};

export const sceneObservationPoints: SceneObservationPoint[] = [
  {
    id: 'floor-display',
    title: '楼层显示屏',
    locationLabel: 'A-01',
    description: '数字停在 9F，右下角有短暂缺亮，边框能看到新鲜划痕。',
    discoveredKeywords: ['9F', '缺亮', '划痕'],
    severity: 'critical',
    x: 50,
    y: 18,
  },
  {
    id: 'button-panel',
    title: '按钮面板',
    locationLabel: 'A-02',
    description: 'B1、9F、开门键附近都有擦拭痕，指纹层次被破坏。',
    discoveredKeywords: ['B1', '9F', '擦拭'],
    severity: 'disturbing',
    x: 74,
    y: 46,
  },
  {
    id: 'door-gap',
    title: '右侧门缝',
    locationLabel: 'A-03',
    description: '门缝下沿夹着深色纤维，位置不像死者倒地后自然剐蹭。',
    discoveredKeywords: ['深色纤维', '制服'],
    severity: 'disturbing',
    x: 59,
    y: 78,
  },
  {
    id: 'camera',
    title: '轿厢摄像头',
    locationLabel: 'A-04',
    description: '镜头没有脱落，但监控回放在同一时间段出现连续雪花。',
    discoveredKeywords: ['雪花', '12秒'],
    severity: 'critical',
    x: 18,
    y: 18,
  },
  {
    id: 'body-outline',
    title: '尸体遮挡轮廓',
    locationLabel: 'A-05',
    description: '遮挡照片只保留姿态：死者背向门口，右手靠近侧壁扶手。',
    discoveredKeywords: ['背向门口', '右手扶手'],
    severity: 'critical',
    x: 48,
    y: 88,
  },
  {
    id: 'inspection-port',
    title: '侧壁检修口',
    locationLabel: 'A-06',
    description: '检修口边缘有新近开启痕迹，技术员建议查控制柜日志。',
    discoveredKeywords: ['手动检修', '00:11'],
    severity: 'critical',
    x: 79,
    y: 74,
  },
];

export const archiveSearchEntries: ArchiveSearchEntry[] = [
  {
    id: 'archive-floor-display',
    evidenceId: 'floor-display-mark',
    keywords: ['缺亮', '显示划痕', '楼层显示屏', '09显示伤'],
    title: '楼层显示异常检索结果',
    abstract: '技术队比对停格照片，确认 9F 显示存在缺亮与边缘划痕。',
  },
  {
    id: 'archive-button-panel',
    evidenceId: 'button-panel-trace',
    keywords: ['擦拭痕', '开门键', '指纹混杂', '按钮面板'],
    title: '按钮面板痕迹检索结果',
    abstract: 'B1、9F、开门键附近有擦拭痕，无法直接锁定操作人。',
  },
  {
    id: 'archive-door-gap',
    evidenceId: 'door-gap-fiber',
    keywords: ['深色纤维', '制服布料', '右侧门缝'],
    title: '门缝纤维检索结果',
    abstract: '门缝右侧提取到深色布料纤维，方向不符合自然剐蹭。',
  },
  {
    id: 'archive-monitor-gap',
    evidenceId: 'monitor-missing-frame',
    keywords: ['雪花断帧', '十二秒', '轿厢摄像头'],
    title: '监控断帧检索结果',
    abstract: '00:11:48 至 00:12:00，轿厢内监控连续雪花。',
  },
  {
    id: 'archive-body-position',
    evidenceId: 'body-position-note',
    keywords: ['背向门口', '右手扶手', '遮挡轮廓'],
    title: '尸体姿态检索结果',
    abstract: '案卷照片已遮挡，仅保留死者姿态和朝向记录。',
  },
  {
    id: 'archive-run-record',
    evidenceId: 'elevator-run-record',
    keywords: ['手动检修', '控制柜日志', '运行记录异常'],
    title: '控制柜运行记录检索结果',
    abstract: '控制柜日志显示货梯在案发时间短暂进入手动检修模式。',
  },
  {
    id: 'archive-guard-shift-gap',
    evidenceId: 'guard-shift-gap',
    keywords: ['短暂空岗', '巡楼空窗', '值班交接'],
    title: '值班交接检索结果',
    abstract: '夜班交接表显示案发前后存在短暂空岗。',
  },
  {
    id: 'archive-access-card-machine-room',
    evidenceId: 'access-card-machine-room',
    keywords: ['机房门禁', '公共权限卡', '刷卡记录'],
    title: '机房门禁检索结果',
    abstract: 'B 座电梯机房门禁在案发前出现公共权限卡刷卡记录。',
  },
  {
    id: 'archive-maintenance-ticket-empty',
    evidenceId: 'maintenance-ticket-empty',
    keywords: ['维修工单', '无报修', '授权维修'],
    title: '维修工单检索结果',
    abstract: '案发当晚没有登记货梯故障报修或授权维修。',
  },
  {
    id: 'archive-power-branch-normal',
    evidenceId: 'power-branch-normal',
    keywords: ['配电记录', '支路未跳', '走廊镜头'],
    title: '配电记录检索结果',
    abstract: '配电箱没有整梯断电或支路跳闸记录。',
  },
  {
    id: 'archive-cleaner-fluid-smell',
    evidenceId: 'cleaner-fluid-smell',
    keywords: ['清洁剂气味', '异常保洁', '轿厢残留'],
    title: '清洁剂残留检索结果',
    abstract: '轿厢和门缝附近存在与正常保洁时间不符的清洁剂气味。',
  },
  {
    id: 'archive-cleaning-cart-track',
    evidenceId: 'cleaning-cart-track',
    keywords: ['清洁车轮印', '门口折返', '浅轮印'],
    title: '清洁车轮印检索结果',
    abstract: '电梯门外有靠近货梯后折返的浅轮印。',
  },
  {
    id: 'archive-corridor-witness-delay',
    evidenceId: 'corridor-witness-delay',
    keywords: ['门响延迟', '十几秒后', '走廊证词'],
    title: '走廊证词检索结果',
    abstract: '加班员工称先听见门响，随后才看到楼层数字变化。',
  },
  {
    id: 'archive-call-button-record',
    evidenceId: 'call-button-record',
    keywords: ['外呼为空', '呼叫记录残缺', '无人呼叫'],
    title: '呼叫记录检索结果',
    abstract: '9F 案发时间段没有有效外呼输入，B1 记录存在残缺日志。',
  },
  {
    id: 'archive-floor-nine-rumor-note',
    evidenceId: 'floor-nine-rumor-note',
    keywords: ['九楼传言', '多停一层', '员工群首发'],
    title: '九楼传言检索结果',
    abstract: '“货梯会多停一层”的最早消息来自九楼仓库临时工。',
  },
];

export const evidenceBriefings: Record<string, EvidenceBriefing> = {
  'floor-display-mark': {
    evidenceId: 'floor-display-mark',
    speakerId: 'hualong',
    comment:
      '数字停在 9F，但显示回路留下了伤。别把屏幕显示当成真实楼层。',
  },
  'button-panel-trace': {
    evidenceId: 'button-panel-trace',
    speakerId: 'baozhan',
    comment:
      '按钮被处理过，只能证明有人碰过，暂时不能证明是谁按下去的。',
  },
  'door-gap-fiber': {
    evidenceId: 'door-gap-fiber',
    speakerId: 'sumei',
    comment:
      '纤维位置不自然。它不像尸体造成的，更像有人在门口短暂停留。',
  },
  'monitor-missing-frame': {
    evidenceId: 'monitor-missing-frame',
    speakerId: 'hualong',
    comment:
      '只有轿厢内断帧，走廊镜头没断。供电问题可以先排除一半。',
  },
  'body-position-note': {
    evidenceId: 'body-position-note',
    speakerId: 'sumei',
    comment:
      '背向门口、右手靠近扶手，这不是随便倒下的姿态。先记住方向。',
  },
  'elevator-run-record': {
    evidenceId: 'elevator-run-record',
    speakerId: 'baozhan',
    comment:
      '手动检修模式是第一章的硬钉子。电梯在那几十秒里不是普通运行。',
  },
  'guard-shift-gap': {
    evidenceId: 'guard-shift-gap',
    speakerId: 'baozhan',
    comment:
      '空岗不是答案，但它告诉你那几分钟没人完整盯住值班台。',
  },
  'access-card-machine-room': {
    evidenceId: 'access-card-machine-room',
    speakerId: 'hualong',
    comment:
      '公共权限卡很麻烦，它说明有人能进去，但还不能说明是谁进去。',
  },
  'maintenance-ticket-empty': {
    evidenceId: 'maintenance-ticket-empty',
    speakerId: 'baozhan',
    comment:
      '没有报修，却有检修模式。这个矛盾要留着，别被鬼故事盖过去。',
  },
  'power-branch-normal': {
    evidenceId: 'power-branch-normal',
    speakerId: 'hualong',
    comment:
      '配电没掉，走廊镜头没断，轿厢画面单独雪花就更不正常。',
  },
  'cleaner-fluid-smell': {
    evidenceId: 'cleaner-fluid-smell',
    speakerId: 'sumei',
    comment:
      '气味不会指认凶手，但它会告诉你现场有没有被人处理过。',
  },
  'cleaning-cart-track': {
    evidenceId: 'cleaning-cart-track',
    speakerId: 'hualong',
    comment:
      '轮印只到门口又折回，像有人靠近过，但不想留下完整路线。',
  },
  'corridor-witness-delay': {
    evidenceId: 'corridor-witness-delay',
    speakerId: 'professor',
    comment:
      '她先听见门响，再看见数字变化。恐惧会夸张细节，但顺序有用。',
  },
  'call-button-record': {
    evidenceId: 'call-button-record',
    speakerId: 'hualong',
    comment:
      '没有外呼，却有停靠说法。别问它像不像鬼，问它怎么被触发。',
  },
  'floor-nine-rumor-note': {
    evidenceId: 'floor-nine-rumor-note',
    speakerId: 'professor',
    comment:
      '传言会把所有人的眼睛引向九楼。越多人相信，越容易被利用。',
  },
};

export function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase();
}

export function searchArchive(keyword: string): ArchiveSearchEntry[] {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return [];
  }

  const matchedEntry = archiveSearchEntries.find((entry) =>
    entry.keywords.some((candidate) => {
      const normalizedCandidate = normalizeKeyword(candidate);

      return (
        normalizedCandidate === normalizedKeyword ||
        normalizedCandidate.includes(normalizedKeyword)
      );
    }),
  );

  return matchedEntry ? [matchedEntry] : [];
}

export const replayQuestions: Record<string, ReplayQuestion> = {
  'replay-chapter-1': {
    id: 'replay-chapter-1',
    chapterId: 'chapter-1',
    prompt: '案发时间内，电梯运行逻辑哪里不成立？',
    candidateEvidenceIds: chapterOneEvidenceIds,
    correctEvidenceIds: [
      'elevator-run-record',
      'monitor-missing-frame',
      'floor-display-mark',
    ],
    reasoningQuestions: [
      {
        id: 'time-window',
        title: '时间矛盾',
        prompt: '第一章里，真正需要被锁定的关键时间窗口是哪一段？',
        options: [
          {
            id: 'manual-gap',
            label: '00:11:33 到 00:12:05：控制柜状态、轿厢画面和楼层显示都在这一段发生变化。',
          },
          {
            id: 'shift-start',
            label: '00:09:58 到 00:10:30：机房门禁和夜班空岗先后出现，说明有人可能接近控制区域。',
          },
          {
            id: 'morning-report',
            label: '00:10 到 00:14：值班交接出现空窗，走廊证词也把异常声音放在这一段。',
          },
          {
            id: 'rumor-days',
            label: '前三晚到案发当晚：闹鬼传言连续发酵，九楼说法成为现场人员的共同预期。',
          },
        ],
        correctOptionId: 'manual-gap',
        successFeedback:
          '正确。第一章要先抓住电梯进入手动检修的几十秒，而不是被传言时间线带走。',
        failureHint:
          '这题问的是能直接解释电梯异常运行的时间窗口，不是报案时间，也不是传言出现的时间。',
      },
      {
        id: 'run-mode',
        title: '运行模式',
        prompt: '为什么“无人呼叫却停在 9F”不能按普通电梯运行解释？',
        options: [
          {
            id: 'manual-mode',
            label: '运行记录显示货梯短暂进入手动检修模式，外呼记录无法单独解释这段停靠。',
          },
          {
            id: 'button-dirty',
            label: '按钮面板有擦拭和混杂指纹，说明轿厢内按键记录可能被人为干扰。',
          },
          {
            id: 'witness-scared',
            label: '走廊证词提到先听见门响、后看见数字变化，异常可能来自门机动作顺序。',
          },
          {
            id: 'floor-rumor',
            label: '九楼传言让目击者优先注意 9F 显示，停靠判断可能受传言影响。',
          },
        ],
        correctOptionId: 'manual-mode',
        successFeedback:
          '正确。手动检修模式改变了电梯运行逻辑，普通外呼记录已经不足以解释停靠。',
        failureHint:
          '不要先判断谁按了按钮。先判断电梯当时处在什么运行模式。',
      },
      {
        id: 'monitor-gap',
        title: '监控断帧',
        prompt: '监控雪花最关键的矛盾是什么？',
        options: [
          {
            id: 'inside-only',
            label: '轿厢内画面连续雪花，但走廊镜头、配电支路和外部照明没有同步异常。',
          },
          {
            id: 'all-black',
            label: '断帧发生在控制柜状态变化之后，可能是检修模式导致监控系统短暂丢帧。',
          },
          {
            id: 'camera-fell',
            label: '轿厢摄像头没有脱落，说明画面异常更可能来自线路或信号链路。',
          },
          {
            id: 'too-dark',
            label: '走廊镜头保留了门外环境，缺失的只是轿厢内部最关键的 12 秒。',
          },
        ],
        correctOptionId: 'inside-only',
        successFeedback:
          '正确。断帧集中在轿厢内部，普通断电解释不通。',
        failureHint:
          '关键不是“画面坏了”，而是坏的范围和其他系统记录对不上。',
      },
      {
        id: 'chapter-conclusion',
        title: '阶段结论',
        prompt: '第一章结束时，玩家能成立的结论是什么？',
        options: [
          {
            id: 'human-made-fear',
            label: '现有证据无法支持普通故障或灵异解释，更像有人借设备异常和九楼传言制造恐惧。',
          },
          {
            id: 'ghost-confirmed',
            label: '现阶段应把重点放在九楼传言的来源，因为传言可能比设备记录更接近动机。',
          },
          {
            id: 'killer-confirmed',
            label: '现阶段应优先锁定公共权限卡的使用人，因为机房门禁是唯一接近控制柜的入口。',
          },
          {
            id: 'accident-only',
            label: '现阶段只能确认货梯存在多处异常，案件性质仍需等待尸检和门缝物证补强。',
          },
        ],
        correctOptionId: 'human-made-fear',
        successFeedback:
          '正确。第一章只完成阶段性定调：排除鬼故事解释，把调查方向转向人为操作。',
        failureHint:
          '第一章还没有指认凶手，也不是证明鬼存在；它要完成的是案件性质定调。',
      },
    ],
    successSummary:
      '复盘成立：核心证据筛选正确，推理链也闭合。电梯曾进入手动检修模式，轿厢内监控单独断帧，楼层显示存在干扰痕迹。所谓“无人操作的停靠”不能按普通运行记录解释。',
    failureHint:
      '证据组合还不能同时解释“运行模式、画面缺失、停靠楼层”三个矛盾。换一组能覆盖这三个方向的证据。',
  },
};

export const chapterResolutionStories: Record<string, ChapterResolutionStory> = {
  'chapter-1': {
    id: 'chapter-1-resolution',
    chapterId: 'chapter-1',
    title: '第一章结案复盘：电梯没有鬼',
    subtitle: 'CASE E-09 / RESOLUTION REPORT',
    imageAlt: '银港大厦货梯结案复盘图，包含电梯、9F 楼层显示、监控断帧和控制柜线索',
    lead:
      '复盘成立后，包斩把所有零散线索重新排进同一条时间线。所谓“有诡电梯”不是灵异事件，而是有人借传言、断帧和显示异常，把一次人为操作伪装成了电梯自己在深夜运行。',
    fullStory: [
      '你第一次接入特案组频道时，银港大厦的怪事已经传了三晚。B 座那部货梯总在午夜以后自己动，楼里的人说它会多停一层，说九楼不干净。包斩没有让你先相信任何人，他只把一份案情背景发进系统，让你记住：鬼故事可以制造恐惧，但不能解释机器记录。',
      '第四晚，货梯门半开，死者倒在轿厢里。画龙先让你看现场，不要翻案卷。楼层显示停在 9F，数字边缘有新鲜划痕；按钮面板被擦过，B1 和 9F 附近指纹混杂；门缝里夹着深色纤维；轿厢摄像头没有脱落，却在关键时间连续雪花。每个点单独看都像是杂音，但放在一起，它们开始指向同一个问题：电梯不是在普通运行。',
      '真正让案件转向的，是控制柜日志。00:11:33，货梯短暂进入手动检修模式，00:12:05 又恢复。这个时间段里，轿厢内监控断了 12 秒，走廊镜头、配电支路和外部照明却没有同步异常。如果是普通断电，断的不会只有轿厢内部；如果是普通外呼，控制柜不会出现检修状态。所谓无人呼叫的停靠，已经不能用正常电梯逻辑解释。',
      '苏眉把注意力拉回尸体和门口。死者背向门，右手靠近侧壁扶手；门缝纤维的位置不像自然剐蹭；清洁剂气味、门外轮印和按钮擦拭痕说明现场被人接近和处理过。与此同时，机房门禁出现公共权限卡记录，当晚却没有维修工单。有人可能接近过控制柜，但第一章还不能直接指认是谁。',
      '复盘到最后，包斩把九楼传言重新放回案板。传言不是答案，但它解释了为什么所有人都会先盯住 9F。楼层显示的缺亮和划痕，像是把目击者的视线固定在鬼故事上；监控断帧遮住了轿厢里最关键的 12 秒；手动检修模式则证明电梯在那段时间不是自己按规则行动。',
      '所以第一章的结论不是“鬼不存在”这么简单，而是更危险的另一句话：有人知道楼里的人害怕什么，也知道怎样让电梯、监控和传言互相配合。你们暂时还没有凶手姓名，但已经把案件从灵异传闻里拉了出来。下一步要查的，是谁能拿到权限卡，谁在空岗时间接近机房，以及九楼传言最早是被谁喂进人群的。',
    ],
    images: [
      {
        id: 'rumor-chat',
        title: '员工群里的第一层恐惧',
        caption: '传言先把所有人的视线推向 9F，之后每一次异常都会被自动解释成闹鬼。',
        alt: '深夜办公室中显示群聊传言的手机和电梯走廊倒影',
      },
      {
        id: 'field-investigation',
        title: '特案组抵达货梯现场',
        caption: '包斩、画龙和苏眉把注意力从鬼故事拉回电梯门、按钮面板和楼层显示。',
        alt: '三名调查员在深夜封锁的货梯现场勘查',
      },
      {
        id: 'cctv-control',
        title: '值班室里的断帧',
        caption: '轿厢内画面雪花，走廊镜头和配电记录却保持正常，断帧不是普通断电。',
        alt: '调查员在值班室查看电梯监控雪花和控制日志',
      },
      {
        id: 'evidence-table',
        title: '物证把人带回电梯门口',
        caption: '门缝纤维、清洁剂、门禁和维修工单共同说明现场被处理过。',
        alt: '电梯案证据桌上摆放纤维样本、门禁卡、维修单和现场照片',
      },
      {
        id: 'team-resolution',
        title: '包斩的结论',
        caption: '第一章不证明鬼存在，只证明有人知道怎样让机器替传言说话。',
        alt: '特案组在案件板前讨论有诡电梯的结案结论',
      },
    ],
    beats: [
      {
        id: 'rumor-before-case',
        time: '前三晚',
        title: '闹鬼传言先替真相开了路',
        body:
          '银港大厦的货梯连续几晚在午夜后异常停靠。员工群里开始出现“货梯会多停一层”“九楼不干净”的说法。传言让所有人先盯住楼层数字，也让后续证词天然带上恐惧滤镜。',
        evidenceIds: ['floor-nine-rumor-note', 'corridor-witness-delay'],
        imageId: 'rumor-chat',
      },
      {
        id: 'manual-mode',
        time: '00:11',
        title: '电梯进入了不该出现的手动检修模式',
        body:
          '控制柜日志显示，货梯在案发时段短暂进入手动检修。可当晚没有维修工单，也没有授权维修人员登记。电梯不是普通运行，必须有人绕过正常流程介入过控制链路。',
        evidenceIds: ['elevator-run-record', 'maintenance-ticket-empty', 'access-card-machine-room'],
        imageId: 'field-investigation',
      },
      {
        id: 'missing-frame',
        time: '00:11:48',
        title: '监控断的不是整栋楼，只是轿厢内部',
        body:
          '画面雪花集中在轿厢内监控，走廊镜头和配电记录没有同步异常。普通断电解释不通，断帧更像是针对电梯内部画面的一次短暂遮断。',
        evidenceIds: ['monitor-missing-frame', 'power-branch-normal'],
        imageId: 'cctv-control',
      },
      {
        id: 'floor-display',
        time: '00:12',
        title: '9F 显示制造了“多停一层”的错觉',
        body:
          '楼层显示边缘有新鲜划痕，数字 9 的右下角曾短暂缺亮。玩家看到的 9F 不一定等于电梯真实停靠楼层，它更像是被利用来呼应传言的视觉锚点。',
        evidenceIds: ['floor-display-mark', 'call-button-record'],
        imageId: 'evidence-table',
      },
      {
        id: 'scene-after',
        time: '案发后',
        title: '现场痕迹把人重新带回电梯门口',
        body:
          '门缝纤维、清洁剂气味和清洁车轮印说明现场被人接近和处理过。死者姿态、按钮擦拭痕与短暂空岗不能单独定罪，但它们共同说明：恐怖不是来自电梯，而是来自有人利用电梯制造恐怖。',
        evidenceIds: [
          'door-gap-fiber',
          'cleaner-fluid-smell',
          'cleaning-cart-track',
          'body-position-note',
          'button-panel-trace',
          'guard-shift-gap',
        ],
        imageId: 'team-resolution',
      },
    ],
    closing:
      '第一章的结论并不指向“鬼”，而是指向一个更危险的问题：有人知道楼里的人害怕什么，也知道怎样让机器替传言说话。第二章要查的，不再只是电梯，而是这些传言是被谁喂大的。',
  },
};

export const chapterById = Object.fromEntries(
  chapters.map((chapter) => [chapter.id, chapter]),
) as Record<string, Chapter>;
