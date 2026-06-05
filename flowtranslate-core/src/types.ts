export type LanguageCode = 'es' | 'en';

export type PanelId = 'spanish' | 'english';

export type PanelRole = 'source' | 'target';

export type PanelStatus =
  | 'idle'
  | 'typing'
  | 'translating'
  | 'error'
  | 'offline';

export type TranslationDirection = {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
};

export type TranslationPresetId =
  | 'natural'
  | 'professional'
  | 'casual'
  | 'concise'
  | 'warm'
  | 'direct'
  | 'shorten';

export type TranslationPreset = {
  id: TranslationPresetId;
  label: string;
  description: string;
  instruction: string;
};

export type TranslationRecord = TranslationDirection & {
  id: string;
  sourceText: string;
  translatedText: string;
  requestHash?: string;
  pairHash?: string;
  createdAt: string;
  deletedAt?: string | null;
};

export type UsageSnapshot = {
  estimatedTokens: number;
  monthlyQuota: number;
  usedThisMonth: number;
  remainingThisMonth: number;
  charged: boolean;
  resetAt: string;
};

export type UsageState = 'available' | 'exhausted' | 'charged';

export type PracticeType =
  | 'vocabulary_recall'
  | 'fill_in'
  | 're_translate';

export type PracticeItem = {
  type: PracticeType;
  prompt: string;
  answer: string;
  translationRecordId?: string | null;
};

export type PracticeSet = {
  items: PracticeItem[];
  sourceTranslationIds: string[];
};

export type StudySegmentRole =
  | 'subject'
  | 'verb'
  | 'object'
  | 'complement'
  | 'modifier'
  | 'connector'
  | 'other';

export type StudySegment = {
  text: string;
  label: string;
  role: StudySegmentRole;
  explanation: string;
};

export type StudyAlternative = {
  label: string;
  text: string;
  note: string;
};

export type StudyTenseVariation = {
  tense: string;
  text: string;
  note: string;
};

export type StudyMistake = {
  mistake: string;
  correction: string;
  note: string;
};

export type StudyExercise = {
  prompt: string;
  answer: string;
};

export type StudyArticleVersion =
  | 'markdown-v1'
  | 'markdown-v2'
  | 'markdown-v3'
  | 'structured-v1';

/** Emotional and cultural tone analysis for the translated phrase. */
export type VibeCheck = {
  /** Categorical tone label. */
  tone: 'formal' | 'professional' | 'neutral' | 'casual' | 'slang';
  /** 0 = very formal, 10 = very casual/slang. */
  score: number;
  /** Representative emoji for the tone (e.g. "😐" or "😎"). */
  emoji: string;
  /** 1-2 sentences on regional/cultural meaning differences. */
  culturalNote: string;
  /** Optional: flags when a phrase can read as passive-aggressive, sarcastic, etc. */
  watchOut?: string;
};

/** One grammar mutation showing how the phrase changes when tense, subject, or mood shifts. */
export type SandboxVariation = {
  /** Short description of what changed (e.g. "In the past", "As a question"). */
  label: string;
  /** The mutated source-language (Spanish) phrase. */
  original: string;
  /** English translation of the mutated phrase. */
  translation: string;
  /** One sentence on the nuance shift. */
  nuance: string;
};

export type StudyArticleResponseMetadata = {
  cached: boolean;
  generatedAt?: string;
};

export type StudyArticle = TranslationDirection & {
  translationRecordId: string;
  sourceText: string;
  translatedText: string;
  title: string;
  summary: string;
  articleVersion: StudyArticleVersion;
  markdown: string;
  lessonFocus?: string[];
  estimatedReadingMinutes?: number;
  /** Interactive sections — present in markdown-v2+ articles. */
  vibeCheck?: VibeCheck;
  sandbox?: SandboxVariation[];
  /** Legacy structured-v1 fields kept for backwards compatibility. */
  segments?: StudySegment[];
  tenseExplanation?: string;
  contextExplanation?: string;
  alternatives?: StudyAlternative[];
  tenseVariations?: StudyTenseVariation[];
  commonMistakes?: StudyMistake[];
  exercises?: StudyExercise[];
};
