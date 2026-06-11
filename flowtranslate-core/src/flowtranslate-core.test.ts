import { describe, expect, it } from 'vitest';
import type { StudyArticle, StudyArticleResponseMetadata } from './index';
import {
  createExpressionPairHash,
  createExpressionRequestHash,
  canSpendEstimatedTokens,
  createPairHash,
  createRequestHash,
  getTranslationPreset,
  getMonthlyResetAt,
  getRemainingUsage,
  getUsageState,
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
    expect(getTranslationPreset('shorten').instruction).toContain('Shorten');
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
