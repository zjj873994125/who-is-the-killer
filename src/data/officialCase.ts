import { officialChapterOneReasoningStory } from './officialStoryText';

export interface OfficialChapter {
  id: string;
  title: string;
  sourceChapterTitle: string;
  summary: string;
  objective: string;
  clueIds: string[];
  requiredClueIds: string[];
  nextChapterId?: string;
  locked?: boolean;
}

export interface OfficialClue {
  id: string;
  chapterId: string;
  title: string;
  source: 'scene' | 'testimony' | 'autopsy' | 'experiment' | 'background';
  summary: string;
  detail: string;
  keywords: string[];
  pressure: 'normal' | 'disturbing' | 'critical';
}

export interface OfficialPrologueBriefing {
  id: string;
  title: string;
  lead: string;
  sections: Array<{
    title: string;
    body: string;
    sceneText: string;
    imageKey: string;
    imageAlt: string;
  }>;
}

export interface OfficialReplayQuestion {
  id: string;
  chapterId: string;
  prompt: string;
  candidateClueIds: string[];
  correctClueIds: string[];
  reasoningQuestions: Array<{
    id: string;
    title: string;
    prompt: string;
    options: Array<{
      id: string;
      label: string;
    }>;
    correctOptionId: string;
  }>;
  successSummary: string;
  failureHint: string;
}

export interface OfficialStoryArc {
  chapterId: string;
  sourceChapterTitle: string;
  playGoal: string;
  unlockCondition: string;
}

export interface OfficialResolutionStory {
  id: string;
  chapterId: string;
  title: string;
  subtitle: string;
  sourceScope: string;
  lead: string;
  imageKey: string;
  imageAlt: string;
  images: Array<{
    id: string;
    imageKey: string;
    title: string;
    caption: string;
    alt: string;
  }>;
  beats: Array<{
    id: string;
    time: string;
    title: string;
    body: string;
    clueIds: string[];
  }>;
  closing: string;
  fullStory: string[];
}

export const officialPrologueBriefing: OfficialPrologueBriefing = {
  id: 'official-prologue-briefing',
  title: '序：电梯门打开之前',
  lead:
    '正式篇从一对母子深夜回公司取钥匙开始。玩家先以随案调查员身份阅读开场传闻，再进入第一章现场。',
  sections: [
    {
      title: '深夜回到四十楼',
      body:
        '一名少妇带着孩子半夜回公司取钥匙。公司在四十楼，大厦电梯早已超龄，夜间只剩一部昏暗的货梯还能使用。',
      sceneText:
        '雨后的写字楼像一座黑色空壳，四十楼还有几盏灯亮着。她牵着孩子站在楼下，觉得只是回来取一串钥匙。',
      imageKey: 'official-prologue-01-building',
      imageAlt: '雨夜写字楼下，母亲牵着孩子望向高层灯光',
    },
    {
      title: '闹鬼传言',
      body:
        '楼里早就流传电梯怪事：门会在无人楼层打开，身后会传来冷笑，监控里还曾出现无法解释的陌生身影。',
      sceneText:
        '楼道空得能听见鞋底贴过地面的声音。那些关于电梯的传言，在灯管闪烁时忽然变得很近。',
      imageKey: 'official-prologue-02-corridor',
      imageAlt: '深夜四十楼走廊里，母亲蹲下给孩子系鞋带，孩子按着电梯按钮',
    },
    {
      title: '四十一楼的异常',
      body:
        '少妇找到钥匙回到电梯口时，电梯却停在 41楼。孩子按住电梯后突然松手，像是看见了无法解释的东西。',
      sceneText:
        '电梯显示停在 41。可这栋楼的夜晚本不该有人去那里。数字亮着，像有人在门后等。',
      imageKey: 'official-prologue-03-floor41',
      imageAlt: '老旧货梯上方楼层指示器显示四十一层，金属门紧闭',
    },
    {
      title: '门打开之前',
      body:
        '孩子说电梯里有个姐姐，没有脚，也没有站在地上。电梯再次升上来，门缓缓打开，故事停在最压迫的一刻。',
      sceneText:
        '她抱紧孩子，看着门缝被冷光一点点撑开。真正可怕的不是电梯来了，而是不知道门后有什么。',
      imageKey: 'official-prologue-04-door',
      imageAlt: '母亲抱着孩子站在缓缓打开的电梯门前，轿厢里只有黑暗',
    },
  ],
};

