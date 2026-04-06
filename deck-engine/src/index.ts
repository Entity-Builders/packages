// ============================================================
// @eb-packages/deck-engine — Public API
// ============================================================

// Core types
export type {
  Card,
  CardFront,
  CardBack,
  DeckSchema,
  RawDeckContent,
  DeckMetadata,
  DeckDesign,
  PrintSpecs,
  PrintDimensions,
  DeckPricing,
  Edition,
  DeckOrder,
  ShippingAddress,
  ShippingZone,
  OrderStatus,
  PrintProvider,
} from './types.js';

// Shared presets
export { PRINT_SPECS } from './shared/print-specs.js';
export type { PrintSpecId } from './shared/print-specs.js';

export { DESIGN_TEMPLATES } from './shared/design-templates.js';
export type { DesignTemplateId } from './shared/design-templates.js';

// Loader utilities
export { resolveDeck, validateDeck } from './loader.js';

// Repository
export type { IDeckRepository } from './repository.js';

// ── Resolved decks ────────────────────────────────────────────
// Pre-resolved deck objects ready to consume.
// Add new editions here as they are created.

export { DECKS } from './decks.js';
export type { DeckId } from './decks.js';
