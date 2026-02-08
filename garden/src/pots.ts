export interface Pot {
  id: string;
  user_id: string;
  name: string;
  species: string;
  seed_type?: string;
  notes?: string;
  photo_url?: string;
  variety?: string; // e.g., "Cherry Tomato", "San Marzano"

  // Registration metadata
  registered_at: Date;
  registered_day_of_year: number;

  // Plant state
  initial_state: 'seeds' | 'seedling' | 'young' | 'mature';

  // Sensor configuration (from existing Plant interface)
  moisture_threshold: number;
  sensor_id?: string;

  // Location data (optional)
  latitude?: number;
  longitude?: number;
  address?: string;

  // Climate snapshot at registration
  temperature?: number; // Celsius
  humidity?: number; // Percentage
  weather_condition?: string; // e.g., "Clear", "Cloudy", "Rainy"
  weather_description?: string; // e.g., "clear sky"

  created_at: Date;
  updated_at: Date;
}

export type PotInput = Omit<
  Pot,
  | 'id'
  | 'user_id'
  | 'registered_at'
  | 'registered_day_of_year'
  | 'created_at'
  | 'updated_at'
>;

export type PotFormData = {
  name: string;
  species: string;
  seed_type?: string;
  initial_state: 'seeds' | 'seedling' | 'young' | 'mature';
  moisture_threshold: number;
  photo_uri?: string;
  variety?: string;
  notes?: string;
  // Location & climate (optional)
  latitude?: number;
  longitude?: number;
  address?: string;
  temperature?: number;
  humidity?: number;
  weather_condition?: string;
  weather_description?: string;
};