const chapterSixClueIds = [
  'official-clue-mother-report',
  'official-clue-standing-corpse',
  'official-clue-head-rolled',
  'official-clue-bound-scarf',
  'official-clue-no-rope',
  'official-clue-blood-spatter',
  'official-clue-neck-tear',
  'official-clue-cadaveric-spasm',
  'official-clue-forty-two-start',
  'official-clue-child-suspended',
  'official-clue-falling-test',
  'official-clue-burnt-smell',
];

export const officialChapters: OfficialChapter[] = [
  {
    id: 'official-prologue',
    title: '序：电梯门打开之前',
    sourceChapterTitle: '序',
    summary:
      '母子深夜回公司取钥匙，大厦电梯怪谈逐渐压到眼前，孩子先于成年人看见了“悬空的人”。',
    objective: '理解大厦传闻、夜间电梯状态和第一目击者的恐惧来源。',
    clueIds: [],
    requiredClueIds: [],
    nextChapterId: 'official-chapter-1',
  },
  {
    id: 'official-chapter-1',
    title: '第一章：尸体痉挛',
    sourceChapterTitle: '第六章 尸体痉挛',
    summary:
      '电梯门打开后，母子发现身首异处的女编辑。现场像密室，也像鬼故事，但特案组必须先判断死亡机制。',
    objective:
      '归档目击、现场、尸检和电梯试验记录，整理第一章可验证事实。',
    clueIds: chapterSixClueIds,
    requiredClueIds: chapterSixClueIds,
    nextChapterId: 'official-chapter-2',
  },
  {
    id: 'official-chapter-2',
    title: '第二章：悬空女尸',
    sourceChapterTitle: '第七章 悬空女尸',
    summary:
      '特案组继续核对电梯井道、机房记录和楼层证词，悬空目击开始变得更具体。',
    objective: '下一关将围绕悬空目击、楼层记录和作案时间展开。',
    clueIds: [],
    requiredClueIds: [],
    nextChapterId: 'official-chapter-3',
    locked: true,
  },
  {
    id: 'official-chapter-3',
    title: '第三章：电梯十忌',
    sourceChapterTitle: '第八章 电梯十忌',
    summary:
      '出版公司与物业嫌疑人浮出水面，电梯禁忌和古怪证物把案件推向更猎奇的方向。',
    objective: '下一关将继续核对嫌疑动机、异常行为和现场证据。',
    clueIds: [],
    requiredClueIds: [],
    nextChapterId: 'official-chapter-4',
    locked: true,
  },
  {
    id: 'official-chapter-4',
    title: '第四章：见鬼十法',
    sourceChapterTitle: '第九章 见鬼十法',
    summary:
      '调查方向从凶手转向“招鬼的人”。苏眉亲身验证见鬼方法，却被困进黑暗电梯。',
    objective: '下一关将记录招鬼传言、失控电梯和18楼异常。',
    clueIds: [],
    requiredClueIds: [],
    nextChapterId: 'official-chapter-5',
    locked: true,
  },
  {
    id: 'official-chapter-5',
    title: '第五章：墙上之门',
    sourceChapterTitle: '第十章 墙上之门',
    summary:
      '新的死亡、迟来的供述和18楼墙上之门，把整起案件带向最后一段黑暗。',
    objective: '最终关将整理遗留物、证词变化和墙上之门的余怖。',
    clueIds: [],
    requiredClueIds: [],
    locked: true,
  },
];

export const officialChapterById = Object.fromEntries(
  officialChapters.map((chapter) => [chapter.id, chapter]),
) as Record<string, OfficialChapter>;

