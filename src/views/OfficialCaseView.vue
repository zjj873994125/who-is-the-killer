<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  Check,
  ChatLineRound,
  Document,
  Files,
  FolderOpened,
  Location,
  Notebook,
  RefreshLeft,
  Search,
  Warning,
} from '@element-plus/icons-vue';
import {
  officialClues,
  officialReplayQuestions,
  officialResolutionStories,
  type OfficialClue,
} from '../data/officialCase';
import { officialChapterOneOriginalStory } from '../data/officialStoryText';
import { imageAssets } from '../utils/cosAssets';
import { getSquadAvatarStyle } from '../utils/squadAvatars';

const surveyElevatorSceneUrl = imageAssets.officialChapterOneSurveyElevator;
const reportElevatorImageUrl = imageAssets.officialPrologue03Floor41;
const fieldInvestigationImageUrl = imageAssets.storyFieldInvestigation;
const wenXiaowanPhotoUrl = imageAssets.wenXiaowanIdPhoto;
const officialStoryImageUrls: Record<string, string> = {
  officialChapterOneScene: surveyElevatorSceneUrl,
  officialPrologueFloor41: imageAssets.officialPrologue03Floor41,
  storyCctvControlRoom: imageAssets.storyCctvControlRoom,
  wenXiaowanIdPhoto: imageAssets.wenXiaowanIdPhoto,
};

type OfficialArea = 'case' | 'messages' | 'survey' | 'search' | 'replay' | 'story';
type OfficialSaveState = {
  version: 1;
  collectedClueIds: string[];
  selectedClueIds: string[];
  selectedReasoningAnswers: Record<string, string>;
  replaySubmitted: boolean;
  activeThreadId: string;
  completedAreaIds: OfficialArea[];
  selectedSurveyHotspotId: string | null;
  inspectedSurveyHotspotIds: string[];
  searchResultClueId: string | null;
  searchDetailClueId: string | null;
  usedSearchHintCount: number;
  experimentStarted: boolean;
};

const OFFICIAL_SAVE_KEY = 'haunted-elevator-official-save-v1';

function createOfficialInitialSaveState(): OfficialSaveState {
  return {
    version: 1,
    collectedClueIds: [],
    selectedClueIds: [],
    selectedReasoningAnswers: {},
    replaySubmitted: false,
    activeThreadId: 'bao',
    completedAreaIds: [],
    selectedSurveyHotspotId: null,
    inspectedSurveyHotspotIds: [],
    searchResultClueId: null,
    searchDetailClueId: null,
    usedSearchHintCount: 0,
    experimentStarted: false,
  };
}

function parseOfficialSaveState(raw: string | null): OfficialSaveState {
  const fallback = createOfficialInitialSaveState();

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OfficialSaveState>;

    return {
      version: 1,
      collectedClueIds: Array.isArray(parsed.collectedClueIds)
        ? parsed.collectedClueIds
        : fallback.collectedClueIds,
      selectedClueIds: Array.isArray(parsed.selectedClueIds)
        ? parsed.selectedClueIds
        : fallback.selectedClueIds,
      selectedReasoningAnswers:
        parsed.selectedReasoningAnswers && typeof parsed.selectedReasoningAnswers === 'object'
          ? parsed.selectedReasoningAnswers
          : fallback.selectedReasoningAnswers,
      replaySubmitted: parsed.replaySubmitted ?? fallback.replaySubmitted,
      activeThreadId: parsed.activeThreadId ?? fallback.activeThreadId,
      completedAreaIds: Array.isArray(parsed.completedAreaIds)
        ? parsed.completedAreaIds.filter((areaId): areaId is OfficialArea =>
            ['case', 'messages', 'survey', 'search', 'replay', 'story'].includes(areaId),
          )
        : fallback.completedAreaIds,
      selectedSurveyHotspotId:
        parsed.selectedSurveyHotspotId ?? fallback.selectedSurveyHotspotId,
      inspectedSurveyHotspotIds: Array.isArray(parsed.inspectedSurveyHotspotIds)
        ? parsed.inspectedSurveyHotspotIds
        : fallback.inspectedSurveyHotspotIds,
      searchResultClueId: parsed.searchResultClueId ?? fallback.searchResultClueId,
      searchDetailClueId: parsed.searchDetailClueId ?? fallback.searchDetailClueId,
      usedSearchHintCount:
        typeof parsed.usedSearchHintCount === 'number'
          ? Math.min(3, Math.max(0, parsed.usedSearchHintCount))
          : fallback.usedSearchHintCount,
      experimentStarted: parsed.experimentStarted ?? fallback.experimentStarted,
    };
  } catch {
    return fallback;
  }
}

function loadOfficialSaveState(): OfficialSaveState {
  if (typeof localStorage === 'undefined') {
    return createOfficialInitialSaveState();
  }

  return parseOfficialSaveState(localStorage.getItem(OFFICIAL_SAVE_KEY));
}

interface SceneHotspot {
  id: string;
  label: string;
  clueId: string;
  observation: string;
  style: Record<string, string>;
  labelPlacement?: 'top' | 'bottom';
}

interface ContactThread {
  id: string;
  name: string;
  role: string;
  avatarId?: string;
  avatarText: string;
  status: string;
  clueId?: string;
  videoClueId?: string;
  messages: Array<{
    from: 'self' | 'other';
    text: string;
  }>;
}

type ElevatorDropAnimation = {
  timeline: gsap.core.Timeline;
  revert: () => void;
};

const router = useRouter();
const route = useRoute();
const initialOfficialSaveState = loadOfficialSaveState();
const collectedClueIds = ref<string[]>(initialOfficialSaveState.collectedClueIds);
const selectedClueIds = ref<string[]>(initialOfficialSaveState.selectedClueIds);
const selectedReasoningAnswers = ref<Record<string, string>>(
  initialOfficialSaveState.selectedReasoningAnswers,
);
const replaySubmitted = ref(initialOfficialSaveState.replaySubmitted);
const completedAreaIds = ref<OfficialArea[]>(initialOfficialSaveState.completedAreaIds);
const activeClue = ref<OfficialClue | null>(null);
const activeCluePresentation = ref<'default' | 'pdf'>('default');
const activeVideoClue = ref<OfficialClue | null>(null);
const activeThreadId = ref(initialOfficialSaveState.activeThreadId);
const selectedSurveyHotspotId = ref<string | null>(initialOfficialSaveState.selectedSurveyHotspotId);
const inspectedSurveyHotspotIds = ref<string[]>(
  initialOfficialSaveState.inspectedSurveyHotspotIds,
);
const keywordInput = ref('');
const searchMessage = ref('');
const searchHintVisible = ref(false);
const searchHintInput = ref('');
const searchHintMessage = ref('');
const usedSearchHintCount = ref(initialOfficialSaveState.usedSearchHintCount);
const searchResultClueId = ref<string | null>(initialOfficialSaveState.searchResultClueId);
const searchDetailClueId = ref<string | null>(initialOfficialSaveState.searchDetailClueId);
const experimentStarted = ref(initialOfficialSaveState.experimentStarted);
const videoExperimentRoot = ref<HTMLElement | null>(null);
const officialFullStoryVisible = ref(false);
let videoExperimentAnimation: ElevatorDropAnimation | null = null;
let isResettingOfficialSave = false;

const chapterReplay = officialReplayQuestions['official-replay-chapter-1'];
const chapterStory = officialResolutionStories['official-chapter-1'];
const chapterClueIds = chapterReplay.candidateClueIds;

const areaRouteById: Record<OfficialArea, string> = {
  case: '/official/chapter-1/case',
  messages: '/official/chapter-1/messages',
  survey: '/official/chapter-1/survey',
  search: '/official/chapter-1/search',
  replay: '/official/chapter-1/replay',
  story: '/official/chapter-1/story',
};

