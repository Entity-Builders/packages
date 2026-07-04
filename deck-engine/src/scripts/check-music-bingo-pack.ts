import {
  MUSIC_BINGO_MVP_THEMES,
  buildMusicBingoPrintPack,
  getMusicBingoPriceQuote,
} from '../products/index.js';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, received ${String(actual)}.`);
  }
}

const theme = MUSIC_BINGO_MVP_THEMES[0];
const priceQuote = getMusicBingoPriceQuote(30, 'private_event');

const pack = buildMusicBingoPrintPack({
  title: theme.suggestedGameName,
  songs: theme.songs,
  cardCount: 30,
  boardSize: 5,
  freeSpace: true,
  seed: 'pack-test',
  useContext: 'private_event',
  sourceLabel: theme.title,
  priceLabel: priceQuote.label,
  playlist: theme.playlist,
});

assertEqual(pack.errors.length, 0, 'valid pack has no errors');
assertEqual(pack.cards.length, 30, 'valid pack creates requested cards');
assertEqual(pack.boardSize, 5, 'pack carries board size');
assertEqual(pack.controlSheet.length, theme.songs.length, 'control sheet has one row per unique song');
const fairnessReport = pack.fairnessReport;
if (!fairnessReport) {
  throw new Error('pack includes fairness report');
}
assert(fairnessReport.balanced === true, 'pack includes balanced fairness report');
assert(
  fairnessReport.summary.includes('distribuidas'),
  'pack exposes human readable fairness summary'
);
assert(pack.setupSteps.length >= 4, 'pack includes setup steps');
assert(pack.playRules.length >= 4, 'pack includes play rules');
assert(
  pack.playRules.some((rule) => rule.includes('orden sugerido')),
  'pack rules mention suggested playback order'
);
assert(pack.variants.length >= 4, 'pack includes variants');
assert(pack.tieBreakers.length >= 4, 'pack includes tie breakers');
assert(pack.printGuide.length >= 4, 'pack includes print guide');
assert(pack.legalSummary.includes('No vende musica'), 'pack includes legal summary');
assertEqual(
  pack.playlist?.url,
  theme.playlist?.url,
  'pack carries selected theme playlist reference'
);
assert(
  pack.setupSteps.some((step) => step.includes(theme.playlist?.title ?? '')),
  'pack setup mentions suggested playlist when provided'
);

const repeatPack = buildMusicBingoPrintPack({
  title: theme.suggestedGameName,
  songs: theme.songs,
  cardCount: 30,
  boardSize: 5,
  freeSpace: true,
  seed: 'pack-test',
  useContext: 'private_event',
  sourceLabel: theme.title,
});

assertEqual(
  JSON.stringify(pack.cards),
  JSON.stringify(repeatPack.cards),
  'pack cards are deterministic for same input'
);

const invalidPack = buildMusicBingoPrintPack({
  title: 'Pack invalido',
  songs: theme.songs.slice(0, 4),
  cardCount: 30,
  boardSize: 5,
  freeSpace: true,
  seed: 'pack-invalid',
  useContext: 'private_event',
  sourceLabel: 'Test',
});

assertEqual(invalidPack.cards.length, 0, 'invalid pack does not generate cards');
assert(invalidPack.errors.length > 0, 'invalid pack exposes validation errors');

const compactPack = buildMusicBingoPrintPack({
  title: 'Pack compacto',
  songs: theme.songs,
  cardCount: 4,
  boardSize: 3,
  freeSpace: true,
  seed: 'pack-compact',
  useContext: 'private_event',
  sourceLabel: theme.title,
});

assertEqual(compactPack.boardSize, 3, 'compact pack carries 3x3 board size');
assertEqual(compactPack.cards[0]?.cells.length, 9, 'compact pack generates 3x3 cards');

console.log('Music bingo print pack checks passed.');
