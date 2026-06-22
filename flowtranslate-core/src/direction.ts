import type {
  ExpressionMode,
  LanguageCode,
  PanelId,
  IntentDetectionResult,
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

export const EXPRESSION_MODES: ExpressionMode[] = [
  'translate_to_english',
  'improve_english',
  'translate_to_spanish',
];

export const DEFAULT_EXPRESSION_MODE: ExpressionMode = 'translate_to_english';

export const EXPRESSION_MODE_LABELS: Record<ExpressionMode, string> = {
  translate_to_english: 'Translate to English',
  improve_english: 'Improve English',
  translate_to_spanish: 'Explain in Spanish',
};

export const createExpressionDirection = (
  mode: ExpressionMode,
): TranslationDirection => {
  if (mode === 'translate_to_english') {
    return { sourceLanguage: 'es', targetLanguage: 'en' };
  }

  if (mode === 'improve_english') {
    return { sourceLanguage: 'en', targetLanguage: 'en' };
  }

  return { sourceLanguage: 'en', targetLanguage: 'es' };
};

export const inferExpressionModeFromDirection = (
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
): ExpressionMode => {
  if (sourceLanguage === 'en' && targetLanguage === 'en') return 'improve_english';
  if (sourceLanguage === 'en' && targetLanguage === 'es') return 'translate_to_spanish';
  return 'translate_to_english';
};

const SPANISH_MARKERS = new Set([
  'a',
  'al',
  'algo',
  'amigo',
  'como',
  'con',
  'cuando',
  'dale',
  'de',
  'del',
  'el',
  'ella',
  'en',
  'es',
  'eso',
  'estoy',
  'hacer',
  'hay',
  'hola',
  'la',
  'las',
  'lo',
  'los',
  'me',
  'mi',
  'muy',
  'necesito',
  'no',
  'para',
  'pero',
  'por',
  'que',
  'quiero',
  'se',
  'si',
  'estas',
  'te',
  'tengo',
  'un',
  'una',
  'vamos',
  'van',
  'vos',
  'yo',
]);

const ENGLISH_MARKERS = new Set([
  'a',
  'about',
  'after',
  'am',
  'and',
  'are',
  'be',
  'but',
  'can',
  'could',
  'for',
  'good',
  'have',
  'hello',
  'help',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'need',
  'of',
  'on',
  'please',
  'thanks',
  'that',
  'the',
  'this',
  'to',
  'want',
  'we',
  'with',
  'you',
]);

const AMBIGUOUS_LANGUAGE_MARKERS = new Set(['a', 'me', 'no']);

const SPANGLISH_SPANISH_MARKERS = new Set([
  ...SPANISH_MARKERS,
  'ahora',
  'cliente',
  'despues',
  'después',
  'hoy',
  'llego',
  'llamada',
  'mail',
  'mañana',
  'mensaje',
  'reunion',
  'reunión',
  'tiempo',
]);

const SPANGLISH_ENGLISH_MARKERS = new Set([
  ...ENGLISH_MARKERS,
  'call',
  'make',
  'meeting',
  'move',
  'same',
  'sorry',
  'time',
  'today',
  'tomorrow',
]);

const tokenizeForDetection = (text: string) =>
  text
    .toLocaleLowerCase()
    .match(/[a-záéíóúüñ]+(?:'[a-z]+)?/gi) || [];

const countSpecificLanguageSignals = (tokens: string[], markers: Set<string>) =>
  tokens.filter(
    (token) =>
      markers.has(token) && !AMBIGUOUS_LANGUAGE_MARKERS.has(token),
  ).length;

export const hasMixedSpanishEnglishInput = (text: string) => {
  const trimmed = text.trim();
  const tokens = tokenizeForDetection(trimmed);
  if (tokens.length < 3) return false;

  const spanishSignals =
    (/[áéíóúüñ¿¡]/i.test(trimmed) ? 1 : 0) +
    (/\b(a la|al|hoy|mañana|no llego|no puedo|necesito|quiero)\b/i.test(trimmed)
      ? 1
      : 0) +
    countSpecificLanguageSignals(tokens, SPANGLISH_SPANISH_MARKERS);
  const englishSignals = countSpecificLanguageSignals(
    tokens,
    SPANGLISH_ENGLISH_MARKERS,
  );

  return spanishSignals > 0 && englishSignals > 0;
};

export const detectExpressionMode = (
  text: string,
  lastMode: ExpressionMode = DEFAULT_EXPRESSION_MODE,
): IntentDetectionResult => {
  const trimmed = text.trim();
  const tokens = tokenizeForDetection(trimmed);

  if (trimmed.length < 4 || tokens.length === 0) {
    return {
      mode: lastMode,
      confidence: 'low',
      reason: 'ambiguous',
      automatic: false,
    };
  }

  const hasSpanishChars = /[áéíóúüñ¿¡]/i.test(trimmed);
  const spanishScore =
    (hasSpanishChars ? 2 : 0) +
    tokens.filter((token) => SPANISH_MARKERS.has(token)).length;
  const englishScore = tokens.filter((token) => ENGLISH_MARKERS.has(token)).length;

  if (spanishScore >= englishScore + 2) {
    return {
      mode: 'translate_to_english',
      confidence: hasSpanishChars || spanishScore >= 3 ? 'high' : 'medium',
      reason: 'spanish',
      automatic: true,
    };
  }

  if (englishScore >= spanishScore + 2) {
    return {
      mode: 'improve_english',
      confidence: englishScore >= 3 ? 'high' : 'medium',
      reason: 'english',
      automatic: true,
    };
  }

  if (spanishScore > 0 && englishScore > 0) {
    return {
      mode: lastMode,
      confidence: 'low',
      reason: 'mixed',
      automatic: false,
    };
  }

  if (spanishScore > englishScore && spanishScore > 0) {
    return {
      mode: 'translate_to_english',
      confidence: 'medium',
      reason: 'spanish',
      automatic: true,
    };
  }

  if (englishScore > spanishScore && englishScore > 0) {
    return {
      mode: 'improve_english',
      confidence: 'medium',
      reason: 'english',
      automatic: true,
    };
  }

  if (!hasSpanishChars && spanishScore === 0 && englishScore === 0 && tokens.length >= 2) {
    return {
      mode: 'improve_english',
      confidence: 'low',
      reason: 'english',
      automatic: true,
    };
  }

  return {
    mode: lastMode,
    confidence: 'low',
    reason: 'ambiguous',
    automatic: false,
  };
};

export type ResponseGuard = {
  requestSequence: number;
  latestSequence: number;
  requestSourceLanguage?: LanguageCode;
  latestSourceLanguage?: LanguageCode;
  requestMode?: ExpressionMode;
  latestMode?: ExpressionMode;
  requestSourceText: string;
  latestSourceText: string;
  requestPresetId?: TranslationPresetId;
  latestPresetId?: TranslationPresetId;
  requestContextText?: string;
  latestContextText?: string;
};

export const canApplyTranslationResponse = ({
  requestSequence,
  latestSequence,
  requestSourceLanguage,
  latestSourceLanguage,
  requestMode,
  latestMode,
  requestSourceText,
  latestSourceText,
  requestPresetId,
  latestPresetId,
  requestContextText,
  latestContextText,
}: ResponseGuard) =>
  requestSequence === latestSequence &&
  (!requestSourceLanguage ||
    !latestSourceLanguage ||
    requestSourceLanguage === latestSourceLanguage) &&
  (!requestMode || !latestMode || requestMode === latestMode) &&
  requestSourceText === latestSourceText &&
  (!requestPresetId || !latestPresetId || requestPresetId === latestPresetId) &&
  (requestContextText ?? '') === (latestContextText ?? '');
