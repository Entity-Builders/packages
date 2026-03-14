import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Hook to manage a user's favorited postcards in PostalPeek.
 *
 * - On mount (if `user` exists), fetches all favorited postcard IDs.
 * - Exposes `toggle(postcardId)` for optimistic add/remove.
 * - Returns the set of favorite IDs so consumers can derive liked state.
 */
export function useFavorites(user: User | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing favorites when user becomes available
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    supabase
      .from('postalpeek_favorites')
      .select('postcard_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          setFavoriteIds(new Set(data.map((r) => r.postcard_id)));
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    async (postcardId: string) => {
      if (!user) return;

      const isFav = favoriteIds.has(postcardId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.delete(postcardId);
        } else {
          next.add(postcardId);
        }
        return next;
      });

      try {
        if (isFav) {
          const { error } = await supabase
            .from('postalpeek_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('postcard_id', postcardId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('postalpeek_favorites')
            .insert({ user_id: user.id, postcard_id: postcardId });

          if (error) throw error;
        }
      } catch (err) {
        // Rollback on failure
        console.error('Failed to toggle favorite:', err);
        setFavoriteIds((prev) => {
          const rollback = new Set(prev);
          if (isFav) {
            rollback.add(postcardId);
          } else {
            rollback.delete(postcardId);
          }
          return rollback;
        });
      }
    },
    [user, favoriteIds],
  );

  return { favoriteIds, toggle, isLoading };
}
