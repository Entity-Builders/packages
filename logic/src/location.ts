/**
 * Location services for GPS and reverse geocoding
 */

import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Get current GPS coordinates using Expo Location API
 * Works on both iOS and Android
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    // Request foreground location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.warn('Location permission denied');
      return null;
    }

    // Get current position with balanced accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Try to get address via reverse geocoding
    const address = await reverseGeocode(latitude, longitude);

    return {
      latitude,
      longitude,
      address: address || undefined,
    };
  } catch (error) {
    console.error('Error getting location:', error);
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
