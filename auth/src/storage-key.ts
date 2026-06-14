export const DEFAULT_SUPABASE_AUTH_STORAGE_SCOPE = 'entity-builders';

export const normalizeSupabaseAuthStorageScope = (
  appId?: string | null,
): string => {
  const normalized = (appId || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || DEFAULT_SUPABASE_AUTH_STORAGE_SCOPE;
};

export const createSupabaseAuthStorageKey = (
  appId?: string | null,
): string => `eb:${normalizeSupabaseAuthStorageScope(appId)}:supabase-auth`;
