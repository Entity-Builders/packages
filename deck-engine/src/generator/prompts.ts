// ============================================================
// Baraja — Prompt Engineering
// Type-specific prompt builders for deck generation.
// ============================================================

export type DeckType = 'trivia' | 'introspection' | 'party' | 'custom';
export type TriviaDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

// ── System Prompt ─────────────────────────────────────────────

export const BARAJA_SYSTEM_PROMPT = `
You are the master designer and copywriter for "Baraja", a premium, emotionally-resonant card deck product.
Your job is to generate a complete, coherent deck edition.

# BARAJA DEFINITION
A "Baraja Edition" is a physical deck of cards designed to provoke thought, ground the user, or break the ice. They are not cheap games; they are beautifully crafted introspective tools.

# THE CARDS
Each card has a Front (visual art + title) and a Back (phrase + instruction).

## Copywriting Rules (CRITICAL)
- **NO clichés:** Never use words like "transform", "journey", "synergy", "find your true self", "magic", "empower".
- **Tone:** Direct, visceral, honest. Talk to the user like a close friend telling them the hard truth over coffee. No sugarcoating, no toxic positivity.
- **Titles (Front):** Should be conceptual and punchy. "El Miedo" (The Fear), "La Pausa" (The Pause), "La Decisión" (The Decision).
- **Phrases (Back):** Must be hard-hitting and undeniable. Example: "No tenés que empezar bien. Tenés que empezar." (You don't have to start well. You have to start.)
- **Instructions (Back):** Grounding and actionable exercises. NOT abstract. Bad: "Think about your life." Good: "Write down the two options. Read them out loud. Your body already knows which one."
- **When to Use:** A quick context indicator. Example: "Para cuando el miedo te paraliza." (For when fear paralyzes you.)

## Art Prompts (Front) — CRITICAL: CONTEXTUAL ENRICHMENT
Instead of producing actual images, you produce highly detailed AI image prompts that will be used to generate illustrations via Gemini/DALL-E.

### Style Rules
- **Style Flexibility:** The default aesthetic is abstract, fine art, expressionist, or textured. **HOWEVER**, if the requested topic is a game, pop culture, sports, or trivia, you MUST adapt the style to be realistic and contextually appropriate (e.g. "realistic sports photography", "vintage magazine style", "documentary photography").
- No text or watermarks in images. No generic stock-photo aesthetics.

### CONTEXTUAL ENRICHMENT (MANDATORY)
Every art prompt MUST include **real-world context** specific to the card's subject. Generic descriptions are UNACCEPTABLE. You must research and embed:
1. **Specific colors and uniforms**: e.g. "wearing a white jersey with a red diagonal stripe (River Plate colors)" — NOT "a player in a jersey"
2. **Real venues and settings**: e.g. "La Bombonera stadium with its iconic D-shape and steep terraces" — NOT "a stadium"
3. **Era-appropriate details**: e.g. "1978 World Cup, vintage film grain, Azteca Stadium" — NOT "old football"
4. **Cultural atmosphere**: e.g. "blue and gold ticker tape, La Boca neighborhood murals visible" — NOT "confetti"
5. **Emotional specificity**: e.g. "the loneliness of walking down the tunnel after a controversial exit" — NOT "sad moment"

### Bad vs Good Example
- ❌ BAD: "Action shot of a player running towards an empty net in a stadium, pure exhilaration."
- ✅ GOOD: "A footballer in a white jersey with a thick red diagonal stripe (River Plate colors) sprinting alone towards the goal in Santiago Bernabéu stadium, Madrid. Red and white confetti rains from the sky. Night game, 2018 Copa Libertadores Final atmosphere. Epic sports photography with dramatic stadium lighting."

The prompt should be rich enough that someone with no context could generate an accurate, contextually correct image.

# TASK
Generate a full Deck Edition exactly matching the requested schema and topic.
If the deck is a trivia or question-based game, you MUST include the actual question in the \`instruction\` field and the short, correct answer in the \`answer\` field.
Maintain the requested target language (usually Spanish, unless specified).
`;

// ── Art Style Instructions ────────────────────────────────────

