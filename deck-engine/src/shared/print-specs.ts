// ============================================================
// Baraja.cards — Print Specification Presets
// Named presets for print specs. Shared across all editions.
// To add a new spec, register it here and reference by ID.
// ============================================================

import type { PrintSpecs } from '../types.js';

export const PRINT_SPECS = {
  // Standard Baraja card: 350g matte, rounded corners, poker-size
  'baraja-standard': {
    paper_weight: '350g',
    finish: 'matte',
    rounded_corners: true,
    dimensions: { width: 88, height: 138, unit: 'mm' },
    bleed: 3,
    color_profile: 'CMYK',
  },
  // Lighter option for budget editions
  'baraja-light': {
    paper_weight: '300g',
    finish: 'matte',
    rounded_corners: true,
    dimensions: { width: 88, height: 138, unit: 'mm' },
    bleed: 3,
    color_profile: 'CMYK',
  },
  // Large horizontal card for trivia / immersive games like cinema
  'baraja-landscape': {
    paper_weight: '350g',
    finish: 'matte',
    rounded_corners: true,
    dimensions: { width: 88, height: 63, unit: 'mm' },
    bleed: 3,
    color_profile: 'CMYK',
  },
} as const satisfies Record<string, PrintSpecs>;

export type PrintSpecId = keyof typeof PRINT_SPECS;
