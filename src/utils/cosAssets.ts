export const COS_ASSET_BASE_URL =
  'https://who-is-killer-1323666988.cos.ap-shanghai.myqcloud.com';

export function cosAssetUrl(fileName: string) {
  return `${COS_ASSET_BASE_URL}/${fileName}`;
}

export const imageAssets = {
  chapterOneResolution: cosAssetUrl('chapter-one-resolution.png'),
  elevatorScene: cosAssetUrl('elevator-scene.png'),
  officialPrologue01Building: cosAssetUrl('official-prologue-01-building.png'),
  officialPrologue02Corridor: cosAssetUrl('official-prologue-02-corridor.png'),
  officialPrologue03Floor41: cosAssetUrl('official-prologue-03-floor41.png'),
  officialPrologue04Door: cosAssetUrl('official-prologue-04-door.png'),
  prologueCctvFrame: cosAssetUrl('prologue-cctv-frame.png'),
  squadAvatarsSprite: cosAssetUrl('squad-avatars-sprite.png'),
  storyCctvControlRoom: cosAssetUrl('story-cctv-control-room.png'),
  storyEvidenceTable: cosAssetUrl('story-evidence-table.png'),
  storyFieldInvestigation: cosAssetUrl('story-field-investigation.png'),
  storyRumorChat: cosAssetUrl('story-rumor-chat.png'),
  storyTeamResolution: cosAssetUrl('story-team-resolution.png'),
  wenXiaowanIdPhoto: cosAssetUrl('wen-xiaowan-id-photo.png'),
} as const;
