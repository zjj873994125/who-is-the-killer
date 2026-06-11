import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { officialReplayQuestions } from '../src/data/officialCase';
import OfficialCaseView from '../src/views/OfficialCaseView.vue';

const push = vi.fn();
const route = {
  name: 'officialChapterOneCase',
};

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
  useRoute: () => route,
}));

function mountOfficialCase(routeName = 'officialChapterOneCase') {
  route.name = routeName;

  return mount(OfficialCaseView, {
    global: {
      stubs: {
        ElIcon: {
          template: '<span><slot /></span>',
        },
        ElButton: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
        },
        ElInput: {
          inheritAttrs: false,
          props: ['modelValue', 'placeholder', 'size'],
          emits: ['update:modelValue', 'keyup', 'paste'],
          data: () => ({
            innerValue: '',
          }),
          watch: {
            modelValue: {
              immediate: true,
              handler(value) {
                this.innerValue = value ?? '';
              },
            },
          },
          template:
            '<input :class="[\'el-input\', $attrs.class]" :placeholder="placeholder" :value="innerValue" @input="innerValue = $event.target.value; $emit(\'update:modelValue\', innerValue)" @keyup="$emit(\'keyup\', $event)" @paste="$emit(\'paste\', { preventDefault: () => $event.preventDefault() })" />',
        },
        ElEmpty: {
          props: ['description'],
          template: '<div>{{ description }}</div>',
        },
        ElTag: {
          template: '<span><slot /></span>',
        },
        ElCard: {
          template: '<section><slot name="header" /><slot /></section>',
        },
        ElAlert: {
          props: ['title'],
          template: '<div>{{ title }}</div>',
        },
        ElResult: {
          props: ['title', 'subTitle'],
          template: '<section>{{ title }}{{ subTitle }}</section>',
        },
        ElDialog: {
          props: ['modelValue'],
          template: '<section v-if="modelValue"><slot /><slot name="footer" /></section>',
        },
        ElContainer: {
          template: '<div><slot /></div>',
        },
        ElAside: {
          template: '<aside><slot /></aside>',
        },
        ElHeader: {
          template: '<header><slot /></header>',
        },
        ElMain: {
          template: '<main><slot /></main>',
        },
        ElSpace: {
          template: '<span><slot /></span>',
        },
        ElRadioGroup: {
          template: '<div><slot /></div>',
        },
        ElRadio: {
          template: '<label><slot /></label>',
        },
      },
    },
  });
}