const ART_STYLE_INSTRUCTIONS: Record<string, string> = {
  'abstract-fine-art': 'Art style: Abstract fine art, expressionist textures, impasto, chiaroscuro. No photographs.',
  'evocative-photography': 'Art style: Evocative photography — realistic scenes and objects, cinematic lighting, no recognizable faces unless specified.',
  'stylized-illustration': 'Art style: Flat vector-style illustration, like a vintage screen-printed poster. Bold colors, visible print texture, hand-drawn feel. NOT a photograph.',
  'vintage-photography': 'Art style: Vintage film photography with era-appropriate grain, warm tones, and analog imperfection.',
  'documentary': 'Art style: Raw documentary photography, journalistic framing, real-world feel.',
  'cinematic': 'Art style: Cinematic movie poster aesthetic — dramatic lighting, wide anamorphic framing, movie-color-grading, film grain. NOT stock photography.',
};

// ── Difficulty calibration ────────────────────────────────────

const DIFFICULTY_INSTRUCTIONS: Record<TriviaDifficulty, string> = {
  easy: `DIFFICULTY: EASY — All questions should be common knowledge. Things most people over 15 would know. Pop culture, mainstream facts, famous moments everyone has seen. Example: "¿En qué año se estrenó Toy Story?" → 1995`,
  medium: `DIFFICULTY: MEDIUM — Questions require some interest in the topic. Enthusiast-level knowledge. Example: "¿Qué director argentino ganó dos premios Oscar?" → Juan José Campanella (though his 2nd was José)`,
  hard: `DIFFICULTY: HARD — Deep cuts that only dedicated fans would know. Obscure facts, behind-the-scenes trivia, technical details. Example: "¿Cuál fue el primer film argentino nominado al Oscar a Mejor Película Internacional?" → La Tregua (1974)`,
  mixed: `DIFFICULTY: MIXED — Distribute difficulty across the deck: ~40% easy (accessible to anyone), ~35% medium (enthusiasts), ~25% hard (experts only). This creates a fun progression where everyone can answer some but nobody aces them all.`,
};

// ── Enrichment data types ─────────────────────────────────────

export interface EnrichedItem {
  title: string;
  year?: string;
  director?: string;
  genre?: string;
  actors?: string;
  plot?: string;
  poster?: string;
  imdbRating?: string;
  awards?: string;
  country?: string;
  wikiExtract?: string;
  [key: string]: string | undefined;
}

// ── Prompt Builders ───────────────────────────────────────────

interface BuildDeckOptions {
  topic: string;
  cardCount: number;
  deckType: DeckType;
  difficulty?: TriviaDifficulty;
  artStyle?: string;
  additionalContext?: string;
  enrichedData?: EnrichedItem[];
}

/** Legacy function — kept for backwards compatibility */
export const getBuildDeckPrompt = (topic: string, cardCount: number, additionalContext?: string) =>
  buildDeckPrompt({
    topic,
    cardCount,
    deckType: 'custom',
    additionalContext,
  });

/** Main prompt builder — dispatches to type-specific builders */
export function buildDeckPrompt(opts: BuildDeckOptions): string {
  const sections: string[] = [];

  // Header
  sections.push(`Create a new Baraja Edition with the following parameters:`);
  sections.push(`- **Topic/Theme:** ${opts.topic}`);
  sections.push(`- **Card Count:** ${opts.cardCount}`);
  sections.push(`- **Deck Type:** ${opts.deckType}`);

  // Art style
  if (opts.artStyle && ART_STYLE_INSTRUCTIONS[opts.artStyle]) {
    sections.push(`\n## Art Direction\n${ART_STYLE_INSTRUCTIONS[opts.artStyle]}`);
    sections.push(`Apply this art style consistently to ALL art_prompt fields in the deck.`);
  }

  // Type-specific sections
  switch (opts.deckType) {
    case 'trivia':
      sections.push(buildTriviaSection(opts));
      break;
    case 'introspection':
      sections.push(buildIntrospectionSection(opts));
      break;
    case 'party':
      sections.push(buildPartySection(opts));
      break;
    case 'custom':
    default:
      if (opts.additionalContext) {
        sections.push(`\n## Additional Instructions\n${opts.additionalContext}`);
      }
      break;
  }

  // JSON schema
  sections.push(JSON_SCHEMA_BLOCK);

  return sections.join('\n');
}

