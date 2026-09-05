#!/usr/bin/env node

/**
 * Baraja AI Edition Generator
 * 
 * Usage:
 * export GEMINI_API_KEY="..." # (If not already in environment)
 * npx tsx src/scripts/create-edition.ts "Mazo para romper el hielo en la primera cita" --cards 10
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, '../content');

// Load environment variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
import { BARAJA_SYSTEM_PROMPT, getBuildDeckPrompt } from '../generator/prompts.js';
import { DeckGenerationSchema, DeckGenerationResult } from '../generator/schemas.js';

async function main() {
  const args = process.argv.slice(2);
  let topic = args[0];
  let cardCount = 30; // default to full deck
  let additionalContext = '';
  
  // Basic arg parsing
  const cardFlagIndex = args.indexOf('--cards');
  if (cardFlagIndex > -1 && args[cardFlagIndex + 1]) {
    cardCount = parseInt(args[cardFlagIndex + 1], 10);
  }

  const ctxFlagIndex = args.indexOf('--context');
  if (ctxFlagIndex > -1 && args[ctxFlagIndex + 1]) {
    additionalContext = args[ctxFlagIndex + 1];
  }

  // Refine topic to make sure we don't grab flags
  if (topic && topic.startsWith('--')) {
    topic = '';
  }

  if (!topic) {
    console.error('Usage: yarn workspace @entity-builders/deck-engine generate "Your topic string" [--cards N] [--context "Additional instructions"]');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }

  console.log(`\n🃏 Baraja Deck Engine`);
  console.log(`Generating edition about: "${topic}" (${cardCount} cards)`);
  console.log(`Booting AI Pipeline...\n`);

  const ai = new GoogleGenAI({ apiKey });

  const aiSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      language: { type: 'string' },
      card_count: { type: 'integer' },
      metadata: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          tone: { type: 'string' },
          target_audience: { type: 'string' },
          player_count: { type: 'string' }
        },
        required: ["topic", "tone", "target_audience", "player_count"]
      },
      cards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            front: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                number: { type: 'integer' },
                art_prompt: { type: 'string' }
              },
              required: ["title", "number", "art_prompt"]
            },
            back: {
              type: 'object',
              properties: {
                phrase: { type: 'string' },
                when_to_use: { type: 'string' },
                instruction: { type: 'string' }
              },
              required: ["phrase", "when_to_use", "instruction"]
            },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ["id", "front", "back", "tags"]
        }
      }
    },
    required: ["name", "description", "language", "card_count", "metadata", "cards"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: getBuildDeckPrompt(topic, cardCount, additionalContext),
      config: {
        systemInstruction: BARAJA_SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: aiSchema as any,
      }
    });

    let rawJson = response.text;
    if (!rawJson) throw new Error("No text returned from Gemini");
    
    // Strip markdown formatting if Gemini ignored the instruction
    rawJson = rawJson.replace(/^```json/mi, '').replace(/```$/m, '').trim();

    console.log("Response received. Validating against schema...");
    let parsed: DeckGenerationResult;
    try {
      const data = JSON.parse(rawJson);
      parsed = DeckGenerationSchema.parse(data);
    } catch (e) {
      console.error("Failed to parse or validate JSON from Gemini.");
      console.error(e);
      // Dump to tmp for debugging
      const dumpPath = path.resolve(CONTENT_DIR, 'failed_dump.json');
      await fs.writeFile(dumpPath, rawJson, 'utf-8');
      console.log(`Dumped raw output to ${dumpPath}`);
      process.exit(1);
    }

    // Assemble the final RawDeckContent schema
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const finalId = `${slug}-v1`;

    const rawDeckContent = {
      id: finalId,
      edition: slug,
      name: parsed.name,
      slug: slug,
      description: parsed.description,
      language: parsed.language,
      card_count: parsed.cards.length,
      metadata: parsed.metadata,
      print_spec_id: "baraja-standard", // Default assumed, devs can change it
      design_template_id: "dark-minimal-01", // Default assumed
      pricing: {
        amount: 1500000,
        currency: "ars"
      },
      cards: parsed.cards
    };

    const outputPath = path.resolve(CONTENT_DIR, `${slug}.json`);
    await fs.writeFile(outputPath, JSON.stringify(rawDeckContent, null, 2), 'utf-8');

    console.log(`\n✅ Edition created successfully!`);
    console.log(`Saved to: packages/deck-engine/src/content/${slug}.json`);
    console.log(`Name: ${parsed.name}`);
    console.log(`Cards generated: ${parsed.cards.length}`);
    console.log(`Tone: ${parsed.metadata.tone}\n`);

  } catch (err: any) {
    console.error("Fatal generation error:");
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
