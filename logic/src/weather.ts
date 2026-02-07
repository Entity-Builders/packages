/**
 * Weather services using Open-Meteo API
 * https://open-meteo.com/
 * Free, no API key required
 */

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  weather_condition: string; // Clear, Cloudy, Rainy, etc.
  weather_description: string; // Detailed description
}

/**
 * Map Open-Meteo weather codes to conditions
 * https://open-meteo.com/en/docs
 */
function getWeatherCondition(code: number): {
  condition: string;
  description: string;
} {
  if (code === 0) return { condition: 'Clear', description: 'Clear sky' };
  if (code <= 3) return { condition: 'Cloudy', description: 'Partly cloudy' };
  if (code <= 48) return { condition: 'Foggy', description: 'Fog' };
  if (code <= 67) return { condition: 'Rainy', description: 'Rain' };
  if (code <= 77) return { condition: 'Snowy', description: 'Snow' };
  if (code <= 82) return { condition: 'Rainy', description: 'Rain showers' };
  if (code <= 86) return { condition: 'Snowy', description: 'Snow showers' };
  if (code <= 99) return { condition: 'Stormy', description: 'Thunderstorm' };

  return { condition: 'Unknown', description: 'Unknown conditions' };
}

/**
 * Fetch current weather for given coordinates
 */
export async function getCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Weather API request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.current) {
      console.error('No current weather data in response');
      return null;
    }

    const { temperature_2m, relative_humidity_2m, weather_code } = data.current;
    const { condition, description } = getWeatherCondition(weather_code);

    return {
      temperature: Math.round(temperature_2m * 10) / 10, // Round to 1 decimal
      humidity: relative_humidity_2m,
      weather_condition: condition,
      weather_description: description,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}
