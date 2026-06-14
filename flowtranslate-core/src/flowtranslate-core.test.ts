import { describe, expect, it } from 'vitest';
import type { StudyArticle, StudyArticleResponseMetadata } from './index';
import {
  chooseRecommendedLearningSituation,
  createExpressionPairHash,
  createExpressionRequestHash,
  canSpendEstimatedTokens,
  createPairHash,
  createRequestHash,
  getTranslationPreset,
  getMonthlyResetAt,
  getRemainingUsage,
  getUsageState,
  rankLearningSituationsFromHistory,
  selectStarterLearningSituations,
  STARTER_LEARNING_SITUATIONS,
  selectRecentUniqueActiveTranslations,
  TRANSLATION_PRESETS,
} from './index';

describe('dedupe helpers', () => {
  it('creates stable request hashes from normalized source and direction', async () => {
    await expect(createRequestHash(' Hola   Mundo ', 'es', 'en')).resolves.toBe(
      await createRequestHash('hola mundo', 'es', 'en'),
    );

    await expect(createRequestHash('hola mundo', 'en', 'es')).resolves.not.toBe(
      await createRequestHash('hola mundo', 'es', 'en'),
    );
  });

  it('keeps natural preset compatible and separates styled presets', async () => {
    await expect(
      createRequestHash('hola mundo', 'es', 'en', 'natural'),
    ).resolves.toBe(await createRequestHash('hola mundo', 'es', 'en'));

    await expect(
      createRequestHash('hola mundo', 'es', 'en', 'casual'),
    ).resolves.not.toBe(
      await createRequestHash('hola mundo', 'es', 'en', 'natural'),
    );
  });

  it('keeps pair hashes sensitive to translated output', async () => {
    await expect(
      createPairHash('hola', 'hello', 'es', 'en'),
    ).resolves.not.toBe(await createPairHash('hola', 'hi', 'es', 'en'));
  });

  it('includes expression mode in new request and pair hashes', async () => {
    await expect(
      createExpressionRequestHash('I need help', 'improve_english'),
    ).resolves.not.toBe(
      await createRequestHash('I need help', 'en', 'en', 'natural', 'improve_english'),
    );

    await expect(
      createExpressionRequestHash('I need help', 'improve_english'),
    ).resolves.not.toBe(
      await createExpressionRequestHash('I need help', 'translate_to_spanish'),
    );

    await expect(
      createExpressionPairHash('I need help', 'I need some help.', 'improve_english'),
    ).resolves.not.toBe(
      await createExpressionPairHash(
        'I need help',
        'Necesito ayuda',
        'translate_to_spanish',
      ),
    );
  });

  it('separates expression requests by work context without changing the source text', async () => {
    await expect(
      createExpressionRequestHash('hoy no puedo ir', 'translate_to_english'),
    ).resolves.not.toBe(
      await createExpressionRequestHash(
        'hoy no puedo ir',
        'translate_to_english',
        'natural',
        'Cliente Sarah, reunion de avance',
      ),
    );
  });
});

describe('preset contracts', () => {
  it('exposes a closed set of product presets', () => {
    expect(TRANSLATION_PRESETS.map((preset) => preset.id)).toEqual([
      'natural',
      'professional',
      'casual',
      'concise',
      'warm',
      'direct',
      'shorten',
    ]);
    expect(getTranslationPreset('shorten')).toMatchObject({
      label: 'Brief',
      description: 'One-line sendable reply.',
    });
    expect(getTranslationPreset('shorten').instruction).toContain(
      'one short sentence',
    );
    expect(getTranslationPreset('shorten').instruction).toContain(
      'message-style',
    );
    expect(getTranslationPreset('shorten').instruction).toContain(
      'Remove non-essential filler',
    );
  });
});

describe('quota helpers', () => {
  it('computes reset periods and remaining quota', () => {
    expect(getMonthlyResetAt(new Date('2026-06-15T10:00:00.000Z'))).toBe(
      '2026-07-01T00:00:00.000Z',
    );
    expect(getRemainingUsage(100, 40)).toBe(60);
    expect(canSpendEstimatedTokens(100, 90, 11)).toBe(false);
    expect(
      getUsageState({
        remainingThisMonth: 0,
        charged: false,
      }),
    ).toBe('exhausted');
  });
});

