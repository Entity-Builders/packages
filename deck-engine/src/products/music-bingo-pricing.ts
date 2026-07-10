export const MUSIC_BINGO_CARD_COUNT_OPTIONS = [
  {
    cardCount: 15,
    label: '15 cartones',
    summary: 'Para probar la dinamica en casa o mesa chica.',
  },
  {
    cardCount: 30,
    label: '30 cartones',
    summary: 'Para cumples, juntadas y mesas chicas.',
  },
  {
    cardCount: 50,
    label: '50 cartones',
    summary: 'Para juntadas grandes o salon chico.',
  },
  {
    cardCount: 70,
    label: '70 cartones',
    summary: 'Para eventos medianos con mas rotacion.',
  },
  {
    cardCount: 100,
    label: '100 cartones',
    summary: 'Para fiestas grandes o varias rondas.',
  },
  {
    cardCount: 150,
    label: '150 cartones',
    summary: 'Para bares chicos, colegios o doble tanda.',
  },
  {
    cardCount: 200,
    label: '200 cartones',
    summary: 'Para convocatorias grandes con margen de invitados.',
  },
  {
    cardCount: 250,
    label: '250 cartones',
    summary: 'Para eventos grandes antes de pasar a propuesta.',
  },
] as const;

export type MusicBingoCardCountOption = (typeof MUSIC_BINGO_CARD_COUNT_OPTIONS)[number];
export type MusicBingoCardCount = MusicBingoCardCountOption['cardCount'];

export type MusicBingoPriceMode = 'prebuilt' | 'playlist_own';
export type MusicBingoCheckoutSongSource =
  | 'curated_spotify'
  | 'custom_spotify'
  | 'manual_fallback';

export const MUSIC_BINGO_PRICE_TIERS = [
  { cardCount: 15, prebuiltAmountARS: 4900, playlistOwnAmountARS: 6900 },
  { cardCount: 30, prebuiltAmountARS: 7900, playlistOwnAmountARS: 9900 },
  { cardCount: 50, prebuiltAmountARS: 10900, playlistOwnAmountARS: 13900 },
  { cardCount: 70, prebuiltAmountARS: 14900, playlistOwnAmountARS: 18900 },
  { cardCount: 100, prebuiltAmountARS: 19900, playlistOwnAmountARS: 24900 },
  { cardCount: 150, prebuiltAmountARS: 28900, playlistOwnAmountARS: 36900 },
  { cardCount: 200, prebuiltAmountARS: 37900, playlistOwnAmountARS: 47900 },
  { cardCount: 250, prebuiltAmountARS: 46900, playlistOwnAmountARS: 58900 },
] as const;

export type MusicBingoPriceTier = (typeof MUSIC_BINGO_PRICE_TIERS)[number];
export type MusicBingoSelfServeOfferingId =
  | 'rock-argentino-prebuilt'
  | 'cumbia-retro-prebuilt'
  | 'hits-2000-prebuilt'
  | 'personalized-music-bingo';

export interface MusicBingoSelfServeOffering {
  id: MusicBingoSelfServeOfferingId;
  title: string;
  priceMode: MusicBingoPriceMode;
  songSources: readonly MusicBingoCheckoutSongSource[];
}

export const MUSIC_BINGO_SELF_SERVE_OFFERINGS: readonly MusicBingoSelfServeOffering[] = [
  {
    id: 'rock-argentino-prebuilt',
    title: 'Bingo Musical: Rock Argentino',
    priceMode: 'prebuilt',
    songSources: ['curated_spotify'],
  },
  {
    id: 'cumbia-retro-prebuilt',
    title: 'Bingo Musical: Cumbia Retro',
    priceMode: 'prebuilt',
    songSources: ['curated_spotify'],
  },
  {
    id: 'hits-2000-prebuilt',
    title: 'Bingo Musical: Hits 2000',
    priceMode: 'prebuilt',
    songSources: ['curated_spotify'],
  },
  {
    id: 'personalized-music-bingo',
    title: 'Bingo Musical con tu playlist',
    priceMode: 'playlist_own',
    songSources: ['custom_spotify', 'manual_fallback'],
  },
];

export interface MusicBingoSelfServePriceQuote {
  cardCount: MusicBingoCardCount;
  amountARS: number;
  currency: 'ARS';
  priceMode: MusicBingoPriceMode;
  label: string;
}

export interface MusicBingoResolvedSelfServeCheckout extends MusicBingoSelfServePriceQuote {
  offering: MusicBingoSelfServeOffering;
}

export function getMusicBingoSelfServePriceQuote(
  cardCount: number,
  priceMode: MusicBingoPriceMode
): MusicBingoSelfServePriceQuote | null {
  const tier = MUSIC_BINGO_PRICE_TIERS.find((candidate) => candidate.cardCount === cardCount);

  if (!tier) return null;

  const amountARS =
    priceMode === 'prebuilt' ? tier.prebuiltAmountARS : tier.playlistOwnAmountARS;

  return {
    cardCount: tier.cardCount,
    amountARS,
    currency: 'ARS',
    priceMode,
    label: formatMusicBingoPriceARS(amountARS),
  };
}

export function resolveMusicBingoSelfServeCheckout(input: {
  cardCount: number;
  offeringId: string;
  songSource: MusicBingoCheckoutSongSource;
}): MusicBingoResolvedSelfServeCheckout | null {
  const offering = MUSIC_BINGO_SELF_SERVE_OFFERINGS.find(
    (candidate) => candidate.id === input.offeringId
  );

  if (!offering || !offering.songSources.includes(input.songSource)) return null;

  const quote = getMusicBingoSelfServePriceQuote(input.cardCount, offering.priceMode);

  return quote ? { ...quote, offering } : null;
}

export function formatMusicBingoPriceARS(amountARS: number): string {
  return `$${amountARS.toLocaleString('es-AR')} ARS`;
}
