// ============================================================
// Baraja — Image Template Prompts
// Generator for visual Physical Print Templates
//
// ARCHITECTURE:
//   Step 1 → buildArtDirectorMetaPrompt()  → sent to Gemini Flash
//            Flash generates a rich visual-only image prompt
//   Step 2 → buildStructuralConstraints()  → appended AFTER Flash's prompt
//            Deterministic layout rules about zones, borders, forbidden content
// ============================================================

// ─── Card Types ──────────────────────────────────────────────────────────────
export type CardType =
  | 'therapeutic'  // Regulatory exercises, emotional techniques (Barómetro, Cable a Tierra)
  | 'trivia'       // Questions & answers (trivia decks)
  | 'party'        // Social games, dares, icebreakers (Rompelo, party games)
  | 'game'         // Game mechanics with rules/instructions
  | 'custom';      // Generic / user-defined

// ─── Layout Zones ────────────────────────────────────────────────────────────
// Each `true` zone is an area where text content will be overlaid.
// The AI must keep those areas visually calm so text remains legible.
export interface CardLayout {
  /** Full-bleed borderless background (true) vs. with a visible decorative frame (false) */
  borderless: boolean;
  /** Top strip (~top 15%): small header text — category, "cuándo usarla", etc. */
  hasHeaderZone: boolean;
  /** Central body (~15%–72%): main content area — the phrase, question, title */
  hasBodyZone: boolean;
  /** Portrait zone (~25%–70%): reserved circular/rectangular image space */
  hasCentralImageZone: boolean;
  /** Footer strip (~bottom 18%): secondary text — answer, instruction, variant */
  hasFooterZone: boolean;
}

// ─── Main Metadata Interface ──────────────────────────────────────────────────
export interface BarajaTemplateMetadata {
  /** Rich textual description of the deck's visual mood — aesthetic keywords for the Art Director */
  themeDescription: string;
  /** Semantic type of card — used to adapt Art Director tone and structural constraints */
  cardType?: CardType;
  /** Which face of the physical card we're generating art for */
  face?: 'front' | 'back';
  /** Content zone layout — specifies where text will be overlaid and what must stay clean */
  layout: CardLayout;
  /** Optional dominant brand color (hex) to hint the palette */
  primaryColorHex?: string;
  /**
   * @deprecated Use `layout.borderless` instead.
   * Kept for backwards compatibility with existing vite.config.ts call sites.
   */
  enforceBorderless?: boolean;
  /** @deprecated Use `layout` zones instead */
  layoutFields?: Array<{ label: string; typicalLength: 'short' | 'medium' | 'long' }>;
  /** @deprecated Use `layout.hasHeaderZone` */
  hasTitleDivider?: boolean;
  /** @deprecated Use `layout.hasFooterZone` */
  hasFooterDivider?: boolean;
  hasImagePortrait?: boolean;
  /** Active text fields to frame in the background */
  dynamicFields?: string[];
}

// ─── Card type descriptions for Art Director context ─────────────────────────
const CARD_TYPE_CONTEXT: Record<CardType, { label: string; visualHint: string }> = {
  therapeutic: {
    label: 'Therapeutic / Introspective Card',
    visualHint:
      'Calm, grounding, and serene. The aesthetic should evoke safety and emotional clarity. Soft organic textures, gentle gradients, soothing palettes. NOT clinical.',
  },
  trivia: {
    label: 'Trivia / Quiz Card',
    visualHint:
      'Bold, energetic, and competitive. Sharp geometric shapes, high-contrast accents, quiz-show energy. Makes players feel the tension of a question.',
  },
  party: {
    label: 'Party / Social Game Card',
    visualHint:
      'Vibrant, playful, and irreverent. Saturated colors, dynamic composition, fun pop energy. Should feel like the card wants to be picked up.',
  },
  game: {
    label: 'Game Mechanic Card',
    visualHint:
      'Clear and structured with strong visual hierarchy. Modern game design aesthetic — bold colors, clean lines, graphic precision. Functional beauty.',
  },
  custom: {
    label: 'Custom Card',
    visualHint:
      'Elegant and minimal. Clean premium design with subtle accents. Let the thematic description guide the specific direction.',
  },
};