describe('practice helpers', () => {
  it('selects active recent unique records', () => {
    const selected = selectRecentUniqueActiveTranslations([
      {
        id: 'old-duplicate',
        sourceLanguage: 'es',
        targetLanguage: 'en',
        sourceText: 'Hola',
        translatedText: 'Hello',
        requestHash: 'same',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
      {
        id: 'new-duplicate',
        sourceLanguage: 'es',
        targetLanguage: 'en',
        sourceText: 'Hola',
        translatedText: 'Hello',
        requestHash: 'same',
        createdAt: '2026-06-01T10:00:00.000Z',
      },
      {
        id: 'deleted',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        sourceText: 'Bye',
        translatedText: 'Chau',
        createdAt: '2026-06-01T11:00:00.000Z',
        deletedAt: '2026-06-01T11:30:00.000Z',
      },
    ]);

    expect(selected.map((record) => record.id)).toEqual(['new-duplicate']);
  });
});

describe('learning situation helpers', () => {
  it('keeps the starter situation catalog stable', () => {
    expect(STARTER_LEARNING_SITUATIONS.map((situation) => situation.id)).toEqual([
      'delay-update',
      'professional-interest',
      'schedule-call',
      'polite-rejection',
      'ask-context',
      'follow-up',
      'thank-and-close',
      'scope-timing',
    ]);

    expect(
      STARTER_LEARNING_SITUATIONS.every(
        (situation) =>
          situation.catalogVersion === 'flowtranslate:learning-situations:v1',
      ),
    ).toBe(true);
  });

  it('selects the first starter situations when history is thin', () => {
    const starters = selectStarterLearningSituations(2);

    expect(starters.map((situation) => situation.id)).toEqual([
      'delay-update',
      'professional-interest',
    ]);

    const recommendation = chooseRecommendedLearningSituation([
      {
        id: 'record-1',
        sourceLanguage: 'es',
        targetLanguage: 'en',
        mode: 'translate_to_english',
        sourceText: 'Gracias por escribir',
        translatedText: 'Thanks for reaching out.',
        createdAt: '2026-06-01T10:00:00.000Z',
      },
    ]);

    expect(recommendation.personalized).toBe(false);
    expect(recommendation.recommended.id).toBe('delay-update');
  });

  it('ranks work situations from recent translation history', () => {
    const ranked = rankLearningSituationsFromHistory([
      {
        id: 'record-1',
        sourceLanguage: 'es',
        targetLanguage: 'en',
        mode: 'translate_to_english',
        sourceText:
          'Decile a un cliente que el reporte se demora hasta manana.',
        translatedText:
          'Tell the client the report is taking longer than expected and I will send it tomorrow.',
        createdAt: '2026-06-02T10:00:00.000Z',
      },
      {
        id: 'record-2',
        sourceLanguage: 'es',
        targetLanguage: 'en',
        mode: 'translate_to_english',
        sourceText:
          'Avisale que la version final demora un poco mas pero ya estamos revisando.',
        translatedText:
          'Let them know the final version is taking a bit longer, but we are already reviewing it.',
        createdAt: '2026-06-02T09:30:00.000Z',
      },
      {
        id: 'record-3',
        sourceLanguage: 'es',
        targetLanguage: 'en',
        mode: 'translate_to_english',
        sourceText:
          'Gracias por escribir, me interesa la propuesta y podemos coordinar una llamada.',
        translatedText:
          'Thanks for reaching out. The proposal sounds interesting and we can schedule a quick call.',
        createdAt: '2026-06-02T09:00:00.000Z',
      },
      {
        id: 'deleted-record',
        sourceLanguage: 'es',
        targetLanguage: 'en',
        mode: 'translate_to_english',
        sourceText: 'Necesito hacer follow up',
        translatedText: 'I need to follow up.',
        createdAt: '2026-06-02T08:00:00.000Z',
        deletedAt: '2026-06-02T08:30:00.000Z',
      },
    ]);

    expect(ranked[0].situation.id).toBe('delay-update');
    expect(ranked[0].sourceRecordIds).toContain('record-1');
    expect(ranked[0].matchedSignals).toEqual(
      expect.arrayContaining(['reporte', 'demora', 'tomorrow']),
    );
    expect(ranked.some((candidate) => candidate.situation.id === 'follow-up'))
      .toBe(false);
  });
});

describe('study article contracts', () => {
  it('uses markdown articles as the primary learning contract', () => {
    const article: StudyArticle = {
      translationRecordId: 'record-1',
      sourceLanguage: 'es',
      targetLanguage: 'en',
      sourceText: 'Yo quiero aprender ingles',
      translatedText: 'I want to learn English',
      mode: 'translate_to_english',
      title: 'I want to learn English',
      summary: 'A personal English lesson.',
      articleVersion: 'markdown-v3',
      markdown:
        '# I want to learn English\n\n## Syntax map\n\n| Part | Role |\n| --- | --- |\n| I | Subject |',
      lessonFocus: ['syntax', 'tense'],
      estimatedReadingMinutes: 3,
    };

    const metadata: StudyArticleResponseMetadata = {
      cached: true,
      generatedAt: '2026-06-05T19:30:00.000Z',
    };

    expect(article.articleVersion).toBe('markdown-v3');
    expect(article.mode).toBe('translate_to_english');
    expect(article.markdown).toContain('## Syntax map');
    expect(article.segments).toBeUndefined();
    expect('roleplay' in article).toBe(false);
    expect(metadata.cached).toBe(true);
  });
});
