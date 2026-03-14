import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Hook to manage a user's favorited postcards in PostalPeek.
 *
 * - On mount (if `user` exists), fetches all favorited postcard IDs AND full postcard data.
 * - Exposes `toggle(postcardId)` for optimistic add/remove.
 * - Returns the set of favorite IDs and the full favorited items array.
 */
export function useFavorites(user: User | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing favorites (IDs + full postcard data) when user becomes available
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setFavoriteItems([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    supabase
      .from('postalpeek_favorites')
      .select('postcard_id, postalpeek_postcards(*)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          setFavoriteIds(new Set(data.map((r) => r.postcard_id)));
          // Extract the joined postcard data
          const postcards = data
            .map((r: any) => r.postalpeek_postcards)
            .filter(Boolean);
          setFavoriteItems(postcards);
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

      // Optimistic update for items list
      if (isFav) {
        setFavoriteItems((prev) => prev.filter((item) => item.id !== postcardId));
      }

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

          // Fetch the full postcard data for the newly favorited item
          const { data: postcard } = await supabase
            .from('postalpeek_postcards')
            .select('*')
            .eq('id', postcardId)
            .single();

          if (postcard) {
            setFavoriteItems((prev) => [postcard, ...prev]);
          }
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

  return { favoriteIds, favoriteItems, toggle, isLoading };
}