const searchHintPrompts = [
  {
    phrase: '我是废物，求求伟大的杰哥给我点提示吧。',
  },
  {
    phrase: '我脑子真的特别垃圾，再求求杰哥了。',
  },
  {
    phrase: '杰哥别走杰哥别走，最后给我一次机会，我真求求你了。',
  },
] as const;

const searchHintTargets = [
  {
    clueId: 'official-clue-burnt-smell',
    keyword: '焦糊味',
  },
  {
    clueId: 'official-clue-child-suspended',
    keyword: '悬空',
  },
  {
    clueId: 'official-clue-falling-test',
    keyword: '坠落',
  },
  {
    clueId: 'official-clue-standing-corpse',
    keyword: '站着的尸体',
  },
  {
    clueId: 'official-clue-no-rope',
    keyword: '没有绳索',
  },
] as const;

const officialAreaOrder: OfficialArea[] = ['case', 'messages', 'survey', 'search', 'replay', 'story'];

const areaByRouteName: Record<string, OfficialArea> = {
  officialChapterOneCase: 'case',
  officialChapterOneMessages: 'messages',
  officialChapterOneSurvey: 'survey',
  officialChapterOneSearch: 'search',
  officialChapterOneReplay: 'replay',
  officialChapterOneStory: 'story',
};

const activeArea = computed<OfficialArea>(() => {
  const routeName = typeof route.name === 'string' ? route.name : '';

  return areaByRouteName[routeName] ?? 'case';
});

const chapterClues = computed(() =>
  chapterClueIds.map((clueId) => officialClues[clueId]),
);

const collectedCount = computed(() =>
  chapterClueIds.filter((clueId) => collectedClueIds.value.includes(clueId)).length,
);

const isCaseAreaComplete = computed(() => completedAreaIds.value.includes('case'));

const currentSearchHintPrompt = computed(
  () => searchHintPrompts[usedSearchHintCount.value] ?? null,
);

const nextUncollectedSearchHintTarget = computed(() =>
  searchHintTargets
    .slice(usedSearchHintCount.value)
    .find((target) => !isClueCollected(target.clueId)) ?? null,
);

const remainingSearchHintCount = computed(() =>
  Math.max(0, searchHintPrompts.length - usedSearchHintCount.value),
);

const activeThread = computed(
  () => contactThreads.find((thread) => thread.id === activeThreadId.value) ?? contactThreads[0],
);

const searchResultClue = computed(() =>
  searchResultClueId.value ? officialClues[searchResultClueId.value] : null,
);

const searchDetailClue = computed(() =>
  searchDetailClueId.value ? officialClues[searchDetailClueId.value] : null,
);

const collectedChapterClues = computed(() =>
  chapterClues.value.filter((item) => isClueCollected(item.id)),
);

const selectedSurveyHotspot = computed(
  () =>
    sceneHotspots.find((hotspot) => hotspot.id === selectedSurveyHotspotId.value) ?? null,
);

const inspectedSurveyHotspots = computed(() =>
  sceneHotspots.filter((hotspot) => inspectedSurveyHotspotIds.value.includes(hotspot.id)),
);

const isMessagesAreaComplete = computed(() =>
  contactThreads
    .map((thread) => thread.clueId)
    .filter((clueId): clueId is string => Boolean(clueId))
    .every((clueId) => isClueCollected(clueId)),
);

const isSurveyAreaComplete = computed(
  () => inspectedSurveyHotspots.value.length === sceneHotspots.length,
);

const isSearchAreaComplete = computed(() => collectedCount.value === chapterClueIds.length);

const canSubmitReplay = computed(
  () =>
    collectedCount.value === chapterClueIds.length &&
    selectedClueIds.value.length === 3 &&
    chapterReplay.reasoningQuestions.every(
      (question) => selectedReasoningAnswers.value[question.id],
    ),
);

const answeredReasoningCount = computed(
  () =>
    chapterReplay.reasoningQuestions.filter(
      (question) => selectedReasoningAnswers.value[question.id],
    ).length,
);

const isReplayCorrect = computed(() => {
  if (!replaySubmitted.value) {
    return false;
  }

  const selected = [...selectedClueIds.value].sort();
  const correct = [...chapterReplay.correctClueIds].sort();
  const cluesCorrect =
    selected.length === correct.length &&
    selected.every((clueId, index) => clueId === correct[index]);
  const answersCorrect = chapterReplay.reasoningQuestions.every(
    (question) =>
      selectedReasoningAnswers.value[question.id] === question.correctOptionId,
  );

  return cluesCorrect && answersCorrect;
});

const areaCompletionById = computed<Record<OfficialArea, boolean>>(() => ({
  case: isCaseAreaComplete.value,
  messages: isMessagesAreaComplete.value,
  survey: isSurveyAreaComplete.value,
  search: isSearchAreaComplete.value,
  replay: isReplayCorrect.value,
  story: isReplayCorrect.value,
}));

const currentUnlockedArea = computed(() => {
  let unlockedArea: OfficialArea = 'case';

  for (let index = 1; index < officialAreaOrder.length; index += 1) {
    const previousArea = officialAreaOrder[index - 1];

    if (!areaCompletionById.value[previousArea]) {
      break;
    }

    unlockedArea = officialAreaOrder[index];
  }

  return unlockedArea;
});

const officialAreaItems = [
  {
    id: 'case',
    label: '案件区',
    desc: '接案背景',
    icon: Document,
  },
  {
    id: 'messages',
    label: '通讯区',
    desc: '角色推进',
    icon: ChatLineRound,
  },
  {
    id: 'survey',
    label: '勘查区',
    desc: '电梯现场',
    icon: Location,
  },
  {
    id: 'search',
    label: '检索区',
    desc: '关键词查档',
    icon: Search,
  },
  {
    id: 'replay',
    label: '复盘区',
    desc: '统一提交',
    icon: Files,
  },
  {
    id: 'story',
    label: '故事区',
    desc: '结案故事',
    icon: Notebook,
  },
] as const;

const officialAreaNavItems = computed(() =>
  officialAreaItems.map((item) => ({
    ...item,
    disabled: !canOpenOfficialArea(item.id),
  })),
);

const caseTimeline = [
  {
    time: '23:00',
    title: '温小婉深夜离开42楼',
    text: '出版公司位于顶楼。她独自加班后进入案发电梯，随后失去正常行动轨迹。',
  },
  {
    time: '40F',
    title: '母子在40楼呼叫电梯',
    text: '孩子先说电梯里有“悬空的姐姐”，母亲随后看到头颅滚出门外。',
  },
  {
    time: '清晨',
    title: '特案组抵达',
    text: '周警官无法判断自杀、他杀还是意外，梁教授要求先拆解物理矛盾。',
  },
];

const caseContradictions = [
  {
    title: '尸体为什么站着',
    text: '无头身体没有倒下，这让目击者把现场理解成“鬼站在电梯里”。',
  },
  {
    title: '头颅为什么滚出门外',
    text: '尸首分离后电梯仍发生停靠和颠簸，发现顺序需要被单独记录。',
  },
  {
    title: '没有绳索却像悬吊',
    text: '孩子看见“没有站在地上”的姐姐，但现场找不到常规吊具。',
  },
  {
    title: '血迹没有人体遮挡',
    text: '四壁喷溅连续，现场记录没有标出明显的人体遮挡空区。',
  },
];

