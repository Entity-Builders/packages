import { describe, expect, it } from 'vitest';
import { getGrammarAnnotations } from './grammar-annotations';

describe('getGrammarAnnotations', () => {
  it('maps saved breakdown structure onto translated text ranges', () => {
    const summary = getGrammarAnnotations({
      translatedText: 'They are going to eat at the restaurant.',
      breakdown: {
        changed: true,
        confidence: 'high',
        feedback: ['Natural future plan.'],
        tense: 'Near future',
        structure: [
          {
            text: 'They',
            role: 'subject',
            note: 'Who performs the action.',
          },
          {
            text: 'are going to eat',
            role: 'verb',
            note: 'Near-future plan.',
          },
          {
            text: 'at the restaurant',
            role: 'complement',
            note: 'Where the action happens.',
          },
        ],
      },
    });

    expect(summary.tenseSummary).toBe('Near future');
    expect(summary.hasAnalysis).toBe(true);
    expect(summary.annotations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: 'They',
          label: 'sujeto',
          startIndex: 0,
          endIndex: 4,
        }),
        expect.objectContaining({
          text: 'are going to eat',
          label: 'verbo',
          startIndex: 5,
        }),
      ]),
    );
  });

  it('keeps unmatched annotations available as labels', () => {
    const summary = getGrammarAnnotations({
      translatedText: 'I need some help.',
      breakdown: {
        changed: true,
        confidence: 'high',
        feedback: ['Sounds softer.'],
        structure: [
          {
            text: 'missing phrase',
            role: 'other',
            note: 'Still useful as a note.',
          },
        ],
      },
    });

    expect(summary.annotations[0]).toEqual(
      expect.objectContaining({
        label: 'estructura',
        startIndex: null,
        endIndex: null,
      }),
    );
  });
});