export const officialClues: Record<string, OfficialClue> = {
  'official-clue-mother-report': {
    id: 'official-clue-mother-report',
    chapterId: 'official-chapter-1',
    title: '母子报警笔录',
    source: 'testimony',
    summary: '母亲在40楼电梯口发现滚出的头颅，孩子持续指向轿厢内部。',
    detail:
      '笔录记录了发现顺序：孩子先前说“姐姐没有站在地上”，再次开门后母亲才看到头颅和轿厢内的尸体。',
    keywords: ['母子报警', '40楼电梯口'],
    pressure: 'critical',
  },
  'official-clue-standing-corpse': {
    id: 'official-clue-standing-corpse',
    chapterId: 'official-chapter-1',
    title: '无头尸体站立',
    source: 'scene',
    summary: '死者身首异处，身体却没有倒下，轿厢内形成强烈的密室错觉。',
    detail:
      '现场照片显示躯干靠近轿厢内侧保持直立，脚下没有明显拖拽痕，周围血迹集中在轿厢壁面和地面。',
    keywords: ['站着的尸体', '没有倒下'],
    pressure: 'critical',
  },
  'official-clue-head-rolled': {
    id: 'official-clue-head-rolled',
    chapterId: 'official-chapter-1',
    title: '头颅滚出门外',
    source: 'scene',
    summary: '电梯停下开门时，头颅因轿厢颠簸滚到目击者脚边。',
    detail:
      '报警记录写明，电梯门打开后头颅先滚出门外，随后母亲才看清轿厢内部情况。门槛处留有血迹擦痕。',
    keywords: ['头颅滚出', '门槛外圆形物'],
    pressure: 'critical',
  },
  'official-clue-bound-scarf': {
    id: 'official-clue-bound-scarf',
    chapterId: 'official-chapter-1',
    title: '丝巾反绑双手',
    source: 'scene',
    summary: '死者双手被自己的丝巾反绑，但捆绑并不紧，留下自缚与他绑的分歧。',
    detail:
      '丝巾来自死者随身衣物，结扣位于腕后，松紧程度在现场记录中被标为“可挣动但不易自行脱落”。',
    keywords: ['丝巾反绑', '双臂绕在身后'],
    pressure: 'disturbing',
  },
  'official-clue-no-rope': {
    id: 'official-clue-no-rope',
    chapterId: 'official-chapter-1',
    title: '现场没有绳索',
    source: 'scene',
    summary: '电梯顶部没有明显悬挂痕迹，轿厢内也没有留下绳索或钢丝。',
    detail:
      '勘查员检查轿厢顶部、门框、地面和控制面板后，未在轿厢内发现绳索、钢丝或常规吊具残留。',
    keywords: ['没有绳索', '没有吊具'],
    pressure: 'critical',
  },
  'official-clue-blood-spatter': {
    id: 'official-clue-blood-spatter',
    chapterId: 'official-chapter-1',
    title: '四壁血液喷溅',
    source: 'scene',
    summary: '血迹覆盖轿厢四壁，没有明显人体遮挡形成的空白区域。',
    detail:
      '现场记录显示四壁均有喷溅痕迹，轿厢门内侧、左右侧壁和地面血迹方向不完全一致，门缝处另有擦痕。',
    keywords: ['四壁血迹', '人体遮挡'],
    pressure: 'critical',
  },
  'official-clue-neck-tear': {
    id: 'official-clue-neck-tear',
    chapterId: 'official-chapter-1',
    title: '颈部机械撕裂',
    source: 'autopsy',
    summary: '创口不是利器切割，更接近细线勒入后由巨大机械力撕断。',
    detail:
      '尸检记录将颈部创口描述为撕裂伤，边缘不平整，未见普通刀具造成的连续切割面，并附有颈部勒痕照片。',
    keywords: ['头颅被扯断', '颈部撕裂'],
    pressure: 'critical',
  },
  'official-clue-cadaveric-spasm': {
    id: 'official-clue-cadaveric-spasm',
    chapterId: 'official-chapter-1',
    title: '尸体痉挛解释',
    source: 'autopsy',
    summary: '法医解释死者可能在死亡瞬间形成罕见的全身僵直。',
    detail:
      '法医在初步意见中提到尸体痉挛可能，称个别死亡瞬间会出现短时间强直状态，需与现场姿态一并核对。',
    keywords: ['尸体痉挛', '死亡瞬间僵直'],
    pressure: 'disturbing',
  },
  'official-clue-forty-two-start': {
    id: 'official-clue-forty-two-start',
    chapterId: 'official-chapter-1',
    title: '42楼进入电梯',
    source: 'testimony',
    summary: '死者所在出版公司位于顶楼，她深夜加班后从42楼离开。',
    detail:
      '物业夜间登记显示，死者所在公司位于42楼。监控记录中，她深夜离开办公区后走向电梯间。',
    keywords: ['42楼公司', '顶楼'],
    pressure: 'normal',
  },
  'official-clue-child-suspended': {
    id: 'official-clue-child-suspended',
    chapterId: 'official-chapter-1',
    title: '孩子看见悬空女人',
    source: 'testimony',
    summary: '孩子说电梯里的姐姐没有脚，也没有站在地上。',
    detail:
      '孩子反复说“姐姐没有站在地上”，并提到看不见脚。笔录备注显示，孩子当时受到严重惊吓。',
    keywords: ['没有站在地上', '悬空状态'],
    pressure: 'critical',
  },
  'official-clue-falling-test': {
    id: 'official-clue-falling-test',
    chapterId: 'official-chapter-1',
    title: '电梯急坠试验',
    source: 'experiment',
    summary: '特案组重新启动电梯测时，轿厢突发急坠，最终被自锁装置拦停。',
    detail:
      '试验记录显示，电梯重新启动后出现急坠，自锁装置介入前，轿厢速度和制停冲击均超出正常乘坐体验。',
    keywords: ['急坠异常', '制停反应'],
    pressure: 'critical',
  },
  'official-clue-burnt-smell': {
    id: 'official-clue-burnt-smell',
    chapterId: 'official-chapter-1',
    title: '轿厢焦糊味',
    source: 'scene',
    summary: '包斩在血腥味里闻到一丝焦糊味，随即提醒不要贸然进入。',
    detail:
      '包斩称血腥味下有很淡的焦糊味，位置接近轿厢顶部和控制面板一侧，已通知物业封存设备。',
    keywords: ['焦糊味', '设备故障'],
    pressure: 'disturbing',
  },
};

