// Example: How to use @eb-packages/ai-services in your app
// This file demonstrates the proper way to import and use the AI services

import {
  extractPotMetadata,
  type PotMetadata,
  GeminiAPIError,
} from '@eb-packages/ai-services';

// Example usage in a React component or service
async function handleTranscript(transcript: string, apiKey: string) {
  try {
    const metadata: PotMetadata = await extractPotMetadata(transcript, {
      apiKey,
    });

    console.log('Extracted metadata:', metadata);
    return metadata;
  } catch (error) {
    if (error instanceof GeminiAPIError) {
      console.error('AI service error:', error.message, error.status);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
