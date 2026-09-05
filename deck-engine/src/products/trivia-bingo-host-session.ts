import type {
  TriviaBingoHostSession,
  TriviaBingoHostSessionRound,
  TriviaBingoPrintPack,
} from './types.js';

export function buildTriviaBingoHostSession(pack: TriviaBingoPrintPack): TriviaBingoHostSession {
  const rounds: TriviaBingoHostSessionRound[] = pack.controlSheet.map((row) => ({
    id: row.questionId,
    revealNumber: row.revealNumber,
    prompt: row.prompt,
    answerLabel: row.correctAnswerLabel,
    revealCopy: row.revealCopy,
  }));

  return {
    editionId: pack.editionId,
    editionTitle: pack.editionTitle,
    contentVersion: pack.contentVersion,
    roundCount: rounds.length,
    rounds,
  };
}
