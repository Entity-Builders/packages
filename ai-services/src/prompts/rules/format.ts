/**
 * Rule for JSON formatting
 */
import { PromptModule } from '../pot-metadata';

export const JSONFormatRule: PromptModule = {
  name: 'JSONFormat',
  type: 'rule',
  instruction: `Output the result strictly as a JSON object.
    - Do not include markdown formatting (like \`\`\`json).
    - Ensure all keys are in snake_case.
    - The root object should be the requested data structure.`,
};
