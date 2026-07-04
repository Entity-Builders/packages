import {
  MUSIC_BINGO_FREE_SPACE_INDEX,
  MUSIC_BINGO_MVP_THEMES,
  getMusicBingoRequiredSongCountForBoard,
  generateMusicBingoCards,
  getMusicBingoPriceQuote,
  parseMusicBingoManualSongs,
  validateMusicBingoDraftSongs,
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

const parsed = parseMusicBingoManualSongs([
  'Soda Stereo - De musica ligera',
  '',
  'Soda Stereo - De musica ligera',
  'Los Redondos - Jijiji',
].join('\n'));

assertEqual(parsed.songs.length, 3, 'manual parser keeps non-empty song rows');
assertEqual(parsed.ignoredLineCount, 1, 'manual parser counts ignored blank rows');

const duplicateValidation = validateMusicBingoDraftSongs(parsed.songs, true);
assertEqual(duplicateValidation.duplicateCount, 1, 'validation counts duplicate songs');
assert(!duplicateValidation.canPreview, 'validation blocks too few songs');

const rockTheme = MUSIC_BINGO_MVP_THEMES.find((theme) => theme.id === 'rock-argentino');
assert(Boolean(rockTheme), 'rock argentino theme exists');
assertEqual(rockTheme?.playlist?.provider, 'spotify', 'rock theme has Spotify playlist reference');
assert(
  Boolean(rockTheme?.playlist?.url.startsWith('https://open.spotify.com/playlist/')),
  'rock theme playlist is a public Spotify playlist URL'
);

const validSongs = rockTheme?.songs ?? [];
const validValidation = validateMusicBingoDraftSongs(validSongs, true);
assert(validValidation.canPreview, 'theme songs can preview with free space');
assertEqual(validValidation.requiredSongCount, 24, 'free-space board needs 24 songs');
assertEqual(getMusicBingoRequiredSongCountForBoard(3, true), 8, '3x3 free-space board needs 8 songs');
assertEqual(getMusicBingoRequiredSongCountForBoard(4, true), 16, '4x4 board does not use free space');

const firstRun = generateMusicBingoCards({
  title: 'Noche Rock Argentino',
  songs: validSongs,
  cardCount: 3,
  freeSpace: true,
  boardSize: 5,
  seed: 'baraja-test',
});

const secondRun = generateMusicBingoCards({
  title: 'Noche Rock Argentino',
  songs: validSongs,
  cardCount: 3,
  freeSpace: true,
  boardSize: 5,
  seed: 'baraja-test',
});

assertEqual(firstRun.cards.length, 3, 'generator creates requested card count');
assertEqual(
  JSON.stringify(firstRun.cards),
  JSON.stringify(secondRun.cards),
  'generator is deterministic for same seed'
);

const firstCard = firstRun.cards[0];
assert(firstCard !== undefined, 'first generated card exists');
assertEqual(firstCard.boardSize, 5, 'generated card carries board size');
assert(firstCard.cells[MUSIC_BINGO_FREE_SPACE_INDEX]?.free === true, 'free-space card has free center cell');

const songIds = firstCard.cells.flatMap((cell) => (cell.songId ? [cell.songId] : []));
assertEqual(new Set(songIds).size, songIds.length, 'generated card has no duplicate song cells');

const compactRun = generateMusicBingoCards({
  title: 'Bingo compacto',
  songs: validSongs,
  cardCount: 1,
  freeSpace: true,
  boardSize: 3,
  seed: 'baraja-compact-test',
});

assertEqual(compactRun.cards[0]?.cells.length, 9, '3x3 card has 9 cells');
assert(compactRun.cards[0]?.cells[4]?.free === true, '3x3 card has free center cell');

const twentyFiveSongs = Array.from({ length: 25 }, (_, index) => ({
  id: `fair-song-${index + 1}`,
  artist: `Artist ${index + 1}`,
  title: `Song ${index + 1}`,
}));
const fairRun = generateMusicBingoCards({
  title: 'Bingo balanceado',
  songs: twentyFiveSongs,
  cardCount: 30,
  freeSpace: true,
  boardSize: 4,
  seed: 'baraja-fairness-test',
});
const repeatFairRun = generateMusicBingoCards({
  title: 'Bingo balanceado',
  songs: twentyFiveSongs,
  cardCount: 30,
  freeSpace: true,
  boardSize: 4,
  seed: 'baraja-fairness-test',
});
const fairCounts = new Map(twentyFiveSongs.map((song) => [song.id, 0]));

fairRun.cards.forEach((card) => {
  const cardSongIds = card.cells.flatMap((cell) => (cell.songId ? [cell.songId] : []));
  assertEqual(card.cells.length, 16, '4x4 card has 16 cells');
  assertEqual(new Set(cardSongIds).size, 16, '4x4 card has no duplicate song cells');
  cardSongIds.forEach((songId) => {
    fairCounts.set(songId, (fairCounts.get(songId) ?? 0) + 1);
  });
});

assertEqual(fairRun.cards.length, 30, 'balanced run creates requested card count');
assertEqual(Math.min(...fairCounts.values()), 19, '25-song 4x4 pack minimum song appearances');
assertEqual(Math.max(...fairCounts.values()), 20, '25-song 4x4 pack maximum song appearances');
assert(fairRun.fairnessReport?.balanced === true, 'fairness report marks pack balanced');
assertEqual(fairRun.fairnessReport?.targetMinAppearances, 19, 'fairness target minimum is 19');
assertEqual(fairRun.fairnessReport?.targetMaxAppearances, 20, 'fairness target maximum is 20');
assertEqual(fairRun.fairnessReport?.duplicateLineCount, 0, 'balanced pack avoids duplicate lines');
assert(
  (fairRun.fairnessReport?.maxSharedSongCount ?? 16) < 16,
  'balanced pack avoids identical 4x4 cards'
);
assertEqual(fairRun.playbackOrder.length, 25, 'balanced run includes suggested playback order');
assertEqual(
  JSON.stringify(fairRun.cards),
  JSON.stringify(repeatFairRun.cards),
  'balanced generator is deterministic for same seed'
);

const privateQuote = getMusicBingoPriceQuote(30, 'private_event');
assertEqual(privateQuote.mode, 'founder_private', 'private event gets founder quote');
assert(privateQuote.label.includes('ARS'), 'private event founder quote shows ARS price');

const venueQuote = getMusicBingoPriceQuote(60, 'venue_event');
assertEqual(venueQuote.mode, 'proposal', 'venue event gets proposal quote');

console.log('Music bingo creator checks passed.');