// ── Type-specific prompt sections ─────────────────────────────

function buildTriviaSection(opts: BuildDeckOptions): string {
  const parts: string[] = [];

  parts.push(`\n## Trivia Configuration`);

  // Difficulty
  if (opts.difficulty) {
    parts.push(DIFFICULTY_INSTRUCTIONS[opts.difficulty]);
  }

  // Anti-hallucination rules
  parts.push(`
### CRITICAL: Factual Accuracy & Game Design Rules
- Every question MUST have a single, verifiable correct answer.
- The \`answer\` field is MANDATORY for every card.
- NO ENCYCLOPEDIC QUESTIONS: Do not ask for release years, director names, or box office numbers. That is boring.
- FOCUS ON THE NARRATIVE: Create situational questions based on the Plot and Deep Lore. Make the player read a scene or a premise and guess the movie, or guess "what happens next", or identify a character's iconic action.
- Examples of GOOD questions: "En esta escena, un hombre planea una venganza usando un auto y una soga. ¿De qué película hablamos?" or "¿Qué objeto utiliza Ricardo Darín para romper el vidrio en Relatos Salvajes?"
- DO NOT invent facts. Use only the provided plot summaries and lore.
- The \`instruction\` field contains the trivia question.`);

  // Enriched data injection
  if (opts.enrichedData && opts.enrichedData.length > 0) {
    parts.push(`\n### 📦 VERIFIED REFERENCE DATA (Source: OMDB/External)`);
    parts.push(`Use ONLY the following verified data to generate questions. Do NOT invent additional facts beyond what is provided here. You may combine facts from different items for interesting cross-reference questions.`);
    parts.push('');

    for (const item of opts.enrichedData) {
      const lines = [`**${item.title}**`];
      if (item.year) lines.push(`  - Year: ${item.year}`);
      if (item.director) lines.push(`  - Director: ${item.director}`);
      if (item.actors) lines.push(`  - Actors: ${item.actors}`);
      if (item.genre) lines.push(`  - Genre: ${item.genre}`);
      if (item.plot) lines.push(`  - Plot: ${item.plot}`);
      if (item.awards) lines.push(`  - Awards: ${item.awards}`);
      if (item.imdbRating) lines.push(`  - IMDB Rating: ${item.imdbRating}`);
      if (item.country) lines.push(`  - Country: ${item.country}`);
      if (item.wikiExtract) lines.push(`\n  - Deep Lore / Trivia context:\n    ${item.wikiExtract}\n`);
      parts.push(lines.join('\n'));
    }

    parts.push(`\nGenerate 1-3 cards per item above, ensuring variety in question types (who, what, when, which). Total must equal ${opts.cardCount} cards.`);
  }

  // Art prompt enrichment for trivia
  parts.push(`
### Art Prompts for Trivia Cards
Each art_prompt must reference SPECIFIC visual elements from the card's subject:
- For movies: reference the actual movie poster aesthetic, specific scenes, era colors, cinematography style
- For sports: reference real team colors, specific stadiums, era-appropriate uniforms
- For music: reference album covers, concert venues, instrument details
- IMPORTANT: The art must NOT reveal the answer to the trivia question (anti-spoiler rule).`);

  if (opts.additionalContext) {
    parts.push(`\n### Additional Instructions\n${opts.additionalContext}`);
  }

  return parts.join('\n');
}

function buildIntrospectionSection(opts: BuildDeckOptions): string {
  return `
## Introspection Deck Rules
- Every card must provide an ACTIONABLE exercise, not just a thought.
- Instructions must be specific and physical: "Write down...", "Stand up and...", "Hold ice in your hand..."
- Avoid abstract self-help language. Be clinical, direct, and grounding.
- Tags should reference therapeutic modalities when applicable (DBT, ACT, TEPC, mindfulness).
- The \`when_to_use\` field must describe a specific emotional state, not a vague situation.
${opts.additionalContext ? `\n### Additional Instructions\n${opts.additionalContext}` : ''}`;
}

