/**
 * Interface for prompt modules (Rules and Skills)
 */
export interface PromptModule {
  name: string;
  type: 'rule' | 'skill';
  instruction: string;
}

/**
 * Configuration options for generating the prompt
 */
export interface PromptOptions {
  skills?: PromptModule[];
  rules?: PromptModule[];
}

/**
 * Prompt template for extracting pot metadata from user transcripts
 * Now supports modular Skills and Rules
 */
export function getPotMetadataPrompt(
  transcript: string,
  options: PromptOptions = {},
): string {
  const { skills = [], rules = [] } = options;

  // Build the prompt sections
  const skillInstructions = skills.map((s) => `- ${s.instruction}`).join('\n');
  const ruleInstructions = rules.map((r) => `- ${r.instruction}`).join('\n');

  return `
You are an expert gardening assistant. Extract structured plant care data from the user's description.

${skills.length > 0 ? `Skills enabled:\n${skillInstructions}\n` : ''}
Instructions:
- Extract all relevant plant information mentioned in the description
- For plant species, use the common name if mentioned, otherwise botanical name
- Fill in care requirements based on typical needs for the species if mentioned
- Only include fields that can be inferred from the description or are standard for the species
- Use clear, actionable language for care instructions
- Be specific with frequencies, amounts, and conditions when possible
${rules.length > 0 ? `\nContext & Formatting Rules:\n${ruleInstructions}` : ''}

User Description: "${transcript}"
`;
}