const sceneHotspots: SceneHotspot[] = [
  {
    id: 'body',
    label: '站立轮廓',
    clueId: 'official-clue-standing-corpse',
    observation: '死者呈站立形态，身体没有自然倒伏，脚下也看不出明显拖拽痕迹。',
    style: { left: '50%', top: '48%' },
  },
  {
    id: 'head',
    label: '门口头颅',
    clueId: 'official-clue-head-rolled',
    observation: '门槛外有一处被遮挡的圆形物，位置靠近电梯开口，像是开门后滚出的结果；颈部撕裂方向需要和轿厢运动一起看。',
    style: { left: '67%', top: '84%' },
  },
  {
    id: 'blood',
    label: '四壁血迹',
    clueId: 'official-clue-blood-spatter',
    observation: '轿厢四壁有大面积暗红痕迹，分布不只集中在地面，现场冲击感很强。',
    style: { left: '28%', top: '34%' },
  },
  {
    id: 'scarf',
    label: '反绑丝巾',
    clueId: 'official-clue-bound-scarf',
    observation: '死者双臂绕在身后，腰侧能看见被束缚的痕迹，像是用随身丝巾反绑。',
    style: { left: '58%', top: '55%' },
  },
  {
    id: 'ceiling',
    label: '轿厢顶部',
    clueId: 'official-clue-no-rope',
    observation: '轿厢顶部和门框处没有一眼可见的吊挂工具，也没有绳索痕迹，现场不像普通悬吊。',
    style: { left: '50%', top: '16%' },
    labelPlacement: 'bottom',
  },
  {
    id: 'display',
    label: '42楼记录',
    clueId: 'official-clue-forty-two-start',
    observation: '楼层显示和案卷记录都指向顶楼方向，死者最后离开的位置需要重点记住。',
    style: { left: '50%', top: '6%' },
    labelPlacement: 'bottom',
  },
  {
    id: 'carpet',
    label: '硬化地毯',
    clueId: 'official-clue-burnt-smell',
    observation: '靠近轿厢地面的位置有发暗和发硬的痕迹，密闭空间里还残留一点异常焦味。',
    style: { left: '58%', top: '77%' },
  },
];

const contactThreads: ContactThread[] = [
  {
    id: 'bao',
    name: '包斩',
    role: '现场嗅觉',
    avatarId: 'baozhan',
    avatarText: '包',
    status: '现场回传',
    clueId: 'official-clue-burnt-smell',
    messages: [
      { from: 'other', text: '你先别急着把它当鬼案。鬼不会留下设备故障的味道。' },
      { from: 'self', text: '你在现场闻到了什么？' },
      { from: 'other', text: '血腥味下面压着一层焦糊味，很淡，但在密闭轿厢里不该被忽略。' },
      { from: 'other', text: '这条先记下来：电梯不是稳定容器，它本身可能出过问题。' },
    ],
  },
  {
    id: 'liang',
    name: '梁教授',
    role: '机制判断',
    avatarId: 'professor',
    avatarText: '梁',
    status: '试验准备',
    clueId: 'official-clue-falling-test',
    videoClueId: 'official-clue-falling-test',
    messages: [
      { from: 'other', text: '站着的尸体能由尸体痉挛解释，但头颅被扯断不能。' },
      { from: 'self', text: '所以重点不是尸体站着？' },
      { from: 'other', text: '站立和没有倒下，可能涉及死亡瞬间僵直。先把现场姿态、创口形态和电梯运行记录分开核对。' },
      { from: 'other', text: '我们坐电梯下去的时候，前几层还算正常，后来楼层数字突然跳得很快，整个人一下往下沉。视频我发你。' },
    ],
  },
  {
    id: 'su',
    name: '苏眉',
    role: '目击证词',
    avatarId: 'sumei',
    avatarText: '苏',
    status: '证词核对',
    clueId: 'official-clue-child-suspended',
    messages: [
      { from: 'other', text: '那个孩子一直说姐姐没有站在地上，他不像是在编故事。' },
      { from: 'self', text: '孩子会不会只是被吓到了？' },
      { from: 'other', text: '会，但恐惧也可能保留最直观的事实：他看见的是悬空状态。' },
    ],
  },
  {
    id: 'zhou',
    name: '周警官',
    role: '现场负责',
    avatarText: '周',
    status: '材料移交',
    clueId: 'official-clue-mother-report',
    messages: [
      { from: 'other', text: '案发电梯已经断电封控，母子笔录和初步验尸都同步给你。' },
      { from: 'self', text: '警方现在倾向哪种方向？' },
      { from: 'other', text: '自杀、他杀、意外都有人提，但没有一种能解释全部现场。' },
    ],
  },
];

function collectClue(clueId: string) {
  if (!collectedClueIds.value.includes(clueId)) {
    collectedClueIds.value = [...collectedClueIds.value, clueId];
  }
}

function collectAndOpenClue(clueId: string) {
  collectClue(clueId);
  activeCluePresentation.value = 'default';
  activeClue.value = officialClues[clueId];
}

function openPdfClue(clueId: string) {
  collectClue(clueId);
  activeCluePresentation.value = 'pdf';
  activeClue.value = officialClues[clueId];
}

async function openExperimentVideo(clueId: string) {
  collectClue(clueId);
  experimentStarted.value = true;
  activeVideoClue.value = officialClues[clueId];
  await nextTick();

  replayExperimentVideo();
}

function replayExperimentVideo() {
  videoExperimentAnimation?.revert();
  videoExperimentAnimation = playElevatorTestVideo(videoExperimentRoot.value);
}

function closeExperimentVideo() {
  videoExperimentAnimation?.revert();
  videoExperimentAnimation = null;
  activeVideoClue.value = null;
}

function inspectSurveyHotspot(hotspot: SceneHotspot) {
  selectedSurveyHotspotId.value = hotspot.id;

  if (!inspectedSurveyHotspotIds.value.includes(hotspot.id)) {
    inspectedSurveyHotspotIds.value = [...inspectedSurveyHotspotIds.value, hotspot.id];
  }
}

function completeOfficialArea(areaId: OfficialArea) {
  if (!completedAreaIds.value.includes(areaId)) {
    completedAreaIds.value = [...completedAreaIds.value, areaId];
  }
}

function canOpenOfficialArea(areaId: OfficialArea) {
  const areaIndex = officialAreaOrder.indexOf(areaId);

  if (areaIndex <= 0) {
    return true;
  }

  return officialAreaOrder
    .slice(0, areaIndex)
    .every((previousAreaId) => areaCompletionById.value[previousAreaId]);
}

function openOfficialArea(areaId: OfficialArea) {
  const targetArea = canOpenOfficialArea(areaId) ? areaId : currentUnlockedArea.value;
  const targetPath = areaRouteById[targetArea];

  if (targetPath) {
    void router.push(targetPath);
  }
}

function startOfficialInvestigation() {
  completeOfficialArea('case');
  openOfficialArea('messages');
}

function collectAllChapterSix() {
  collectedClueIds.value = Array.from(
    new Set([...collectedClueIds.value, ...chapterClueIds]),
  );

  if (!searchDetailClueId.value) {
    searchDetailClueId.value = chapterClueIds[0] ?? null;
  }
}

function searchKeyword() {
  const rawKeyword = keywordInput.value.trim();
  const normalizedKeyword = rawKeyword.toLowerCase();

  if (!normalizedKeyword) {
    searchResultClueId.value = null;
    searchMessage.value = '请输入你从现场、通讯或案卷里注意到的异常。';
    return;
  }

  const matchedClue = chapterClues.value.find((clue) =>
    clue.keywords.some((keyword) =>
      keyword.toLowerCase().includes(normalizedKeyword) ||
      normalizedKeyword.includes(keyword.toLowerCase()),
    ),
  );

  if (!matchedClue) {
    searchResultClueId.value = null;
    searchDetailClueId.value = null;
    searchMessage.value = '没有命中档案。换一个更具体的现场异常试试。';
    return;
  }

  searchResultClueId.value = matchedClue.id;
  searchDetailClueId.value = matchedClue.id;
  searchMessage.value = '命中 1 条档案。详情已同步展开，确认后可归档。';
}

function openSearchDetail(clueId: string) {
  searchDetailClueId.value = clueId;
}

function submitSearchHint(inputValue = searchHintInput.value) {
  if (!currentSearchHintPrompt.value) {
    searchHintMessage.value = '三次提示机会已经用完。';
    return;
  }

  const normalizeHintText = (text: string) => text.replace(/\s/g, '');

  if (
    normalizeHintText(inputValue) ===
    normalizeHintText(currentSearchHintPrompt.value.phrase)
  ) {
    searchHintMessage.value = nextUncollectedSearchHintTarget.value
      ? `提示已开启：试试搜索：${nextUncollectedSearchHintTarget.value.keyword}`
      : '你已经归档了当前提示池里的全部线索。';
    usedSearchHintCount.value += 1;
    searchHintInput.value = '';
    return;
  }

  searchHintMessage.value = '口令不对。照着上面的句子完整输入。';
}

