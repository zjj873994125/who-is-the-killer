import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import CaseView from './views/CaseView.vue';
import SurveyView from './views/SurveyView.vue';
import CluesView from './views/CluesView.vue';
import ReplayView from './views/ReplayView.vue';
import StoryView from './views/StoryView.vue';
import LockedView from './views/LockedView.vue';
import OfficialCaseView from './views/OfficialCaseView.vue';
import OfficialPrologueView from './views/OfficialPrologueView.vue';
import GameSelectView from './views/GameSelectView.vue';
import JiangMaskCaseView from './views/shortCases/JiangMaskCaseView.vue';
import { hasCompletedOfficialPrologue } from './utils/officialProgress';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'gameSelect',
    component: GameSelectView,
  },
  {
    path: '/demo/case',
    name: 'case',
    component: CaseView,
  },
  {
    path: '/demo/survey',
    name: 'survey',
    component: SurveyView,
  },
  {
    path: '/demo/clues',
    name: 'clues',
    component: CluesView,
  },
  {
    path: '/demo/replay',
    name: 'replay',
    component: ReplayView,
  },
  {
    path: '/demo/story',
    name: 'story',
    component: StoryView,
  },
  {
    path: '/demo/locked',
    name: 'locked',
    component: LockedView,
  },
  {
    path: '/official/prologue',
    name: 'officialPrologue',
    component: OfficialPrologueView,
  },
  {
    path: '/official/chapter-6',
    redirect: '/official/prologue',
  },
  {
    path: '/official/chapter-1',
    redirect: '/official/chapter-1/case',
  },
  {
    path: '/official/chapter-1/case',
    name: 'officialChapterOneCase',
    component: OfficialCaseView,
  },
  {
    path: '/official/chapter-1/messages',
    name: 'officialChapterOneMessages',
    component: OfficialCaseView,
  },
  {
    path: '/official/chapter-1/survey',
    name: 'officialChapterOneSurvey',
    component: OfficialCaseView,
  },
  {
    path: '/official/chapter-1/search',
    name: 'officialChapterOneSearch',
    component: OfficialCaseView,
  },
  {
    path: '/official/chapter-1/experiment',
    redirect: '/official/chapter-1/messages',
  },
  {
    path: '/official/chapter-1/replay',
    name: 'officialChapterOneReplay',
    component: OfficialCaseView,
  },
  {
    path: '/official/chapter-1/story',
    name: 'officialChapterOneStory',
    component: OfficialCaseView,
  },
  {
    path: '/short/jiang-mask',
    redirect: '/short/jiang-mask/case',
  },
  {
    path: '/short/jiang-mask/:area(case|survey|search|replay|story)',
    name: 'shortJiangMaskCase',
    component: JiangMaskCaseView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  if (
    to.path.startsWith('/official/chapter-1') &&
    !hasCompletedOfficialPrologue()
  ) {
    return '/official/prologue';
  }

  return true;
});
