import { describe, expect, it } from 'vitest';
import {
  canApplyTranslationResponse,
  createDirection,
  getOppositeLanguage,
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

  it('allows only the latest matching response to apply', () => {
    expect(
      canApplyTranslationResponse({
        requestSequence: 2,
        latestSequence: 2,
        requestSourceLanguage: 'en',
        latestSourceLanguage: 'en',
        requestSourceText: 'hello',
        latestSourceText: 'hello',
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
  });
});
