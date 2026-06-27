// ============================================================
// Baraja.cards — Deck Engine Types
// Two layers:
//   RawDeckContent  → what lives in /content/*.json (references IDs)
//   DeckSchema      → fully resolved object ready for use
// ============================================================

import type { PrintSpecId } from './shared/print-specs.js';
import type { DesignTemplateId } from './shared/design-templates.js';

// ── Art Direction ────────────────────────────────────────────
// Controls how illustrations are generated for this edition.

export type ArtStyle = 
  | 'abstract-fine-art'      // Default: expressionist, textured, no people
  | 'evocative-photography'  // Realistic scenes/objects but NO recognizable faces
  | 'stylized-illustration'  // Caricature, comic, or illustrated style
  | 'vintage-photography'    // Era-appropriate film photography look
  | 'documentary'            // Raw, journalistic real-world feel
  | 'custom';                // Fully described in art_direction.custom_brief

export interface ArtDirection {
  /** Primary visual style for all cards in this edition */
  style: ArtStyle;
  /**
   * Can illustrations show recognizable real people?
   * - 'none': No faces, no likenesses (safest for commercial use)
   * - 'silhouette': Body shapes/poses but no recognizable features
   * - 'stylized': Caricature or illustrated likenesses (medium legal risk)
   * - 'realistic': Photorealistic depictions (HIGH legal risk, needs licensing)
   */
  faces: 'none' | 'silhouette' | 'stylized' | 'realistic';
  /** Global art brief injected into every card's prompt generation */
  global_brief?: string;
  /** Free-form art direction override (used when style = 'custom') */
  custom_brief?: string;
  /** Reference image URLs for style consistency (mood board) */
  reference_urls?: string[];
}

// ── Card Front ───────────────────────────────────────────────
// The physical face of the card: artwork + identity.

export interface CardFront {
  /** AI generation prompt used to create the artwork for this card */
  art_prompt: string;
  /** URL of the generated artwork image (populated after AI generation) */
  art_url?: string;
  /** History of all previously generated art URLs (newest first) */
  art_versions?: string[];
  /** The card's proper name — e.g. "La Vuelta" */
  title: string;
  /** Position in the deck — e.g. 8 (displayed as "08 / 30") */
  number: number;
  /** Subject hint for contextual enrichment (e.g. "Martín Palermo", "La Bombonera") */
  subject_hint?: string;
}

// ── Card Back ────────────────────────────────────────────────
// The content face: context + editorial hook + primary instruction.

export interface CardBack {
  /** Short editorial hook or mood line; secondary to the instruction in playable decks */
  phrase: string;
  /** One-line context for when to use this card */
  when_to_use: string;
  /** Primary playable instruction, question, exercise, or mechanic */
  instruction: string;
  /** For trivia cards: The answer to the question */
  answer?: string;
  /** Fun fact or "nerd info" to spark conversation during the game */
  fun_fact?: string;
  /** QR code destination URL — Phase 2 */
  qr_url?: string;
  /** AI-generated full card back image (Flujo B: AI renders design+text, pdfme overlays QR only) */
  back_image_url?: string;
  /** History of all previously generated back image URLs (newest first) */
  back_image_versions?: string[];
}

// ── Card ─────────────────────────────────────────────────────

export interface Card {
  /** Unique identifier within the deck — e.g. "cat-01" */
  id: string;
  front: CardFront;
  back: CardBack;
  tags?: string[];
}

// ── Print Specifications ──────────────────────────────────────

export interface PrintDimensions {
  width: number;
  height: number;
  unit: 'mm' | 'in';
}

export interface PrintSpecs {
  paper_weight: '300g' | '350g';
  finish: 'matte' | 'gloss';
  rounded_corners: boolean;
  dimensions: PrintDimensions;
  /** Bleed area in mm */
  bleed: number;
  color_profile: 'CMYK' | 'RGB';
}

// ── Design Template ───────────────────────────────────────────