// ─── Layout preset descriptions ───────────────────────────────────────────────
function describeLayout(layout: CardLayout): string {
  const activeZones: string[] = [];

  if (layout.hasHeaderZone) {
    activeZones.push(
      '• TOP EDGE AREA: Low detail zone. Let the background color or subtle texture flow here continuously, but do not draw any prominent shapes or lines.'
    );
  }
  if (layout.hasBodyZone) {
    activeZones.push(
      '• WIDE MIDDLE AREA: The calmest part of the design. The background texture must continue smoothly through this area, but keep it extremely low-contrast and free of busy patterns or focal points. This area must breathe.'
    );
  }
  if (layout.hasCentralImageZone) {
    activeZones.push(
      '• CENTER CUTOUT: Leave a soft, plain area in the very center. The surrounding illustrative elements should frame this center.'
    );
  }
  if (layout.hasFooterZone) {
    activeZones.push(
      '• BOTTOM EDGE AREA: Low detail zone. Continue the background colors smoothly, but keep it very calm without decorative shapes.'
    );
  }

  const baseInstructions = [
    'CONTENT READABILITY ZONES: You MUST adjust the background details in the following areas so text can be overlaid later:',
    '',
    ...activeZones,
    '',
    'VISUAL STRATEGY: The artwork must flow edge-to-edge as a single continuous image. However, push ALL heavy visual complexity, prominent textures, and decorative focal points strictly toward the OUTER MARGINS. Keep the readability zones listed above very calm and low-contrast.',
  ].join('\n');
  
  return baseInstructions;
}

function describeDynamicFields(fields: string[] | undefined): string {
  if (!fields || fields.length === 0) return '';
  return `
⚠️ CRITICAL BACKGROUND DIRECTIVE:
You are generating PURE background art.
DO NOT draw any placeholder boxes, rectangles, banners, lines, or empty containers for text. 
The background should be a seamless, unified artistic canvas.
Text and dynamic containers will be overlaid programmatically later as separate SVG layers, so your image must remain purely textural and illustrative without any explicit layout boxes baked into the pixels.`;
}

// ─── Part 1: Art Director Meta-Prompt (sent to Gemini Flash) ─────────────────
// Flash reads the deck context and generates a complete visual-only image prompt.

export function buildArtDirectorMetaPrompt(metadata: BarajaTemplateMetadata): string {
  const cardType: CardType = metadata.cardType ?? 'custom';
  const typeContext = CARD_TYPE_CONTEXT[cardType];
  const layout = metadata.layout ?? {
    borderless: metadata.enforceBorderless === true, // Default to FALSE (framed) if not explicitly borderless
    hasHeaderZone: metadata.hasTitleDivider ?? false,
    hasBodyZone: true,
    hasCentralImageZone: metadata.hasImagePortrait ?? false,
    hasFooterZone: metadata.hasFooterDivider ?? false,
  };
  const isBorderless = layout.borderless;
  return `You are an expert Art Director for a modern, premium design studio.

You are designing RAW DIGITAL ARTWORK. 
CRITICAL: Do NOT generate a photograph, 3D mockup, or a picture of an object lying on a surface. The entire image you generate IS the 2D canvas itself and must bleed to the absolute edges. DO NOT draw rounded corners or white borders.
Your aesthetic is CLEAN, CONTEMPORARY, and tailored to the following emotional context:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CARD CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Card Type: ${typeContext.label}
Visual Tone: ${typeContext.visualHint}

Deck Theme / Aesthetic Brief:
${metadata.themeDescription}
${metadata.primaryColorHex ? `\nBrand Color: ${metadata.primaryColorHex}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN PHILOSOPHY — pick ONE of these 3 base styles that best matches the card type above, BUT INVENT A WILDLY UNIQUE TAKE ON IT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A) MINIMAL GEOMETRIC — thin clean lines, simple geometric shapes (circles, arcs, triangles), generous negative space, Apple-like precision. Best for: therapeutic, custom.
B) SMOOTH GRADIENT — a beautiful gradient or color wash that fills the entire canvas. Silky transitions between 2–3 harmonious colors, subtle noise texture for richness. Best for: therapeutic, custom.
C) MODERN ILLUSTRATIVE — a stylized abstract pattern or motif relevant to the deck theme. Flat or semi-flat, bold colors, clean edges. Think: editorial illustration, Headspace app, modern game packaging. Best for: trivia, party, game.

