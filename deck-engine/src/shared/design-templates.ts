// ============================================================
// Baraja.cards — Design Templates
// Named design presets for each visual identity.
// Each edition registers its template here.
// ============================================================

import type { DeckDesign } from '../types.js';

export const DESIGN_TEMPLATES = {
  // Cable a Tierra: dark premium, gold accents, Cormorant serif
  'dark-minimal-01': {
    template_id: 'dark-minimal-01',
    primary_color: '#0c0b09',
    accent_color: '#d4af64',
    font_heading: 'Cormorant Garamond',
    font_body: 'Inter',
  },
  // Future: light/cream edition
  'cream-classic-01': {
    template_id: 'cream-classic-01',
    primary_color: '#f5f0e8',
    accent_color: '#2c2416',
    font_heading: 'Cormorant Garamond',
    font_body: 'Inter',
  },
  // Cable a Tierra (Earthy redesign)
  'earthy-minimal-01': {
    template_id: 'earthy-minimal-01',
    primary_color: '#f4f1ea',
    accent_color: '#9c6d46',
    font_heading: 'Cormorant Garamond',
    font_body: 'Inter',
    background: '#f4f1ea',
    text_color: '#2c2419',
    surface_color: '#eae5dc'
  },
} as const satisfies Record<string, DeckDesign>;

export type DesignTemplateId = keyof typeof DESIGN_TEMPLATES;
