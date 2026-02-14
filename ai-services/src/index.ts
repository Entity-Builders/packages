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

// Export lightweight identification (use this first to save tokens!)
export {
  identifyPlantSpecies,
  type PlantIdentification,
} from './identify-plant-species.ts';

// Export prompts (for customization if needed)
export { getPotMetadataPrompt } from './prompts/pot-metadata.ts';
export { getIdentifySpeciesPrompt } from './prompts/identify-species.ts';