⚠️ DYNAMIC VARIANCE REQUIRED: 
DO NOT simply output "split diagonally color block" every time. You MUST invent a COMPLETELY UNIQUE, highly specific visual concept every time (e.g. swirling liquid neon, brutalist textured paper clippings, futuristic isometric tech-grid, glowing cyber-botanicals, abstract organic blobs). Let your creativity run wild based on the theme! Ensure the color palette and composition is fresh and surprising.

⚠️ ABSOLUTE RULE — THIS IS A PRINTED CARD CANVAS:
The generated image will have text and game content printed directly on top.
You MUST NOT depict any people, faces, human figures, characters, animals, or living creatures anywhere in the image.
You MAY use small decorative shapes, stars, icons, patterns, textures, gradients, and graphic motifs.
Any large detailed characters in the background will destroy the final printed card's readability.

RULES FOR YOUR OUTPUT:
1. Output ONLY the image generation prompt text. No markdown, no explanation, no preamble.
2. Describe VISUAL elements only — colors, shapes, textures, lighting, composition.
3. The image must be 100% text-free and symbol-free.
${isBorderless ? '4. The image must be entirely BORDERLESS — fills edge to edge with no frames or margins.' : '4. The image MUST feature a STRONG decorative border or frame around the perimeter — this frames the content canvas.'}
5. NEVER use the words: "deck", "tarot", "poker", "game", "filigree", "ornate", "scrollwork", "baroque".
6. Keep the prompt to 3–5 sentences. Be specific about colors, textures, and composition.
7. NEVER include people, human figures, faces, silhouettes, hands, bodies, or any living being. Small decorative graphic shapes (like stars or dots) ARE allowed if they fit the theme.

