/**
 * Lightweight prompt for identifying plant species only
 * Uses minimal tokens compared to full metadata extraction
 */
export function getIdentifySpeciesPrompt(transcript: string): string {
  return `
You are a plant expert. Identify the plant species from this brief description.

Instructions:
- Extract only the species/botanical name and common name
- Use standard botanical nomenclature when possible
- If uncertain, use the most common interpretation

User Description: "${transcript}"
`;
}
