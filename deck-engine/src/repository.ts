import type { RawDeckContent } from './types.js';

export interface IDeckRepository {
  getDeckById(id: string): Promise<RawDeckContent | null>;
  getAllDecks(): Promise<RawDeckContent[]>;
  updateDeckSettings(id: string, updates: Partial<RawDeckContent>): Promise<void>;
}
