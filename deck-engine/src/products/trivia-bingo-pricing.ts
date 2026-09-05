import {
  TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT,
  TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION_ID,
  TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_OFFERING_ID,
} from './trivia-bingo.js';

export const TRIVIA_BINGO_PILOT_TABLE_COUNT = 8;
export const TRIVIA_BINGO_PILOT_QUESTION_COUNT = 18;
export const TRIVIA_BINGO_PILOT_GRID_SIZE = 3;

export const TRIVIA_BINGO_PILOT_OFFER = {
  id: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_OFFERING_ID,
  editionId: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION_ID,
  contentVersion: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT.contentVersion,
  title: 'Trivia Bingo: Esto es muy argentino',
  amountARS: 9900,
  currency: 'ARS',
  label: 'ARS 9.900 final por evento',
  tableCount: TRIVIA_BINGO_PILOT_TABLE_COUNT,
  questionCount: TRIVIA_BINGO_PILOT_QUESTION_COUNT,
  gridSize: TRIVIA_BINGO_PILOT_GRID_SIZE,
} as const;

export type TriviaBingoPilotOffer = typeof TRIVIA_BINGO_PILOT_OFFER;

export interface TriviaBingoPriceQuote {
  offeringId: TriviaBingoPilotOffer['id'];
  editionId: TriviaBingoPilotOffer['editionId'];
  contentVersion: TriviaBingoPilotOffer['contentVersion'];
  amountARS: TriviaBingoPilotOffer['amountARS'];
  currency: TriviaBingoPilotOffer['currency'];
  label: TriviaBingoPilotOffer['label'];
  tableCount: TriviaBingoPilotOffer['tableCount'];
  questionCount: TriviaBingoPilotOffer['questionCount'];
  gridSize: TriviaBingoPilotOffer['gridSize'];
}

export function resolveTriviaBingoPilotOffer(input: {
  offeringId: string;
  editionId: string;
}): TriviaBingoPriceQuote | null {
  if (
    input.offeringId !== TRIVIA_BINGO_PILOT_OFFER.id ||
    input.editionId !== TRIVIA_BINGO_PILOT_OFFER.editionId
  ) {
    return null;
  }

  return {
    offeringId: TRIVIA_BINGO_PILOT_OFFER.id,
    editionId: TRIVIA_BINGO_PILOT_OFFER.editionId,
    contentVersion: TRIVIA_BINGO_PILOT_OFFER.contentVersion,
    amountARS: TRIVIA_BINGO_PILOT_OFFER.amountARS,
    currency: TRIVIA_BINGO_PILOT_OFFER.currency,
    label: TRIVIA_BINGO_PILOT_OFFER.label,
    tableCount: TRIVIA_BINGO_PILOT_OFFER.tableCount,
    questionCount: TRIVIA_BINGO_PILOT_OFFER.questionCount,
    gridSize: TRIVIA_BINGO_PILOT_OFFER.gridSize,
  };
}

export function formatTriviaBingoPriceARS(amountARS: number): string {
  return `$${amountARS.toLocaleString('es-AR')} ARS`;
}
