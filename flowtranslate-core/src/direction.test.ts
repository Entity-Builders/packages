import { describe, expect, it } from 'vitest';
import {
  canApplyTranslationResponse,
  createDirection,
  createExpressionDirection,
  detectExpressionMode,
  EXPRESSION_MODE_LABELS,
  getOppositeLanguage,
  inferExpressionModeFromDirection,
  languageToPanel,
} from './direction';

describe('direction helpers', () => {
  it('maps Spanish and English panels in both directions', () => {
    expect(getOppositeLanguage('es')).toBe('en');
    expect(getOppositeLanguage('en')).toBe('es');
    expect(createDirection('es')).toEqual({
      sourceLanguage: 'es',
      targetLanguage: 'en',
    });
    expect(languageToPanel('en')).toBe('english');
  });

  it('maps expression modes to language direction including English improvement', () => {
    expect(createExpressionDirection('translate_to_english')).toEqual({
      sourceLanguage: 'es',
      targetLanguage: 'en',
    });
    expect(createExpressionDirection('improve_english')).toEqual({
      sourceLanguage: 'en',
      targetLanguage: 'en',
    });
    expect(createExpressionDirection('translate_to_spanish')).toEqual({
      sourceLanguage: 'en',
      targetLanguage: 'es',
    });
    expect(inferExpressionModeFromDirection('en', 'en')).toBe('improve_english');
    expect(EXPRESSION_MODE_LABELS.translate_to_spanish).toBe('Explain in Spanish');
  });

  it('detects expression intent and falls back to last mode for ambiguous input', () => {
    expect(detectExpressionMode('quiero pedir ayuda').mode).toBe(
      'translate_to_english',
    );
    expect(detectExpressionMode('I need some help').mode).toBe('improve_english');

    const mixed = detectExpressionMode('dale I will call you', 'translate_to_spanish');
    expect(mixed.mode).toBe('translate_to_spanish');
    expect(mixed.automatic).toBe(false);

    const short = detectExpressionMode('ok', 'improve_english');
    expect(short.mode).toBe('improve_english');
    expect(short.confidence).toBe('low');
  });

  it('allows only the latest matching response to apply', () => {
    expect(
      canApplyTranslationResponse({
        requestSequence: 2,
        latestSequence: 2,
        requestSourceLanguage: 'en',
        latestSourceLanguage: 'en',
        requestSourceText: 'hello',
        latestSourceText: 'hello',
        requestMode: 'improve_english',
        latestMode: 'improve_english',
      }),
    ).toBe(true);

    expect(
      canApplyTranslationResponse({
        requestSequence: 1,
        latestSequence: 2,
        requestSourceLanguage: 'en',
        latestSourceLanguage: 'en',
        requestSourceText: 'hello',
        latestSourceText: 'hello',
      }),
    ).toBe(false);

    expect(
      canApplyTranslationResponse({
        requestSequence: 2,
        latestSequence: 2,
        requestMode: 'improve_english',
        latestMode: 'translate_to_spanish',
        requestSourceText: 'hello',
        latestSourceText: 'hello',
      }),
    ).toBe(false);

    expect(
      canApplyTranslationResponse({
        requestSequence: 2,
        latestSequence: 2,
        requestSourceLanguage: 'en',
        latestSourceLanguage: 'en',
        requestSourceText: 'hello',
        latestSourceText: 'hello',
        requestPresetId: 'professional',
        latestPresetId: 'casual',
      }),
    ).toBe(false);
  });
});