function submitSearchHintFromDialog(event: MouseEvent) {
  const dialog =
    (event.currentTarget as HTMLElement).closest('.el-dialog, section') ?? document;
  const input = dialog.querySelector<HTMLInputElement>('.official-search-hint-input');

  submitSearchHint(input?.value ?? searchHintInput.value);
}

function updateSearchHintInput(event: Event) {
  searchHintInput.value = (event.target as HTMLInputElement).value;
}

function blockSearchHintPaste(event: ClipboardEvent) {
  event.preventDefault();
  searchHintMessage.value = '不能复制粘贴，只能打字输入。';
}

function archiveSearchDetail() {
  if (!searchDetailClueId.value) {
    return;
  }

  collectClue(searchDetailClueId.value);
}

function toggleReplayClue(clueId: string) {
  replaySubmitted.value = false;

  if (selectedClueIds.value.includes(clueId)) {
    selectedClueIds.value = selectedClueIds.value.filter((id) => id !== clueId);
    return;
  }

  if (selectedClueIds.value.length >= 3) {
    return;
  }

  selectedClueIds.value = [...selectedClueIds.value, clueId];
}

function playElevatorTestVideo(root: HTMLElement | null): ElevatorDropAnimation | null {
  if (!root) {
    return null;
  }

  let timeline: gsap.core.Timeline | null = null;
  const ctx = gsap.context(() => {
    const floorDisplay = root.querySelector('.official-video-floor-display');
    const floorState = { value: 42 };

    const setFloorText = () => {
      if (floorDisplay) {
        floorDisplay.textContent = String(Math.max(1, Math.round(floorState.value))).padStart(
          2,
          '0',
        );
      }
    };

    floorState.value = 42;
    setFloorText();
    gsap.set('.official-video-door-line', { autoAlpha: 0.38 });
    gsap.set('.official-video-elevator-cab', { y: -10, scaleY: 1, autoAlpha: 1 });
    gsap.set('.official-video-speed-lines', { y: 0, autoAlpha: 0.12 });

    timeline = gsap
      .timeline({ defaults: { ease: 'none' } })
      .to('.official-video-scanline', { y: 430, duration: 1.5 }, 0)
      .to('.official-video-speed-lines', { y: -80, duration: 1.05 }, 0.1)
      .to('.official-video-elevator-cab', { y: 8, duration: 1.05 }, 0.1)
      .to(
        floorState,
        {
          value: 39,
          duration: 1.05,
          snap: { value: 0.1 },
          onUpdate: setFloorText,
        },
        0.1,
      )
      .to(
        '.official-video-door-line',
        { autoAlpha: 0.58, repeat: 3, yoyo: true, duration: 0.12 },
        1.05,
      )
      .to(
        floorState,
        {
          value: 12,
          duration: 0.34,
          snap: { value: 0.1 },
          ease: 'power4.in',
          onUpdate: setFloorText,
        },
        1.16,
      )
      .to(
        '.official-video-speed-lines',
        { y: -390, autoAlpha: 0.42, duration: 0.34, ease: 'power4.in' },
        1.16,
      )
      .to(
        '.official-video-elevator-cab',
        { y: 46, scaleY: 0.96, duration: 0.34, ease: 'power4.in' },
        1.16,
      )
      .to(
        floorState,
        {
          value: 9,
          duration: 0.12,
          snap: { value: 0.1 },
          ease: 'power2.out',
          onUpdate: setFloorText,
        },
        1.52,
      )
      .to(
        '.official-video-frame',
        { x: -2, repeat: 3, yoyo: true, duration: 0.04 },
        1.48,
      )
      .to(
        '.official-video-elevator-cab',
        { y: 32, scaleY: 1, duration: 0.12, ease: 'power2.out' },
        1.5,
      )
      .to(
        '.official-video-floor-display',
        { autoAlpha: 0.42, repeat: 5, yoyo: true, duration: 0.045 },
        1.16,
      );
  }, root);

  if (!timeline) {
    ctx.revert();
    return null;
  }

  return {
    timeline,
    revert() {
      timeline?.kill();
      ctx.revert();
    },
  };
}

function submitReplay() {
  replaySubmitted.value = true;
}

function resetReplay() {
  replaySubmitted.value = false;
  selectedClueIds.value = [];
  selectedReasoningAnswers.value = {};
}

function resetOfficialSave() {
  const resetState = createOfficialInitialSaveState();

  isResettingOfficialSave = true;
  closeExperimentVideo();
  collectedClueIds.value = resetState.collectedClueIds;
  selectedClueIds.value = resetState.selectedClueIds;
  selectedReasoningAnswers.value = resetState.selectedReasoningAnswers;
  replaySubmitted.value = resetState.replaySubmitted;
  activeThreadId.value = resetState.activeThreadId;
  completedAreaIds.value = resetState.completedAreaIds;
  selectedSurveyHotspotId.value = resetState.selectedSurveyHotspotId;
  inspectedSurveyHotspotIds.value = resetState.inspectedSurveyHotspotIds;
  keywordInput.value = '';
  searchMessage.value = '';
  searchHintInput.value = '';
  searchHintMessage.value = '';
  usedSearchHintCount.value = resetState.usedSearchHintCount;
  searchResultClueId.value = resetState.searchResultClueId;
  searchDetailClueId.value = resetState.searchDetailClueId;
  experimentStarted.value = resetState.experimentStarted;
  activeClue.value = null;
  activeCluePresentation.value = 'default';

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(OFFICIAL_SAVE_KEY);
  }

  isResettingOfficialSave = false;
  void router.push(areaRouteById.case);
}

function isClueCollected(clueId: string) {
  return collectedClueIds.value.includes(clueId);
}

function sourceLabel(source: OfficialClue['source']) {
  const labels: Record<OfficialClue['source'], string> = {
    scene: '现场',
    testimony: '证词',
    autopsy: '尸检',
    experiment: '试验',
    background: '背景',
  };

  return labels[source];
}

function clueTitles(clueIds: string[]) {
  return clueIds
    .map((clueId) => officialClues[clueId]?.title)
    .filter(Boolean);
}

function avatarStyle(thread: ContactThread) {
  return thread.avatarId ? getSquadAvatarStyle(thread.avatarId) : undefined;
}

watch(
  [
    collectedClueIds,
    selectedClueIds,
    selectedReasoningAnswers,
    replaySubmitted,
    activeThreadId,
    completedAreaIds,
    selectedSurveyHotspotId,
    inspectedSurveyHotspotIds,
    searchResultClueId,
    searchDetailClueId,
    usedSearchHintCount,
    experimentStarted,
  ],
  () => {
    if (isResettingOfficialSave || typeof localStorage === 'undefined') {
      return;
    }

    const saveState: OfficialSaveState = {
      version: 1,
      collectedClueIds: collectedClueIds.value,
      selectedClueIds: selectedClueIds.value,
      selectedReasoningAnswers: selectedReasoningAnswers.value,
      replaySubmitted: replaySubmitted.value,
      activeThreadId: activeThreadId.value,
      completedAreaIds: completedAreaIds.value,
      selectedSurveyHotspotId: selectedSurveyHotspotId.value,
      inspectedSurveyHotspotIds: inspectedSurveyHotspotIds.value,
      searchResultClueId: searchResultClueId.value,
      searchDetailClueId: searchDetailClueId.value,
      usedSearchHintCount: usedSearchHintCount.value,
      experimentStarted: experimentStarted.value,
    };

    localStorage.setItem(OFFICIAL_SAVE_KEY, JSON.stringify(saveState));
  },
  { deep: true, flush: 'sync' },
);

