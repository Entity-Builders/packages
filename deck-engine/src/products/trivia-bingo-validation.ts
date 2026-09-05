import type {
  TriviaBingoCard,
  TriviaBingoEditionContent,
  TriviaBingoFairnessCheckpoint,
  TriviaBingoPrintPack,
} from './types.js';
import {
  TRIVIA_BINGO_PILOT_GRID_SIZE,
  TRIVIA_BINGO_PILOT_QUESTION_COUNT,
  TRIVIA_BINGO_PILOT_TABLE_COUNT,
} from './trivia-bingo-pricing.js';

export function validateTriviaBingoEditionContent(content: TriviaBingoEditionContent): string[] {
  const errors: string[] = [];

  if (!content.contentVersion.trim()) {
    errors.push('Trivia Bingo content requires a content version.');
  }

  if (content.questions.length !== TRIVIA_BINGO_PILOT_QUESTION_COUNT) {
    errors.push(
      `Trivia Bingo content requires exactly ${TRIVIA_BINGO_PILOT_QUESTION_COUNT} questions.`
    );
  }

  const answerIds = new Set<string>();
  for (const answer of content.answers) {
    if (!answer.id.trim() || !answer.label.trim()) {
      errors.push('Trivia Bingo answers require a non-empty id and label.');
      continue;
    }

    if (answerIds.has(answer.id)) {
      errors.push(`Trivia Bingo answer id "${answer.id}" is duplicated.`);
    }

    answerIds.add(answer.id);
  }

  const questionIds = new Set<string>();
  const correctAnswerIds = new Set<string>();

  for (const question of content.questions) {
    if (!question.id.trim()) {
      errors.push('Trivia Bingo questions require a non-empty id.');
    } else if (questionIds.has(question.id)) {
      errors.push(`Trivia Bingo question id "${question.id}" is duplicated.`);
    }
    questionIds.add(question.id);

    if (!question.prompt.trim() || !question.revealCopy.trim()) {
      errors.push(`Trivia Bingo question "${question.id}" requires a prompt and reveal copy.`);
    }

    if (!question.editorialSourceReference?.trim()) {
      errors.push(`Trivia Bingo question "${question.id}" requires an editorial source reference.`);
    }

    if (!answerIds.has(question.correctAnswerId)) {
      errors.push(
        `Trivia Bingo question "${question.id}" references unknown answer "${question.correctAnswerId}".`
      );
    } else if (correctAnswerIds.has(question.correctAnswerId)) {
      errors.push(
        `Trivia Bingo questions must reveal unique answers; "${question.correctAnswerId}" is repeated.`
      );
    }

    correctAnswerIds.add(question.correctAnswerId);
  }

  if (content.answers.length - correctAnswerIds.size < TRIVIA_BINGO_PILOT_TABLE_COUNT - 1) {
    errors.push(
      `Trivia Bingo needs at least ${TRIVIA_BINGO_PILOT_TABLE_COUNT - 1} decoy answers for non-winning cards.`
    );
  }

  if (content.guideSteps.length === 0 || content.printInstructions.length === 0) {
    errors.push('Trivia Bingo content requires host guidance and print instructions.');
  }

  if (!content.legalSummary.trim()) {
    errors.push('Trivia Bingo content requires a legal summary.');
  }

  return errors;
}

export function validateTriviaBingoPrintPack(input: {
  pack: TriviaBingoPrintPack;
  content: TriviaBingoEditionContent;
}): string[] {
  const errors = validateTriviaBingoEditionContent(input.content);
  const { pack, content } = input;
  const publishedAnswers = new Map(content.answers.map((answer) => [answer.id, answer]));
  const publishedQuestions = new Map(content.questions.map((question) => [question.id, question]));

  if (pack.contentVersion !== content.contentVersion) {
    errors.push('Trivia Bingo pack content version does not match its edition content.');
  }

  if (pack.tableCount !== TRIVIA_BINGO_PILOT_TABLE_COUNT || pack.cards.length !== pack.tableCount) {
    errors.push(`Trivia Bingo pack requires exactly ${TRIVIA_BINGO_PILOT_TABLE_COUNT} cards.`);
  }

  if (pack.gridSize !== TRIVIA_BINGO_PILOT_GRID_SIZE) {
    errors.push(`Trivia Bingo pack requires a ${TRIVIA_BINGO_PILOT_GRID_SIZE}×${TRIVIA_BINGO_PILOT_GRID_SIZE} grid.`);
  }

  validatePackQuestions(pack, publishedQuestions, errors);
  validateCards(pack.cards, publishedAnswers, pack.questions, errors);
  validateControlSheet(pack, errors);
  validateFairnessReport(pack, errors);

  return errors;
}

function validatePackQuestions(
  pack: TriviaBingoPrintPack,
  publishedQuestions: Map<string, TriviaBingoEditionContent['questions'][number]>,
  errors: string[]
): void {
  if (pack.questions.length !== TRIVIA_BINGO_PILOT_QUESTION_COUNT) {
    errors.push(
      `Trivia Bingo pack requires exactly ${TRIVIA_BINGO_PILOT_QUESTION_COUNT} ordered questions.`
    );
  }

  const packQuestionIds = new Set<string>();
  for (const question of pack.questions) {
    const publishedQuestion = publishedQuestions.get(question.id);

    if (!publishedQuestion) {
      errors.push(`Trivia Bingo pack references unpublished question "${question.id}".`);
      continue;
    }

    if (packQuestionIds.has(question.id)) {
      errors.push(`Trivia Bingo pack repeats question "${question.id}".`);
    }
    packQuestionIds.add(question.id);

    if (
      question.correctAnswerId !== publishedQuestion.correctAnswerId ||
      question.prompt !== publishedQuestion.prompt ||
      question.revealCopy !== publishedQuestion.revealCopy
    ) {
      errors.push(`Trivia Bingo pack question "${question.id}" does not match published content.`);
    }
  }
}

