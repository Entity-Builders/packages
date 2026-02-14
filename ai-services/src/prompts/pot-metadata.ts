/**
 * Prompt template for extracting pot metadata from user transcripts
 */
export function getPotMetadataPrompt(transcript: string): string {
  return `
You are an expert gardening assistant. Extract structured plant care data from the user's description.

Instructions:
- Extract all relevant plant information mentioned in the description
- For plant species, use the common name if mentioned, otherwise botanical name
- Fill in care requirements based on typical needs for the species if mentioned
- Only include fields that can be inferred from the description or are standard for the species
- Use clear, actionable language for care instructions
- Be specific with frequencies, amounts, and conditions when possible

User Description: "${transcript}"
`;
}
