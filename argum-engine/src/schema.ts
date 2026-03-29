import { z } from 'zod';

export const SourceMetadataSchema = z.object({
  raw_quote: z.string().describe("The exact quote without any edits"),
  speaker: z.string().nullable().describe("Entity or individual who produced the quote"),
  context_tags: z.array(z.string()).describe("e.g. ['Political Debate', 'Economy']"),
  origin_url: z.string().url().describe("The exact URL where the quote was extracted from"),
  timestamp: z.string().describe("ISO 8601 timestamp of when it was said or published"),
});

export const PremiseSchema = z.object({
  id: z.string(),
  content: z.string().describe("Distilled premise in neutral language"),
  type: z.enum(["explicit", "implicit"]).describe("Whether the premise was explicitly stated or assumed by the speaker"),
});

export const ConclusionSchema = z.object({
  content: z.string().describe("Distilled conclusion in neutral language"),
  validity: z.enum(["valid", "invalid"]).describe("Strict formal logical validity based on the provided premises, NOT objective factual truth"),
});

export const FallacySchema = z.object({
  fallacy_type: z.string().describe("Name of the fallacy, e.g. 'False Dilemma', 'Straw Man'"),
  explanation_en: z.string().describe("Technical explanation of why the logic fails in English"),
  explanation_es: z.string().describe("Technical explanation of why the logic fails in Spanish"),
  affected_premise_ids: z.array(z.string()),
});

export const ArgumentBlueprintSchema = z.object({
  id: z.string().uuid(),
  source_metadata: SourceMetadataSchema,
  logical_structure: z.object({
    premises: z.array(PremiseSchema),
    conclusion: ConclusionSchema,
    fallacies_detected: z.array(FallacySchema),
  }),
});

export type ArgumentBlueprint = z.infer<typeof ArgumentBlueprintSchema>;
