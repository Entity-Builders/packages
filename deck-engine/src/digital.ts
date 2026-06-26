import type {
  Card,
  DeckPrintableAccess,
  DeckSchema,
  DeckSessionMode,
  DigitalDeckConfig,
} from './types.js';

export const DEFAULT_PREVIEW_CARD_COUNT = 3;

export interface DrawCardsOptions {
  count?: number;
  pool?: 'all' | 'preview';
  seed?: string | number;
}

export type CardFace = 'front' | 'back';

export interface ShareableCardPayload {
  deckId: string;
  deckSlug: string;
  deckName: string;
  cardId: string;
  title: string;
  phrase?: string;
  previewable: boolean;
}

export function getDeckSessionModes(deck: DeckSchema): DeckSessionMode[] {
  const modes = deck.digital?.session_modes;

  if (!modes?.length) {
    return ['browse'];
  }

  return [...new Set(modes)];
}

export function getDefaultSessionMode(deck: DeckSchema): DeckSessionMode {
  const modes = getDeckSessionModes(deck);
  const configuredMode = deck.digital?.default_session_mode;

  if (configuredMode && modes.includes(configuredMode)) {
    return configuredMode;
  }

  return modes[0] ?? 'browse';
}

export function flipCardFace(currentFace: CardFace): CardFace {
  return currentFace === 'front' ? 'back' : 'front';
}

export function getPreviewCards(
  deck: DeckSchema,
  limit = DEFAULT_PREVIEW_CARD_COUNT
): Card[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  const previewIds = deck.digital?.preview_card_ids ?? [];

  if (safeLimit === 0) {
    return [];
  }

  if (!previewIds.length) {
    return deck.cards.slice(0, safeLimit);
  }

  const cardsById = new Map(deck.cards.map((card) => [card.id, card]));

  return previewIds
    .map((cardId) => cardsById.get(cardId))
    .filter((card): card is Card => Boolean(card))
    .slice(0, safeLimit);
}

export function isCardPreviewable(deck: DeckSchema, cardId: string): boolean {
  return getPreviewCards(deck, deck.cards.length).some((card) => card.id === cardId);
}

export function getPrintableAccess(deck: DeckSchema): DeckPrintableAccess | undefined {
  const printable = deck.digital?.printable;

  if (!printable?.enabled) {
    return undefined;
  }

  return printable;
}

export function shouldRenderPrintableQr(deck: { digital?: DigitalDeckConfig }): boolean {
  return deck.digital?.printable?.enabled === true;
}

export function drawCards(deck: DeckSchema, options: DrawCardsOptions = {}): Card[] {
  const sourceCards =
    options.pool === 'preview' ? getPreviewCards(deck, deck.cards.length) : deck.cards;
  const count = Math.min(
    sourceCards.length,
    Math.max(1, Math.floor(options.count ?? 1))
  );

  return shuffleCards(sourceCards, options.seed).slice(0, count);
}

export function shuffleCards(cards: readonly Card[], seed?: string | number): Card[] {
  const shuffled = [...cards];
  const random = createRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const swap = shuffled[swapIndex];

    if (current && swap) {
      shuffled[index] = swap;
      shuffled[swapIndex] = current;
    }
  }

  return shuffled;
}

export function getShareableCardPayload(
  deck: DeckSchema,
  cardId: string
): ShareableCardPayload | undefined {
  const card = deck.cards.find((candidate) => candidate.id === cardId);

  if (!card) {
    return undefined;
  }

  const previewable = isCardPreviewable(deck, cardId);
  const canSharePhrase = previewable || deck.digital?.sharing?.allow_card_share === true;

  return {
    deckId: deck.id,
    deckSlug: deck.slug,
    deckName: deck.name,
    cardId: card.id,
    title: card.front.title,
    phrase: canSharePhrase ? card.back.phrase : undefined,
    previewable,
  };
}

function createRandom(seed?: string | number): () => number {
  if (seed === undefined) {
    return Math.random;
  }

  let state = normalizeSeed(seed);

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function normalizeSeed(seed: string | number): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return seed >>> 0 || 1;
  }

  const input = String(seed);
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0 || 1;
}
