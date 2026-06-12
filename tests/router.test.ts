import { beforeEach, describe, expect, it } from 'vitest';
import { router, routes } from '../src/router';

describe('router', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('splits the playable demo and formal chapter into separate games', () => {
    const namedRoutes = routes.filter((route) => route.name);

    expect(namedRoutes.map((route) => route.name)).toEqual([
      'gameSelect',
      'case',
      'survey',
      'clues',
      'replay',
      'story',
      'locked',
      'officialPrologue',
      'officialChapterOneCase',
      'officialChapterOneMessages',
      'officialChapterOneSurvey',
      'officialChapterOneSearch',
      'officialChapterOneReplay',
      'officialChapterOneStory',
      'shortJiangMaskCase',
    ]);

    expect(namedRoutes.map((route) => route.path)).toEqual([
      '/',
      '/demo/case',
      '/demo/survey',
      '/demo/clues',
      '/demo/replay',
      '/demo/story',
      '/demo/locked',
      '/official/prologue',
      '/official/chapter-1/case',
      '/official/chapter-1/messages',
      '/official/chapter-1/survey',
      '/official/chapter-1/search',
      '/official/chapter-1/replay',
      '/official/chapter-1/story',
      '/short/jiang-mask/:area(case|survey|search|replay|story)',
    ]);
  });

  it('keeps the old source-chapter URL as a redirect to the formal prologue', () => {
    const legacyRoute = routes.find((route) => route.path === '/official/chapter-6');

    expect(legacyRoute?.redirect).toBe('/official/prologue');
  });

  it('redirects the removed standalone experiment area to the chat evidence', () => {
    const experimentRoute = routes.find((route) => route.path === '/official/chapter-1/experiment');

    expect(experimentRoute?.redirect).toBe('/official/chapter-1/messages');
    expect(experimentRoute?.name).toBeUndefined();
  });

  it('adds the new short case without changing demo or formal chapter routes', () => {
    const shortRedirect = routes.find((route) => route.path === '/short/jiang-mask');
    const shortRoute = routes.find((route) => route.name === 'shortJiangMaskCase');

    expect(shortRedirect?.redirect).toBe('/short/jiang-mask/case');
    expect(shortRoute?.path).toBe('/short/jiang-mask/:area(case|survey|search|replay|story)');
  });

  it('requires completing the formal prologue before direct chapter one routes', async () => {
    const result = await router.push('/official/chapter-1/case');

    expect(result).toBeUndefined();
    expect(router.currentRoute.value.path).toBe('/official/prologue');
  });
});
