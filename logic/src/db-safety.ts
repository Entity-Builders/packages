/**
 * db-safety.ts — Scoped Supabase client for multi-app shared DB
 *
 * Prevents App A from accidentally modifying App B's tables.
 * Each app declares its table prefix, and all operations are
 * validated against it before hitting the database.
 *
 * Usage:
 *   import { createScopedClient } from '@eb-packages/logic';
 *   const db = createScopedClient(supabase, 'tablia_');
 *   db.from('tablia_venues')  // ✅ works
 *   db.from('postalpeek_postcards')  // 🚨 throws Error
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ScopedSupabaseClient {
  /** Like supabase.from(), but validates table prefix first */
  from: SupabaseClient['from'];
  /** Direct access to the underlying client (for auth, storage, etc.) */
  raw: SupabaseClient;
  /** The app prefix this client is scoped to */
  prefix: string;
}

/**
 * Wraps a Supabase client so .from() only allows tables matching the prefix.
 * Non-table operations (auth, storage, realtime) are unaffected.
 */
export function createScopedClient(
  client: SupabaseClient,
  appPrefix: string,
): ScopedSupabaseClient {
  if (!appPrefix.endsWith('_')) {
    throw new Error(
      `[db-safety] Prefix must end with underscore. Got: "${appPrefix}"`,
    );
  }

  return {
    prefix: appPrefix,
    raw: client,
    from(table: string, ...args: any[]) {
      if (!table.startsWith(appPrefix)) {
        throw new Error(
          `\n🚨 [DB SAFETY] BLOCKED!\n` +
            `   Table: "${table}"\n` +
            `   Expected prefix: "${appPrefix}"\n` +
            `   This app can only access ${appPrefix}* tables.\n` +
            `   If this is intentional, use db.raw.from("${table}") instead.\n`,
        );
      }
      return (client.from as any)(table, ...args);
    },
  };
}

/**
 * Validates a list of table names against an app prefix.
 * Useful for validating migration files or seed scripts.
 */
export function validateTableNames(
  tables: string[],
  appPrefix: string,
): { valid: boolean; violations: string[] } {
  const violations = tables.filter((t) => !t.startsWith(appPrefix));
  return { valid: violations.length === 0, violations };
}
