import type {
  TriviaBingoCard,
  TriviaBingoControlSheetRow,
  TriviaBingoFairnessReport,
  TriviaBingoPrintPack,
} from './types';

export type TriviaBingoProjectionSlideKind = 'opening' | 'question' | 'reveal' | 'closing';

export interface TriviaBingoProjectionSlide {
  id: string;
  kind: TriviaBingoProjectionSlideKind;
  title: string;
  body: string;
  revealNumber?: number;
  timerSeconds?: number;
}

export interface TriviaBingoHostGuide {
  title: string;
  steps: string[];
  controlSheet: TriviaBingoControlSheetRow[];
  printInstructions: string[];
  legalSummary: string;
  fairnessReport: TriviaBingoFairnessReport;
}

export interface TriviaBingoPrintableKit {
  title: string;
  editionId: string;
  contentVersion: string;
  projectionSlides: TriviaBingoProjectionSlide[];
  tableCards: TriviaBingoCard[];
  hostGuide: TriviaBingoHostGuide;
}

export function buildTriviaBingoPrintableKit(pack: TriviaBingoPrintPack): TriviaBingoPrintableKit {
  const projectionSlides: TriviaBingoProjectionSlide[] = [
    {
      id: 'opening',
      kind: 'opening',
      title: pack.editionTitle,
      body: 'Conversen en mesa. Marcá sólo la respuesta oficial cuando aparezca en tu cartón. Gana el primer cartón lleno validado.',
    },
  ];

  for (const row of pack.controlSheet) {
    projectionSlides.push({
      id: `question-${row.revealNumber}`,
      kind: 'question',
      title: `Pregunta ${row.revealNumber}`,
      body: row.prompt,
      revealNumber: row.revealNumber,
      timerSeconds: 20,
    });
    projectionSlides.push({
      id: `reveal-${row.revealNumber}`,
      kind: 'reveal',
      title: `Respuesta: ${row.correctAnswerLabel}`,
      body: row.revealCopy,
      revealNumber: row.revealNumber,
    });
  }

  projectionSlides.push({
    id: 'closing',
    kind: 'closing',
    title: '¡Cartón lleno!',
    body: 'Levantá el cartón y verificá las nueve respuestas con la guía de host antes de anunciar al ganador.',
  });

  return {
    title: pack.editionTitle,
    editionId: pack.editionId,
    contentVersion: pack.contentVersion,
    projectionSlides,
    tableCards: pack.cards,
    hostGuide: {
      title: `Guía de host · ${pack.editionTitle}`,
      steps: pack.hostGuideSteps,
      controlSheet: pack.controlSheet,
      printInstructions: pack.printInstructions,
      legalSummary: pack.legalSummary,
      fairnessReport: pack.fairnessReport,
    },
  };
}