export const officialReplayQuestions: Record<string, OfficialReplayQuestion> = {
  'official-replay-chapter-1': {
    id: 'official-replay-chapter-1',
    chapterId: 'official-chapter-1',
    prompt: '第一章复盘：哪三条记录最能同时解释站立尸体、工具缺失和急坠试验？',
    candidateClueIds: chapterSixClueIds,
    correctClueIds: [
      'official-clue-standing-corpse',
      'official-clue-no-rope',
      'official-clue-falling-test',
    ],
    reasoningQuestions: [
      {
        id: 'official-mechanism',
        title: '机械力来源',
        prompt: '在“现场没有凶器”的前提下，哪种判断最能把颈部撕裂和电梯急坠联系起来？',
        options: [
          {
            id: 'a',
            label:
              '凶手可能借电梯下降形成拉扯力，细线或钢丝完成作用后离开轿厢，所以现场看不到常规凶器。',
          },
          {
            id: 'b',
            label:
              '颈部创口更像近距离利器切割，凶器应被凶手带走，电梯急坠只是后续试验中的独立故障。',
          },
          {
            id: 'c',
            label:
              '没有绳索说明勒颈推断不成立，尸体站立和头颅脱落更接近电梯停靠时的二次碰撞。',
          },
          {
            id: 'd',
            label:
              '焦糊味能证明电梯存在故障，但只能说明事故风险，不能作为判断外力来源的证据。',
          },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'official-spasm',
        title: '站立尸体',
        prompt: '法医提出“尸体痉挛”后，这条解释在复盘中应该被放在什么位置？',
        options: [
          {
            id: 'a',
            label:
              '它可以解释无头身体为什么保持站立，但死亡瞬间的拉扯、工具消失和悬空目击仍要另找机制。',
          },
          {
            id: 'b',
            label:
              '它说明死者死亡后姿态会被固定，因此孩子看到的悬空女人很可能只是尸体僵直后的错觉。',
          },
          {
            id: 'c',
            label:
              '它能解释身体没有倒下，也能解释四壁血迹的喷溅方向，因此足以完成第一章死亡机制判断。',
          },
          {
            id: 'd',
            label:
              '它把案件重点转向死者生前状态，说明丝巾反绑更可能是死者自缚，不必优先考虑外部机关。',
          },
        ],
        correctOptionId: 'a',
      },
    ],
    successSummary:
      '第一章结论成立：鬼故事只解释恐惧，不能解释机械力。真正的突破口是把电梯从案发容器改看成杀人工具。',
    failureHint:
      '不要只选最恐怖的描述。第一章要找的是“站立尸体如何成立、工具为什么不在现场、电梯为何能提供力量”。',
  },
};

export const officialStoryArcs: OfficialStoryArc[] = [
  {
    chapterId: 'official-chapter-1',
    sourceChapterTitle: '第六章 尸体痉挛',
    playGoal: '玩家完成首次现场复盘，整理目击、尸检、勘查和试验记录。',
    unlockCondition: '阅读序章并完成第一章十二条线索归档。',
  },
  {
    chapterId: 'official-chapter-2',
    sourceChapterTitle: '第七章 悬空女尸',
    playGoal: '玩家继续核对悬空目击、楼层记录和电梯运行异常。',
    unlockCondition: '第一章复盘成立后解锁。',
  },
  {
    chapterId: 'official-chapter-3',
    sourceChapterTitle: '第八章 电梯十忌',
    playGoal: '玩家从古怪证物、嫌疑人排查和电梯禁忌中筛选有效记录。',
    unlockCondition: '完成上一章楼层记录核对后解锁。',
  },
  {
    chapterId: 'official-chapter-4',
    sourceChapterTitle: '第九章 见鬼十法',
    playGoal: '玩家把招鬼传言转化成可验证行为，推进到苏眉被困电梯和18楼异常。',
    unlockCondition: '完成电梯十忌证词与见鬼行为对照后解锁。',
  },
  {
    chapterId: 'official-chapter-5',
    sourceChapterTitle: '第十章 墙上之门',
    playGoal: '玩家还原温小婉、傻大个、裤兜三人的隐瞒链条，并保留墙上之门的余怖。',
    unlockCondition: '见鬼十法现场模拟完成后解锁。',
  },
];

export const officialResolutionStories: Record<string, OfficialResolutionStory> = {
  'official-chapter-1': {
    id: 'official-chapter-1-resolution',
    chapterId: 'official-chapter-1',
    title: '第一章完整故事：电梯就是凶器',
    subtitle: '第六章主体 + 第七章前半段',
    sourceScope:
      '本章故事覆盖“尸体痉挛”的现场发现、特案组初步复盘，以及“悬空女尸”开头对死亡机制的说明。',
    lead:
      '母子在40楼看到的不是鬼影，而是一场利用电梯机械力完成的杀人。第一章的故事到此才真正闭合：尸体为何站着、工具为何消失、孩子为何说她悬在空中。',
    imageKey: 'officialPrologueFloor41',
    imageAlt: '电梯楼层监控画面',
    images: [
      {
        id: 'official-story-report',
        imageKey: 'officialPrologueFloor41',
        title: '母子报警',
        caption: '40楼电梯门打开后，头颅先滚出门外，母亲看到轿厢里站着无头女尸。',
        alt: '41楼电梯间监控画面与报警楼层信息',
      },
      {
        id: 'official-story-victim',
        imageKey: 'wenXiaowanIdPhoto',
        title: '温小婉身份',
        caption: '死者身份确认后，案件从“闹鬼传闻”转回到一个真实受害者的死亡过程。',
        alt: '温小婉证件照',
      },
      {
        id: 'official-story-scene',
        imageKey: 'officialChapterOneScene',
        title: '案发现场',
        caption: '尸体姿态、门槛外圆形物、轿厢四壁血迹共同构成本章最重要的现场图像。',
        alt: '第一章案发电梯现场图',
      },
      {
        id: 'official-story-test',
        imageKey: 'storyCctvControlRoom',
        title: '急坠试验',
        caption: '梁教授重新测试电梯运行时间，轿厢突然急坠，所有人第一次直面这部电梯的危险。',
        alt: '监控室和电梯运行记录屏幕',
      },
      {
        id: 'official-story-resolution',
        imageKey: 'officialChapterOneScene',
        title: '死亡机制',
        caption: '第七章前半段把谜题翻开：凶手可以不在电梯里，现场留下的力量来自下降中的轿厢。',
        alt: '案发电梯现场用于复盘死亡机制',
      },
    ],
    beats: [
      {
        id: 'official-story-beat-report',
        time: '40F',
        title: '电梯门打开',
        body:
          '母子在40楼呼叫电梯，门打开后头颅先滚出门外。母亲随后看到轿厢中央站着一具无头女尸，孩子却一直强调“姐姐没有站在地上”。',
        clueIds: [
          'official-clue-mother-report',
          'official-clue-head-rolled',
          'official-clue-child-suspended',
        ],
      },
      {
        id: 'official-story-beat-scene',
        time: '现场',
        title: '没有凶手的电梯',
        body:
          '轿厢四壁都是喷溅血迹，没有人体遮挡留下的空白；现场没有指纹、鞋印、凶器、绳索或钢丝。它看起来像密室，也像有人故意把案件伪装成鬼故事。',
        clueIds: [
          'official-clue-blood-spatter',
          'official-clue-no-rope',
          'official-clue-bound-scarf',
        ],
      },
      {
        id: 'official-story-beat-spasm',
        time: '尸检',
        title: '尸体痉挛解释站立',
        body:
          '法医给出罕见解释：死亡瞬间的强烈刺激可能让肌肉立即强硬收缩，温小婉的身体因此在失去头颅后仍保持站立。但这只是姿态答案，不是死亡答案。',
        clueIds: [
          'official-clue-standing-corpse',
          'official-clue-cadaveric-spasm',
          'official-clue-neck-tear',
        ],
      },
      {
        id: 'official-story-beat-test',
        time: '试验',
        title: '电梯暴露危险',
        body:
          '梁教授要求恢复电源做运行时间测试。包斩先闻到焦糊味，随后轿厢在下降途中突然断电急坠，又被自锁装置拦停。电梯不再只是案发地点，它本身可能提供了力量。',
        clueIds: [
          'official-clue-burnt-smell',
          'official-clue-falling-test',
        ],
      },
      {
        id: 'official-story-beat-mechanism',
        time: '复盘',
        title: '死亡原因被推开',
        body:
          '第七章开头，梁教授用一则电梯密室谜题提示众人：凶手可以借电梯下降让弹性绳索或细线发力。温小婉的颈部撕裂、消失的工具、孩子看到的悬空状态，开始指向同一个方向。',
        clueIds: [
          'official-clue-neck-tear',
          'official-clue-no-rope',
          'official-clue-child-suspended',
        ],
      },
      {
        id: 'official-story-beat-next',
        time: '未解',
        title: '第一章留下的新问题',
        body:
          '如果凶手在42楼进入电梯，又在41楼离开，他必须在极短时间内控制温小婉、反绑双手并套住细线。梁教授承认作案时间仍是谜，本章到此结束，下一章要查的是悬空女尸背后的操作痕迹。',
        clueIds: [
          'official-clue-forty-two-start',
          'official-clue-bound-scarf',
        ],
      },
    ],
    closing:
      '鬼故事解释不了机械力。第一章真正的结论不是“谁杀了她”，而是“电梯怎样参与了杀人”。',
    fullStory: [...officialChapterOneReasoningStory],
  },
};
