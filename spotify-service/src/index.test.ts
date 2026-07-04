import {
  formatSpotifyTrackForMusicBingo,
  parseSpotifyPlaylistId,
  resolveSpotifyPlaylist,
} from './index.js';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, received ${String(actual)}`);
  }
}

async function run(): Promise<void> {
  assertEqual(
    parseSpotifyPlaylistId('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=test'),
    '37i9dQZF1DXcBWIGoYBM5M',
    'parses open.spotify.com playlist URL',
  );
  assertEqual(
    parseSpotifyPlaylistId('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M'),
    '37i9dQZF1DXcBWIGoYBM5M',
    'parses Spotify playlist URI',
  );
  assertEqual(parseSpotifyPlaylistId('https://open.spotify.com/album/abc'), null, 'rejects non-playlist URLs');

  const successFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/playlists/37i9dQZF1DXcBWIGoYBM5M?')) {
      assert(url.includes('market=US'), 'requests playlist with a market');
      return jsonResponse({
        id: '37i9dQZF1DXcBWIGoYBM5M',
        name: 'Fiesta',
        description: 'Demo',
        external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' },
        images: [{ url: 'https://i.scdn.co/image/playlist-cover', width: 640, height: 640 }],
        snapshot_id: 'snapshot',
        owner: { display_name: 'Baraja' },
        tracks: { total: 3 },
      });
    }
    if (url.includes('/tracks')) {
      assert(url.includes('market=US'), 'requests tracks with a market');
      return jsonResponse({
        total: 3,
        next: null,
        items: [
          {
            track: {
              id: 'track-1',
              name: 'De musica ligera',
              type: 'track',
              is_local: false,
              duration_ms: 210000,
              artists: [{ name: 'Soda Stereo' }],
              album: {
                images: [{ url: 'https://i.scdn.co/image/track-1', width: 640, height: 640 }],
              },
              external_urls: { spotify: 'https://open.spotify.com/track/track-1' },
            },
          },
          {
            track: {
              id: 'episode-1',
              name: 'Podcast',
              type: 'episode',
              artists: [],
            },
          },
          {
            track: {
              id: 'track-2',
              name: 'Jijiji',
              type: 'track',
              is_local: false,
              duration_ms: 360000,
              artists: [{ name: 'Los Redondos' }],
              album: {
                images: [{ url: 'https://i.scdn.co/image/track-2', width: 640, height: 640 }],
              },
              external_urls: { spotify: 'https://open.spotify.com/track/track-2' },
            },
          },
        ],
      });
    }

    return jsonResponse({ error: { message: 'Not found' } }, 404);
  };

  const resolved = await resolveSpotifyPlaylist({
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    credentials: { clientId: 'client', clientSecret: 'secret' },
    fetcher: successFetch,
  });
  assert(resolved.ok, 'resolves playlist response');
  if (resolved.ok) {
    assertEqual(resolved.playlist.name, 'Fiesta', 'maps playlist name');
    assertEqual(resolved.playlist.coverImageUrl, 'https://i.scdn.co/image/playlist-cover', 'maps playlist cover');
    assertEqual(resolved.playlist.importedTrackCount, 2, 'skips non-track playlist items');
    assertEqual(resolved.playlist.tracks[0].imageUrl, 'https://i.scdn.co/image/track-1', 'maps track image');
    assertEqual(formatSpotifyTrackForMusicBingo(resolved.playlist.tracks[0]), 'Soda Stereo - De musica ligera', 'formats imported track');
  }

  const forbiddenFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    return jsonResponse({ error: { message: 'Forbidden' } }, 403);
  };
  const denied = await resolveSpotifyPlaylist({
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    credentials: { clientId: 'client', clientSecret: 'secret' },
    fetcher: forbiddenFetch,
  });
  assert(!denied.ok, 'returns failure for forbidden Spotify response');
  if (!denied.ok) {
    assertEqual(denied.reason, 'access_denied', 'classifies Spotify 403 as access denied');
  }

  const fallbackFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/playlists/37i9dQZF1DXcBWIGoYBM5M?')) {
      return jsonResponse({
        id: '37i9dQZF1DXcBWIGoYBM5M',
        name: 'Blocked through API',
        tracks: { total: 2 },
      });
    }
    if (url.includes('/tracks')) {
      return jsonResponse({ error: { message: 'Forbidden' } }, 403);
    }
    if (url === 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M') {
      return htmlResponse(publicPlaylistHtml('37i9dQZF1DXcBWIGoYBM5M'));
    }

    return jsonResponse({ error: { message: 'Not found' } }, 404);
  };
  const fallbackResolved = await resolveSpotifyPlaylist({
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    credentials: { clientId: 'client', clientSecret: 'secret' },
    fetcher: fallbackFetch,
  });
  assert(fallbackResolved.ok, 'falls back to the public Spotify playlist page after API denial');
  if (fallbackResolved.ok) {
    assertEqual(fallbackResolved.playlist.name, 'Public fiesta', 'maps public playlist name');
    assertEqual(fallbackResolved.playlist.totalTracks, 2, 'maps public playlist total count');
    assertEqual(fallbackResolved.playlist.coverImageUrl, 'https://i.scdn.co/image/public-playlist', 'maps public playlist cover');
    assertEqual(fallbackResolved.playlist.importedTrackCount, 2, 'imports public page tracks');
    assertEqual(fallbackResolved.playlist.tracks[0].id, 'publictrack1', 'maps public track id');
    assertEqual(fallbackResolved.playlist.tracks[0].imageUrl, 'https://i.scdn.co/image/public-track-large', 'chooses largest public track image');
    assertEqual(formatSpotifyTrackForMusicBingo(fallbackResolved.playlist.tracks[0]), 'Soda Stereo - Persiana americana', 'formats public fallback track');
  }

  const publicOnlyFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url === 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M') {
      return htmlResponse(publicPlaylistHtml('37i9dQZF1DXcBWIGoYBM5M'));
    }

    return jsonResponse({ error: { message: 'Unexpected request' } }, 500);
  };
  const publicOnlyResolved = await resolveSpotifyPlaylist({
    playlistUrl: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
    credentials: {},
    fetcher: publicOnlyFetch,
  });
  assert(publicOnlyResolved.ok, 'uses public Spotify page when API credentials are not configured');
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

function publicPlaylistHtml(playlistId: string): string {
  const initialState = {
    entities: {
      items: {
        [`spotify:playlist:${playlistId}`]: {
          __typename: 'Playlist',
          id: playlistId,
          uri: `spotify:playlist:${playlistId}`,
          name: 'Public fiesta',
          description: 'Tracks from the public page',
          ownerV2: {
            data: {
              name: 'Listanauta',
            },
          },
          images: {
            items: [
              {
                sources: [
                  {
                    url: 'https://i.scdn.co/image/public-playlist',
                    width: null,
                    height: null,
                  },
                ],
              },
            ],
          },
          content: {
            totalCount: 2,
            items: [
              {
                itemV2: {
                  data: {
                    __typename: 'Track',
                    name: 'Persiana americana',
                    uri: 'spotify:track:publictrack1',
                    duration: {
                      totalMilliseconds: 286000,
                    },
                    artists: {
                      items: [
                        {
                          profile: {
                            name: 'Soda Stereo',
                          },
                        },
                      ],
                    },
                    albumOfTrack: {
                      coverArt: {
                        sources: [
                          {
                            url: 'https://i.scdn.co/image/public-track-small',
                            width: 64,
                            height: 64,
                          },
                          {
                            url: 'https://i.scdn.co/image/public-track-large',
                            width: 640,
                            height: 640,
                          },
                        ],
                      },
                    },
                  },
                },
              },
              {
                itemV2: {
                  data: {
                    __typename: 'Track',
                    name: 'Matador',
                    uri: 'spotify:track:publictrack2',
                    duration: {
                      totalMilliseconds: 276000,
                    },
                    artists: {
                      items: [
                        {
                          profile: {
                            name: 'Los Fabulosos Cadillacs',
                          },
                        },
                      ],
                    },
                    albumOfTrack: {
                      coverArt: {
                        sources: [
                          {
                            url: 'https://i.scdn.co/image/public-track-2',
                            width: 300,
                            height: 300,
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  };

  return `<html><body><script id="initialState" type="text/plain">${btoa(
    JSON.stringify(initialState),
  )}</script></body></html>`;
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
