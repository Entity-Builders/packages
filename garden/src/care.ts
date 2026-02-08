export type CareType =
  | 'watering'
  | 'fertilizing'
  | 'pruning'
  | 'repotting'
  | 'other';

export interface CareSchedule {
  id: string;
  pot_id: string;
  care_type: CareType;
  frequency_days: number;
  last_care_date: Date | null;
  next_care_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CareLog {
  id: string;
  pot_id: string;
  care_type: CareType;
  performed_at: Date;
  notes: string | null;
  photo_url: string | null;
  created_at: Date;
}

export interface CareLogInput {
  pot_id: string;
  care_type: CareType;
  performed_at?: Date;
  notes?: string;
  photo_uri?: string; // For uploading new photo
}

export interface CareScheduleInput {
  pot_id: string;
  care_type: CareType;
  frequency_days: number;
  notes?: string;
}
