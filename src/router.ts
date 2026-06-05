import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import CaseView from './views/CaseView.vue';
import SurveyView from './views/SurveyView.vue';
import CluesView from './views/CluesView.vue';
import ReplayView from './views/ReplayView.vue';
import StoryView from './views/StoryView.vue';
import LockedView from './views/LockedView.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/case',
    name: 'case',
    component: CaseView,
  },
  {
    path: '/survey',
    name: 'survey',
    component: SurveyView,
  },
  {
    path: '/clues',
    name: 'clues',
    component: CluesView,
  },
  {
    path: '/replay',
    name: 'replay',
    component: ReplayView,
  },
  {
    path: '/story',
    name: 'story',
    component: StoryView,
  },
  {
    path: '/locked',
    name: 'locked',
    component: LockedView,
  },
  {
    path: '/',
    redirect: '/case',
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
