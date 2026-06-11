export const OFFICIAL_PROLOGUE_COMPLETE_KEY =
  'haunted-elevator-official-prologue-complete';

export function hasCompletedOfficialPrologue() {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  return localStorage.getItem(OFFICIAL_PROLOGUE_COMPLETE_KEY) === 'true';
}

export function completeOfficialPrologue() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(OFFICIAL_PROLOGUE_COMPLETE_KEY, 'true');
}
