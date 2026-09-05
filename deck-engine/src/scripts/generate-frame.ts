#!/usr/bin/env node

/**
 * Baraja AI Frame Generator
 * 
 * Usage:
 * yarn workspace @entity-builders/deck-engine frame "dark minimalist luxury geometric card frame, glowing dark background, blank center"
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_PUBLIC_DIR = path.resolve(__dirname, '../../../../apps/baraja/public/frames');

// Load environment variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function main() {
  const args = process.argv.slice(2);
  const promptArg = args[0];

  if (!promptArg || promptArg.startsWith('--')) {
    console.error('Usage: yarn workspace @entity-builders/deck-engine frame "<prompt>"');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }

  console.log(`\n🖼️ Baraja Frame Generator`);
  console.log(`Prompt: "${promptArg}"`);

  // Ensure output directory exists
  await fs.mkdir(FRONTEND_PUBLIC_DIR, { recursive: true });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
    
    // Add specific style rules for standardizing card frames
    const fullPrompt = `${promptArg}. Flat 2D graphic design asset, portrait orientation, aspect ratio 70x120. Minimalist geometric frame outline. Dark themed. No center text.`;
    
    // Default aspect ratio for gemini-2.5-flash-image can be passed. 
    // Usually 9:16 or 3:4 is closest to tarot (70:120 is roughly 9:16)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: { 
          responseModalities: ['IMAGE'],
          // Provide aspect ratio to get closer to 70x120
          // "aspectRatio": "9:16"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    
    const parts = data.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

    if (!imagePart?.inlineData?.data) {
      throw new Error("No imageBytes were returned by Gemini.");
    }

    const imageBytesBase64 = imagePart.inlineData.data;
    const buffer = Buffer.from(imageBytesBase64, 'base64');

    // Save to disk
    const assetFileName = `back-frame-ai-${Date.now()}.png`;
    const assetFilePath = path.resolve(FRONTEND_PUBLIC_DIR, assetFileName);
    await fs.writeFile(assetFilePath, buffer);

    console.log(`✅ Generated and saved: apps/baraja/public/frames/${assetFileName}`);
    console.log(`\nTo use it, update lib/cardFrame.ts:`);
    console.log(`export const FRAME_URL = '/frames/${assetFileName}';\n`);

  } catch (e: any) {
    console.error(`❌ Failed to generate frame`);
    console.error(e.message || e);
    process.exit(1);
  }
}

main();
