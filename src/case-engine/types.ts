export type CaseAreaId = 'case' | 'survey' | 'search' | 'replay' | 'story';

export type CaseTheme = 'default' | 'folk' | 'urban' | 'industrial';

export type CaseClueStage = 'early' | 'middle' | 'late';

export interface CaseAreaDefinition {
  id: CaseAreaId;
  label: string;
  routeSegment: string;
  requiresCompletedAreaId?: CaseAreaId;
  isDisabled?: boolean;
}

export interface CaseIntroBlock {
  title: string;
  body: string;
}

export interface CaseContactThread {
  id: string;
  name: string;
  role: string;
  avatarId?: string;
  avatarText: string;
  messages: Array<{
    from: 'self' | 'other';
    text: string;
  }>;
}

export interface CaseSurveyHotspot {
  id: string;
  label: string;
  observation: string;
  style: Record<string, string>;
}

export interface CaseSurveyPrivateRoom {
  id: string;
  title: string;
  password: string;
  passwordHint: string;
  lockedText: string;
  unlockedTitle: string;
  unlockedBody: string;
}

export interface CaseClue {
  id: string;
  title: string;
  summary: string;
  detail: string;
  keywords: string[];
  stage?: CaseClueStage;
  requiresArchivedClueIds?: string[];
  requiresUnlockedRoomIds?: string[];
  source?: string;
}

export interface CaseReplayQuestion {
  id: string;
  title: string;
  prompt: string;
  options: Array<{
    id: string;
    label: string;
  }>;
  correctOptionId: string;
}

export interface CaseReplayDefinition {
  id: string;
  requiredClueIds: string[];
  correctClueIds: string[];
  clueSelectionLimit: number;
  questions: CaseReplayQuestion[];
  prompt?: string;
  successSummary?: string;
  failureHint?: string;
}

export interface CaseStoryDefinition {
  title: string;
  lead: string;
  paragraphs: string[];
}

export interface PlayableCaseDefinition {
  id: string;
  title: string;
  subtitle: string;
  theme: CaseTheme;
  startAreaId: CaseAreaId;
  areas: CaseAreaDefinition[];
  introBlocks?: CaseIntroBlock[];
  contacts?: CaseContactThread[];
  survey?: {
    title: string;
    lead: string;
    imageUrl?: string;
    imageAlt?: string;
    hotspots: CaseSurveyHotspot[];
    privateRoom?: CaseSurveyPrivateRoom;
  };
  clues: CaseClue[];
  replay: CaseReplayDefinition;
  story: CaseStoryDefinition;
}

export interface CaseFlowState {
  version: 1;
  completedAreaIds: CaseAreaId[];
  archivedClueIds: string[];
  selectedClueIds: string[];
  selectedAnswers: Record<string, string>;
  replaySolved: boolean;
  activeAreaId: CaseAreaId;
  activeClueId: string | null;
  inspectedHotspotIds: string[];
  unlockedRoomIds: string[];
  hintCount: number;
}

export type ReplaySubmitReason =
  | 'correct'
  | 'missing-required-clues'
  | 'wrong-clues'
  | 'missing-answer'
  | 'wrong-answer';

export interface ReplaySubmitResult {
  solved: boolean;
  reason: ReplaySubmitReason;
}
