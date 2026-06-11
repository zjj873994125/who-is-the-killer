import { describe, expect, it } from 'vitest';
import { COS_ASSET_BASE_URL, cosAssetUrl, imageAssets } from '../src/utils/cosAssets';

describe('cosAssets', () => {
  it('builds image urls from the Tencent COS prefix', () => {
    expect(COS_ASSET_BASE_URL).toBe(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com',
    );
    expect(cosAssetUrl('elevator-scene.png')).toBe(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/elevator-scene.png',
    );
  });

  it('uses the floor 41 image for the official chapter one report card', () => {
    expect(imageAssets.officialPrologue03Floor41).toBe(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/official-prologue-03-floor41.png',
    );
  });

  it('uses COS for the official chapter one elevator scene', () => {
    expect(imageAssets.officialChapterOneSurveyElevator).toBe(
      'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com/official-chapter-1-survey-elevator-v7.png',
    );
  });
});
