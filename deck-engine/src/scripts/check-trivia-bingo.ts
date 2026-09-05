import {
  TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT,
  TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION,
  TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_OFFERING_ID,
} from '../products/trivia-bingo.js';
import { generateTriviaBingoPrintPack } from '../products/trivia-bingo-generator.js';
import { buildTriviaBingoPrintableKit } from '../products/trivia-bingo-print-pack.js';
import { buildTriviaBingoHostSession } from '../products/trivia-bingo-host-session.js';
import { resolveTriviaBingoPilotOffer } from '../products/trivia-bingo-pricing.js';
import {
  validateTriviaBingoEditionContent,
  validateTriviaBingoPrintPack,
} from '../products/trivia-bingo-validation.js';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, received ${String(actual)}.`);
  }
}

const contentErrors = validateTriviaBingoEditionContent(
  TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT
);
assertEqual(contentErrors.length, 0, 'reviewed Trivia Bingo content validates');

const sameSeedInput = {
  edition: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION,
  seed: 'trivia-bingo-check-seed',
};
const first = generateTriviaBingoPrintPack(sameSeedInput);
const second = generateTriviaBingoPrintPack(sameSeedInput);

assertEqual(
  JSON.stringify(first.pack),
  JSON.stringify(second.pack),
  'the same seed produces the same pack'
);
assertEqual(first.pack.questions.length, 18, 'pack has 18 questions');
assertEqual(first.pack.cards.length, 8, 'pack has eight cards');
assertEqual(
  first.pack.fairnessReport.completedCardIdsBeforeFinalReveal.length,
  0,
  'no card completes through reveal 17'
);
assertEqual(
  first.pack.fairnessReport.completedCardIdsAtFinalReveal.length,
  1,
  'exactly one card completes at reveal 18'
);

const cardKeys = new Set(
  first.pack.cards.map((card) => card.cells.map((cell) => cell.answerId).sort().join('|'))
);
assertEqual(cardKeys.size, 8, 'every generated card has a distinct answer set');

const packErrors = validateTriviaBingoPrintPack({
  pack: first.pack,
  content: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT,
});
assertEqual(packErrors.length, 0, 'generated pack validates');

for (const seed of Array.from({ length: 64 }, (_unused, index) => `property-seed-${index + 1}`)) {
  const { pack } = generateTriviaBingoPrintPack({
    edition: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION,
    seed,
  });
  const errors = validateTriviaBingoPrintPack({
    pack,
    content: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT,
  });

  assertEqual(errors.length, 0, `${seed} validates`);
  assertEqual(
    pack.fairnessReport.completedCardIdsBeforeFinalReveal.length,
    0,
    `${seed} has no winner before the final reveal`
  );
  assertEqual(
    pack.fairnessReport.completedCardIdsAtFinalReveal.length,
    1,
    `${seed} has one winner at the final reveal`
  );
}

const invalidContent = {
  ...TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT,
  questions: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT.questions.map((question, index) =>
    index === 1
      ? {
          ...question,
          correctAnswerId:
            TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT.questions[0].correctAnswerId,
        }
      : question
  ),
};
assert(
  validateTriviaBingoEditionContent(invalidContent).some((error) => error.includes('unique answers')),
  'content validation rejects duplicate correct answers'
);

const invalidPack = {
  ...first.pack,
  cards: first.pack.cards.map((card, index) =>
    index === 0
      ? {
          ...card,
          cells: card.cells.map((cell, cellIndex) =>
            cellIndex === 0 ? { ...cell, answerId: 'not-published' } : cell
          ),
        }
      : card
  ),
};
assert(
  validateTriviaBingoPrintPack({
    pack: invalidPack,
    content: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT,
  }).some((error) => error.includes('unpublished answer')),
  'pack validation rejects unpublished answer references'
);

const printableKit = buildTriviaBingoPrintableKit(first.pack);
assertEqual(printableKit.tableCards.length, 8, 'print kit exposes all table cards');
assertEqual(printableKit.hostGuide.controlSheet.length, 18, 'print kit exposes host control rows');
assertEqual(printableKit.projectionSlides.length, 38, 'print kit exposes opening, question, reveal and closing slides');

const firstHostSession = buildTriviaBingoHostSession(first.pack);
const secondHostSession = buildTriviaBingoHostSession(second.pack);
assertEqual(firstHostSession.roundCount, 18, 'host session exposes the 18 ordered rounds');
assertEqual(
  JSON.stringify(firstHostSession),
  JSON.stringify(secondHostSession),
  'host session is deterministic for the same pack'
);
assert(
  !JSON.stringify(firstHostSession).includes('winnerCardId') &&
    !JSON.stringify(firstHostSession).includes('fairnessReport') &&
    !JSON.stringify(firstHostSession).includes('trivia-bingo-check-seed'),
  'host session omits fairness and seed data'
);

const quote = resolveTriviaBingoPilotOffer({
  offeringId: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_OFFERING_ID,
  editionId: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION.id,
});
assertEqual(quote?.amountARS, 9900, 'pilot offer resolves the approved ARS amount');
assertEqual(quote?.contentVersion, 'v1', 'pilot offer resolves the content version');
assertEqual(
  resolveTriviaBingoPilotOffer({
    offeringId: 'untrusted-offer',
    editionId: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION.id,
  }),
  null,
  'unsupported offers do not resolve'
);

console.log('Trivia Bingo checks passed.');
