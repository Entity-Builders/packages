import type {
  GameEdition,
  TriviaBingoAnswer,
  TriviaBingoCard,
  TriviaBingoCardCell,
  TriviaBingoEditionContent,
  TriviaBingoFairnessCheckpoint,
  TriviaBingoPrintPack,
  TriviaBingoQuestion,
} from './types.js';
import {
  TRIVIA_BINGO_PILOT_GRID_SIZE,
  TRIVIA_BINGO_PILOT_QUESTION_COUNT,
  TRIVIA_BINGO_PILOT_TABLE_COUNT,
} from './trivia-bingo-pricing.js';
import { validateTriviaBingoPrintPack } from './trivia-bingo-validation.js';

export interface TriviaBingoGeneratePackInput {
  edition: GameEdition;
  seed: string;
  tableCount?: number;
}

export interface TriviaBingoGeneratePackResult {
  pack: TriviaBingoPrintPack;
  winnerCardNumber: number;
}

export function generateTriviaBingoPrintPack(
  input: TriviaBingoGeneratePackInput
): TriviaBingoGeneratePackResult {
  const content = requireTriviaBingoContent(input.edition);
  const tableCount = input.tableCount ?? TRIVIA_BINGO_PILOT_TABLE_COUNT;

  if (tableCount !== TRIVIA_BINGO_PILOT_TABLE_COUNT) {
    throw new Error(`Trivia Bingo only supports ${TRIVIA_BINGO_PILOT_TABLE_COUNT} tables.`);
  }

  if (!input.seed.trim()) {
    throw new Error('Trivia Bingo requires a non-empty seed.');
  }

  if (content.questions.length !== TRIVIA_BINGO_PILOT_QUESTION_COUNT) {
    throw new Error(
      `Trivia Bingo requires ${TRIVIA_BINGO_PILOT_QUESTION_COUNT} published questions.`
    );
  }

  const random = createSeededRandom(input.seed);
  const answersById = new Map(content.answers.map((answer) => [answer.id, answer]));
  const orderedQuestions = shuffle(content.questions, random);
  const questionAnswerIds = orderedQuestions.map((question) => question.correctAnswerId);
  const questionAnswerIdSet = new Set(questionAnswerIds);
  const finalAnswerId = questionAnswerIds.at(-1);

  if (!finalAnswerId || questionAnswerIdSet.size !== questionAnswerIds.length) {
    throw new Error('Trivia Bingo questions must reveal unique published answers.');
  }

  const decoyAnswerIds = content.answers
    .map((answer) => answer.id)
    .filter((answerId) => !questionAnswerIdSet.has(answerId));

  if (decoyAnswerIds.length === 0) {
    throw new Error('Trivia Bingo requires at least one published decoy answer.');
  }

  if (decoyAnswerIds.length < tableCount - 1) {
    throw new Error(
      `Trivia Bingo requires at least ${tableCount - 1} decoy answers for its non-winning tables.`
    );
  }

  const winnerCardNumber = randomInt(random, tableCount) + 1;
  const orderedDecoyAnswerIds = shuffle(decoyAnswerIds, random);
  let nonWinningCardIndex = 0;
  const cards = Array.from({ length: tableCount }, (_unused, index) => {
    const cardNumber = index + 1;
    const answerIds = cardNumber === winnerCardNumber
      ? buildWinnerAnswerIds(questionAnswerIds, finalAnswerId, random)
      : buildNonWinningAnswerIds(
          questionAnswerIds,
          orderedDecoyAnswerIds[nonWinningCardIndex++],
          random
        );

    return buildCard({
      editionTitle: input.edition.title,
      cardNumber,
      answerIds,
      answersById,
      random,
    });
  });

  ensureDistinctCards(cards);

  const controlSheet = orderedQuestions.map((question, index) => {
    const answer = answersById.get(question.correctAnswerId);

    if (!answer) {
      throw new Error(`Question "${question.id}" references an unknown answer.`);
    }

    return {
      revealNumber: index + 1,
      questionId: question.id,
      prompt: question.prompt,
      correctAnswerId: answer.id,
      correctAnswerLabel: answer.label,
      revealCopy: question.revealCopy,
    };
  });

  const checkpoints = buildFairnessCheckpoints(cards, orderedQuestions);
  const finalCheckpoint = checkpoints.at(-1);
  const beforeFinalCheckpoint = checkpoints.at(-2);
  const winnerCardId = `table-${winnerCardNumber}`;

  if (!finalCheckpoint || !beforeFinalCheckpoint) {
    throw new Error('Trivia Bingo could not calculate its fairness checkpoints.');
  }

  const pack: TriviaBingoPrintPack = {
    productId: input.edition.productId,
    editionId: input.edition.id,
    editionTitle: input.edition.title,
    contentVersion: content.contentVersion,
    seed: input.seed,
    tableCount,
    gridSize: TRIVIA_BINGO_PILOT_GRID_SIZE,
    questions: orderedQuestions,
    cards,
    controlSheet,
    hostGuideSteps: content.guideSteps,
    printInstructions: content.printInstructions,
    legalSummary: content.legalSummary,
    fairnessReport: {
      winnerCardId,
      checkpoints,
      completedCardIdsBeforeFinalReveal: beforeFinalCheckpoint.completedCardIds,
      completedCardIdsAtFinalReveal: finalCheckpoint.completedCardIds,
    },
  };

  const validationErrors = validateTriviaBingoPrintPack({ pack, content });
  if (validationErrors.length > 0) {
    throw new Error(`Trivia Bingo generated an invalid pack: ${validationErrors.join(' ')}`);
  }

  return { pack, winnerCardNumber };
}

