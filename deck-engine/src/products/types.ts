export type GameKind =
  | 'card_deck'
  | 'music_bingo'
  | 'trivia_bingo'
  | 'bingo'
  | 'trivia'
  | 'football_bar_game'
  | 'future_game';

export type ProductFamily =
  | 'digital_deck'
  | 'printable_game'
  | 'custom_service';

export type ProductMode =
  | 'catalog'
  | 'prebuilt'
  | 'custom'
  | 'venue_event'
  | 'campaign_pilot';

export type GameEditionStatus = 'draft' | 'demo' | 'active' | 'archived';

export type UseContext =
  | 'personal_private'
  | 'private_event'
  | 'venue_event'
  | 'professional_facilitation';

export type SalesMode = 'whatsapp' | 'manual_invoice' | 'checkout' | 'proposal';

export type LicenseScope = UseContext;

export type PricingMode = 'hidden' | 'from_price' | 'fixed' | 'proposal';

export type PrintableAssetKind =
  | 'cards_pdf'
  | 'projection_pdf'
  | 'control_sheet'
  | 'rules_guide'
  | 'song_list'
  | 'print_guide';

export type PrintableAssetStatus = 'planned' | 'generated' | 'delivered';

export type DigitalCompanionKind = 'qr_player' | 'host_view';

export type DigitalCompanionStatus = 'demo' | 'active' | 'disabled';

export type DigitalCompanionStateMode = 'local_only' | 'persisted_session';

export type CampaignLandingPurpose = 'validation' | 'campaign' | 'seo' | 'launch';

export type CampaignLandingStatus = 'draft' | 'active' | 'paused';

export interface ProductLegalExclusion {
  id: string;
  label: string;
}

export interface ProductLegalBoundary {
  summary: string;
  exclusions: ProductLegalExclusion[];
  organizerResponsibilities: string[];
}

export interface BarajaProduct {
  id: string;
  slug: string;
  brand: 'baraja';
  kind: GameKind;
  family: ProductFamily;
  modes: ProductMode[];
  title: string;
  summary: string;
  legal: ProductLegalBoundary;
}

export interface GameTemplate {
  id: string;
  kind: GameKind;
  title: string;
  summary: string;
  requiredAssetKinds: PrintableAssetKind[];
  optionalCompanionKinds: DigitalCompanionKind[];
  rulesSummary: string;
}

export interface GameEditionEventContext {
  venueId?: string;
  venueName?: string;
  eventName?: string;
  dateLabel?: string;
  audience?: string;
  duration?: string;
}

export interface MusicBingoSong {
  id: string;
  artist: string;
  title: string;
  artworkUrl?: string;
  spotifyTrackUrl?: string;
}

export interface MusicBingoCell {
  id: string;
  label: string;
  hint: string;
  songId?: string;
  free?: boolean;
}

export interface MusicBingoEditionContent {
  songs: MusicBingoSong[];
  board: MusicBingoCell[];
  guideSteps: string[];
}

export interface TriviaBingoAnswer {
  id: string;
  label: string;
}

export interface TriviaBingoQuestion {
  id: string;
  prompt: string;
  correctAnswerId: string;
  revealCopy: string;
  originalVisualDescription?: string;
  editorialSourceReference?: string;
}

export interface TriviaBingoEditionContent {
  contentVersion: string;
  answers: TriviaBingoAnswer[];
  questions: TriviaBingoQuestion[];
  guideSteps: string[];
  printInstructions: string[];
  legalSummary: string;
}

export interface TriviaBingoCardCell {
  id: string;
  answerId: string;
  label: string;
}

export interface TriviaBingoCard {
  id: string;
  cardNumber: number;
  title: string;
  gridSize: 3;
  cells: TriviaBingoCardCell[];
}

export interface TriviaBingoControlSheetRow {
  revealNumber: number;
  questionId: string;
  prompt: string;
  correctAnswerId: string;
  correctAnswerLabel: string;
  revealCopy: string;
}

export interface TriviaBingoFairnessCheckpoint {
  revealNumber: number;
  completedCardIds: string[];
}

export interface TriviaBingoFairnessReport {
  winnerCardId: string;
  checkpoints: TriviaBingoFairnessCheckpoint[];
  completedCardIdsBeforeFinalReveal: string[];
  completedCardIdsAtFinalReveal: string[];
}

export interface TriviaBingoPrintPack {
  productId: string;
  editionId: string;
  editionTitle: string;
  contentVersion: string;
  seed: string;
  tableCount: number;
  gridSize: 3;
  questions: TriviaBingoQuestion[];
  cards: TriviaBingoCard[];
  controlSheet: TriviaBingoControlSheetRow[];
  hostGuideSteps: string[];
  printInstructions: string[];
  legalSummary: string;
  fairnessReport: TriviaBingoFairnessReport;
}

export interface TriviaBingoHostSessionRound {
  id: string;
  revealNumber: number;
  prompt: string;
  answerLabel: string;
  revealCopy: string;
}

export interface TriviaBingoHostSession {
  editionId: string;
  editionTitle: string;
  contentVersion: string;
  roundCount: number;
  rounds: TriviaBingoHostSessionRound[];
}

export interface GameEditionContent {
  musicBingo?: MusicBingoEditionContent;
  triviaBingo?: TriviaBingoEditionContent;
}

export interface GameEdition {
  id: string;
  productId: string;
  templateId: string;
  slug: string;
  route: string;
  title: string;
  locale: 'es';
  status: GameEditionStatus;
  summary: string;
  audience: string;
  designedUseContexts: UseContext[];
  eventContext?: GameEditionEventContext;
  content?: GameEditionContent;
}

export interface PrintableAsset {
  id: string;
  kind: PrintableAssetKind;
  title: string;
  status: PrintableAssetStatus;
  fileKey?: string;
}

export interface PrintablePack {
  id: string;
  editionId: string;
  title: string;
  assets: PrintableAsset[];
}

export interface DigitalCompanion {
  id: string;
  editionId: string;
  kind: DigitalCompanionKind;
  route: string;
  status: DigitalCompanionStatus;
  stateMode: DigitalCompanionStateMode;
  qrEnabled: boolean;
  title: string;
}

export interface ProductOffering {
  id: string;
  productId: string;
  editionId?: string;
  title: string;
  audience: string;
  description: string;
  tags: string[];
  sampleItems: string[];
  salesMode: SalesMode;
  licenseScope: LicenseScope;
  commercialResaleAllowed: boolean;
  pricingMode: PricingMode;
  priceLabel?: string;
  analyticsOfferType: string;
  messageLines: string[];
}

export interface CampaignLanding {
  id: string;
  slug: string;
  route: string;
  productId: string;
  featuredEditionIds: string[];
  offeringIds: string[];
  purpose: CampaignLandingPurpose;
  status: CampaignLandingStatus;
  title: string;
  summary: string;
}

export interface CustomProject {
  id: string;
  productId: string;
  sourceOfferingId?: string;
  status: 'inquiry' | 'proposal_sent' | 'confirmed' | 'archived';
}

export interface BarajaProductCatalog {
  products: BarajaProduct[];
  templates: GameTemplate[];
  editions: GameEdition[];
  printablePacks: PrintablePack[];
  digitalCompanions: DigitalCompanion[];
  offerings: ProductOffering[];
  campaignLandings: CampaignLanding[];
  customProjects: CustomProject[];
}
