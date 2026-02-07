/**
 * Location services for GPS and reverse geocoding
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Get current GPS coordinates using browser Geolocation API
 * Note: This is a placeholder for mobile implementation
 * In React Native, use expo-location instead
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    // For web, use browser geolocation
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Try to get address via reverse geocoding
            const address = await reverseGeocode(latitude, longitude);

            resolve({
              latitude,
              longitude,
              address: address || undefined,
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      });
    }

    console.warn('Geolocation not available');
    return null;
  } catch (error) {
    console.error('Error in getCurrentLocation:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to human-readable address
 * Uses Nominatim (OpenStreetMap) API - free, no API key required
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PotLink/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error('Reverse geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();

    // Build a nice address string
    const address = data.address;
    const parts = [];

    if (address.road) parts.push(address.road);
    if (address.house_number)
      parts[parts.length - 1] += ` ${address.house_number}`;
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.country) parts.push(address.country);

    return parts.join(', ') || data.display_name;
  } catch (error) {
    console.error('Error in reverseGeocode:', error);
    return null;
  }
}
