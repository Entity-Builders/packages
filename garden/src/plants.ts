export interface Plant {
  id: string;
  name: string;
  species: string;
  moistureThreshold: number; // percentage (0-100)
}

export interface PotDiagnosisLog {
  id: string;
  pot_id: string;
  user_id: string;
  general_image_url: string;
  soil_image_url: string;
  user_query?: string;
  ai_diagnosis: string;
  urgency: 'low' | 'medium' | 'high';
  action_plan: string[];
  chat_history?: { role: 'user' | 'assistant'; content: string }[];
  metadata?: {
    has_pests: boolean;
    soil_condition: 'dry' | 'moist' | 'waterlogged' | 'unknown';
    light_exposure: 'low' | 'adequate' | 'excessive' | 'unknown';
    plant_parts_affected: string[];
    leaf_color: 'green' | 'yellowing' | 'browning' | 'spotted' | 'unknown';
    plant_vitality: 'healthy' | 'wilted' | 'drooping' | 'unknown';
    suspected_disease: 'none' | 'fungal' | 'bacterial' | 'viral' | 'unknown';
    pot_suitability?:
      | 'too_small'
      | 'appropriate'
      | 'too_large'
      | 'needs_repotting_soon'
      | 'unknown';
    stem_condition?: 'healthy' | 'leggy' | 'mushy' | 'woody_normal' | 'unknown';
    pest_type?: string[];
    leaf_density?:
      | 'dense'
      | 'normal'
      | 'sparse'
      | 'dropping_leaves'
      | 'unknown';
    soil_surface?:
      | 'clean'
      | 'moldy'
      | 'mineral_buildup'
      | 'moss_growth'
      | 'unknown';
  };
  created_at: string;
}

export interface SpeciesCareGuide {
  id: number; // BigInt in SQL usually maps to number/string in JS, checking usage
  species_name: string;
  variety?: string;
  care_level?: string;
  climate?: string;
  watering_frequency?: string;
  fertilizer_frequency?: string;
  pruning_info?: string;
  companions?: string;
  light_requirements?: string;
  common_pests?: string; // It was not in the seed but might be there, checking seed again... actually seed has limited columns but let's stick to what's in seed and general usefulness.
  // Checking seed.sql again: species_name, variety, care_level, climate, watering_frequency, fertilizer_frequency, pruning_info, companions
  created_at?: string;
}

export interface SensorReading {
  sensorId: string;
  value: number;
  timestamp: string;
}

export const getHealthStatus = (
  moisture: number,
  threshold: number,
): 'ok' | 'needs_water' | 'overwatered' => {
  if (moisture < threshold) return 'needs_water';
  if (moisture > 90) return 'overwatered';
  return 'ok';
};
