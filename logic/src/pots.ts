import { supabase } from './supabase';
import type { Pot, PotFormData } from '@eb-packages/garden';

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
    const { error } = await supabase.from('pots').delete().eq('id', potId);

    if (error) {
      console.error('Error deleting pot:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePot:', error);
    return false;
  }
}
