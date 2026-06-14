import { useEffect, useState } from 'react';
import { supabase, supabaseAuthStorageKey } from '../supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Hardcoded admin emails. Any authenticated user whose email
 * is in this list gets `isAdmin = true`.
 * Cheap and effective for a solo-preneur setup.
 */
const ADMIN_EMAILS = ['juanobrach@gmail.com'];

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Reusable auth hook for any app in the Entity Builders ecosystem.
 * Subscribes to Supabase auth state changes and exposes:
 * - `user` — the current Supabase user (or null)
 * - `isAdmin` — whether the user is in the admin list
 * - `loading` — true while the initial session check is in progress
 * - `signIn(email, password)` — login helper
 * - `signOut()` — logout helper
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Check existing session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error: unknown) => {
        console.warn('[useAuth] Failed to restore Supabase session', error);
        if (!mounted) return;
        setUser(null);
        setLoading(false);

        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(supabaseAuthStorageKey);
        }
      });

    // 2. Subscribe to auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? '');
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, isAdmin, loading, signIn, signOut };
}
