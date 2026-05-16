import { supabase } from './supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InviteCode {
  code: string;
  expiresAt: Date;
  batchId: string;
}

export interface BatchMember {
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface JoinResult {
  batchId: string;
  batchName: string;
  batchIcon: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generates a random 6-character uppercase alphanumeric code */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Generates a new invite code for a batch.
 * If an active (unused, non-expired) code exists, it is returned instead.
 */
export async function generateInviteCode(batchId: string): Promise<InviteCode> {
  // Check for an existing valid code first
  const { data: existing } = await supabase
    .from('batch_invite_codes')
    .select('code, expires_at')
    .eq('batch_id', batchId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      code: existing.code,
      expiresAt: new Date(existing.expires_at),
      batchId,
    };
  }

  // Generate a new unique code
  let code = generateCode();
  let attempts = 0;
  let lastError = null;
  while (attempts < 5) {
    const { error } = await supabase.from('batch_invite_codes').insert({
      batch_id: batchId,
      code,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });
    if (!error) {
      lastError = null;
      break;
    }
    // Conflict on code uniqueness or RLS — try a different code
    lastError = error;
    code = generateCode();
    attempts++;
  }

  if (lastError) {
    console.error('Failed to insert invite code after 5 attempts:', lastError);
    throw new Error('Failed to generate invite code. ' + lastError.message);
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { code, expiresAt, batchId };
}

/**
 * Joins a batch using an invite code.
 * Returns batch info on success, throws on failure.
 */
export async function joinBatchWithCode(code: string): Promise<JoinResult> {
  const { data, error } = await supabase.rpc('join_batch_with_code', {
    p_code: code.toUpperCase().trim(),
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);

  return {
    batchId: data.batch_id,
    batchName: data.batch_name,
    batchIcon: data.batch_icon,
  };
}

/**
 * Returns the list of members for a batch.
 */
export async function getBatchMembers(batchId: string): Promise<BatchMember[]> {
  const { data, error } = await supabase
    .from('batch_members')
    .select('user_id, role, joined_at')
    .eq('batch_id', batchId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((m) => ({
    userId: m.user_id,
    role: m.role as 'owner' | 'member',
    joinedAt: new Date(m.joined_at),
  }));
}

/**
 * Returns the member count for a batch (used to show shared indicator in UI).
 */
export async function getBatchMemberCount(batchId: string): Promise<number> {
  const { count, error } = await supabase
    .from('batch_members')
    .select('*', { count: 'exact', head: true })
    .eq('batch_id', batchId);

  if (error) return 1;
  return count ?? 1;
}
