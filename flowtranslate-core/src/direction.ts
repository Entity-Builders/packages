import type {
  LanguageCode,
  PanelId,
  TranslationDirection,
  TranslationPresetId,
} from './types';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  es: 'Spanish',
  en: 'English',
};

export const PANEL_LANGUAGE: Record<PanelId, LanguageCode> = {
  spanish: 'es',
  english: 'en',
};

export const languageToPanel = (language: LanguageCode): PanelId =>
  language === 'es' ? 'spanish' : 'english';

export const getOppositeLanguage = (language: LanguageCode): LanguageCode =>
  language === 'es' ? 'en' : 'es';

export const createDirection = (
  sourceLanguage: LanguageCode,
): TranslationDirection => ({
  sourceLanguage,
  targetLanguage: getOppositeLanguage(sourceLanguage),
});

export type ResponseGuard = {
  requestSequence: number;
  latestSequence: number;
  requestSourceLanguage: LanguageCode;
  latestSourceLanguage: LanguageCode;
  requestSourceText: string;
  latestSourceText: string;
  requestPresetId?: TranslationPresetId;
  latestPresetId?: TranslationPresetId;
};

export const canApplyTranslationResponse = ({
  requestSequence,
  latestSequence,
  requestSourceLanguage,
  latestSourceLanguage,
  requestSourceText,
  latestSourceText,
  requestPresetId,
  latestPresetId,
}: ResponseGuard) =>
  requestSequence === latestSequence &&
  requestSourceLanguage === latestSourceLanguage &&
  requestSourceText === latestSourceText &&
  (!requestPresetId || !latestPresetId || requestPresetId === latestPresetId);
