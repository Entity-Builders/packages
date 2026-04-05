#!/usr/bin/env node

/**
 * Baraja AI Art Generator
 * 
 * Usage:
 * yarn workspace @eb-packages/deck-engine art "barometro"
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { RawDeckContent } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, '../content');
const FRONTEND_PUBLIC_DIR = path.resolve(__dirname, '../../../../apps/baraja/public/assets/editions');

// Load environment variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function main() {
  const args = process.argv.slice(2);
  const slug = args[0];

  if (!slug || slug.startsWith('--')) {
    console.error('Usage: yarn workspace @eb-packages/deck-engine art <edition-slug>');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const jsonPath = path.resolve(CONTENT_DIR, `${slug}.json`);
  if (!existsSync(jsonPath)) {
    console.error(`Error: Edition file not found at ${jsonPath}`);
    process.exit(1);
  }

  console.log(`\n🎨 Baraja Art Pipeline`);
  console.log(`Loading edition: "${slug}"`);

  // Load JSON
  const rawData = await fs.readFile(jsonPath, 'utf-8');
  let deck: RawDeckContent;
  try {
    deck = JSON.parse(rawData);
  } catch (e) {
    console.error("Failed to parse JSON.");
    process.exit(1);
  }

  // Ensure output directory exists
  const editionAssetsDir = path.resolve(FRONTEND_PUBLIC_DIR, slug);
  await fs.mkdir(editionAssetsDir, { recursive: true });

  const ai = new GoogleGenAI({ apiKey });

  let newImagesGenerated = 0;

  for (let i = 0; i < deck.cards.length; i++) {
    const card = deck.cards[i];

    if (card.front.art_url) {
      console.log(`[${i + 1}/${deck.cards.length}] Skipping ${card.id} (Already has art_url)`);
      continue;
    }

    console.log(`\n[${i + 1}/${deck.cards.length}] Generating art for: ${card.id}`);
    console.log(`Prompt: "${card.front.art_prompt}"`);

    try {
      // Based on PostalPeek's fallback - direct REST call to gemini-2.5-flash-image
      // We don't use @google/genai SDK here because the image endpoint routing can be finicky there
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: card.front.art_prompt }]
          }],
          generationConfig: { 
            responseModalities: ['IMAGE'] 
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
      const assetFileName = `${card.id}.jpg`;
      const assetFilePath = path.resolve(editionAssetsDir, assetFileName);
      await fs.writeFile(assetFilePath, buffer);

      // Inject URL into JSON object
      // The frontend serves static assets from /assets/editions/{slug}
      const publicUrl = `/assets/editions/${slug}/${assetFileName}`;
      card.front.art_url = publicUrl;

      console.log(`✅ Saved: ${publicUrl}`);
      newImagesGenerated++;

      // Write JSON to disk iteratively to save progress in case of crash
      await fs.writeFile(jsonPath, JSON.stringify(deck, null, 2), 'utf-8');

      // Simple rate-limiting to avoid hitting generic quotas (usually 30 per min for Imagen)
      await new Promise(r => setTimeout(r, 2000));

    } catch (e: any) {
      console.error(`❌ Failed to generate art for ${card.id}`);
      console.error(e.message || e);
      // Wait a bit before continuing to next card in case of temporary error
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`\n🎉 Art Pipeline finished!`);
  console.log(`Generated ${newImagesGenerated} new images for ${slug}.`);
}

main();