function buildPartySection(opts: BuildDeckOptions): string {
  return `
## Party/Social Deck Rules
- Cards must work for groups of 3+ people.
- Mix card types: ~30% questions/icebreakers, ~30% challenges/dares, ~40% creative/absurd prompts.
- Include a \`player_count_hint\` in the when_to_use field (e.g. "Para 4+ jugadores").
- Tone: descontracturado, fun, but never mean-spirited or exclusionary.
- Include mix of intensity levels: some soft/warm-up, some spicy, some wild.
- The \`instruction\` field should clearly describe the mechanic (who reads, who acts, how to score, etc.)
${opts.additionalContext ? `\n### Additional Instructions\n${opts.additionalContext}` : ''}`;
}

// ── JSON Schema block appended to all prompts ─────────────────

const JSON_SCHEMA_BLOCK = `
Please fill out the metadata, give it a compelling (but not cringey) name and description, and generate the exact number of cards requested following the Baraja strict copywriting rules.
If additional instructions were provided, prioritize them for the tone, intent, and type of exercises.

Your response MUST be a raw JSON object (no markdown formatting, no \`\`\`json) exactly matching this structure:

{
  "name": "string",
  "description": "string",
  "language": "es" | "en",
  "card_count": number,
  "metadata": {
    "topic": "string",
    "tone": "string",
    "target_audience": "string",
    "player_count": "string"
  },
  "cards": [
    {
      "id": "string (e.g. deck-prefix-01)",
      "front": {
        "title": "string",
        "number": number,
        "art_prompt": "string"
      },
      "back": {
        "phrase": "string",
        "when_to_use": "string",
        "instruction": "string",
        "answer": "string (optional, only for trivia)",
        "fun_fact": "string (nerdy trivia or fun fact to spark conversation during the game, optional)"
      },
      "tags": ["string", "string", "string"]
    }
  ]
}
`;

// ── Critic / Fact-Checking Prompts ────────────────────────────

export const BARAJA_CRITIC_SYSTEM_PROMPT = `
You are a ruthless Fact-Checker and Editor for "Baraja", a premium trivia card game.
Your ONLY job is to validate and correct drafted trivia cards against a verified "Source of Truth".

# THE PROBLEM
Language models suffer from "parametric blending", often confusing different scenes, characters, or facts from the same movie or subject, or inventing facts.

# YOUR TASK
1. You will receive an array of DRAFT cards and the SOURCE OF TRUTH (Wikipedia/TMDB data).
2. You must iterate through EVERY CARD.
3. For each card where \`answer\` is present (Trivia cards):
   - Check if the \`instruction\` (question) and \`answer\` are EXPLICITLY SUPPORTED by the provided Source of Truth.
   - If they are hallucinated, blended with another scene, or not present in the Source of Truth, YOU MUST REWRITE the \`instruction\` and \`answer\` to be 100% accurate based ONLY on the provided text.
   - If the card is completely unfixable or nonsensical, rewrite it entirely using a different fact from the Source of Truth.
4. DO NOT change the \`id\`, \`front.title\`, \`front.number\`, \`front.art_prompt\`, or any layout structure unless absolutely necessary due to the rewrite. Focus entirely on fixing factual errors in the \`back.instruction\` and \`back.answer\`.
5. Your output MUST be the complete, corrected array of cards in valid JSON format.
`;

export function buildCriticPrompt(draftCards: any[], enrichedData: any[]): string {
  const parts: string[] = [];

  parts.push("# TASK: Correct these Draft Cards using the Source of Truth\n\n");
  
  parts.push("## SOURCE OF TRUTH (Verified Data)\n");
  for (const item of enrichedData) {
    const lines = [`**${item.title}**`];
    if (item.year) lines.push(`  - Year: ${item.year}`);
    if (item.director) lines.push(`  - Director: ${item.director}`);
    if (item.plot) lines.push(`  - Plot: ${item.plot}`);
    if (item.wikiExtract) lines.push(`  - Deep Lore: ${item.wikiExtract}`);
    parts.push(lines.join('\n'));
  }

  parts.push("\n## DRAFT CARDS (JSON Array to review)\n");
  parts.push(JSON.stringify(draftCards, null, 2));

  parts.push("\nReturn the ENTIRE corrected JSON array. ONLY return the JSON array, starting with [ and ending with ]. Do not wrap in markdown tags.");

  return parts.join('\n');
}
