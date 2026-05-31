export type LifeArea =
  | 'cuerpo'
  | 'entorno'
  | 'mente'
  | 'conexion'
  | 'crecimiento';

export type ActivationEnergy = 'low' | 'medium' | 'high';

export type PsychologicalReward = 'immediate' | 'delayed';

export type HistoryStatus =
  | 'suggested'
  | 'accepted'
  | 'completed'
  | 'skipped'
  | 'abandoned';

export interface CompasTask {
  id?: string;
  slug: string;
  name: string;
  category: string;
  lifeArea: LifeArea;
  benefits: string[];
  activationEnergy: ActivationEnergy;
  durationSeconds: number;
  psychologicalReward: PsychologicalReward;
  toltecAgreement?: string;
  isSeed?: boolean;
  sortOrder?: number;
}

export interface ActivationHistoryEntry {
  id?: string;
  taskId?: string | null;
  taskName: string;
  lifeArea: LifeArea;
  activationEnergy: ActivationEnergy;
  durationSeconds: number;
  status: HistoryStatus;
  startAt: string | Date;
  endAt?: string | Date;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  inertiaBroken?: boolean;
}

export interface SuggestionOptions {
  now?: Date;
  limit?: number;
  inactivityThresholdMinutes?: number;
  random?: () => number;
}

export interface ScoredTask {
  task: CompasTask;
  score: number;
  reasons: string[];
}

export interface SuggestionResult {
  suggestions: CompasTask[];
  scored: ScoredTask[];
  maxEnergy: ActivationEnergy;
  resetToLow: boolean;
  balance: Partial<Record<LifeArea, number>>;
}
