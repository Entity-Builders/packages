import { getPotMetadataPrompt } from './prompts/pot-metadata.ts';

/**
 * Structured metadata extracted from pot description
 */
export interface PotMetadata {
  // Basic Information
  name?: string;
  species?: string;
  seed_type?: string;

  // Care Requirements
  watering_frequency?: string;
  watering_amount?: string;
  misting_required?: boolean;
  misting_frequency?: string;
  light_requirements?: string;
  light_hours?: string;
  temperature_range?: string;
  humidity_level?: string;

  // Soil & Fertilization
  soil_type?: string;
  fertilizer_type?: string;
  fertilizer_frequency?: string;
  fertilizer_season?: string;

  // Additional Care
  pruning_needs?: string;
  repotting_frequency?: string;
  common_issues?: string;
  seasonal_care?: string;
  notes?: string;

  // Growth & Lifecycle
  growth_rate?: string;
  mature_height?: string;
  mature_width?: string;
  lifespan?: string;
  time_to_harvest?: string;
  flowering_season?: string;
  fruiting_season?: string;

  // Pests & Safety
  common_pests?: string[];
  pest_prevention?: string;
  disease_susceptibility?: string;
  pet_safe?: boolean;
  child_safe?: boolean;

  // Propagation
  propagation_method?: string;
  propagation_difficulty?: string;
  best_propagation_season?: string;

  // Special Features
  edible_parts?: string;
  air_purifying?: boolean;
  fragrant?: boolean;
  attracts_wildlife?: string;
  drought_tolerant?: boolean;
  cold_hardy?: boolean;
}

/**
 * JSON Schema for PotMetadata structure
 * Used by Gemini API to ensure structured response
 */
export const POT_METADATA_SCHEMA = {
  type: 'object',
  properties: {
    // Basic Information
    name: {
      type: 'string',
      description: 'The nickname of the pot/plant',
    },
    species: {
      type: 'string',
      description: 'The plant species',
    },
    seed_type: {
      type: 'string',
      description: 'Type of seed (e.g., Heirloom, Hybrid, Organic)',
    },

    // Care Requirements
    watering_frequency: {
      type: 'string',
      description: 'How often to water the plant',
    },
    watering_amount: {
      type: 'string',
      description: 'Amount of water needed',
    },
    misting_required: {
      type: 'boolean',
      description: 'Whether leaves need spraying/misting',
    },
    misting_frequency: {
      type: 'string',
      description: 'How often to mist the leaves',
    },
    light_requirements: {
      type: 'string',
      description: 'Type of light needed',
    },
    light_hours: {
      type: 'string',
      description: 'Hours of light needed per day',
    },
    temperature_range: {
      type: 'string',
      description: 'Ideal temperature range',
    },
    humidity_level: {
      type: 'string',
      description: 'Required humidity level',
    },

    // Soil & Fertilization
    soil_type: {
      type: 'string',
      description: 'Type of soil needed',
    },
    fertilizer_type: {
      type: 'string',
      description: 'Type of fertilizer to use',
    },
    fertilizer_frequency: {
      type: 'string',
      description: 'How often to fertilize',
    },
    fertilizer_season: {
      type: 'string',
      description: 'Best season/time to fertilize',
    },

    // Additional Care
    pruning_needs: {
      type: 'string',
      description: 'Pruning requirements',
    },
    repotting_frequency: {
      type: 'string',
      description: 'How often to repot',
    },
    common_issues: {
      type: 'string',
      description: 'Common problems to watch for',
    },
    seasonal_care: {
      type: 'string',
      description: 'Special care for different seasons',
    },
    notes: {
      type: 'string',
      description: 'Any other details',
    },

    // Growth & Lifecycle
    growth_rate: {
      type: 'string',
      description: 'Growth speed (e.g., "Slow", "Moderate", "Fast")',
    },
    mature_height: {
      type: 'string',
      description: 'Expected height when mature',
    },
    mature_width: {
      type: 'string',
      description: 'Expected width/spread when mature',
    },
    lifespan: {
      type: 'string',
      description: 'Plant lifespan (e.g., "Annual", "Perennial", "Biennial")',
    },
    time_to_harvest: {
      type: 'string',
      description: 'Time until harvest for edible plants',
    },
    flowering_season: {
      type: 'string',
      description: 'When the plant flowers',
    },
    fruiting_season: {
      type: 'string',
      description: 'When the plant produces fruit',
    },

    // Pests & Safety
    common_pests: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'Common pests that affect this plant',
    },
    pest_prevention: {
      type: 'string',
      description: 'How to prevent pests',
    },
    disease_susceptibility: {
      type: 'string',
      description: 'Common diseases and vulnerabilities',
    },
    pet_safe: {
      type: 'boolean',
      description: 'Whether the plant is safe for pets',
    },
    child_safe: {
      type: 'boolean',
      description: 'Whether the plant is safe for children',
    },

    // Propagation
    propagation_method: {
      type: 'string',
      description: 'How to propagate (e.g., "Seeds", "Cuttings", "Division")',
    },
    propagation_difficulty: {
      type: 'string',
      description:
        'Difficulty level (e.g., "Easy", "Intermediate", "Difficult")',
    },
    best_propagation_season: {
      type: 'string',
      description: 'Best time/season to propagate',
    },

    // Special Features
    edible_parts: {
      type: 'string',
      description: 'Which parts are edible',
    },
    air_purifying: {
      type: 'boolean',
      description: 'Whether the plant purifies air',
    },
    fragrant: {
      type: 'boolean',
      description: 'Whether the plant has fragrance',
    },
    attracts_wildlife: {
      type: 'string',
      description:
        'Wildlife it attracts (e.g., "Butterflies", "Bees", "Hummingbirds")',
    },
    drought_tolerant: {
      type: 'boolean',
      description: 'Whether the plant tolerates drought',
    },
    cold_hardy: {
      type: 'boolean',
      description: 'Whether the plant resists frost/cold',
    },
  },
} as const;

/**
 * Configuration for Gemini API calls
 */
export interface GeminiConfig {
  apiKey: string;
  modelName?: string;
}

/**
 * Error thrown when Gemini API returns an error
 */
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public responseText?: string,
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

/**
 * Extract structured pot metadata from a user's transcript
 *
 * @param transcript - User's description of the pot/plant
 * @param config - Gemini API configuration
 * @returns Structured metadata extracted from the transcript
 * @throws {GeminiAPIError} When the Gemini API returns an error
 * @throws {Error} When JSON parsing fails or no content is generated
 *
 * @example
 * ```typescript
 * const metadata = await extractPotMetadata(
 *   "Un tomate cherry rojo en maceta pequeña",
 *   { apiKey: process.env.GEMINI_API_KEY }
 * );
 * console.log(metadata.species); // "Tomato"
 * ```
 */
export async function extractPotMetadata(
  transcript: string,
  config: GeminiConfig,
): Promise<PotMetadata> {
  const modelName = config.modelName || 'gemini-flash-latest';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`;

  const prompt = getPotMetadataPrompt(transcript);

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        responseSchema: POT_METADATA_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new GeminiAPIError(
      `Gemini API error: ${response.status}`,
      response.status,
      errorText,
    );
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error('No content generated by Gemini API');
  }

  const metadata: PotMetadata = JSON.parse(generatedText);
  return metadata;
}
