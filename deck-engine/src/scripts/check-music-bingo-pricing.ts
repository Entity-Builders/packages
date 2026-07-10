import {
  MUSIC_BINGO_PRICE_TIERS,
  MUSIC_BINGO_SELF_SERVE_OFFERINGS,
  getMusicBingoSelfServePriceQuote,
  resolveMusicBingoSelfServeCheckout,
} from '../products/index.js';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, received ${String(actual)}.`);
  }
}

for (const tier of MUSIC_BINGO_PRICE_TIERS) {
  const prebuilt = getMusicBingoSelfServePriceQuote(tier.cardCount, 'prebuilt');
  const playlistOwn = getMusicBingoSelfServePriceQuote(tier.cardCount, 'playlist_own');

  assertEqual(prebuilt?.amountARS, tier.prebuiltAmountARS, `prebuilt ${tier.cardCount} price`);
  assertEqual(
    playlistOwn?.amountARS,
    tier.playlistOwnAmountARS,
    `playlist-own ${tier.cardCount} price`
  );
}

for (const offering of MUSIC_BINGO_SELF_SERVE_OFFERINGS) {
  for (const songSource of offering.songSources) {
    const resolved = resolveMusicBingoSelfServeCheckout({
      cardCount: 30,
      offeringId: offering.id,
      songSource,
    });

    assert(Boolean(resolved), `${offering.id} resolves for ${songSource}`);
    assertEqual(resolved?.priceMode, offering.priceMode, `${offering.id} keeps its price mode`);
  }
}

assertEqual(
  resolveMusicBingoSelfServeCheckout({
    cardCount: 30,
    offeringId: 'rock-argentino-prebuilt',
    songSource: 'custom_spotify',
  }),
  null,
  'custom playlists cannot purchase a prebuilt offer'
);
assertEqual(
  resolveMusicBingoSelfServeCheckout({
    cardCount: 30,
    offeringId: 'personalized-music-bingo',
    songSource: 'curated_spotify',
  }),
  null,
  'curated themes cannot purchase a playlist-own offer'
);
assertEqual(
  getMusicBingoSelfServePriceQuote(16, 'prebuilt'),
  null,
  'unsupported card counts have no price'
);

console.log('Music bingo pricing checks passed.');
