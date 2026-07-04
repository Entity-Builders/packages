import type { MusicBingoSong } from './types.js';

export interface MusicBingoSongArtworkCacheEntry {
  artworkUrl: string;
  spotifyTrackUrl?: string;
}

export function applyMusicBingoSongArtworkCache(
  songs: MusicBingoSong[],
  cache: Record<string, MusicBingoSongArtworkCacheEntry>
): MusicBingoSong[] {
  return songs.map((song) => {
    const cachedArtwork = cache[song.id];
    return cachedArtwork ? { ...song, ...cachedArtwork } : song;
  });
}