describe('OfficialCaseView', () => {
  beforeEach(() => {
    push.mockClear();
    route.name = 'officialChapterOneCase';
    localStorage.clear();
  });

  it('presents the case board with victim file, police judgement, contradictions and task actions', async () => {
    const wrapper = mountOfficialCase();

    expect(wrapper.find('.official-case-board').exists()).toBe(true);
    expect(wrapper.find('.official-victim-file').text()).toContain('温小婉');
    expect(wrapper.find('.official-victim-photo').attributes('alt')).toBe('温小婉证件照');
    expect(wrapper.find('.official-case-image').exists()).toBe(true);
    expect(wrapper.find('.board-field.official-case-image-card').exists()).toBe(true);
    expect(wrapper.find('.official-report-card img').attributes('src')).toContain(
      'official-prologue-03-floor41.png',
    );
    expect(wrapper.find('.official-report-card').text()).toContain('母子报警');
    expect(wrapper.find('.official-police-judgement').text()).toContain('自杀');
    expect(wrapper.findAll('.official-contradiction-card')).toHaveLength(4);
    expect(wrapper.findAll('.official-case-task-note')).toHaveLength(2);
    expect(wrapper.find('.official-case-task-panel').text()).toContain('故事背景');
    expect(wrapper.find('.official-case-task-panel').text()).toContain('本章目标');
    expect(wrapper.find('.official-case-start-button').text()).toContain('开始断案');
    expect(wrapper.findAll('.official-case-action')).toHaveLength(0);

    await wrapper.find('.official-case-start-button').trigger('click');

    expect(push).toHaveBeenCalledWith('/official/chapter-1/messages');
  });

  it('splits formal chapter one into six investigation areas without the old experiment area', () => {
    const wrapper = mountOfficialCase();
    const navText = wrapper.findAll('.workspace-nav-card').map((item) => item.text());

    expect(navText).toEqual(
      expect.arrayContaining([
        expect.stringContaining('案件区'),
        expect.stringContaining('通讯区'),
        expect.stringContaining('勘查区'),
        expect.stringContaining('检索区'),
        expect.stringContaining('复盘区'),
        expect.stringContaining('故事区'),
      ]),
    );
    expect(navText).not.toEqual(expect.arrayContaining([expect.stringContaining('试验区')]));
    expect(wrapper.findAll('.workspace-nav-card')).toHaveLength(6);
  });

  it('uses formal chapter sub-routes when switching investigation areas', async () => {
    localStorage.setItem(
      'haunted-elevator-official-save-v1',
      JSON.stringify({
        version: 1,
        collectedClueIds: [
          'official-clue-burnt-smell',
          'official-clue-falling-test',
          'official-clue-child-suspended',
          'official-clue-mother-report',
        ],
        selectedClueIds: [],
        selectedReasoningAnswers: {},
        replaySubmitted: false,
        activeThreadId: 'bao',
        completedAreaIds: ['case'],
        selectedSurveyHotspotId: null,
        inspectedSurveyHotspotIds: [],
        searchResultClueId: null,
        searchDetailClueId: null,
        experimentStarted: false,
      }),
    );

    const wrapper = mountOfficialCase('officialChapterOneMessages');

    await wrapper
      .findAll('.workspace-nav-card')
      .find((item) => item.text().includes('勘查区'))
      ?.trigger('click');

    expect(push).toHaveBeenCalledWith('/official/chapter-1/survey');
  });

  it('locks later formal areas until each previous area is completed', async () => {
    const wrapper = mountOfficialCase();
    const navCards = () => wrapper.findAll('.workspace-nav-card');

    expect(navCards().find((item) => item.text().includes('案件区'))?.attributes('disabled')).toBeUndefined();
    expect(navCards().find((item) => item.text().includes('通讯区'))?.attributes('disabled')).toBeDefined();
    expect(navCards().find((item) => item.text().includes('勘查区'))?.attributes('disabled')).toBeDefined();
    expect(navCards().find((item) => item.text().includes('检索区'))?.attributes('disabled')).toBeDefined();
    expect(navCards().find((item) => item.text().includes('复盘区'))?.attributes('disabled')).toBeDefined();
    expect(navCards().find((item) => item.text().includes('故事区'))?.attributes('disabled')).toBeDefined();

    await navCards()
      .find((item) => item.text().includes('检索区'))
      ?.trigger('click');

    expect(push).not.toHaveBeenCalled();

    await wrapper.find('.official-case-start-button').trigger('click');
    await wrapper.vm.$nextTick();

    expect(navCards().find((item) => item.text().includes('通讯区'))?.attributes('disabled')).toBeUndefined();
    expect(navCards().find((item) => item.text().includes('勘查区'))?.attributes('disabled')).toBeDefined();
  });

  it('redirects direct access to the current unlocked formal area', async () => {
    mountOfficialCase('officialChapterOneReplay');

    await Promise.resolve();

    expect(push).toHaveBeenCalledWith('/official/chapter-1/case');
  });

  it('clears formal chapter save data from the aside action group', async () => {
    localStorage.setItem(
      'haunted-elevator-official-save-v1',
      JSON.stringify({
        version: 1,
        collectedClueIds: ['official-clue-burnt-smell'],
        selectedClueIds: ['official-clue-burnt-smell'],
        selectedReasoningAnswers: { 'official-reasoning-fall': 'falling' },
        replaySubmitted: true,
        activeThreadId: 'liang',
        completedAreaIds: ['case'],
        selectedSurveyHotspotId: 'body',
        inspectedSurveyHotspotIds: ['body'],
        searchResultClueId: 'official-clue-burnt-smell',
        searchDetailClueId: 'official-clue-burnt-smell',
        experimentStarted: true,
      }),
    );

    const wrapper = mountOfficialCase('officialChapterOneMessages');

    expect(wrapper.text()).toContain('1/12 线索');
    expect(wrapper.find('.official-thread-profile').text()).toContain('梁教授');

    await wrapper
      .findAll('.official-aside-actions button')
      .find((button) => button.text().includes('清空存档'))
      ?.trigger('click');
    await wrapper.vm.$nextTick();

    expect(localStorage.getItem('haunted-elevator-official-save-v1')).toBeNull();
    expect(wrapper.text()).toContain('0/12 线索');
    expect(wrapper.findAll('.workspace-nav-card').find((item) => item.text().includes('通讯区'))?.attributes('disabled')).toBeDefined();
    expect(push).toHaveBeenCalledWith('/official/chapter-1/case');
  });

  it('presents task-force chats with avatars, attachments and archive status', async () => {
    const wrapper = mountOfficialCase('officialChapterOneMessages');

    expect(wrapper.findAll('.official-contact-card')).toHaveLength(4);
    expect(wrapper.findAll('.official-contact-avatar').length).toBeGreaterThanOrEqual(4);
    expect(wrapper.find('.official-chat-file-message').exists()).toBe(true);
    expect(wrapper.find('.official-thread-attachment').text()).toContain('PDF');
    expect(wrapper.find('.official-thread-attachment').text()).toContain('轿厢焦糊味');
    expect(wrapper.find('.official-thread-status').text()).toContain('未归档');

    await wrapper.find('.official-thread-attachment').trigger('click');

    expect(wrapper.text()).toContain('1/12 线索');
    expect(wrapper.find('.official-pdf-preview').text()).toContain('PDF');
    expect(wrapper.find('.official-pdf-page').text()).toContain('文件摘要');
    expect(wrapper.text()).not.toContain('归档线索');
    expect(wrapper.find('.official-thread-status').text()).toContain('已归档');
  });

  it('opens Liang professor elevator drop video from the chat attachment', async () => {
    const wrapper = mountOfficialCase('officialChapterOneMessages');

    await wrapper
      .findAll('.official-contact-card')
      .find((item) => item.text().includes('梁教授'))
      ?.trigger('click');

    expect(wrapper.findAll('.official-chat-file-message')).toHaveLength(2);
    expect(wrapper.find('.official-thread-attachment').text()).toContain('PDF');
    expect(wrapper.find('.official-thread-attachment').text()).toContain('电梯急坠试验');
    expect(wrapper.find('.official-chat-video-message').exists()).toBe(true);
    expect(wrapper.find('.official-thread-video').attributes('aria-label')).toBe(
      '播放电梯急坠试验视频',
    );
    expect(wrapper.find('.official-thread-video').text()).toContain('00:12');
    expect(wrapper.find('.official-thread-video').text()).not.toContain('电梯急坠试验.mp4');
    expect(wrapper.find('.official-thread-video').text()).not.toContain('PDF');
    expect(wrapper.find('.official-thread-status').text()).toContain('附件未归档');
    expect(wrapper.text()).not.toContain('准备试验电梯运行时间');
    expect(wrapper.text()).toContain('我们坐电梯下去的时候');
    expect(wrapper.text()).toContain('楼层数字突然跳得很快');

    await wrapper.find('.official-thread-attachment').trigger('click');

    expect(wrapper.text()).toContain('1/12 线索');
    expect(wrapper.find('.official-pdf-preview').text()).toContain('PDF');

    await wrapper.find('.official-thread-video').trigger('click');

    expect(wrapper.find('.official-thread-status').text()).toContain('附件已归档');
    expect(wrapper.find('.official-video-preview').exists()).toBe(true);
    expect(wrapper.find('.official-video-progress').exists()).toBe(false);
    expect(wrapper.find('.official-video-preview').text()).not.toContain('00:12');
    expect(wrapper.find('.official-video-floor-display').exists()).toBe(true);
    expect(wrapper.find('.official-video-floor-display').text()).toContain('42');
    expect(wrapper.find('.official-video-elevator-cab').exists()).toBe(true);
    expect(wrapper.find('.official-video-speed-lines').exists()).toBe(true);
    expect(wrapper.find('.official-video-preview').text()).not.toContain('ELEVATOR TEST CAM');
    expect(wrapper.find('.official-video-preview').text()).not.toContain('SPEED');
    expect(wrapper.find('.official-video-preview').text()).not.toContain('BRAKE');
    expect(wrapper.find('.official-video-preview').text()).not.toContain('NORMAL DESCENT');
    expect(wrapper.find('.official-video-preview').text()).not.toContain('FREE FALL');
    expect(wrapper.find('.official-video-impact').exists()).toBe(false);
    expect(wrapper.find('.official-video-spark').exists()).toBe(false);
    expect(wrapper.find('.official-video-actions').text()).toContain('重新播放');
    expect(wrapper.find('.official-video-actions').text()).toContain('取消');
    expect(wrapper.find('.official-video-preview').text()).not.toContain('急坠异常已记录');

    await wrapper
      .findAll('.official-video-actions button')
      .find((button) => button.text().includes('重新播放'))
      ?.trigger('click');

    expect(wrapper.find('.official-video-preview').exists()).toBe(true);
  });

  it('restores official chapter progress after remounting', async () => {
    const messagesWrapper = mountOfficialCase('officialChapterOneMessages');

    await messagesWrapper.find('.official-thread-attachment').trigger('click');
    await messagesWrapper
      .findAll('.official-contact-card')
      .find((item) => item.text().includes('梁教授'))
      ?.trigger('click');
    messagesWrapper.unmount();

    const restoredMessagesWrapper = mountOfficialCase('officialChapterOneMessages');

    expect(restoredMessagesWrapper.text()).toContain('1/12 线索');
    expect(restoredMessagesWrapper.find('.official-thread-profile').text()).toContain('梁教授');

    const surveyWrapper = mountOfficialCase('officialChapterOneSurvey');

    await surveyWrapper.find('.official-scene-hotspot').trigger('click');
    surveyWrapper.unmount();

    const restoredSurveyWrapper = mountOfficialCase('officialChapterOneSurvey');

    expect(restoredSurveyWrapper.find('.official-survey-status-card').text()).toContain('1/7');
    expect(restoredSurveyWrapper.find('.official-survey-selected').text()).toContain('站立轮廓');
  });

  it('records scene hotspots without archiving clues before opening replay', async () => {
    const wrapper = mountOfficialCase('officialChapterOneSurvey');

    expect(wrapper.find('.official-survey-scene-image').attributes('src')).toContain(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/official-chapter-1-survey-elevator-v7.png',
    );
    expect(wrapper.findAll('.official-scene-hotspot').length).toBeGreaterThanOrEqual(7);
    expect(wrapper.find('.official-scene-hotspot .hotspot-dot').exists()).toBe(true);
    expect(wrapper.find('.official-scene-hotspot .hotspot-label').exists()).toBe(true);
    expect(wrapper.find('.official-survey-selected').text()).toContain('尚未选中点位');

    const firstHotspot = wrapper.find('.official-scene-hotspot');
    await firstHotspot.trigger('click');

    expect(wrapper.text()).not.toContain('1/12 线索');
    expect(wrapper.find('.official-survey-status-card').text()).toContain('1/7');
    expect(wrapper.find('.official-survey-selected').text()).toContain('站立轮廓');
    expect(wrapper.find('.official-survey-selected').text()).toContain('死者呈站立形态');
    expect(wrapper.findAll('.official-survey-archive-item')).toHaveLength(1);
    expect(wrapper.find('.official-survey-archive').text()).toContain('已勘查点位');
    expect(wrapper.find('.official-survey-next-action').text()).toContain('去检索区');
  });

  it('searches one clue at a time and shows the matched clue detail immediately', async () => {
    const wrapper = mountOfficialCase('officialChapterOneSearch');

    expect(wrapper.findAll('.official-clue-item')).toHaveLength(0);
    expect(wrapper.find('.official-search-detail-panel').text()).toContain('线索详情');

    const input = wrapper.find('.official-keyword-input');
    await input.setValue('焦糊味');
    await wrapper.find('.official-search-submit').trigger('click');

    expect(wrapper.findAll('.official-search-result')).toHaveLength(1);
    expect(wrapper.text()).toContain('轿厢焦糊味');
    expect(wrapper.find('.official-search-detail-panel').text()).toContain('包斩称血腥味下');

    await wrapper.find('.official-search-detail-panel button').trigger('click');

    expect(wrapper.find('.archived-dossier').text()).toContain('1 条');
    expect(wrapper.find('.official-archive-list').text()).toContain('轿厢焦糊味');
    expect(wrapper.find('.official-archive-list').text()).not.toContain('包斩称血腥味下');
  });

  it('opens a search hint dialog with the first manual prompt sentence', async () => {
    const wrapper = mountOfficialCase('officialChapterOneSearch');

    expect(wrapper.text()).not.toContain('我是废物，求求伟大的杰哥给我点提示吧。');

    await wrapper.find('.official-search-hint-button').trigger('click');

    expect(wrapper.find('.official-search-hint-dialog').text()).toContain(
      '我是废物，求求伟大的杰哥给我点提示吧。',
    );
    expect(wrapper.find('.official-search-hint-dialog').text()).toContain('剩余 3 次');
  });

  it('advances through three manual hint prompts and then exhausts chances', async () => {
    const wrapper = mountOfficialCase('officialChapterOneSearch');

    await wrapper.find('.official-search-hint-button').trigger('click');
    const typeHintPhrase = async (phrase: string) => {
      await wrapper.find('.official-search-hint-input').setValue(phrase);
      await wrapper.vm.$nextTick();
    };

    await typeHintPhrase('我是废物，求求伟大的杰哥给我点提示吧。');
    await wrapper.find('.official-search-hint-submit').trigger('click');

    expect(wrapper.find('.official-search-hint-result').text()).toContain('试试搜索：焦糊味');
    expect(wrapper.find('.official-search-hint-dialog').text()).toContain(
      '我脑子真的特别垃圾，再求求杰哥了。',
    );

    await typeHintPhrase('我脑子真的特别垃圾，再求求杰哥了。');
    await wrapper.find('.official-search-hint-submit').trigger('click');

    expect(wrapper.find('.official-search-hint-result').text()).toContain('试试搜索：悬空');
    expect(wrapper.find('.official-search-hint-dialog').text()).toContain(
      '杰哥别走杰哥别走，最后给我一次机会，我真求求你了。',
    );

    await typeHintPhrase('杰哥别走杰哥别走，最后给我一次机会，我真求求你了。');
    await wrapper.find('.official-search-hint-submit').trigger('click');

    expect(wrapper.find('.official-search-hint-result').text()).toContain('试试搜索：坠落');
    expect(wrapper.find('.official-search-hint-dialog').text()).toContain('3/3 已用完');

    await wrapper.find('.official-search-hint-submit').trigger('click');

    expect(wrapper.find('.official-search-hint-result').text()).toContain('三次提示机会已经用完');
    expect(wrapper.findAll('.official-search-result')).toHaveLength(0);
  });

  it('skips archived clues when giving search hint keywords', async () => {
    localStorage.setItem(
      'haunted-elevator-official-save-v1',
      JSON.stringify({
        version: 1,
        collectedClueIds: ['official-clue-burnt-smell'],
        selectedClueIds: [],
        selectedReasoningAnswers: {},
        replaySubmitted: false,
        activeThreadId: 'bao',
        completedAreaIds: ['case'],
        selectedSurveyHotspotId: null,
        inspectedSurveyHotspotIds: [],
        searchResultClueId: null,
        searchDetailClueId: null,
        usedSearchHintCount: 0,
        experimentStarted: false,
      }),
    );
    const wrapper = mountOfficialCase('officialChapterOneSearch');

    await wrapper.find('.official-search-hint-button').trigger('click');
    await wrapper.find('.official-search-hint-input').setValue('我是废物，求求伟大的杰哥给我点提示吧。');
    await wrapper.find('.official-search-hint-submit').trigger('click');

    expect(wrapper.find('.official-search-hint-result').text()).not.toContain('焦糊味');
    expect(wrapper.find('.official-search-hint-result').text()).toContain('试试搜索：悬空');
  });

  it('blocks pasting into the search hint input', async () => {
    const wrapper = mountOfficialCase('officialChapterOneSearch');

    await wrapper.find('.official-search-hint-button').trigger('click');
    await wrapper.find('.official-search-hint-input').trigger('paste');

    expect(wrapper.find('.official-search-hint-result').text()).toContain('不能复制粘贴');
  });

  it('does not trigger the hint flow from the normal archive search input', async () => {
    const wrapper = mountOfficialCase('officialChapterOneSearch');

    await wrapper
      .find('.official-keyword-input')
      .setValue('我是废物，我只能通过提示开挂获取线索');
    await wrapper.find('.official-search-submit').trigger('click');

    expect(wrapper.find('.official-search-feedback').text()).not.toContain('试试搜索：焦糊味');
    expect(wrapper.find('.official-search-feedback').text()).toContain('没有命中档案');
  });

  it('presents the replay area as a structured workbench', () => {
    localStorage.setItem(
      'haunted-elevator-official-save-v1',
      JSON.stringify({
        version: 1,
        collectedClueIds: officialReplayQuestions['official-replay-chapter-1'].candidateClueIds,
        selectedClueIds: [],
        selectedReasoningAnswers: {},
        replaySubmitted: false,
        activeThreadId: 'bao',
        completedAreaIds: ['case'],
        selectedSurveyHotspotId: 'body',
        inspectedSurveyHotspotIds: ['body', 'head', 'blood', 'scarf', 'ceiling', 'display', 'carpet'],
        searchResultClueId: null,
        searchDetailClueId: null,
        usedSearchHintCount: 0,
        experimentStarted: false,
      }),
    );

    const wrapper = mountOfficialCase('officialChapterOneReplay');

    expect(wrapper.find('.official-replay-workbench').exists()).toBe(true);
    expect(wrapper.find('.official-replay-question-strip').text()).toContain('复盘题');
    expect(wrapper.find('.official-replay-question-strip').text()).toContain('选出 3 条证据');
    expect(wrapper.find('.official-replay-question-strip').text()).toContain('站立尸体如何成立');
    expect(wrapper.find('.official-replay-question-strip').text()).toContain('工具为什么不在现场');
    expect(wrapper.find('.official-replay-question-strip').text()).toContain('电梯为何能提供力量');
    expect(wrapper.find('.official-replay-evidence-panel').text()).toContain('证据筛选');
    expect(wrapper.find('.official-replay-reasoning-panel').text()).toContain('推理作答');
    expect(wrapper.find('.official-replay-status-card').exists()).toBe(false);
    expect(wrapper.find('.official-replay-brief').exists()).toBe(false);
    expect(wrapper.find('.official-replay-submit-bar').text()).toContain('提交复盘');
  });

  it('unlocks the formal story area after a correct replay', async () => {
    localStorage.setItem(
      'haunted-elevator-official-save-v1',
      JSON.stringify({
        version: 1,
        collectedClueIds: officialReplayQuestions['official-replay-chapter-1'].candidateClueIds,
        selectedClueIds: officialReplayQuestions['official-replay-chapter-1'].correctClueIds,
        selectedReasoningAnswers: {
          'official-mechanism': 'a',
          'official-spasm': 'a',
        },
        replaySubmitted: true,
        activeThreadId: 'bao',
        completedAreaIds: ['case'],
        selectedSurveyHotspotId: 'body',
        inspectedSurveyHotspotIds: ['body', 'head', 'blood', 'scarf', 'ceiling', 'display', 'carpet'],
        searchResultClueId: null,
        searchDetailClueId: null,
        usedSearchHintCount: 0,
        experimentStarted: false,
      }),
    );

    const wrapper = mountOfficialCase('officialChapterOneStory');

    expect(wrapper.find('.official-story-card').text()).toContain('第一章完整故事');
    expect(wrapper.find('.official-story-card').text()).toContain('第六章主体 + 第七章前半段');
    expect(wrapper.find('.official-story-card img').attributes('src')).toContain(
      'official-prologue-03-floor41.png',
    );
    const storyGalleryImageSources = wrapper
      .findAll('.story-gallery-item img')
      .map((image) => image.attributes('src'));
    expect(storyGalleryImageSources).toEqual(
      expect.arrayContaining([
        expect.stringContaining('official-prologue-03-floor41.png'),
        expect.stringContaining('wen-xiaowan-id-photo.png'),
        expect.stringContaining(
          'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/official-chapter-1-survey-elevator-v7.png',
        ),
        expect.stringContaining('story-cctv-control-room.png'),
      ]),
    );
    expect(storyGalleryImageSources).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining('story-field-investigation.png'),
        expect.stringContaining('story-evidence-table.png'),
        expect.stringContaining('story-team-resolution.png'),
      ]),
    );
    expect(wrapper.find('.story-timeline-card').text()).toContain('电梯暴露危险');
    expect(wrapper.find('.story-closing-card').text()).toContain('电梯怎样参与了杀人');

    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('查看完整故事'))
      ?.trigger('click');

    const fullStoryText = wrapper.find('.full-story-body').text();
    expect(fullStoryText).toContain('第六章 尸体痉挛');
    expect(fullStoryText).toContain('2008年10月17日');
    expect(fullStoryText).toContain('第七章 悬空女尸');
    expect(fullStoryText).toContain('凶手的作案时间还是一个谜');
    expect(fullStoryText).toContain('推理复盘');
    expect(fullStoryText.indexOf('第六章 尸体痉挛')).toBeLessThan(
      fullStoryText.indexOf('推理复盘'),
    );
  });

  it('does not render the removed standalone experiment area', () => {
    const wrapper = mountOfficialCase('officialChapterOneMessages');

    expect(wrapper.find('.official-experiment-layout').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('为什么要做电梯试验');
  });
});