watch(
  activeArea,
  (areaId) => {
    if (canOpenOfficialArea(areaId)) {
      return;
    }

    void router.push(areaRouteById[currentUnlockedArea.value]);
  },
  { immediate: true },
);

onUnmounted(() => {
  videoExperimentAnimation?.revert();
});
</script>

<template>
  <el-container class="official-game-shell">
    <el-aside class="official-game-aside" width="clamp(248px, 22vw, 300px)">
      <div class="workspace-aside-body">
        <section class="workspace-brand">
          <span class="brand-mark">CH-01</span>
          <div>
            <p>正式篇 / 独立章节</p>
            <h1>尸体痉挛</h1>
          </div>
        </section>

        <section class="chapter-status">
          <el-tag type="info" effect="plain">当前游戏</el-tag>
          <h2>第一章：尸体痉挛</h2>
          <p>从开场怪谈进入无头女尸现场，确认电梯是否只是案发地点。</p>
        </section>

        <nav class="workspace-nav" aria-label="第一章调查区">
          <button
            v-for="item in officialAreaNavItems"
            :key="item.id"
            class="workspace-nav-card"
            :class="{ active: activeArea === item.id, disabled: item.disabled }"
            type="button"
            :disabled="item.disabled"
            @click="openOfficialArea(item.id)"
          >
            <el-icon :size="20"><component :is="item.icon" /></el-icon>
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.disabled ? '待完成前序' : item.desc }}</small>
            </span>
          </button>
        </nav>

        <div class="official-aside-actions">
          <el-button class="reset-button" :icon="RefreshLeft" plain @click="resetOfficialSave">
            清空存档
          </el-button>
          <el-button class="reset-button" :icon="ArrowLeft" plain @click="router.push('/')">
            返回首页
          </el-button>
        </div>
      </div>
    </el-aside>

    <el-container class="workspace-main">
      <el-header class="workspace-header" height="76px">
        <div>
          <p class="eyebrow">FORMAL CHAPTER DESK</p>
          <strong>第一章：尸体痉挛</strong>
        </div>
        <el-space>
          <el-tag type="danger" effect="plain">
            {{ collectedCount }}/{{ chapterClueIds.length }} 线索
          </el-tag>
          <el-tag effect="plain">正式章节</el-tag>
        </el-space>
      </el-header>

      <el-main class="workspace-content">
        <template v-if="activeArea === 'case'">
          <el-card shadow="never" class="section-card official-case-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="eyebrow">CASE INTAKE</p>
                  <h2>案件区</h2>
                </div>
                <el-tag type="danger" effect="plain">
                  第一现场：电梯
                </el-tag>
              </div>
            </template>

            <div class="official-case-board" aria-label="案件线索白板">
              <div class="board-line line-report-victim"></div>
              <div class="board-line line-victim-judge"></div>
              <div class="board-line line-report-timeline"></div>
              <div class="board-line line-judge-contradictions"></div>

              <section class="board-paper board-report official-report-card">
                <span class="board-pin"></span>
                <img
                  :src="reportElevatorImageUrl"
                  alt="案发电梯现场"
                />
                <div>
                  <span>110 接警摘录</span>
                  <h3>母子报警</h3>
                  <p>
                    40楼电梯门打开后，球形物体滚到母亲脚边。确认是一颗人头后，
                    孩子仍指着轿厢，说里面的姐姐没有站在地上。
                  </p>
                </div>
              </section>

              <figure class="board-photo board-field official-case-image-card">
                <span class="board-pin"></span>
                <img
                  class="official-case-image"
                  :src="fieldInvestigationImageUrl"
                  alt="特案组在现场协查案发电梯"
                />
                <figcaption>特案组抵达后，周警官移交现场保护记录。</figcaption>
              </figure>

              <section class="board-victim official-victim-file">
                <span class="board-pin"></span>
                <div class="official-victim-head">
                  <div>
                    <span>VICTIM FILE</span>
                    <h3>温小婉</h3>
                  </div>
                </div>
                <div class="official-victim-body">
                  <img
                    class="official-victim-photo"
                    :src="wenXiaowanPhotoUrl"
                    alt="温小婉证件照"
                  />
                  <dl>
                    <div>
                      <dt>身份</dt>
                      <dd>出版公司编辑</dd>
                    </div>
                    <div>
                      <dt>地点</dt>
                      <dd>42楼公司 / 案发电梯</dd>
                    </div>
                    <div>
                      <dt>状态</dt>
                      <dd>身首异处，双手被丝巾反绑</dd>
                    </div>
                    <div>
                      <dt>背景</dt>
                      <dd>分手、加班、情绪低落，仍需与现场记录交叉核对</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section class="board-note board-judgement official-police-judgement">
                <span>POLICE VIEW</span>
                <h3>警方初判</h3>
                <p>
                  现场一度被放进三个方向：自杀、他杀、意外死亡。
                  但自杀缺少吊具，他杀缺少凶手痕迹，意外又解释不了双手反绑和悬空目击。
                </p>
              </section>

              <section class="board-timeline official-case-timeline" aria-label="第一章时间线">
                <article v-for="item in caseTimeline" :key="item.time">
                  <span>{{ item.time }}</span>
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.text }}</p>
                  </div>
                </article>
              </section>

              <section class="board-contradictions official-contradiction-list" aria-label="核心矛盾">
                <article
                  v-for="contradiction in caseContradictions"
                  :key="contradiction.title"
                  class="official-contradiction-card"
                >
                  <strong>{{ contradiction.title }}</strong>
                  <p>{{ contradiction.text }}</p>
                </article>
              </section>

              <section class="board-task official-case-task-panel">
                <article class="official-case-task-note">
                  <span>CURRENT TASK</span>
                  <h3>故事背景</h3>
                  <p>
                    出版公司女编辑温小婉深夜进入电梯后身首异处。报警母子在40楼看到头颅滚出，
                    孩子却坚持说电梯里还有一个“悬空的姐姐”。
                  </p>
                </article>
                <article class="official-case-task-note">
                  <span>CHAPTER GOAL</span>
                  <h3>本章目标</h3>
                  <p>
                    先理解这起“有鬼电梯”的表象，再进入通讯区、勘查区和检索区，
                    把怪谈拆成可验证的现场矛盾。
                  </p>
                  <button
                    class="official-case-start-button"
                    type="button"
                    @click="startOfficialInvestigation"
                  >
                    开始断案
                  </button>
                </article>
              </section>
            </div>
          </el-card>
        </template>

        <template v-else-if="activeArea === 'messages'">
          <el-card shadow="never" class="section-card official-case-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="eyebrow">TASK FORCE CHAT</p>
                  <h2>通讯区</h2>
                </div>
                <el-tag effect="plain">
                  已归档 {{ collectedCount }}/{{ chapterClueIds.length }}
                </el-tag>
              </div>
            </template>

            <div class="official-chat-layout">
              <aside class="official-contact-list" aria-label="通讯联系人">
                <button
                  v-for="thread in contactThreads"
                  :key="thread.id"
                  class="official-contact-card"
                  type="button"
                  :class="{ active: activeThreadId === thread.id }"
                  @click="activeThreadId = thread.id"
                >
                  <span
                    class="official-contact-avatar squad-avatar"
                    :style="avatarStyle(thread)"
                    aria-hidden="true"
                  >
                    {{ thread.avatarId ? '' : thread.avatarText }}
                  </span>
                  <span class="official-contact-copy">
                    <strong>{{ thread.name }}</strong>
                    <small>{{ thread.role }}</small>
                  </span>
                  <span
                    v-if="thread.clueId"
                    class="official-contact-state"
                    :class="{ archived: isClueCollected(thread.clueId) }"
                  >
                    {{ isClueCollected(thread.clueId) ? '已归档' : '未归档' }}
                  </span>
                </button>
              </aside>

              <section class="official-chat-panel">
                <header>
                  <div class="official-thread-profile">
                    <span
                      class="official-contact-avatar squad-avatar large"
                      :style="avatarStyle(activeThread)"
                      aria-hidden="true"
                    >
                      {{ activeThread.avatarId ? '' : activeThread.avatarText }}
                    </span>
                    <div>
                      <strong>{{ activeThread.name }}</strong>
                      <span>{{ activeThread.role }} / {{ activeThread.status }}</span>
                    </div>
                  </div>
                  <span
                    v-if="activeThread.clueId"
                    class="official-thread-status"
                    :class="{ archived: isClueCollected(activeThread.clueId) }"
                  >
                    {{ isClueCollected(activeThread.clueId) ? '附件已归档' : '附件未归档' }}
                  </span>
                </header>
                <div class="official-chat-messages">
                  <article
                    v-for="(message, index) in activeThread.messages"
                    :key="`${activeThread.id}-${index}`"
                    class="official-chat-message"
                    :class="message.from"
                  >
                    <span
                      v-if="message.from === 'other'"
                      class="official-message-avatar squad-avatar"
                      :style="avatarStyle(activeThread)"
                      aria-hidden="true"
                    >
                      {{ activeThread.avatarId ? '' : activeThread.avatarText }}
                    </span>
                    <p>{{ message.text }}</p>
                  </article>
                  <article
                    v-if="activeThread.clueId"
                    class="official-chat-message other official-chat-file-message"
                  >
                    <span
                      class="official-message-avatar squad-avatar"
                      :style="avatarStyle(activeThread)"
                      aria-hidden="true"
                    >
                      {{ activeThread.avatarId ? '' : activeThread.avatarText }}
                    </span>
                    <button
                      class="official-thread-attachment"
                      type="button"
                      @click="openPdfClue(activeThread.clueId)"
                    >
                      <span class="official-pdf-icon">PDF</span>
                      <span class="official-pdf-copy">
                        <strong>{{ officialClues[activeThread.clueId].title }}</strong>
                        <small>{{ officialClues[activeThread.clueId].summary }}</small>
                      </span>
                      <span class="official-pdf-meta">PDF 文件</span>
                    </button>
                  </article>
                  <article
                    v-if="activeThread.videoClueId"
                    class="official-chat-message other official-chat-file-message official-chat-video-message"
                  >
                    <span
                      class="official-message-avatar squad-avatar"
                      :style="avatarStyle(activeThread)"
                      aria-hidden="true"
                    >
                      {{ activeThread.avatarId ? '' : activeThread.avatarText }}
                    </span>
                    <button
                      class="official-thread-video"
                      type="button"
                      aria-label="播放电梯急坠试验视频"
                      @click="openExperimentVideo(activeThread.videoClueId)"
                    >
                      <span class="official-video-play"></span>
                      <span class="official-video-duration">00:12</span>
                    </button>
                  </article>
                </div>
              </section>
            </div>
          </el-card>
        </template>

        <template v-else-if="activeArea === 'survey'">
          <el-card shadow="never" class="section-card official-case-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="eyebrow">SCENE SURVEY</p>
                  <h2>勘查区</h2>
                </div>
                <el-button
                  type="danger"
                  :icon="Search"
                  :disabled="!canOpenOfficialArea('search')"
                  @click="openOfficialArea('search')"
                >
                  去检索区
                </el-button>
              </div>
            </template>

            <div class="official-scene-layout">
              <section class="official-elevator-scene" aria-label="电梯现场模拟">
                <div class="official-elevator-door">
                  <img
                    class="official-survey-scene-image"
                    :src="surveyElevatorSceneUrl"
                    alt="电梯门打开后的正式篇第一章现场勘查图"
                  />
                  <button
                    v-for="hotspot in sceneHotspots"
                    :key="hotspot.id"
                    class="official-scene-hotspot"
                    :class="{
                      inspected: inspectedSurveyHotspotIds.includes(hotspot.id),
                      'label-bottom': hotspot.labelPlacement === 'bottom',
                    }"
                    type="button"
                    :style="hotspot.style"
                    :aria-label="`勘查现场点位：${hotspot.label}`"
                    @click="inspectSurveyHotspot(hotspot)"
                  >
                    <span class="hotspot-dot" aria-hidden="true"></span>
                    <span class="hotspot-label">
                      <strong>{{ hotspot.id.toUpperCase().slice(0, 2) }}</strong>
                      <span>{{ hotspot.label }}</span>
                    </span>
                  </button>
                </div>
              </section>

              <aside class="official-scene-notes">
                <section class="official-survey-status-card">
                  <span>SURVEY STATUS</span>
                  <h3>勘查进度</h3>
                  <strong>{{ inspectedSurveyHotspots.length }}/{{ sceneHotspots.length }}</strong>
                  <p>先点击图中黄色点位了解现场情况。线索不会自动归档，需要去检索区输入关键词查询。</p>
                </section>

                <section class="official-survey-selected">
                  <span>CURRENT POINT</span>
                  <template v-if="selectedSurveyHotspot">
                    <h3>{{ selectedSurveyHotspot.label }}</h3>
                    <strong>现场观察</strong>
                    <p>{{ selectedSurveyHotspot.observation }}</p>
                  </template>
                  <template v-else>
                    <h3>尚未选中点位</h3>
                    <p>从现场图上的黄点开始勘查。这里只记录现场观察，不直接进入线索归档。</p>
                  </template>
                </section>

                <section class="official-survey-archive">
                  <span>SCENE CHECKED</span>
                  <h3>已勘查点位</h3>
                  <div class="official-survey-archive-list">
                    <button
                      v-for="hotspot in inspectedSurveyHotspots"
                      :key="hotspot.id"
                      class="official-survey-archive-item"
                      type="button"
                      @click="selectedSurveyHotspotId = hotspot.id"
                    >
                      {{ hotspot.label }}
                    </button>
                  </div>
                  <p v-if="!inspectedSurveyHotspots.length">暂无记录。先点击左侧现场点位。</p>
                </section>

                <button
                  class="official-survey-next-action"
                  type="button"
                  :disabled="!canOpenOfficialArea('search')"
                  @click="openOfficialArea('search')"
                >
                  去检索区
                </button>
              </aside>
            </div>
          </el-card>
        </template>

        <template v-else-if="activeArea === 'search'">
          <div class="clues-workbench-grid official-clues-workbench">
            <el-card shadow="never" class="section-card clues-search-panel">
              <template #header>
                <div class="card-header">
                  <div>
                    <p class="eyebrow">线索区 / 档案检索</p>
                    <h2>把现场观察变成可归档证据</h2>
                  </div>
                  <el-tag effect="plain" type="danger">
                    {{ collectedChapterClues.length }} 条已归档
                  </el-tag>
                </div>
              </template>

              <div class="search-console">
                <div class="search-row">
                  <el-input
                    v-model="keywordInput"
                    class="terminal-input official-keyword-input"
                    size="large"
                    placeholder="输入你从现场推断出的词"
                    clearable
                    @keyup.enter="searchKeyword"
                  />
                  <el-button
                    class="official-search-submit"
                    type="danger"
                    size="large"
                    :icon="Search"
                    @click="searchKeyword"
                  >
                    检索
                  </el-button>
                  <el-button
                    class="official-search-hint-button"
                    plain
                    size="large"
                    :icon="Warning"
                    @click="searchHintVisible = true"
                  >
                    提示
                  </el-button>
                </div>
                <p class="search-helper">
                  你需要回忆电梯现场的异常，再用自己的判断检索档案。
                </p>
                <p v-if="searchMessage" class="official-search-feedback">{{ searchMessage }}</p>
              </div>

              <section class="archived-dossier">
                <div class="archived-dossier-header">
                  <div>
                    <strong>已归档证据</strong>
                    <span>只显示标题，详情在右侧查看。</span>
                  </div>
                  <el-tag effect="plain">{{ collectedChapterClues.length }} 条</el-tag>
                </div>

                <el-empty
                  v-if="!collectedChapterClues.length"
                  description="尚未归档证据"
                  :image-size="70"
                />
                <div v-else class="archived-stack official-archive-list">
                  <button
                    v-for="clue in collectedChapterClues"
                    :key="clue.id"
                    class="archived-evidence-item"
                    :class="{ active: searchDetailClue?.id === clue.id }"
                    type="button"
                    @click="openSearchDetail(clue.id)"
                  >
                    <span class="archive-file-icon">
                      <el-icon><FolderOpened /></el-icon>
                    </span>
                    <span class="archive-file-main">
                      <strong>{{ clue.title }}</strong>
                    </span>
                  </button>
                </div>
              </section>

              <section class="developer-import-panel" aria-label="开发工具">
                <div>
                  <strong>开发工具</strong>
                  <span>跳过关键词检索，直接归档第一章全部线索。</span>
                </div>
                <el-button
                  plain
                  :icon="Files"
                  :disabled="collectedChapterClues.length === chapterClueIds.length"
                  @click="collectAllChapterSix"
                >
                  {{
                    collectedChapterClues.length === chapterClueIds.length
                      ? '全部线索已导入'
                      : '一键导入全部线索'
                  }}
                </el-button>
              </section>

              <el-button
                class="clues-replay-button"
                type="danger"
                :icon="Location"
                :disabled="!canOpenOfficialArea('replay')"
                @click="openOfficialArea('replay')"
              >
                去复盘区验证
              </el-button>
            </el-card>

            <el-card shadow="never" class="section-card clues-results-panel">
              <div class="results-workspace">
                <section class="results-summary-panel">
                  <div class="panel-title-row">
                    <div>
                      <p class="eyebrow">ARCHIVE MATCH</p>
                      <h2>检索结果</h2>
                    </div>
                    <el-tag v-if="searchResultClueId" effect="plain">1 条命中</el-tag>
                  </div>

                  <div class="results-body compact">
                    <el-empty
                      v-if="searchResultClueId && !searchResultClue"
                      description="未命中档案。换一个更具体的检索词。"
                      :image-size="64"
                    />
                    <el-empty
                      v-else-if="!searchResultClueId"
                      description="等待输入检索词"
                      :image-size="64"
                    />
                    <div v-else-if="searchResultClue" class="archive-result-list">
                      <el-card
                        shadow="never"
                        class="archive-result-card official-search-result"
                        role="button"
                        tabindex="0"
                        @click="openSearchDetail(searchResultClue.id)"
                        @keydown.enter="openSearchDetail(searchResultClue.id)"
                      >
                        <div class="archive-result">
                          <div>
                            <p class="eyebrow">ARCHIVE MATCH</p>
                            <h3>{{ searchResultClue.title }}</h3>
                          </div>
                          <el-button
                            :type="isClueCollected(searchResultClue.id) ? 'success' : 'danger'"
                            :disabled="isClueCollected(searchResultClue.id)"
                            @click.stop="collectClue(searchResultClue.id)"
                          >
                            {{ isClueCollected(searchResultClue.id) ? '已归档' : '归档证据' }}
                          </el-button>
                        </div>
                      </el-card>
                    </div>
                  </div>
                </section>

                <section class="evidence-detail-panel official-search-detail-panel">
                  <div class="panel-title-row">
                    <div>
                      <p class="eyebrow">EVIDENCE DETAIL</p>
                      <h2>线索详情</h2>
                    </div>
                  </div>

                  <div v-if="searchDetailClue" class="inline-evidence-detail">
                    <div class="inline-detail-heading">
                      <span class="archive-file-icon detail-icon">
                        <el-icon><Document /></el-icon>
                      </span>
                      <div>
                        <p class="eyebrow">
                          EVIDENCE / {{ sourceLabel(searchDetailClue.source) }}
                        </p>
                        <h3>{{ searchDetailClue.title }}</h3>
                      </div>
                    </div>
                    <p class="drawer-primary">{{ searchDetailClue.summary }}</p>
                    <p class="drawer-secondary">{{ searchDetailClue.detail }}</p>
                    <el-button
                      type="danger"
                      :disabled="isClueCollected(searchDetailClue.id)"
                      @click="archiveSearchDetail"
                    >
                      {{ isClueCollected(searchDetailClue.id) ? '已归档' : '归档证据' }}
                    </el-button>
                  </div>
                  <el-empty
                    v-else
                    description="点击左侧已归档证据，或点击上方检索结果查看详情。"
                    :image-size="96"
                  />
                </section>
              </div>
            </el-card>
          </div>
        </template>

        <template v-else-if="activeArea === 'replay'">
          <el-card shadow="never" class="section-card official-replay-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="eyebrow">REPLAY</p>
                  <h2>第一章复盘</h2>
                </div>
                <el-tag effect="plain">
                  先选 3 条线索，再统一提交
                </el-tag>
              </div>
            </template>

            <el-alert
              v-if="collectedCount < chapterClueIds.length"
              title="需要先归档第一章全部 12 条线索，才能正式提交复盘。"
              type="warning"
              show-icon
              :closable="false"
            />

            <div class="official-replay-workbench">
              <section class="official-replay-question-strip" aria-label="复盘题目">
                <div class="official-replay-question-title">
                  <span>复盘题</span>
                  <strong>请从已检索线索中选出 3 条证据，解释现场中最不成立的三个问题。</strong>
                </div>
                <ol>
                  <li>站立尸体如何成立？</li>
                  <li>工具为什么不在现场？</li>
                  <li>电梯为何能提供力量？</li>
                </ol>
              </section>

              <div class="official-replay-main-grid">
                <section class="official-replay-evidence-panel">
                  <div class="official-replay-panel-head">
                    <div>
                      <p class="eyebrow">EVIDENCE FILTER</p>
                      <h3>证据筛选</h3>
                    </div>
                    <span>{{ selectedClueIds.length }}/3</span>
                  </div>
                  <div class="official-replay-clues">
                    <button
                      v-for="clueId in chapterReplay.candidateClueIds"
                      :key="clueId"
                      class="official-replay-choice"
                      :class="{ selected: selectedClueIds.includes(clueId) }"
                      type="button"
                      :disabled="!isClueCollected(clueId)"
                      @click="toggleReplayClue(clueId)"
                    >
                      {{ officialClues[clueId].title }}
                    </button>
                  </div>
                </section>

                <section class="official-replay-reasoning-panel">
                  <div class="official-replay-panel-head">
                    <div>
                      <p class="eyebrow">CASE QUESTIONS</p>
                      <h3>推理作答</h3>
                    </div>
                    <span>{{ answeredReasoningCount }}/{{ chapterReplay.reasoningQuestions.length }}</span>
                  </div>
                  <div class="official-reasoning-list">
                    <section
                      v-for="question in chapterReplay.reasoningQuestions"
                      :key="question.id"
                      class="official-reasoning-question"
                    >
                      <h3>{{ question.title }}</h3>
                      <p>{{ question.prompt }}</p>
                      <el-radio-group v-model="selectedReasoningAnswers[question.id]">
                        <el-radio
                          v-for="option in question.options"
                          :key="option.id"
                          :label="option.id"
                        >
                          {{ option.label }}
                        </el-radio>
                      </el-radio-group>
                    </section>
                  </div>
                </section>
              </div>

              <div class="official-replay-submit-bar">
                <p>
                  {{
                    canSubmitReplay
                      ? '证据与判断已就绪，可以统一提交。'
                      : '收齐线索、选择 3 条核心证据，并完成全部判断题后才能提交。'
                  }}
                </p>
                <div class="official-replay-actions">
                  <el-button @click="resetReplay">重选</el-button>
                  <el-button
                    type="danger"
                    :disabled="!canSubmitReplay"
                    :icon="Check"
                    @click="submitReplay"
                  >
                    提交复盘
                  </el-button>
                </div>
              </div>
            </div>

            <el-result
              v-if="replaySubmitted"
              :icon="isReplayCorrect ? 'success' : 'warning'"
              :title="isReplayCorrect ? '第一章复盘成立' : '复盘还不成立'"
              :sub-title="
                isReplayCorrect
                  ? chapterReplay.successSummary
                  : chapterReplay.failureHint
              "
            >
              <template #extra>
                <el-button
                  v-if="isReplayCorrect"
                  type="danger"
                  :icon="Notebook"
                  @click="openOfficialArea('story')"
                >
                  进入故事区
                </el-button>
              </template>
            </el-result>
          </el-card>
        </template>

        <template v-else-if="activeArea === 'story'">
          <el-card shadow="never" class="story-hero-card official-story-card">
            <div class="story-hero-grid">
              <div class="story-copy">
                <p class="eyebrow">{{ chapterStory.subtitle }}</p>
                <h2>{{ chapterStory.title }}</h2>
                <p>{{ chapterStory.lead }}</p>
                <small>{{ chapterStory.sourceScope }}</small>
                <el-button type="danger" :icon="Notebook" @click="officialFullStoryVisible = true">
                  查看完整故事
                </el-button>
              </div>
              <figure class="story-visual">
                <img
                  :src="officialStoryImageUrls[chapterStory.imageKey]"
                  :alt="chapterStory.imageAlt"
                />
                <figcaption>正式篇第一章 / 结案故事</figcaption>
              </figure>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card story-gallery-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="eyebrow">OFFICIAL STORY DOSSIER</p>
                  <h2>故事图像卷宗</h2>
                </div>
                <el-tag effect="plain">{{ chapterStory.images.length }} 张图片</el-tag>
              </div>
            </template>

            <div class="story-gallery">
              <figure
                v-for="image in chapterStory.images"
                :key="image.id"
                class="story-gallery-item"
              >
                <img :src="officialStoryImageUrls[image.imageKey]" :alt="image.alt" loading="lazy" />
                <figcaption>
                  <strong>{{ image.title }}</strong>
                  <span>{{ image.caption }}</span>
                </figcaption>
              </figure>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card story-timeline-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="eyebrow">RESOLUTION STORY</p>
                  <h2>第一章结案复盘</h2>
                </div>
                <el-tag type="success" effect="plain">复盘成立</el-tag>
              </div>
            </template>

            <div class="story-timeline">
              <article
                v-for="beat in chapterStory.beats"
                :key="beat.id"
                class="story-beat"
              >
                <div class="story-beat-time">{{ beat.time }}</div>
                <div class="story-beat-body">
                  <h3>{{ beat.title }}</h3>
                  <p>{{ beat.body }}</p>
                  <div class="story-evidence-strip">
                    <span
                      v-for="title in clueTitles(beat.clueIds)"
                      :key="title"
                    >
                      {{ title }}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card story-closing-card">
            <p class="eyebrow">LIANG PROFESSOR / FINAL NOTE</p>
            <blockquote>{{ chapterStory.closing }}</blockquote>
            <el-button type="danger" :icon="Notebook" @click="officialFullStoryVisible = true">
              查看完整故事
            </el-button>
          </el-card>
        </template>
      </el-main>
    </el-container>

    <el-dialog
      v-model="officialFullStoryVisible"
      class="full-story-dialog"
      title="第一章完整故事"
      width="780px"
      destroy-on-close
    >
      <div class="full-story-body">
        <section
          v-for="section in officialChapterOneOriginalStory"
          :key="section.id"
          class="full-story-section"
        >
          <h3>{{ section.title }}</h3>
          <p
            v-for="paragraph in section.paragraphs"
            :key="paragraph"
          >
            {{ paragraph }}
          </p>
        </section>

        <section class="full-story-section reasoning">
          <h3>推理复盘</h3>
          <p
            v-for="paragraph in chapterStory.fullStory"
            :key="paragraph"
          >
            {{ paragraph }}
          </p>
        </section>
      </div>
      <template #footer>
        <el-button @click="officialFullStoryVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="searchHintVisible"
      width="520px"
      title="检索提示"
      destroy-on-close
    >
      <div class="official-search-hint-dialog">
        <p>剩余 {{ remainingSearchHintCount }} 次。只能手动输入，不能复制粘贴。</p>
        <template v-if="currentSearchHintPrompt">
          <p>让玩家在下方输入：</p>
          <strong>{{ currentSearchHintPrompt.phrase }}</strong>
          <input
            class="official-search-hint-input"
            type="text"
            :value="searchHintInput"
            placeholder="在这里手动输入上面的完整句子"
            @input="updateSearchHintInput"
            @keyup.enter="submitSearchHint(searchHintInput)"
            @paste="blockSearchHintPaste"
          >
        </template>
        <strong v-else>3/3 已用完</strong>
        <p
          v-if="searchHintMessage"
          class="official-search-hint-result"
        >
          {{ searchHintMessage }}
        </p>
      </div>
      <template #footer>
        <el-button
          class="official-search-hint-submit"
          type="danger"
          @click="submitSearchHintFromDialog"
        >
          获取提示
        </el-button>
        <el-button @click="searchHintVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :model-value="Boolean(activeClue)"
      :width="activeCluePresentation === 'pdf' ? '760px' : '620px'"
      :title="activeCluePresentation === 'pdf' ? 'PDF 文件预览' : '正式线索详情'"
      destroy-on-close
      @close="activeClue = null; activeCluePresentation = 'default'"
    >
      <template v-if="activeClue">
        <div
          v-if="activeCluePresentation === 'pdf'"
          class="official-pdf-preview"
        >
          <header class="official-pdf-toolbar">
            <span class="official-pdf-toolbar-icon">PDF</span>
            <div>
              <strong>{{ activeClue.title }}</strong>
              <small>{{ sourceLabel(activeClue.source) }} / {{ activeClue.pressure }}</small>
            </div>
          </header>
          <article class="official-pdf-page">
            <p class="official-pdf-stamp">SPECIAL CASE FILE</p>
            <h2>{{ activeClue.title }}</h2>
            <section>
              <h3>文件摘要</h3>
              <p>{{ activeClue.summary }}</p>
            </section>
            <section>
              <h3>正文摘录</h3>
              <p>{{ activeClue.detail }}</p>
            </section>
            <footer>PDF / 第一章同步材料 / 自动归档</footer>
          </article>
        </div>
        <div v-else class="official-clue-detail">
          <p class="eyebrow">{{ sourceLabel(activeClue.source) }} / {{ activeClue.pressure }}</p>
          <h2>{{ activeClue.title }}</h2>
          <p>{{ activeClue.summary }}</p>
          <blockquote>{{ activeClue.detail }}</blockquote>
        </div>
      </template>
      <template #footer>
        <el-button @click="activeClue = null; activeCluePresentation = 'default'">关闭</el-button>
        <el-button
          v-if="activeClue && activeCluePresentation !== 'pdf'"
          type="danger"
          :icon="Search"
          @click="collectClue(activeClue.id); activeClue = null; activeCluePresentation = 'default'"
        >
          归档线索
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      :model-value="Boolean(activeVideoClue)"
      width="760px"
      title="视频播放"
      destroy-on-close
      @close="closeExperimentVideo"
    >
      <template v-if="activeVideoClue">
        <div ref="videoExperimentRoot" class="official-video-preview">
          <section class="official-video-frame" aria-label="电梯急坠试验回放">
            <span class="official-video-floor-display">42</span>
            <div class="official-video-elevator-view" aria-hidden="true">
              <div class="official-video-door left"></div>
              <div class="official-video-door right"></div>
              <span class="official-video-door-line"></span>
              <div class="official-video-speed-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="official-video-elevator-cab">
                <span></span>
              </div>
            </div>
            <span class="official-video-scanline" aria-hidden="true"></span>
          </section>
        </div>
      </template>
      <template #footer>
        <div class="official-video-actions">
          <el-button @click="replayExperimentVideo">重新播放</el-button>
          <el-button @click="closeExperimentVideo">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>
