/**
 * QR URL utilities for Baraja card printing.
 *
 * Each physical card gets a unique canonical URL embedded in its QR code.
 * When scanned, the system knows exactly which deck and card number it is.
 *
 * URL schema: https://baraja.cards/c/{deck-slug}/{zero-padded-number}
 * Example:    https://baraja.cards/c/rompelo/03
 */

const DEFAULT_BASE_URL = 'https://baraja.cards';

/**
 * Returns the canonical QR URL for a specific card.
 *
 * @param deckSlug   - The deck's slug (e.g. 'rompelo', 'barometro').
 * @param cardNumber - The card's number (e.g. 1, 7, 12).
 * @param baseUrl    - Override base URL (useful for staging/local).
 *
 * @example
 * getCardQrUrl('rompelo', 3)            // → 'https://baraja.cards/c/rompelo/03'
 * getCardQrUrl('barometro', 12)         // → 'https://baraja.cards/c/barometro/12'
 * getCardQrUrl('rompelo', 1, 'http://localhost:5173') // → 'http://localhost:5173/c/rompelo/01'
 */
export function getCardQrUrl(
  deckSlug: string,
  cardNumber: number,
  baseUrl: string = DEFAULT_BASE_URL,
): string {
  const paddedNumber = String(cardNumber).padStart(2, '0');
  return `${baseUrl}/c/${deckSlug}/${paddedNumber}`;
}
