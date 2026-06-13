export type LanguageCode = 'es' | 'en';

export type PanelId = 'spanish' | 'english';

export type PanelRole = 'source' | 'target';

export type PanelStatus =
  | 'idle'
  | 'typing'
  | 'translating'
  | 'error'
  | 'offline';

export type Profile = {
  user_id: string;
  email?: string | null;
  monthly_quota: number;
  global_context?: string | null;
  current_streak: number;
  last_study_date?: string | null;
};

export type TranslationDirection = {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
};

export type ExpressionMode =
  | 'translate_to_english'
  | 'improve_english'
  | 'translate_to_spanish';

export type IntentDetectionConfidence = 'high' | 'medium' | 'low';

export type IntentDetectionResult = {
  mode: ExpressionMode;
  confidence: IntentDetectionConfidence;
  reason: 'spanish' | 'english' | 'mixed' | 'ambiguous' | 'manual';
  automatic: boolean;
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

export type GrammarInsight = {
  tense: string;
  structure: string;
  observation: string;
};

export type TranslationRecord = TranslationDirection & {
  id: string;
  sourceText: string;
  translatedText: string;
  mode?: ExpressionMode;
  breakdown?: ExpressionBreakdown | null;
  grammarInsight?: GrammarInsight | null;
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

export type ExpressionConfidence = 'high' | 'medium' | 'low';

export type ExpressionAlternative = {
  label: string;
  text: string;
  note: string;
};

export type ExpressionStructurePart = {
  text: string;
  role: 'subject' | 'verb' | 'object' | 'complement' | 'modifier' | 'connector' | 'other';
  note: string;
};

export type ExpressionTenseNote = {
  label: string;
  text: string;
  note: string;
};

export type ExpressionBreakdown = {
  changed: boolean;
  confidence: ExpressionConfidence;
  feedback: string[];
  /** Legacy compact summary. Prefer `tenses` when clause-level tense notes are available. */
  tense?: string;
  tenses?: ExpressionTenseNote[];
  structure?: ExpressionStructurePart[];
  commonMistake?: string;
  whyThisWorks?: string;
  alternatives?: ExpressionAlternative[];
};

export type BreakdownChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ExpressionOutput = TranslationDirection & {
  mode: ExpressionMode;
  sourceText: string;
  resultText: string;
  breakdown: ExpressionBreakdown;
  grammarInsight?: GrammarInsight;
};

export type LearningInsightItem = {
  title: string;
  expression: string;
  explanation: string;
  example?: string;
  sourceRecordIds?: string[];
};

export type LearningInsight = {
  insightVersion: string;
  historySnapshotHash: string;
  generatedAt: string;
  summary?: string;
  writingItems: LearningInsightItem[];
  conversationItems: LearningInsightItem[];
  sourceRecordIds: string[];
};

export type LearningInsightResponseMetadata = {
  cached: boolean;
  generatedAt?: string;
  refreshAvailable?: boolean;
};

export type LearningSituationId = string;

export type LearningSituationCategory =
  | 'delay_update'
  | 'professional_interest'
  | 'schedule_call'
  | 'polite_rejection'
  | 'ask_context'
  | 'follow_up'
  | 'thank_and_close'
  | 'scope_timing';

export type LearningSituation = {
  id: LearningSituationId;
  catalogVersion: string;
  category: LearningSituationCategory;
  title: string;
  description: string;
  outcome: string;
  samplePhrases: string[];
  detectionHints: {
    keywords: string[];
    modes?: ExpressionMode[];
  };
  priority: number;
};

export type LearningSituationCandidate = {
  situation: LearningSituation;
  score: number;
  sourceRecordIds: string[];
  matchedSignals: string[];
};

export type LearningGrammarNote = {
  label: string;
  text: string;
  note: string;
};

export type LearningBestOptionChoice = {
  id: string;
  text: string;
  preferred: boolean;
  feedback: string;
};

export type LearningBestOptionExercise = {
  prompt: string;
  choices: LearningBestOptionChoice[];
};

export type LearningSessionContent = {
  situationTitle: string;
  anchorPhrase: string;
  whyItWorks: string;
  grammarNotes: LearningGrammarNote[];
  bestOption: LearningBestOptionExercise;
  rewritePrompt: string;
  suggestedPhrases: string[];
};

export type LearningSessionStatus = 'active' | 'completed' | 'archived';

export type LearningSession = {
  id: string;
  situationId: LearningSituationId;
  catalogVersion: string;
  status: LearningSessionStatus;
  content: LearningSessionContent;
  sourceRecordIds: string[];
  historySnapshotHash?: string;
  createdAt: string;
  completedAt?: string | null;
};

export type LearningAttemptFeedback = {
  summary: string;
  improvedVersion: string;
  naturalness: 'strong' | 'close' | 'needs_work';
  notes: LearningGrammarNote[];
};

export type LearningAttempt = {
  id: string;
  sessionId: string;
  userAnswer: string;
  feedback: LearningAttemptFeedback;
  createdAt: string;
};

export type SavedPhrase = {
  id: string;
  text: string;
  note?: string;
  situationId?: LearningSituationId | null;
  sessionId?: string | null;
  sourceRecordIds: string[];
  createdAt: string;
  archivedAt?: string | null;
};

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
  mode?: ExpressionMode;
  sourceText: string;
  translatedText: string;
  breakdown?: ExpressionBreakdown | null;
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
