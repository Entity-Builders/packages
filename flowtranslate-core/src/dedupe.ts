import type { LanguageCode } from './types';

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
) =>
  [
    'flowtranslate:v1:request',
    sourceLanguage,
    targetLanguage,
    normalizeTranslationText(sourceText),
  ].join('\n');

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
) => sha256Hex(buildRequestFingerprint(sourceText, sourceLanguage, targetLanguage));

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
