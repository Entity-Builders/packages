// ============================================================
// Baraja.cards — Deck Loader
// Resolves a RawDeckContent (from JSON) into a full DeckSchema
// by replacing preset IDs with their actual objects.
// ============================================================

import { PRINT_SPECS } from './shared/print-specs.js';
import { DESIGN_TEMPLATES } from './shared/design-templates.js';
import type { DeckSchema, RawDeckContent } from './types.js';

/**
 * Resolves a raw deck content object (from a JSON file) into a fully
 * typed DeckSchema by looking up print_spec_id and design_template_id.
 *
 * Throws if any referenced preset does not exist.
 */
export function resolveDeck(raw: RawDeckContent): DeckSchema {
  const print_specs = PRINT_SPECS[raw.print_spec_id];
  let design = DESIGN_TEMPLATES[raw.design_template_id];

  if (!print_specs) {
    throw new Error(
      `[deck-engine] Unknown print_spec_id: "${raw.print_spec_id}". ` +
      `Available: ${Object.keys(PRINT_SPECS).join(', ')}`
    );
  }

  if (!design) {
    // If it's not a built-in static template, it might be a DB-driven dynamic template.
    // We provide a fallback, and rely on design_template_overrides injected at runtime.
    design = {
      template_id: raw.design_template_id as any,
      primary_color: '#0c0b09',
      accent_color: '#d4af64',
      font_heading: 'Cormorant Garamond',
      font_body: 'Inter',
    };
  }

  const { 
    print_spec_id, 
    design_template_id, 
    print_specs_overrides, 
    design_template_overrides, 
    ...rest 
  } = raw;
  void print_spec_id;
  void design_template_id;

  return { 
    ...rest, 
    print_specs: { ...print_specs, ...(print_specs_overrides || {}) }, 
    design: { ...design, ...(design_template_overrides || {}) } 
  };
}

/**
 * Validates that card_count matches the actual number of cards.
 * Useful during content authoring to catch mismatches.
 */
export function validateDeck(deck: DeckSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (deck.card_count !== deck.cards.length) {
    errors.push(
      `card_count (${deck.card_count}) doesn't match actual cards (${deck.cards.length})`
    );
  }

  const numbers = deck.cards.map((c) => c.front.number);
  const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate card numbers: ${duplicates.join(', ')}`);
  }

  const missingArt = deck.cards.filter((c) => !c.front.art_prompt);
  if (missingArt.length > 0) {
    errors.push(`Cards missing art_prompt: ${missingArt.map((c) => c.id).join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