export interface DeckDesign {
  /** Identifier of this template — matches key in DESIGN_TEMPLATES */
  template_id: string;
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  background?: string;
  text_color?: string;
  surface_color?: string;
  /** Serialized visual/layout configuration persisted by Baraja authoring tools. */
  layout_config?: unknown;
  /** Content fields hidden by the operator in generated card backs or PDFs. */
  hidden_fields?: Record<string, boolean>;
  /** Which card face owns each content field in digital/admin renderers. */
  field_placements?: Partial<Record<CardFieldPlacementKey, CardFieldPlacement>>;
  /** Legacy shorthand migrated into hidden_fields.player_count by admin tools. */
  hide_player_count?: boolean;
  /** Optional QR foreground color for the selected deck template. */
  qr_color?: string | null;
}

export type CardFieldPlacement = 'front' | 'back' | 'hidden';

export type CardFieldPlacementKey =
  | 'number'
  | 'title'
  | 'when_to_use'
  | 'phrase'
  | 'instruction'
  | 'answer'
  | 'fun_fact'
  | 'qr'
  | 'brand';

// ── Pricing ───────────────────────────────────────────────────

export interface DeckPricing {
  /** Amount in smallest currency unit (centavos for ARS, cents for USD) */
  amount: number;
  currency: 'ars' | 'usd';
  /** Stripe Price ID — populated once set up in Stripe Dashboard */
  stripe_price_id?: string;
}

// ── Raw Deck Content (JSON layer) ─────────────────────────────
// This is the shape of /content/*.json files.
// References preset IDs instead of inlining specs.

export interface DeckMetadata {
  /** The core topic or emotional goal (e.g. "Groundedness, reflection, anxiety relief") */
  topic: string;
  /** Intended tone of the copy and design (e.g. "Honest, calm, earthy") */
  tone: string;
  /** Primary target audience (e.g. "Overworked adults", "Couples") */
  target_audience: string;
  /** Number of players (e.g. "1", "2-8") */
  player_count: string;
  /** Art direction rules for illustration generation */
  art_direction?: ArtDirection;
}

// ── Landing Configuration ─────────────────────────────────────

export interface LandingReason {
  icon: string;
  title: string;
  description: string;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingHero {
  eyebrow: string;
  titleHtml?: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary?: string;
}

export interface LandingShowcase {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer?: string;
}

export interface LandingLeadCapture {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
}

export interface LandingConfig {
  hero?: LandingHero;
  showcase?: LandingShowcase;
  reasons?: LandingReason[];
  faqTitle?: string;
  faq?: LandingFaq[];
  leadCapture?: LandingLeadCapture;
}

// ── Digital Deck Experience ───────────────────────────────────

export type DigitalDeckCategory =
  | 'introspection'
  | 'emotional-regulation'
  | 'conversation'
  | 'trivia'
  | 'language-learning'
  | 'team-building'
  | 'coaching'
  | 'creative-prompts'
  | 'other';

export type DeckCatalogCollectionId =
  | 'self-work'
  | 'social-games'
  | 'couples-dating'
  | 'team-tools'
  | 'trivia-games'
  | 'learning'
  | 'other';

export type DeckCatalogCategoryId =
  | 'emotional-regulation'
  | 'introspection'
  | 'grounding'
  | 'anxiety-pause'
  | 'journaling'
  | 'boundaries'
  | 'decision-clarity'
  | 'between-friends'
  | 'dinner-table'
  | 'party'
  | 'family'
  | 'dates'
  | 'first-date'
  | 'couple-reconnection'
  | 'playful-intimacy'
  | 'hard-conversations'
  | 'conversation'
  | 'confessions'
  | 'office'
  | 'facilitation'
  | 'retrospectives'
  | 'feedback'
  | 'onboarding'
  | 'values'
  | 'conflict'
  | 'argentine-cinema'
  | 'romantic-comedy'
  | 'pop-culture'
  | 'music'
  | 'argentina-latam'
  | 'language-practice'
  | 'classroom-conversation'
  | 'writing-prompts'
  | 'debate'
  | 'creativity'
  | 'football'
  | 'other';

export interface DeckCatalogPlacement {
  collection: DeckCatalogCollectionId;
  category: DeckCatalogCategoryId;
}

export type DeckSessionMode =
  | 'browse'
  | 'solo'
  | 'daily-card'
  | 'pair'
  | 'group'
  | 'facilitator';

export type DeckAccessScope = 'preview' | 'single-deck' | 'bundle' | 'all-access';

export type PrintableLicenseScope =
  | 'personal_print'
  | 'business_internal'
  | 'commercial_resale';

export interface DeckPrintableAccess {
  enabled: boolean;
  /** License scopes granted by this deck/SKU. Commercial resale should stay opt-in only. */
  license_scopes: PrintableLicenseScope[];
  /** Private storage key for the print-ready PDF, resolved by the consuming app. */
  file_key?: string;
  /** Optional companion instructions for local printers or business buyers. */
  instructions_file_key?: string;
  version?: string;
  recommended_use?: string;
}

export interface DeckSharingPolicy {
  allow_card_share?: boolean;
  allow_bulk_export?: boolean;
}

export interface DigitalDeckLandingCopy {
  /** Primary public deck promise for the pre-purchase hero. */
  hero_promise?: string;
  /** Supporting copy that clarifies who the deck is for or how it helps. */
  hero_supporting_copy?: string;
  /** Copy shown above the public preview cards. */
  preview_intro?: string;
  /** Copy shown near the locked/full-access purchase band. */
  unlock_summary?: string;
}

export interface DigitalDeckConfig {
  is_published?: boolean;
  category?: DigitalDeckCategory;
  tags?: string[];
  catalog?: DeckCatalogPlacement;
  landing?: DigitalDeckLandingCopy;
  preview_card_ids?: string[];
  default_session_mode?: DeckSessionMode;
  session_modes?: DeckSessionMode[];
  purchase_sku?: string;
  access_scopes?: DeckAccessScope[];
  printable?: DeckPrintableAccess;
  sharing?: DeckSharingPolicy;
}

export interface RawDeckContent {
  id: string;
  /** Which edition this deck belongs to — e.g. "cable-a-tierra" */
  edition: string;
  name: string;
  slug: string;
  description: string;
  language: 'es' | 'en';
  card_count: number;
  metadata: DeckMetadata;
  /** References a preset in PRINT_SPECS */
  print_spec_id: PrintSpecId;
  /** References a template in DESIGN_TEMPLATES */
  design_template_id: DesignTemplateId;
  
