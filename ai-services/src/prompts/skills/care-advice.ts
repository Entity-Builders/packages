/**
 * Skill for providing care advice
 */
import { PromptModule } from '../pot-metadata';

export const CareAdviceSkill: PromptModule = {
  name: 'CareAdvice',
  type: 'skill',
  instruction: `Provide tailored care advice based on the identified species.
    - Water: Specify frequency (e.g. "every 1-2 weeks") and signs of thirst.
    - Light: Describe ideal light conditions (e.g. "bright indirect light").
    - Humidity: Mention if the plant needs high humidity or misting.
    - Toxicity: Warn if the plant is toxic to pets or humans.`,
};