ENCOURAGED ELEMENTS (pick 1–2 depending on style):
- ${isBorderless ? 'Clean lines, smooth curves, geometric precision' : 'Strong border lines, thick elegant framing edges, corner ornaments (geometric, not baroque)'}
- Palette derived from the brand color or deck visual mood
- Soft gradients, subtle grain/noise, layered transparency
- Generous whitespace or breathing room in the center
- Frosted glass effects, subtle blur, depth layers`;
}

// ─── Part 2: Structural Constraints (deterministic, always applied) ───────────
// These are appended AFTER Flash's visual prompt to enforce layout/print rules.

export function buildStructuralConstraints(metadata: BarajaTemplateMetadata): string {
  const layout: CardLayout = metadata.layout ?? {
    borderless: metadata.enforceBorderless === true, // Default to FALSE (framed)
    hasHeaderZone: metadata.hasTitleDivider ?? false,
    hasBodyZone: true,
    hasCentralImageZone: metadata.hasImagePortrait ?? false,
    hasFooterZone: metadata.hasFooterDivider ?? false,
  };
  const parts: string[] = [];

  // 1. Card identity
  parts.push(
    `PRINT CONTEXT: This is RAW DIGITAL ARTWORK. You are generating a flat, 2D background pattern/illustration. ABSOLUTE RULE: DO NOT generate a 3D mockup, DO NOT draw a card shape, DO NOT draw rounded corners, and DO NOT add white margins. The artwork MUST fill the entire canvas edge-to-edge as a continuous bleed.`
  );

  // 2. Border / composition rule
  if (layout.borderless) {
    parts.push(
      'COMPOSITION: BORDERLESS full-bleed design. The background MUST fill the entire canvas edge-to-edge. No interior lines, no frames, no panels, no corner decorations.'
    );
  } else {
    parts.push(
      'COMPOSITION: FRAMED design. The image MUST feature a DISTINCT, PROMINENT border or structural frame running along all outer edges. The frame should clearly delineate the content canvas inside. Do NOT produce a borderless image.'
    );
  }

  // 3. Dynamic content zone instructions
  const layoutDesc = describeLayout(layout);
  parts.push(layoutDesc);
  
  const dynamicFieldsDesc = describeDynamicFields(metadata.dynamicFields);
  if (dynamicFieldsDesc) {
     parts.push(dynamicFieldsDesc);
  }

  // 4. Universal forbidden rules
  parts.push(
    'STRICTLY FORBIDDEN — NO TEXT: Do not draw any letters, numbers, symbols, icons, or typography of any kind. The canvas must be 100% text-free.'
  );
  parts.push(
    'STRICTLY FORBIDDEN — NO LIVING BEINGS: Do not depict any people, faces, human figures, silhouettes, hands, bodies, animals, or animated characters. This is a background canvas. Small abstract graphic elements (like stars, geometric shapes, or delicate thematic motifs) ARE allowed.'
  );

  return parts.join('\n\n');
}

// ─── Convenience: Layout Presets ─────────────────────────────────────────────
// Pre-built layout configurations for common card types.

export const LAYOUT_PRESETS: Record<string, { label: string; description: string; layout: CardLayout }> = {
  'front-illustration': {
    label: 'Frente — Solo ilustración',
    description: 'Cara frontal. Arte puro, sin zonas de contenido. El canvas es la ilustración.',
    layout: { borderless: true, hasHeaderZone: false, hasBodyZone: false, hasCentralImageZone: false, hasFooterZone: false },
  },
  'back-standard': {
    label: 'Reverso estándar (Header + Cuerpo + Footer)',
    description: 'Carta típica con 3 zonas: categoría arriba, contenido principal al centro, respuesta/instrucción abajo.',
    layout: { borderless: false, hasHeaderZone: true, hasBodyZone: true, hasCentralImageZone: false, hasFooterZone: true },
  },
  'back-body-only': {
    label: 'Reverso — Solo cuerpo expandido',
    description: 'Máximo espacio para texto largo (ejercicios, instrucciones extensas). Sin header ni footer.',
    layout: { borderless: false, hasHeaderZone: false, hasBodyZone: true, hasCentralImageZone: false, hasFooterZone: false },
  },
  'back-with-portrait': {
    label: 'Reverso — Con zona de retrato central',
    description: 'Carta estilo coleccionable/póker con imagen central, header y footer.',
    layout: { borderless: false, hasHeaderZone: true, hasBodyZone: false, hasCentralImageZone: true, hasFooterZone: true },
  },
  'back-borderless-body': {
    label: 'Reverso — Fondo continuo + cuerpo',
    description: 'Fondo full-bleed sin borde visible, con zona de cuerpo principal.',
    layout: { borderless: true, hasHeaderZone: true, hasBodyZone: true, hasCentralImageZone: false, hasFooterZone: true },
  },
};

// ─── Legacy: combined prompt for "Ver prompt" display ─────────────────────────
// Used ONLY for admin UI preview. Actual generation uses the 2-step pipeline.

export function buildMasterTemplatePrompt(metadata: BarajaTemplateMetadata): string {
  return [
    '(Structural template — full visual prompt generated dynamically by Gemini Flash at generation time)',
    '',
    buildStructuralConstraints(metadata),
  ].join('\n');
}
