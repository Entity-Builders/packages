import { DEFAULT_TRANSLATION_PRESET_ID } from './presets';
import type { ExpressionMode, LanguageCode, TranslationPresetId } from './types';
import { createExpressionDirection } from './direction';

const encoder = new TextEncoder();

const bytesToHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const normalizeTranslationText = (text: string) =>
  text.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export const buildRequestFingerprint = (
  sourceText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
) => {
  const parts = [
    'flowtranslate:v1:request',
    sourceLanguage,
    targetLanguage,
    normalizeTranslationText(sourceText),
  ];

  return parts.join('\n');
};

export const buildPresetRequestFingerprint = (
  sourceText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  presetId: TranslationPresetId = DEFAULT_TRANSLATION_PRESET_ID,
  mode?: ExpressionMode,
) => {
  const parts = [
    'flowtranslate:v1:request',
    ...(mode ? [`mode:${mode}`] : []),
    sourceLanguage,
    targetLanguage,
    normalizeTranslationText(sourceText),
  ];

  if (presetId !== DEFAULT_TRANSLATION_PRESET_ID) {
    parts.push(`preset:${presetId}`);
    parts.push(STYLE_PRESET_REQUEST_CONTRACT_VERSION);
  }

  return parts.join('\n');
};

export const buildPairFingerprint = (
  sourceText: string,
  translatedText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  mode?: ExpressionMode,
) =>
  [
    'flowtranslate:v1:pair',
    ...(mode ? [`mode:${mode}`] : []),
    sourceLanguage,
    targetLanguage,
    normalizeTranslationText(sourceText),
    normalizeTranslationText(translatedText),
  ].join('\n');

export const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToHex(digest);
};

export const EXPRESSION_REQUEST_HASH_VERSION =
  'flowtranslate:v4:fast_expression_request';
export const STYLE_PRESET_REQUEST_CONTRACT_VERSION =
  'flowtranslate:style-preset-request:v3';

export const createRequestHash = (
  sourceText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  presetId: TranslationPresetId = DEFAULT_TRANSLATION_PRESET_ID,
  mode?: ExpressionMode,
) =>
  sha256Hex(
    buildPresetRequestFingerprint(
      sourceText,
      sourceLanguage,
      targetLanguage,
      presetId,
      mode,
    ),
  );

export const createPairHash = (
  sourceText: string,
  translatedText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  mode?: ExpressionMode,
) =>
  sha256Hex(
    buildPairFingerprint(
      sourceText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      mode,
    ),
  );

export const createExpressionRequestHash = (
  sourceText: string,
  mode: ExpressionMode,
  presetId: TranslationPresetId = DEFAULT_TRANSLATION_PRESET_ID,
  contextText = '',
) => {
  const direction = createExpressionDirection(mode);
  const parts = [
    contextText.trim()
      ? 'flowtranslate:v5:fast_expression_request_with_context'
      : EXPRESSION_REQUEST_HASH_VERSION,
    `mode:${mode}`,
    direction.sourceLanguage,
    direction.targetLanguage,
    normalizeTranslationText(sourceText),
  ];

  if (presetId !== DEFAULT_TRANSLATION_PRESET_ID) {
    parts.push(`preset:${presetId}`);
    parts.push(STYLE_PRESET_REQUEST_CONTRACT_VERSION);
  }

  if (contextText.trim()) {
    parts.push(`context:${normalizeTranslationText(contextText)}`);
  }

  return sha256Hex(parts.join('\n'));
};

export const createExpressionPairHash = (
  sourceText: string,
  resultText: string,
  mode: ExpressionMode,
) => {
  const direction = createExpressionDirection(mode);
  return createPairHash(
    sourceText,
    resultText,
    direction.sourceLanguage,
    direction.targetLanguage,
    mode,
  );
};
