import { supabase } from './supabase';
import type { PotDiagnosisLog } from '@eb-packages/garden';

export async function diagnosePlant(params: {
  potId: string;
  generalImage: string; // base64
  soilImage: string; // base64
  name?: string;
  species?: string;
  userQuery?: string;
}): Promise<PotDiagnosisLog> {
  const { potId, generalImage, soilImage, name, species, userQuery } = params;

  try {
    console.log('Calling Edge Function diagnose-plant...');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 1. Get AI Diagnosis
    const { data: diagnosisResult, error: diagnosisError } =
      await supabase.functions.invoke('diagnose-plant', {
        body: { generalImage, soilImage, name, species, userQuery },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

    if (diagnosisError) {
      console.error('Edge Function error:', diagnosisError);
      throw diagnosisError;
    }

    // 2. Upload images to Storage
    const generalFileName = `${potId}/${Date.now()}_general.jpg`;
    const soilFileName = `${potId}/${Date.now()}_soil.jpg`;

    let generalImageUrl = '';
    let soilImageUrl = '';

    try {
      // Upload General Image
      const fetchGeneral = await fetch(generalImage);
      const blobGeneral = await fetchGeneral.blob();
      const { error: uploadErrorGeneral } = await supabase.storage
        .from('pot_photos')
        .upload(generalFileName, blobGeneral, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      if (uploadErrorGeneral) throw uploadErrorGeneral;
      const { data: publicUrlDataGeneral } = supabase.storage
        .from('pot_photos')
        .getPublicUrl(generalFileName);
      generalImageUrl = publicUrlDataGeneral.publicUrl;

      // Upload Soil Image
      const fetchSoil = await fetch(soilImage);
      const blobSoil = await fetchSoil.blob();
      const { error: uploadErrorSoil } = await supabase.storage
        .from('pot_photos')
        .upload(soilFileName, blobSoil, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      if (uploadErrorSoil) throw uploadErrorSoil;
      const { data: publicUrlDataSoil } = supabase.storage
        .from('pot_photos')
        .getPublicUrl(soilFileName);
      soilImageUrl = publicUrlDataSoil.publicUrl;
    } catch (e) {
      console.warn(
        'Failed to upload diagnosis images, saving without image URL',
        e,
      );
    }

    // 3. Save to database
    const { data: savedLog, error: dbError } = await supabase
      .from('potlink_diagnosis_logs')
      .insert({
        pot_id: potId,
        general_image_url: generalImageUrl || 'pending',
        soil_image_url: soilImageUrl || 'pending',
        user_query: userQuery,
        ai_diagnosis: diagnosisResult.diagnosis,
        urgency: diagnosisResult.urgency,
        action_plan: diagnosisResult.action_plan,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return savedLog as PotDiagnosisLog;
  } catch (error) {
    console.error('Error diagnosing plant:', error);
    throw error;
  }
}

export async function getDiagnosisLogs(
  potId: string,
): Promise<PotDiagnosisLog[]> {
  const { data, error } = await supabase
    .from('potlink_diagnosis_logs')
    .select('*')
    .eq('pot_id', potId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diagnosis logs:', error);
    throw error;
  }

  return data as PotDiagnosisLog[];
}
