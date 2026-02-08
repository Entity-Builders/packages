import { supabase } from './supabase';
import type {
  CareSchedule,
  CareLog,
  CareLogInput,
  CareScheduleInput,
} from '@eb-packages/garden';
import { uploadPotPhoto } from './pots';

/**
 * Get all care schedules for a pot
 */
export async function getCareSchedules(potId: string): Promise<CareSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('care_schedules')
      .select('*')
      .eq('pot_id', potId);

    if (error) {
      console.error('Error fetching care schedules:', error);
      return [];
    }

    return (data || []).map((item) => ({
      ...item,
      // Ensure dates are Date objects
      last_care_date: item.last_care_date
        ? new Date(item.last_care_date)
        : null,
      next_care_date: item.next_care_date
        ? new Date(item.next_care_date)
        : null,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
    })) as CareSchedule[];
  } catch (error) {
    console.error('Error in getCareSchedules:', error);
    return [];
  }
}

/**
 * Upsert a care schedule
 */
export async function upsertCareSchedule(
  schedule: CareScheduleInput & { id?: string },
): Promise<CareSchedule | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Calculate initial next_care_date if not set and we have frequency
    // (Actual calculation logic might be better placed in the UI or a specific function,
    // but for upsert we usually take what's given or default)
    // If it's a new schedule, next_care_date could be today + frequency
    const now = new Date();
    let nextCareDate = null;
    if (!schedule.id && schedule.frequency_days) {
      // Default to starting tomorrow or today?
      // Let's say we want to do it in frequency_days from now
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + schedule.frequency_days);
      nextCareDate = nextDate;
    }

    // Prepare data
    const payload: any = {
      pot_id: schedule.pot_id,
      care_type: schedule.care_type,
      frequency_days: schedule.frequency_days,
      notes: schedule.notes,
      updated_at: now.toISOString(),
    };

    if (!schedule.id && nextCareDate) {
      payload.next_care_date = nextCareDate.toISOString();
    }

    if (schedule.id) {
      payload.id = schedule.id;
    }

    const { data, error } = await supabase
      .from('care_schedules')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error upserting care schedule:', error);
      return null;
    }

    return {
      ...data,
      last_care_date: data.last_care_date
        ? new Date(data.last_care_date)
        : null,
      next_care_date: data.next_care_date
        ? new Date(data.next_care_date)
        : null,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    } as CareSchedule;
  } catch (error) {
    console.error('Error in upsertCareSchedule:', error);
    return null;
  }
}

/**
 * Log a care activity
 */
export async function logCare(input: CareLogInput): Promise<CareLog | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload photo if provided
    let photoUrl: string | null = null;
    if (input.photo_uri) {
      photoUrl = await uploadPotPhoto(user.id, input.photo_uri);
    }

    const performedAt = input.performed_at || new Date();

    // 1. Insert log
    const { data: logData, error: logError } = await supabase
      .from('care_logs')
      .insert({
        pot_id: input.pot_id,
        care_type: input.care_type,
        performed_at: performedAt.toISOString(),
        notes: input.notes,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging care:', logError);
      return null;
    }

    // 2. Update schedule (if exists)
    // Find the schedule for this pot and care_type
    const { data: schedules } = await supabase
      .from('care_schedules')
      .select('*')
      .eq('pot_id', input.pot_id)
      .eq('care_type', input.care_type);

    if (schedules && schedules.length > 0) {
      const schedule = schedules[0];
      if (schedule.frequency_days) {
        // Calculate next date
        const nextDate = new Date(performedAt);
        nextDate.setDate(nextDate.getDate() + schedule.frequency_days);

        await supabase
          .from('care_schedules')
          .update({
            last_care_date: performedAt.toISOString(),
            next_care_date: nextDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', schedule.id);
      } else {
        // Just update last_care_date
        await supabase
          .from('care_schedules')
          .update({
            last_care_date: performedAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', schedule.id);
      }
    }

    return {
      ...logData,
      performed_at: new Date(logData.performed_at),
      created_at: new Date(logData.created_at),
    } as CareLog;
  } catch (error) {
    console.error('Error in logCare:', error);
    return null;
  }
}

/**
 * Get care history for a pot
 */
export async function getCareHistory(potId: string): Promise<CareLog[]> {
  try {
    const { data, error } = await supabase
      .from('care_logs')
      .select('*')
      .eq('pot_id', potId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching care history:', error);
      return [];
    }

    return (data || []).map((item) => ({
      ...item,
      performed_at: new Date(item.performed_at),
      created_at: new Date(item.created_at),
    })) as CareLog[];
  } catch (error) {
    console.error('Error in getCareHistory:', error);
    return [];
  }
}
