import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, '../content');
const OUTPUT_FILE = path.resolve(__dirname, '../decks.ts');

function kebabToCamel(str: string): string {
  return str.replace(/-./g, x => x[1].toUpperCase());
}

async function main() {
  console.log('🔄 Syncing decks...');
  
  const files = await fs.readdir(CONTENT_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('failed_'));
  
  let imports = `import { resolveDeck } from './loader.js';\nimport type { RawDeckContent } from './types.js';\n\n`;
  let exports = `export const DECKS = {\n`;
  
  for (const file of jsonFiles) {
    const defaultExportName = 'raw' + kebabToCamel(file.replace('.json', '')).replace(/^./, x => x.toUpperCase());
    imports += `import ${defaultExportName} from './content/${file}';\n`;
    
    const key = file.replace('.json', '');
    exports += `  '${key}': resolveDeck(${defaultExportName} as unknown as RawDeckContent),\n`;
  }
  
  exports += `} as const;\n\nexport type DeckId = keyof typeof DECKS;\n`;
  
  const finalContent = `// ==================================================================\n// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n// Run \`yarn workspace @eb-packages/deck-engine sync\` to update.\n// ==================================================================\n\n${imports}\n${exports}`;
  
  await fs.writeFile(OUTPUT_FILE, finalContent, 'utf-8');
  console.log(`✅ Synced ${jsonFiles.length} decks to src/decks.ts`);
}

main().catch(err => {
  console.error('Error syncing decks:', err);
  process.exit(1);
});
