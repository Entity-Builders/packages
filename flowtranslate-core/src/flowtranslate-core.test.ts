import { describe, expect, it } from 'vitest';
import {
  canSpendEstimatedTokens,
  createPairHash,
  createRequestHash,
  getMonthlyResetAt,
  getRemainingUsage,
  getUsageState,
  selectRecentUniqueActiveTranslations,
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

  it('keeps pair hashes sensitive to translated output', async () => {
    await expect(
      createPairHash('hola', 'hello', 'es', 'en'),
    ).resolves.not.toBe(await createPairHash('hola', 'hi', 'es', 'en'));
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