function requireTriviaBingoContent(edition: GameEdition): TriviaBingoEditionContent {
  if (!edition.content?.triviaBingo) {
    throw new Error(`Edition "${edition.id}" does not contain Trivia Bingo content.`);
  }

  return edition.content.triviaBingo;
}

function buildWinnerAnswerIds(
  questionAnswerIds: string[],
  finalAnswerId: string,
  random: () => number
): string[] {
  const earlyAnswerIds = questionAnswerIds.filter((answerId) => answerId !== finalAnswerId);
  const selectedEarlyAnswerIds = shuffle(earlyAnswerIds, random).slice(
    0,
    TRIVIA_BINGO_PILOT_GRID_SIZE ** 2 - 1
  );

  return shuffle([...selectedEarlyAnswerIds, finalAnswerId], random);
}

function buildNonWinningAnswerIds(
  questionAnswerIds: string[],
  decoyAnswerId: string,
  random: () => number
): string[] {
  const revealedAnswerIds = shuffle(questionAnswerIds, random).slice(
    0,
    TRIVIA_BINGO_PILOT_GRID_SIZE ** 2 - 1
  );

  return shuffle([...revealedAnswerIds, decoyAnswerId], random);
}

function buildCard(input: {
  editionTitle: string;
  cardNumber: number;
  answerIds: string[];
  answersById: Map<string, TriviaBingoAnswer>;
  random: () => number;
}): TriviaBingoCard {
  const cells: TriviaBingoCardCell[] = input.answerIds.map((answerId, index) => {
    const answer = input.answersById.get(answerId);

    if (!answer) {
      throw new Error(`Trivia Bingo card references an unknown answer "${answerId}".`);
    }

    return {
      id: `table-${input.cardNumber}-cell-${index + 1}`,
      answerId: answer.id,
      label: answer.label,
    };
  });

  if (new Set(cells.map((cell) => cell.answerId)).size !== cells.length) {
    throw new Error(`Trivia Bingo table ${input.cardNumber} contains a duplicate answer.`);
  }

  return {
    id: `table-${input.cardNumber}`,
    cardNumber: input.cardNumber,
    title: `${input.editionTitle} · Mesa ${input.cardNumber}`,
    gridSize: TRIVIA_BINGO_PILOT_GRID_SIZE,
    cells: shuffle(cells, input.random),
  };
}

function buildFairnessCheckpoints(
  cards: TriviaBingoCard[],
  questions: TriviaBingoQuestion[]
): TriviaBingoFairnessCheckpoint[] {
  const revealedAnswerIds = new Set<string>();

  return questions.map((question, index) => {
    revealedAnswerIds.add(question.correctAnswerId);

    return {
      revealNumber: index + 1,
      completedCardIds: cards
        .filter((card) => card.cells.every((cell) => revealedAnswerIds.has(cell.answerId)))
        .map((card) => card.id),
    };
  });
}

function ensureDistinctCards(cards: TriviaBingoCard[]): void {
  const cardKeys = new Set<string>();

  for (const card of cards) {
    const key = card.cells
      .map((cell) => cell.answerId)
      .sort()
      .join('|');

    if (cardKeys.has(key)) {
      throw new Error('Trivia Bingo generated duplicate table cards.');
    }

    cardKeys.add(key);
  }
}

function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function randomInt(random: () => number, upperExclusive: number): number {
  return Math.floor(random() * upperExclusive);
}
