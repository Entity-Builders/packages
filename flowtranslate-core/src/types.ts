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
