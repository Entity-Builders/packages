import {
  MUSIC_BINGO_FREE_SPACE_INDEX,
  MUSIC_BINGO_MVP_THEMES,
  calculateMusicBingoPlaylistFit,
  getMusicBingoCollectionTarget,
  getRecommendedMusicBingoEventRuleProfile,
  getMusicBingoRequiredSongCountForBoard,
  getMusicBingoUsableSongPool,
  generateMusicBingoCards,
  getMusicBingoPriceQuote,
  parseMusicBingoManualSongs,
  validateMusicBingoCatalogThemes,
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
assertEqual(
  getMusicBingoUsableSongPool(parsed.songs).usableSongs.length,
  2,
  'usable song helper dedupes manual songs'
);

const rockTheme = MUSIC_BINGO_MVP_THEMES.find((theme) => theme.id === 'rock-argentino');
assert(Boolean(rockTheme), 'rock argentino theme exists');
assertEqual(rockTheme?.playlist?.provider, 'spotify', 'rock theme has Spotify playlist reference');
assert(
  Boolean(rockTheme?.playlist?.url.startsWith('https://open.spotify.com/playlist/')),
  'rock theme playlist is a public Spotify playlist URL'
);
assertEqual(validateMusicBingoCatalogThemes().length, 0, 'music bingo catalog metadata is valid');
assertEqual(rockTheme?.catalog.categoryId, 'rock', 'rock theme has catalog category');
assert(rockTheme?.catalog.supportedBoardSizes.includes(5) === true, 'rock theme supports 5x5 catalog cards');

const validSongs = rockTheme?.songs ?? [];
const validValidation = validateMusicBingoDraftSongs(validSongs, true);
assert(validValidation.canPreview, 'theme songs can preview with free space');
assertEqual(validValidation.requiredSongCount, 24, 'free-space board needs 24 songs');
assertEqual(getMusicBingoRequiredSongCountForBoard(3, true), 8, '3x3 free-space board needs 8 songs');
assertEqual(getMusicBingoRequiredSongCountForBoard(4, true), 16, '4x4 board does not use free space');
assertEqual(getMusicBingoRequiredSongCountForBoard(5, false), 25, '5x5 without free space needs 25 songs');

const songsForCapacity = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `capacity-song-${count}-${index + 1}`,
    artist: `Artist ${index + 1}`,
    title: `Song ${index + 1}`,
  }));

const smallThreeByThreeValidation = validateMusicBingoDraftSongs(
  songsForCapacity(24),
  true,
  3,
  { cardCount: 10 }
);
assertEqual(
  smallThreeByThreeValidation.playlistFit.scenarioMinimum,
  24,
  '3x3 small game needs 24 songs for scenario fit'
);
assertEqual(
  smallThreeByThreeValidation.playlistFit.severity,
  'scenario_ready',
  '3x3 small game is scenario-ready at 24 songs'
);

const normalFourByFourValidation = validateMusicBingoDraftSongs(
  songsForCapacity(50),
  true,
  4,
  { cardCount: 30 }
);
assertEqual(
  normalFourByFourValidation.playlistFit.scenarioMinimum,
  64,
  '4x4 normal party needs 64 songs for scenario fit'
);
assertEqual(
  normalFourByFourValidation.playlistFit.severity,
  'scale_warning',
  '4x4 normal party warns when song pool is below scenario fit'
);

const smallFiveByFiveNoFreeValidation = validateMusicBingoDraftSongs(
  songsForCapacity(75),
  false,
  5,
  { cardCount: 10 }
);
assertEqual(
  smallFiveByFiveNoFreeValidation.playlistFit.scenarioMinimum,
  75,
  '5x5 no-free small game needs 75 songs for scenario fit'
);
assertEqual(
  smallFiveByFiveNoFreeValidation.playlistFit.severity,
  'scenario_ready',
  '5x5 no-free small game is scenario-ready at 75 songs'
);

const largeFit = calculateMusicBingoPlaylistFit({
  usableSongCount: 191,
  songSlotsPerCard: 24,
  cardCount: 151,
});
assertEqual(largeFit.scaleBand, 'extra_large', '151 cards uses extra-large scale band');
assertEqual(largeFit.scenarioMinimum, 192, 'extra-large 5x5 free-space game needs 192 songs');
assertEqual(largeFit.severity, 'scale_warning', 'extra-large fit warns at 191 songs');
assertEqual(
  calculateMusicBingoPlaylistFit({
    usableSongCount: 192,
    songSlotsPerCard: 24,
    cardCount: 151,
  }).severity,
  'scenario_ready',
  'extra-large fit is ready at 192 songs'
);
assertEqual(
  calculateMusicBingoPlaylistFit({
    usableSongCount: 96,
    songSlotsPerCard: 24,
    cardCount: 30,
  }).expectedSharedSongs,
  6,
  'expected shared songs uses K squared over N'
);
assertEqual(
  getMusicBingoCollectionTarget(79).status,
  'prototype',
  'collections below 80 songs are prototypes'
);
assertEqual(
  getMusicBingoCollectionTarget(120).status,
  'standard_official',
  '120-song collections are standard official collections'
);
assertEqual(
  getMusicBingoCollectionTarget(180).status,
  'broad_commercial',
  '180-song collections are broad commercial collections'
);
assertEqual(
  getRecommendedMusicBingoEventRuleProfile(150).id,
  'large-venue-proposal',
  'large events use proposal-based rule profile'
);

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

const prebuiltQuote = getMusicBingoPriceQuote(30, 'private_event', 'baraja_theme');
assertEqual(prebuiltQuote.mode, 'prebuilt', 'Baraja theme gets prebuilt quote');
assert(prebuiltQuote.label.includes('ARS'), 'prebuilt quote shows ARS price');

const playlistOwnQuote = getMusicBingoPriceQuote(30, 'private_event', 'manual');
assertEqual(playlistOwnQuote.mode, 'playlist_own', 'manual songs get playlist-own quote');

const venueQuote = getMusicBingoPriceQuote(60, 'venue_event');
assertEqual(venueQuote.mode, 'proposal', 'venue event gets proposal quote');

console.log('Music bingo creator checks passed.');
