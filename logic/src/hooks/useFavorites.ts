import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

type FavoriteJoinRow = {
  postcard_id: string;
  postcards: unknown | null;
};

type BilingualText = {
  es: string;
  en: string;
};

export type FavoritePostcardItem = {
  id: string;
  country: string;
  city: string;
  location_name?: string;
  lat: number;
  lng: number;
  original_image_url: string;
  illustration_url: string;
  category: string | BilingualText;
  description: string | BilingualText;
  created_at: string;
  [key: string]: unknown;
};

const isBilingualText = (value: unknown): value is BilingualText => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.es === 'string' && typeof record.en === 'string';
};

const isFavoritePostcardItem = (
  postcard: unknown,
): postcard is FavoritePostcardItem => {
  if (!postcard || typeof postcard !== 'object') return false;
  const record = postcard as Record<string, unknown>;
  const category = record.category;
  const description = record.description;

  return (
    typeof record.id === 'string' &&
    typeof record.country === 'string' &&
    typeof record.city === 'string' &&
    typeof record.lat === 'number' &&
    typeof record.lng === 'number' &&
    typeof record.original_image_url === 'string' &&
    typeof record.illustration_url === 'string' &&
    (typeof category === 'string' || isBilingualText(category)) &&
    (typeof description === 'string' || isBilingualText(description)) &&
    typeof record.created_at === 'string'
  );
};

/**
 * Hook to manage a user's favorited postcards in PostalPeek.
 *
 * - On mount (if `user` exists), fetches all favorited postcard IDs AND full postcard data.
 * - Exposes `toggle(postcardId)` for optimistic add/remove.
 * - Returns the set of favorite IDs and the full favorited items array.
 */
export function useFavorites(user: User | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<FavoritePostcardItem[]>(
    [],
  );
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
      .from('favorites')
      .select('postcard_id, postcards(*)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          const rows = data as FavoriteJoinRow[];
          setFavoriteIds(new Set(rows.map((r) => r.postcard_id)));
          // Extract the joined postcard data
          const postcards = rows
            .map((r) => r.postcards)
            .filter(isFavoritePostcardItem);
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
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('postcard_id', postcardId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('favorites')
            .insert({ user_id: user.id, postcard_id: postcardId });

          if (error) throw error;

          // Fetch the full postcard data for the newly favorited item
          const { data: postcard } = await supabase
            .from('postcards')
            .select('*')
            .eq('id', postcardId)
            .single();

          if (isFavoritePostcardItem(postcard)) {
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
