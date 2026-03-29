import { DeconstructionEngine } from '../src/engine';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Try to load env from .env in monorepo root or local if available
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config();

const engine = new DeconstructionEngine({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const quote = "Si reducimos los impuestos a las corporaciones, automáticamente habrá inversión extranjera. Como el país está al borde de la quiebra y necesitamos inversión urgente, la única y exclusiva solución es bajar los impuestos hoy mismo.";
  
  console.log("Analyzing quote:\\n" + quote + "\\n");
  
  try {
    const result = await engine.parseQuote(quote, "https://twitter.com/example/status/123", "Example Politician");
    console.log("--- ARGUMENT BLUEPRINT ---");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Evaluation failed:", err);
  }
}

run().catch(console.error);
