import type { CSSProperties } from 'vue';
import { imageAssets } from './cosAssets';

const squadAvatarsSpriteUrl = imageAssets.squadAvatarsSprite;

const squadAvatarPositions: Record<string, string> = {
  baozhan: '0% 0%',
  hualong: '100% 0%',
  sumei: '0% 100%',
  professor: '100% 100%',
};

export function getSquadAvatarStyle(speakerId: string): CSSProperties {
  return {
    backgroundImage: `url(${squadAvatarsSpriteUrl})`,
    backgroundPosition: squadAvatarPositions[speakerId] ?? '0% 0%',
  };
}
