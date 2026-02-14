/**
 * Skill for identifying plant species
 */
import { PromptModule } from '../pot-metadata';

export const PlantIdentificationSkill: PromptModule = {
  name: 'PlantIdentification',
  type: 'skill',
  instruction: `Identify the plant species with high precision.
    - If the user provides a common name, also provide the botanical name.
    - If the user describes visual characteristics (e.g. "big leaves with holes"), try to infer the species (e.g. Monstera deliciosa).
    - If the species is unclear, mark it as 'Unknown' but suggest potential matches based on description.`,
};
