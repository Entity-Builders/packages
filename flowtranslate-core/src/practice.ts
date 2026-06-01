import type { PracticeType, TranslationRecord } from './types';

export const DEFAULT_PRACTICE_TYPES: PracticeType[] = [
  'vocabulary_recall',
  'fill_in',
  're_translate',
];

export const selectRecentUniqueActiveTranslations = (
  records: TranslationRecord[],
  limit = 20,
) => {
  const seen = new Set<string>();
  const sorted = [...records].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const selected: TranslationRecord[] = [];

  for (const record of sorted) {
    if (record.deletedAt) continue;

    const key =
      record.requestHash ||
      [
        record.sourceLanguage,
        record.targetLanguage,
        record.sourceText.trim().replace(/\s+/g, ' ').toLocaleLowerCase(),
      ].join(':');

    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(record);

    if (selected.length >= limit) break;
  }

  return selected;
};
