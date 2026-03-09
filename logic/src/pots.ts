import { supabase } from './supabase';
import type { Pot, PotFormData } from '@eb-packages/garden';
import { getCurrentLocation } from './location';
import { getCurrentWeather } from './weather';
import { getLinkedAccounts } from './accountLinking';
import * as FileSystem from 'expo-file-system/legacy';

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
    console.log(
      `Starting photo upload for user ${userId} from URI: ${photoUri}`,
    );

    // Determine content type from URI extension
    let contentType = 'image/jpeg';
    const uriLower = photoUri.toLowerCase();

    if (uriLower.endsWith('.png')) {
      contentType = 'image/png';
    } else if (uriLower.endsWith('.jpg') || uriLower.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (uriLower.endsWith('.webp')) {
      contentType = 'image/webp';
    } else if (uriLower.endsWith('.heic')) {
      contentType = 'image/heic';
    }

    console.log(`Determined content type: ${contentType}`);

    // Read file as base64 using expo-file-system
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: 'base64',
    });

    if (!base64) {
      console.error('Failed to read file as base64');
      return null;
    }

    console.log(
      `File read successfully. Base64 length: ${base64.length} chars`,
    );

    // Convert base64 to Uint8Array for upload
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log(`Binary data created. Size: ${bytes.length} bytes`);

    if (bytes.length === 0) {
      console.error('Binary data is empty after conversion');
      return null;
    }

    // Generate unique filename with correct extension
    const timestamp = Date.now();
    const extension = contentType === 'image/png' ? 'png' : 'jpg';
    const filename = `${userId}/${timestamp}.${extension}`;

    console.log(`Uploading to pot-photos/${filename}...`);

    // Upload to storage with binary data (Uint8Array)
    const { data, error } = await supabase.storage
      .from('pot-photos')
      .upload(filename, bytes, {
        contentType: contentType,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading photo to Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    if (!data?.path) {
      console.error('Upload successful but no path returned');
      return null;
    }

    console.log('Upload successful. Path:', data.path);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('pot-photos').getPublicUrl(data.path);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Unexpected error in uploadPotPhoto:', error);
    return null;
  }
}

/**
 * Create a new pot
 */
export async function createPot(potData: PotFormData): Promise<Pot | null> {
  try {
    // Ensure we have a valid session before making DB calls (fixes RLS 42501 errors)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn('[createPot] No active session, attempting refresh...');
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('[createPot] Session refresh failed:', refreshError);
        throw new Error('Session expired. Please log in again.');
      }
    }

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
      variety: potData.variety,
      seed_type: potData.seed_type,
      notes: potData.notes,
      initial_state: potData.initial_state,
      location_type: potData.location_type,
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

    // Fetch linked user IDs
    const linkedAccounts = await getLinkedAccounts();
    const userIdsToFetch = [
      user.id,
      ...linkedAccounts.map((a) => a.linked_user_id),
    ];

    const { data, error } = await supabase
      .from('pots')
      .select('*, potlink_diagnosis_logs(created_at)')
      .in('user_id', userIdsToFetch)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pots:', error);
      return [];
    }

    // Map the returned data to extract the most recent diagnosis date
    const potsWithDiagnosis = data?.map((pot: any) => {
      // potlink_diagnosis_logs is an array of objects since it's a 1-to-many relationship
      const logs = pot.potlink_diagnosis_logs || [];

      // Sort to get the most recent date if there are multiple logs
      // Note: We could also order the select in PostgREST, but sorting locally is fine for small arrays
      const sortedLogs = logs.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      const lastDate = sortedLogs.length > 0 ? sortedLogs[0].created_at : null;

      // Clean up the object to match the expected Pot interface
      const { potlink_diagnosis_logs, ...potData } = pot;

      return {
        ...potData,
        last_diagnosis_date: lastDate,
      } as Pot;
    });

    return (potsWithDiagnosis || []) as Pot[];
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

    // 1. Delete care logs first (they reference pot)
    const { error: logsError } = await supabase
      .from('care_logs')
      .delete()
      .eq('pot_id', potId);

    if (logsError) {
      console.error('Error deleting care logs:', logsError);
      // We continue even if this fails? Or stop?
      // If we stop, we can't delete the pot. But if logs exist, pot delete will fail anyway.
      // So we should probably return false or try to proceed if the error is "not found" (which shouldn't happen with delete).
      return false;
    }

    // 2. Delete care schedules (they reference pot)
    const { error: schedulesError } = await supabase
      .from('care_schedules')
      .delete()
      .eq('pot_id', potId);

    if (schedulesError) {
      console.error('Error deleting care schedules:', schedulesError);
      return false;
    }

    // 3. Delete the pot (RLS will ensure user owns it)
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

    console.log('Successfully deleted pot and related data:', potId);
    return true;
  } catch (error) {
    console.error('Error in deletePot:', error);
    return false;
  }
}
