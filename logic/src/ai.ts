import type { PotFormData } from '@entity-builders/garden';

import { supabase } from './supabase';

/**
 * Extract metadata from a voice transcript using Supabase Edge Function (Gemini).
 */
export async function extractPotMetadata(
  transcript: string,
): Promise<Partial<PotFormData>> {
  try {
    console.log('Calling Edge Function extract-pot-metadata...');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke(
      'extract-pot-metadata',
      {
        body: { transcript },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      },
    );

    if (error) {
      console.warn('Edge Function error:', error);
      throw error;
    }

    console.log('Extracted metadata (Edge Function):', data);
    return data as Partial<PotFormData>;
  } catch (error) {
    console.error(
      'Error calling Edge Function, falling back to keyword parser:',
      error,
    );
    return extractPotMetadataKeyword(transcript);
  }
}

/**
 * Identify plant species and variety from image using Gemini Vision
 */
export async function identifyPlant(base64Image: string): Promise<{
  species?: string;
  variety?: string;
  confidence?: string;
  description?: string;
  care_info?: {
    climate?: string;
    watering_frequency?: string;
    fertilizer_frequency?: string;
    pruning_info?: string;
    companions?: string;
    care_level?: string;
    sun_exposure?: string;
  };
}> {
  try {
    console.log('Calling Edge Function identify-plant...');

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('identify-plant', {
      body: { image: base64Image },
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw error;
    }

    console.log('Plant identified:', data);

    return data as {
      species?: string;
      variety?: string;
      confidence?: string;
      description?: string;
      care_info?: {
        climate?: string;
        watering_frequency?: string;
        fertilizer_frequency?: string;
        pruning_info?: string;
        companions?: string;
        care_level?: string;
        sun_exposure?: string;
      };
    };
  } catch (error) {
    console.error('Error calling identify-plant Edge Function:', error);
    // Return empty object on error
    return {
      species: undefined,
      variety: undefined,
      confidence: 'low',
      description: 'No se pudo identificar la planta',
    };
  }
}

/**
 * Fallback keyword parser
 */
function extractPotMetadataKeyword(transcript: string): Partial<PotFormData> {
  const metadata: Partial<PotFormData> = {};
  const lowerTranscript = transcript.toLowerCase();

  // Extract Name: "se llama [X]" or "nombre [X]"
  const nameMatch =
    lowerTranscript.match(/se llama\s+([a-z0-9\s]+)/i) ||
    lowerTranscript.match(/nombre\s+([a-z0-9\s]+)/i);
  if (nameMatch && nameMatch[1]) {
    // Take up to the next keyword or end of string
    const rawName = nameMatch[1].trim();
    const cleanName = rawName.split(/\s+(y|e|la|el|es)\s+/)[0]; // Simple stop condition
    metadata.name = capitalize(cleanName);
  }

  // Extract Species: "es un [X]" or "planta [X]" or "especie [X]"
  const speciesMatch =
    lowerTranscript.match(/es un\s+([a-z0-9\s]+)/i) ||
    lowerTranscript.match(/es una\s+([a-z0-9\s]+)/i) ||
    lowerTranscript.match(/planta\s+([a-z0-9\s]+)/i) ||
    lowerTranscript.match(/especie\s+([a-z0-9\s]+)/i);

  if (speciesMatch && speciesMatch[1]) {
    const rawSpecies = speciesMatch[1].trim();
    const cleanSpecies = rawSpecies.split(/\s+(y|e|la|el|se|con)\s+/)[0];
    metadata.species = capitalize(cleanSpecies);
  }

  // Extract Seed Type: "semilla [X]" or "tipo [X]"
  const seedMatch =
    lowerTranscript.match(
      /semilla\s+(?:es\s+)?(?:de\s+)?(?:tipo\s+)?([a-z0-9\s]+)/i,
    ) || lowerTranscript.match(/tipo\s+([a-z0-9\s]+)/i);

  if (seedMatch && seedMatch[1]) {
    const rawSeed = seedMatch[1].trim();
    const cleanSeed = rawSeed.split(/\s+(y|e|la|el)\s+/)[0];
    metadata.seed_type = capitalize(cleanSeed);
  }

  // Add the full transcript as notes for context IF not redundant?
  // actually, for fallback, it's good to keep it.
  if (!metadata.notes) {
    metadata.notes = `Voice note search: "${transcript}"`;
  }

  console.log('Extracted metadata (keyword):', metadata);
  return metadata;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export async function generateBudgetIcon(name: string): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('generate-budget-icon', {
      body: { name },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    if (error) throw error;
    return data.icon || '📌';
  } catch (error) {
    console.error('Error generating budget icon:', error);
    return '📌';
  }
}
