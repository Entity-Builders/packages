export interface Plant {
  id: string;
  name: string;
  species: string;
  moistureThreshold: number; // percentage (0-100)
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
