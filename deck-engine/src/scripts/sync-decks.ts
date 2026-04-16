import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, '../content');
const OUTPUT_FILE = path.resolve(__dirname, '../decks.ts');

// Local Supabase instance (from `npx supabase status` in eb-infra)
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'REDACTED_SUPABASE_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function kebabToCamel(str: string): string {
  return str.replace(/-./g, x => x[1].toUpperCase());
}

async function seedIfMissing(rawContent: any): Promise<void> {
  const { slug } = rawContent;

  // Check if edition already exists in the DB
  const { data: existing } = await supabase
    .from('baraja_editions')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    console.log(`  ⏩ Already in DB, skipping seed: ${slug}`);
    return;
  }

  // Insert the edition
  const { error: editionError } = await supabase
    .from('baraja_editions')
    .insert({
      slug,
      name: rawContent.name,
      description: rawContent.description,
      print_spec_id: rawContent.print_spec_id,
      design_template_id: rawContent.design_template_id,
      print_specs_overrides: rawContent.print_specs_overrides || {},
      design_template_overrides: rawContent.design_template_overrides || {},
    });

  if (editionError) {
    console.error(`  ❌ Error inserting edition ${slug}:`, editionError.message);
    return;
  }

  // Insert cards
  const cardsToInsert = (rawContent.cards || []).map((card: any) => ({
    id: card.id,
    edition_slug: slug,
    number: card.front.number,
    front: card.front,
    back: card.back,
    tags: card.tags || [],
  }));

  if (cardsToInsert.length > 0) {
    const { error: cardsError } = await supabase
      .from('baraja_cards')
      .insert(cardsToInsert);

    if (cardsError) {
      console.error(`  ❌ Error inserting cards for ${slug}:`, cardsError.message);
    } else {
      console.log(`  ✅ Seeded: ${slug} (${cardsToInsert.length} cards)`);
    }
  }
}

async function main() {
  console.log('🔄 Syncing decks...\n');

  const files = await fs.readdir(CONTENT_DIR);
  const jsonFiles = files.filter(
    f => f.endsWith('.json') && !f.startsWith('failed_') && f !== 'frames_library.json'
  );

  // ── 1. Regenerate decks.ts ────────────────────────────────────
  let imports = `import { resolveDeck } from './loader.js';\nimport type { RawDeckContent } from './types.js';\n\n`;
  let exports = `export const DECKS = {\n`;

  for (const file of jsonFiles) {
    const defaultExportName = 'raw' + kebabToCamel(file.replace('.json', '')).replace(/^./, x => x.toUpperCase());
    imports += `import ${defaultExportName} from './content/${file}';\n`;
    const key = file.replace('.json', '');
    exports += `  '${key}': resolveDeck(${defaultExportName} as unknown as RawDeckContent),\n`;
  }

  exports += `} as const;\n\nexport type DeckId = keyof typeof DECKS;\n`;

  const finalContent =
    `// ==================================================================\n` +
    `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n` +
    `// Run \`yarn workspace @eb-packages/deck-engine sync\` to update.\n` +
    `// ==================================================================\n\n` +
    `${imports}\n${exports}`;

  await fs.writeFile(OUTPUT_FILE, finalContent, 'utf-8');
  console.log(`✅ decks.ts regenerated (${jsonFiles.length} decks)\n`);

  // ── 2. Seed any missing editions into Supabase ────────────────
  console.log('🌱 Seeding missing editions into Supabase...');
  for (const file of jsonFiles) {
    const rawContent = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8'));
    await seedIfMissing(rawContent);
  }

  console.log('\n🏁 Sync complete.');
}

main().catch(err => {
  console.error('Error during sync:', err);
  process.exit(1);
});