function validateCards(
  cards: TriviaBingoCard[],
  publishedAnswers: Map<string, TriviaBingoEditionContent['answers'][number]>,
  questions: TriviaBingoPrintPack['questions'],
  errors: string[]
): void {
  const cardIds = new Set<string>();
  const cardNumbers = new Set<number>();
  const cardKeys = new Set<string>();
  const earlyAnswerIds = new Set(questions.slice(0, -1).map((question) => question.correctAnswerId));

  for (const card of cards) {
    if (cardIds.has(card.id)) {
      errors.push(`Trivia Bingo card id "${card.id}" is duplicated.`);
    }
    cardIds.add(card.id);

    if (cardNumbers.has(card.cardNumber)) {
      errors.push(`Trivia Bingo card number "${card.cardNumber}" is duplicated.`);
    }
    cardNumbers.add(card.cardNumber);

    if (card.gridSize !== TRIVIA_BINGO_PILOT_GRID_SIZE) {
      errors.push(`Trivia Bingo card "${card.id}" has an unsupported grid size.`);
    }

    if (card.cells.length !== TRIVIA_BINGO_PILOT_GRID_SIZE ** 2) {
      errors.push(`Trivia Bingo card "${card.id}" must have exactly 9 cells.`);
    }

    const answerIds = card.cells.map((cell) => cell.answerId);
    if (new Set(answerIds).size !== answerIds.length) {
      errors.push(`Trivia Bingo card "${card.id}" contains duplicate answers.`);
    }

    if (!answerIds.some((answerId) => earlyAnswerIds.has(answerId))) {
      errors.push(`Trivia Bingo card "${card.id}" has no reachable early mark.`);
    }

    for (const cell of card.cells) {
      const answer = publishedAnswers.get(cell.answerId);
      if (!answer) {
        errors.push(`Trivia Bingo card "${card.id}" references unpublished answer "${cell.answerId}".`);
      } else if (cell.label !== answer.label) {
        errors.push(`Trivia Bingo card "${card.id}" has a stale label for "${cell.answerId}".`);
      }
    }

    const cardKey = [...answerIds].sort().join('|');
    if (cardKeys.has(cardKey)) {
      errors.push(`Trivia Bingo card "${card.id}" duplicates another card's answer set.`);
    }
    cardKeys.add(cardKey);
  }
}

function validateControlSheet(pack: TriviaBingoPrintPack, errors: string[]): void {
  if (pack.controlSheet.length !== pack.questions.length) {
    errors.push('Trivia Bingo control sheet must include every ordered question.');
    return;
  }

  for (const [index, row] of pack.controlSheet.entries()) {
    const question = pack.questions[index];
    if (
      row.revealNumber !== index + 1 ||
      row.questionId !== question.id ||
      row.prompt !== question.prompt ||
      row.correctAnswerId !== question.correctAnswerId ||
      row.revealCopy !== question.revealCopy
    ) {
      errors.push(`Trivia Bingo control row ${index + 1} does not match its question.`);
    }
  }
}

function validateFairnessReport(pack: TriviaBingoPrintPack, errors: string[]): void {
  const expectedCheckpoints = buildExpectedCheckpoints(pack.cards, pack.questions);
  const report = pack.fairnessReport;

  if (report.checkpoints.length !== expectedCheckpoints.length) {
    errors.push('Trivia Bingo fairness report must include every reveal checkpoint.');
  }

  for (const [index, expected] of expectedCheckpoints.entries()) {
    const actual = report.checkpoints[index];
    if (!actual || actual.revealNumber !== expected.revealNumber || !sameStrings(actual.completedCardIds, expected.completedCardIds)) {
      errors.push(`Trivia Bingo fairness checkpoint ${expected.revealNumber} is invalid.`);
    }
  }

  const beforeFinal = expectedCheckpoints.at(-2)?.completedCardIds ?? [];
  const atFinal = expectedCheckpoints.at(-1)?.completedCardIds ?? [];

  if (beforeFinal.length !== 0 || expectedCheckpoints.slice(0, -1).some((checkpoint) => checkpoint.completedCardIds.length > 0)) {
    errors.push('Trivia Bingo cannot complete any card before the final reveal.');
  }

  if (atFinal.length !== 1) {
    errors.push('Trivia Bingo must complete exactly one card at the final reveal.');
  }

  if (
    !sameStrings(report.completedCardIdsBeforeFinalReveal, beforeFinal) ||
    !sameStrings(report.completedCardIdsAtFinalReveal, atFinal)
  ) {
    errors.push('Trivia Bingo fairness summary does not match the checkpoints.');
  }

  if (atFinal[0] !== report.winnerCardId) {
    errors.push('Trivia Bingo fairness report winner does not match the final completed card.');
  }
}

function buildExpectedCheckpoints(
  cards: TriviaBingoCard[],
  questions: TriviaBingoPrintPack['questions']
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

function sameStrings(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