  /** Optional manual overrides for the print spec */
  print_specs_overrides?: Partial<PrintSpecs>;
  /** Optional manual overrides for the design template */
  design_template_overrides?: Partial<DeckDesign>;

  /** Copy and configuration for the edition's landing page */
  landing_config?: LandingConfig;

  /** Optional metadata used by the digital deck platform experience. */
  digital?: DigitalDeckConfig;

  pricing: DeckPricing;
  cards: Card[];
}

// ── Deck Schema (resolved layer) ──────────────────────────────
// Fully resolved deck — IDs replaced with actual objects.
// This is what the rest of the app consumes.

export interface DeckSchema extends Omit<RawDeckContent, 'print_spec_id' | 'design_template_id'> {
  print_specs: PrintSpecs;
  design: DeckDesign;
  landing_config?: LandingConfig;
}

// ── Edition ───────────────────────────────────────────────────

export interface Edition {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** subdomain → e.g. "cable-a-tierra" → cable-a-tierra.baraja.cards */
  subdomain: string;
  decks: DeckSchema[];
  branding: {
    tagline: string;
    logo_url?: string;
    hero_image_url?: string;
    palette: {
      bg: string;
      surface: string;
      accent: string;
      text: string;
    };
  };
}

// ── Orders (Phase 2) ─────────────────────────────────────────

export type ShippingZone = 'CABA' | 'AMBA' | 'INTERIOR' | 'INTERNATIONAL';
export type OrderStatus = 'pending' | 'processing' | 'printing' | 'shipped' | 'delivered';
export type PrintProvider = 'local' | 'gelato' | 'manual';

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface DeckOrder {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name?: string;
  shipping_address: ShippingAddress;
  shipping_zone: ShippingZone;
  deck_id: string;
  edition: string;
  quantity: number;
  amount_total: number;
  currency: string;
  status: OrderStatus;
  /** R2 object key of the generated print-ready PDF */
  print_file_key?: string;
  print_provider: PrintProvider;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}
