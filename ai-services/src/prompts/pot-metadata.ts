/**
 * Prompt template for extracting pot metadata from user transcripts
 */
export function getPotMetadataPrompt(transcript: string): string {
  return `
You are a gardening assistant. Extract structured data from the following user description of a plant pot.
Return ONLY a valid JSON object with the following fields (all optional):
- name: string (The nickname of the pot/plant, e.g., "Rojo", "My Basil")
- species: string (The plant species, e.g., "Tomato", "Basil")
- seed_type: string (e.g., "Heirloom", "Hybrid", "Organic")
- notes: string (Any other details mentioned)

User Description: "${transcript}"
`;
}
