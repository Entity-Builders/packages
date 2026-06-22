import type {
  ExpressionBreakdown,
  ExpressionStructurePart,
  ExpressionTenseNote,
  TranslationRecord,
} from './types';

export type GrammarAnnotation = {
  id: string;
  text: string;
  label: string;
  role: ExpressionStructurePart['role'] | 'tense';
  note: string;
  startIndex: number | null;
  endIndex: number | null;
};

export type GrammarAnnotationSummary = {
  annotations: GrammarAnnotation[];
  tenseNotes: ExpressionTenseNote[];
  tenseSummary: string | null;
  hasAnalysis: boolean;
};

const roleLabels: Record<ExpressionStructurePart['role'], string> = {
  subject: 'sujeto',
  verb: 'verbo',
  object: 'objeto',
  complement: 'complemento',
  modifier: 'modificador',
  connector: 'conector',
  other: 'estructura',
};

const normalizeSearchText = (value: string) => value.toLocaleLowerCase();

const findPartRange = (
  translatedText: string,
  partText: string,
  preferredStart: number,
) => {
  const trimmedPart = partText.trim();
  if (!trimmedPart) return { startIndex: null, endIndex: null };

  const normalizedText = normalizeSearchText(translatedText);
  const normalizedPart = normalizeSearchText(trimmedPart);
  const afterPreferredStart = normalizedText.indexOf(
    normalizedPart,
    preferredStart,
  );
  const startIndex =
    afterPreferredStart >= 0
      ? afterPreferredStart
      : normalizedText.indexOf(normalizedPart);

  if (startIndex < 0) return { startIndex: null, endIndex: null };

  return {
    startIndex,
    endIndex: startIndex + trimmedPart.length,
  };
};
const tenseNotesFromBreakdown = (breakdown: ExpressionBreakdown | null) => {
  if (!breakdown) return [];
  if (breakdown.tenses?.length) return breakdown.tenses;
  if (!breakdown.tense) return [];

  return [
    {
      label: breakdown.tense,
      text: '',
      note: '',
    },
  ];
};

export const getGrammarAnnotations = (
  record: Pick<TranslationRecord, 'translatedText' | 'breakdown'>,
): GrammarAnnotationSummary => {
  const breakdown = record.breakdown || null;
  const tenseNotes = tenseNotesFromBreakdown(breakdown);
  const annotations: GrammarAnnotation[] = [];
  let searchCursor = 0;

  breakdown?.structure?.forEach((part, index) => {
    const range = findPartRange(record.translatedText, part.text, searchCursor);
    if (range.endIndex !== null) {
      searchCursor = range.endIndex;
    }

    annotations.push({
      id: `structure-${index}`,
      text: part.text,
      label: roleLabels[part.role],
      role: part.role,
      note: part.note,
      startIndex: range.startIndex,
      endIndex: range.endIndex,
    });
  });

  tenseNotes.forEach((tense, index) => {
    if (!tense.text.trim()) return;

    const range = findPartRange(record.translatedText, tense.text, 0);
    const overlapsStructure = annotations.some(
      (annotation) =>
        annotation.startIndex !== null &&
        annotation.endIndex !== null &&
        range.startIndex !== null &&
        range.endIndex !== null &&
        annotation.startIndex <= range.startIndex &&
        annotation.endIndex >= range.endIndex,
    );

    if (overlapsStructure) return;

    annotations.push({
      id: `tense-${index}`,
      text: tense.text,
      label: tense.label,
      role: 'tense',
      note: tense.note,
      startIndex: range.startIndex,
      endIndex: range.endIndex,
    });
  });

  return {
    annotations,
    tenseNotes,
    tenseSummary: tenseNotes.length
      ? tenseNotes.map((tense) => tense.label).join(' + ')
      : null,
    hasAnalysis:
      annotations.length > 0 ||
      tenseNotes.length > 0 ||
      Boolean(breakdown?.whyThisWorks || breakdown?.feedback.length),
  };
};
