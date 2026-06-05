import { DEFAULT_TRANSLATION_PRESET_ID } from './presets';
import type { LanguageCode, TranslationPresetId } from './types';

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
) => {
  const parts = [
    'flowtranslate:v1:request',
    sourceLanguage,
    targetLanguage,
    normalizeTranslationText(sourceText),
  ];

  if (presetId !== DEFAULT_TRANSLATION_PRESET_ID) {
    parts.push(`preset:${presetId}`);
  }

  return parts.join('\n');
};

export const buildPairFingerprint = (
  sourceText: string,
  translatedText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
) =>
  [
    'flowtranslate:v1:pair',
    sourceLanguage,
    targetLanguage,
    normalizeTranslationText(sourceText),
    normalizeTranslationText(translatedText),
  ].join('\n');

export const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToHex(digest);
};

export const createRequestHash = (
  sourceText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  presetId: TranslationPresetId = DEFAULT_TRANSLATION_PRESET_ID,
) =>
  sha256Hex(
    buildPresetRequestFingerprint(
      sourceText,
      sourceLanguage,
      targetLanguage,
      presetId,
    ),
  );

export const createPairHash = (
  sourceText: string,
  translatedText: string,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
) =>
  sha256Hex(
    buildPairFingerprint(
      sourceText,
      translatedText,
      sourceLanguage,
      targetLanguage,
    ),
  );
