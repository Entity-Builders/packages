import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ArgumentBlueprintSchema, ArgumentBlueprint } from './schema';
import { SYSTEM_PROMPT } from './prompts';

export interface EngineConfig {
  apiKey?: string; // Defaults to process.env.GEMINI_API_KEY if not provided
  model?: string;
}

export class DeconstructionEngine {
  private ai: GoogleGenAI;
  private model: string;

  constructor(config: EngineConfig = {}) {
    this.ai = new GoogleGenAI(config.apiKey ? { apiKey: config.apiKey } : {});
    this.model = config.model || 'gemini-2.5-flash';
  }

  async parseQuote(quote: string, url: string = "unknown", speaker: string = "unknown"): Promise<ArgumentBlueprint> {
    const jsonSchema = zodToJsonSchema(ArgumentBlueprintSchema, "mySchema");

    const userPrompt = `
Analyze the following quote structurally according to the system instructions.
Return your analysis strictly as a JSON object matching the schema below.

Target Speaker: ${speaker}
Origin URL: ${url}

Quote to analyze:
"""
${quote}
"""

Expected Output Schema:
${JSON.stringify(jsonSchema, null, 2)}
`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate structural analysis from the model.");
    }

    const rawJson = JSON.parse(response.text);
    return ArgumentBlueprintSchema.parse(rawJson);
  }
}
