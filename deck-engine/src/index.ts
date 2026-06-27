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
  CardFieldPlacement,
  CardFieldPlacementKey,
  DigitalDeckCategory,
  DeckCatalogCategoryId,
  DeckCatalogCollectionId,
  DeckCatalogPlacement,
  DeckAccessScope,
  DeckPrintableAccess,
  DeckSessionMode,
  DigitalDeckConfig,
  DigitalDeckLandingCopy,
  DeckSharingPolicy,
  PrintableLicenseScope,
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

// Digital deck utilities
export {
  DEFAULT_PREVIEW_CARD_COUNT,
  drawCards,
  flipCardFace,
  getDeckSessionModes,
  getDefaultSessionMode,
  getPreviewCards,
  getPrintableAccess,
  getShareableCardPayload,
  isCardPreviewable,
  shouldRenderPrintableQr,
  shuffleCards,
} from './digital.js';
export type { CardFace, DrawCardsOptions, ShareableCardPayload } from './digital.js';

// Catalog taxonomy
export {
  DECK_CATALOG_CATEGORIES,
  DECK_CATALOG_COLLECTIONS,
  getDeckCatalogBreadcrumb,
  getDeckCatalogFacet,
  getDeckCatalogValidationErrors,
} from './catalog.js';
export type {
  DeckCatalogBreadcrumbItem,
  DeckCatalogCategoryDefinition,
  DeckCatalogCollectionDefinition,
  DeckCatalogFacet,
} from './catalog.js';

// Repository
export type { IDeckRepository } from './repository.js';

// Generator: template prompts, layout presets, card types
export * from './generator/template-prompts.js';

// ── Resolved decks ────────────────────────────────────────────
// Pre-resolved deck objects ready to consume.
// Add new editions here as they are created.

export { DECKS } from './decks.js';
export type { DeckId } from './decks.js';

// QR URL generation
export { getCardQrUrl } from './qr.js';
