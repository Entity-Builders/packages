import { supabase } from './supabase';
import type { Pot, PotFormData } from '@eb-packages/garden';
import { getCurrentLocation } from './location';
import { getCurrentWeather } from './weather';

/**
 * Calculate day of year (1-365/366)
 */
function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Upload pot photo to Supabase Storage
 */
export async function uploadPotPhoto(
  userId: string,
  photoUri: string,
): Promise<string | null> {
  try {
    // Convert photo URI to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}.jpg`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('pot-photos')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading photo:', error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('pot-photos').getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadPotPhoto:', error);
    return null;
  }
}

/**
 * Create a new pot
 */
export async function createPot(potData: PotFormData): Promise<Pot | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload photo if provided
    let photoUrl: string | null = null;
    if (potData.photo_uri) {
      photoUrl = await uploadPotPhoto(user.id, potData.photo_uri);
    }

    // Capture location and weather data
    let locationData = null;
    let weatherData = null;

    try {
      // Get current location
      locationData = await getCurrentLocation();

      // If we have location, get weather for those coordinates
      if (locationData) {
        weatherData = await getCurrentWeather(
          locationData.latitude,
          locationData.longitude,
        );
      }
    } catch (error) {
      // Location/weather capture is optional - don't fail pot creation if it fails
      console.warn('Could not capture location/weather data:', error);
    }

    // Prepare pot data
    const now = new Date();
    const potRecord = {
      user_id: user.id,
      name: potData.name,
      species: potData.species,
      initial_state: potData.initial_state,
      moisture_threshold: potData.moisture_threshold,
      photo_url: photoUrl,
      registered_day_of_year: getDayOfYear(now),
      // Location data (if available)
      latitude: locationData?.latitude,
      longitude: locationData?.longitude,
      address: locationData?.address,
      // Weather data (if available)
      temperature: weatherData?.temperature,
      humidity: weatherData?.humidity,
      weather_condition: weatherData?.weather_condition,
      weather_description: weatherData?.weather_description,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('pots')
      .insert(potRecord)
      .select()
      .single();

    if (error) {
      console.error('Error creating pot:', error);
      return null;
    }

    return data as Pot;
  } catch (error) {
    console.error('Error in createPot:', error);
    return null;
  }
}

/**
 * Get all pots for the current user
 */
export async function getUserPots(): Promise<Pot[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('pots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pots:', error);
      return [];
    }

    return (data || []) as Pot[];
  } catch (error) {
    console.error('Error in getUserPots:', error);
    return [];
  }
}

/**
 * Get a single pot by ID
 */
export async function getPotById(potId: string): Promise<Pot | null> {
  try {
    const { data, error } = await supabase
      .from('pots')
      .select('*')
      .eq('id', potId)
      .single();

    if (error) {
      console.error('Error fetching pot:', error);
      return null;
    }

    return data as Pot;
  } catch (error) {
    console.error('Error in getPotById:', error);
    return null;
  }
}

/**
 * Update a pot
 */
export async function updatePot(
  potId: string,
  updates: Partial<PotFormData>,
): Promise<Pot | null> {
  try {
    const { data, error } = await supabase
      .from('pots')
      .update(updates)
      .eq('id', potId)
      .select()
      .single();

    if (error) {
      console.error('Error updating pot:', error);
      return null;
    }

    return data as Pot;
  } catch (error) {
    console.error('Error in updatePot:', error);
    return null;
  }
}

/**
 * Delete a pot
 */
export async function deletePot(potId: string): Promise<boolean> {
  try {
    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Error getting user for delete:', authError);
      return false;
    }

    console.log('Attempting to delete pot:', potId, 'for user:', user.id);

    // Delete the pot (RLS will ensure user owns it)
    const { data, error } = await supabase
      .from('pots')
      .delete()
      .eq('id', potId)
      .select(); // Add select to see what was deleted

    if (error) {
      console.error('Error deleting pot:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('Delete result:', data);

    // Check if anything was actually deleted
    if (!data || data.length === 0) {
      console.error(
        'No pot was deleted. Pot may not exist or user does not own it.',
      );
      return false;
    }

    console.log('Successfully deleted pot:', potId);
    return true;
  } catch (error) {
    console.error('Error in deletePot:', error);
    return false;
  }
}
