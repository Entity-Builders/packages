import { z } from 'zod';

// We map the RawDeckContent structure so Gemini outputs precisely this.
// We exclude print_spec_id, design_template_id, and pricing from AI generation
// as those are technical configuration parameters we inject manually later,
// but we include them as optional/defaultable if we want the schema fully compliant.

export const CardFrontSchema = z.object({
  art_prompt: z.string().describe('Highly detailed AI visual prompt meant for Midjourney/DALL-E. No text. Describes the abstract fine art aesthetic matching the deck tone.'),
  title: z.string().describe('The short, punchy proper name of the card. e.g., "La Promesa", "La Pausa"'),
  number: z.number().int().describe('Sequential number in the deck (1 to card_count)'),
});

export const CardBackSchema = z.object({
  phrase: z.string().describe('A short editorial hook or mood line. It supports the card tone but is secondary to the instruction for social, trivia, team, and learning decks.'),
  when_to_use: z.string().describe('One-line context for when the user might pull or need this card.'),
  instruction: z.string().describe('The primary playable payload: the action, question, mechanic, or reflection the user should actually do. If it is a trivia or question, provide the question here.'),
  answer: z.string().optional().describe('For trivia cards ONLY: The concise answer to the trivia question.'),
});

export const CardSchema = z.object({
  id: z.string().describe('A unique identifier, e.g., "deck-prefix-01"'),
  front: CardFrontSchema,
  back: CardBackSchema,
  tags: z.array(z.string()).describe('List of 3 relevant string tags'),
});

export const DeckMetadataSchema = z.object({
  topic: z.string().describe('The core topic or emotional goal of the deck.'),
  tone: z.string().describe('Intended tone of the copy. e.g., "Honest, calm, earthy"'),
  target_audience: z.string().describe('Description of who this deck is for.'),
  player_count: z.string().describe('Number of players, e.g., "1" or "2+"'),
});

export const DeckGenerationSchema = z.object({
  name: z.string().describe('The name of the edition'),
  description: z.string().describe('Short commercial description (max 2 lines) avoiding cliché words.'),
  language: z.enum(['es', 'en']).describe('Language of the deck content'),
  card_count: z.number().int().describe('Total number of cards to generate'),
  metadata: DeckMetadataSchema,
  cards: z.array(CardSchema).describe('The fully generated cards'),
});

export type DeckGenerationResult = z.infer<typeof DeckGenerationSchema>;
