/**
 * AI Services Package
 *
 * Provides reusable AI service integrations (Gemini API) for:
 * - Plant metadata extraction from transcripts
 * - Plant identification from images
 * - Care guide generation
 */

// Export metadata extraction
export {
  extractPotMetadata,
  type PotMetadata,
  type GeminiConfig,
  GeminiAPIError,
} from './extract-pot-metadata.ts';

// Export prompts (for customization if needed)
export { getPotMetadataPrompt } from './prompts/pot-metadata.ts';
