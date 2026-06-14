import type { TranslationPreset, TranslationPresetId } from './types';

export const DEFAULT_TRANSLATION_PRESET_ID: TranslationPresetId = 'natural';

export const TRANSLATION_PRESETS: TranslationPreset[] = [
  {
    id: 'natural',
    label: 'Natural',
    description: 'Closest everyday translation.',
    instruction:
      'Translate naturally while preserving the source meaning, register, and intent.',
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Polished for work.',
    instruction:
      'Rewrite with a polished professional tone suitable for email, documents, and work chat.',
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Relaxed and conversational.',
    instruction:
      'Rewrite with a relaxed conversational tone that sounds natural in everyday chat.',
  },
  {
    id: 'concise',
    label: 'Concise',
    description: 'Clear with fewer words.',
    instruction:
      'Make the translation clear and compact without removing important meaning.',
  },
  {
    id: 'warm',
    label: 'Warm',
    description: 'Friendly and human.',
    instruction:
      'Rewrite the translation so it feels friendly, warm, and human while staying faithful.',
  },
  {
    id: 'direct',
    label: 'Direct',
    description: 'Plain and straightforward.',
    instruction:
      'Rewrite with a direct, plain style with minimal softening and no extra flourish.',
  },
  {
    id: 'shorten',
    label: 'Brief',
    description: 'One-line sendable reply.',
    instruction:
      'Write a brief, sendable, message-style version in one short sentence when possible. Remove non-essential filler while preserving the core intent and next step.',
  },
];

export const isTranslationPresetId = (
  value: unknown,
): value is TranslationPresetId =>
  TRANSLATION_PRESETS.some((preset) => preset.id === value);

export const getTranslationPreset = (presetId: TranslationPresetId) =>
  TRANSLATION_PRESETS.find((preset) => preset.id === presetId) ||
  TRANSLATION_PRESETS[0];
