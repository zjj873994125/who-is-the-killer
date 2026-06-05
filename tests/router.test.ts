import { describe, expect, it } from 'vitest';
import { routes } from '../src/router';

describe('router', () => {
  it('splits the investigation into clear working areas', () => {
    const namedRoutes = routes.filter((route) => route.name);

    expect(namedRoutes.map((route) => route.name)).toEqual([
      'case',
      'survey',
      'clues',
      'replay',
      'story',
      'locked',
    ]);

    expect(namedRoutes.map((route) => route.path)).toEqual([
      '/case',
      '/survey',
      '/clues',
      '/replay',
      '/story',
      '/locked',
    ]);
  });
});
