import {
  cleanupSpotifyPlaylistDuplicates,
  createSpotifyPlaylistFromQueries,
  formatSpotifyTrackForMusicBingo,
  listSpotifyUserPlaylists,
  normalizeSeedQueryKey,
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
    if (url.includes('/items')) {
      assert(url.includes('market=US'), 'requests playlist items with a market');
      return jsonResponse({
        total: 3,
        next: null,
        items: [
          {
            item: {
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
            item: {
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
    assertEqual(resolved.playlist.importSource, 'web_api', 'marks API imports as web API source');
    assertEqual(resolved.playlist.isPartial, false, 'marks complete API import as not partial');
    assertEqual(resolved.playlist.importedTrackCount, 2, 'skips non-track playlist items');
    assertEqual(resolved.playlist.tracks[0].imageUrl, 'https://i.scdn.co/image/track-1', 'maps track image');
    assertEqual(formatSpotifyTrackForMusicBingo(resolved.playlist.tracks[0]), 'Soda Stereo - De musica ligera', 'formats imported track');
  }

  const paginatedTrackOffsets: number[] = [];
  const paginatedFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/playlists/37i9dQZF1DXcBWIGoYBM5M?')) {
      return jsonResponse({
        id: '37i9dQZF1DXcBWIGoYBM5M',
        name: 'Fiesta paginada',
        tracks: { total: 101 },
      });
    }
    if (url.includes('/items')) {
      const endpoint = new URL(url);
      const offset = Number(endpoint.searchParams.get('offset') ?? '0');
      const limit = Number(endpoint.searchParams.get('limit') ?? '50');
      paginatedTrackOffsets.push(offset);
      const remaining = Math.max(0, 101 - offset);
      const count = Math.min(limit, remaining);
      return jsonResponse({
        total: 101,
        next: offset + count < 101 ? `https://api.spotify.com/v1/playlists/demo/items?offset=${offset + count}` : null,
        items: Array.from({ length: count }, (_, index) =>
          apiTrackItem(`track-${offset + index + 1}`, `Tema ${offset + index + 1}`, 'Baraja Band')
        ),
      });
    }

    return jsonResponse({ error: { message: 'Not found' } }, 404);
  };
  const paginatedResolved = await resolveSpotifyPlaylist({
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    credentials: { clientId: 'client', clientSecret: 'secret' },
    fetcher: paginatedFetch,
    maxTracks: 200,
  });
  assert(paginatedResolved.ok, 'resolves paginated API playlist response');
  if (paginatedResolved.ok) {
    assertEqual(paginatedTrackOffsets.join(','), '0,50,100', 'requests every API page');
    assertEqual(paginatedResolved.playlist.totalTracks, 101, 'keeps API total track count');
    assertEqual(paginatedResolved.playlist.importedTrackCount, 101, 'imports tracks from every API page');
    assertEqual(paginatedResolved.playlist.isPartial, false, 'marks fully paginated API import as complete');
    assertEqual(formatSpotifyTrackForMusicBingo(paginatedResolved.playlist.tracks[100]), 'Baraja Band - Tema 101', 'maps tracks from the second page');
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
    if (url.includes('/items')) {
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
    assertEqual(fallbackResolved.playlist.importSource, 'public_page', 'marks fallback imports as public page source');
    assertEqual(fallbackResolved.playlist.isPartial, false, 'marks complete public fallback import as not partial');
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
  if (publicOnlyResolved.ok) {
    assertEqual(publicOnlyResolved.playlist.importSource, 'public_page', 'marks public-only imports as public page source');
  }

  const partialPublicFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url === 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M') {
      return htmlResponse(publicPlaylistHtml('37i9dQZF1DXcBWIGoYBM5M', { totalCount: 100 }));
    }

    return jsonResponse({ error: { message: 'Unexpected request' } }, 500);
  };
  const partialPublicResolved = await resolveSpotifyPlaylist({
    playlistUrl: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
    credentials: {},
    fetcher: partialPublicFetch,
  });
  assert(partialPublicResolved.ok, 'uses partial public Spotify page data when it is the only readable source');
  if (partialPublicResolved.ok) {
    assertEqual(partialPublicResolved.playlist.totalTracks, 100, 'keeps partial public playlist total count');
    assertEqual(partialPublicResolved.playlist.importedTrackCount, 2, 'imports only embedded public page tracks');
    assertEqual(partialPublicResolved.playlist.isPartial, true, 'marks public page imports as partial when total is larger');
  }

  const userPlaylistOffsets: number[] = [];
  const userPlaylistsFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/me/playlists')) {
      const endpoint = new URL(url);
      const offset = Number(endpoint.searchParams.get('offset') ?? '0');
      userPlaylistOffsets.push(offset);
      return jsonResponse({
        total: 2,
        next: offset === 0 ? 'https://api.spotify.com/v1/me/playlists?offset=1' : null,
        items: offset === 0
          ? [
              {
                id: 'playlist-1',
                name: 'Mi fiesta',
                description: 'Propia',
                external_urls: { spotify: 'https://open.spotify.com/playlist/playlist-1' },
                images: [{ url: 'https://i.scdn.co/image/user-playlist-1', width: 640, height: 640 }],
                owner: { display_name: 'Juano' },
                tracks: { total: 72 },
                collaborative: false,
                public: false,
              },
            ]
          : [
              {
                id: 'playlist-2',
                name: 'Compartida',
                external_urls: {},
                images: [],
                owner: { display_name: 'Equipo' },
                tracks: { total: 120 },
                collaborative: true,
                public: true,
              },
            ],
      });
    }

    return jsonResponse({ error: { message: 'Not found' } }, 404);
  };
  const userPlaylistsResolved = await listSpotifyUserPlaylists({
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    fetcher: userPlaylistsFetch,
    maxPlaylists: 2,
  });
  assert(userPlaylistsResolved.ok, 'lists current user playlists');
  if (userPlaylistsResolved.ok) {
    assertEqual(userPlaylistOffsets.join(','), '0,1', 'requests user playlist pages');
    assertEqual(userPlaylistsResolved.playlists.length, 2, 'returns normalized user playlists');
    assertEqual(userPlaylistsResolved.playlists[0].name, 'Mi fiesta', 'maps user playlist name');
    assertEqual(userPlaylistsResolved.playlists[0].totalTracks, 72, 'maps user playlist track total');
    assertEqual(userPlaylistsResolved.playlists[0].coverImageUrl, 'https://i.scdn.co/image/user-playlist-1', 'maps user playlist cover');
    assertEqual(userPlaylistsResolved.playlists[1].spotifyUrl, 'https://open.spotify.com/playlist/playlist-2', 'falls back to Spotify playlist URL');
    assertEqual(userPlaylistsResolved.playlists[1].isCollaborative, true, 'maps collaborative flag');
  }

  let createPlaylistRequestCount = 0;
  let addPlaylistItemsRequestCount = 0;
  let updateExistingPlaylistItemsRequestCount = 0;
  const seedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/search')) {
      const endpoint = new URL(url);
      const query = endpoint.searchParams.get('q') ?? '';
      assertEqual(endpoint.searchParams.get('type'), 'track', 'searches only tracks');
      assertEqual(endpoint.searchParams.get('limit'), '1', 'requests the best match only');
      if (query === 'No existe - Cancion inventada') {
        return jsonResponse({
          tracks: {
            items: [],
          },
        });
      }
      if (query === 'Charly Garcia - No voy en tren') {
        return jsonResponse({
          tracks: {
            items: [apiSearchTrack('track-seed-2', 'No voy en tren', 'Charly Garcia')],
          },
        });
      }

      return jsonResponse({
        tracks: {
          items: [apiSearchTrack('track-seed-1', 'De musica ligera', 'Soda Stereo')],
        },
      });
    }
    if (url.endsWith('/me/playlists')) {
      createPlaylistRequestCount += 1;
      assertEqual(init?.method, 'POST', 'creates playlist with POST');
      const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      assertEqual(body.name, 'Baraja Seed Test', 'sends playlist name');
      assertEqual(body.public, false, 'creates private playlists by default');
      return jsonResponse({
        id: 'seed-playlist',
        name: 'Baraja Seed Test',
        external_urls: { spotify: 'https://open.spotify.com/playlist/seed-playlist' },
      }, 201);
    }
    if (url.includes('/playlists/existingplaylist/items')) {
      if (init?.method === 'POST') {
        updateExistingPlaylistItemsRequestCount += 1;
        const body = JSON.parse(String(init?.body ?? '{}')) as { uris?: unknown };
        const uris = Array.isArray(body.uris) ? body.uris : [];
        assertEqual(uris.length, 1, 'adds only tracks missing from the existing playlist');
        assertEqual(uris[0], 'spotify:track:track-seed-2', 'skips existing track uris');
        return jsonResponse({ snapshot_id: 'snapshot-existing' }, 201);
      }

      return jsonResponse({
        total: 1,
        next: null,
        items: [
          {
            track: {
              id: 'track-seed-1',
              uri: 'spotify:track:track-seed-1',
              type: 'track',
            },
          },
        ],
      });
    }
    if (url.endsWith('/playlists/seed-playlist/items')) {
      addPlaylistItemsRequestCount += 1;
      assertEqual(init?.method, 'POST', 'adds playlist items with POST');
      const body = JSON.parse(String(init?.body ?? '{}')) as { uris?: unknown };
      const uris = Array.isArray(body.uris) ? body.uris : [];
      assert(uris.length > 0, 'sends uris in the JSON body');
      assertEqual(uris[0], 'spotify:track:track-seed-1', 'adds matched track uri');
      return jsonResponse({ snapshot_id: 'snapshot-seed' }, 201);
    }

    return jsonResponse({ error: { message: 'Not found' } }, 404);
  };

  const dryRunSeed = await createSpotifyPlaylistFromQueries({
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    name: 'Baraja Seed Test',
    queries: ['Soda Stereo - De musica ligera', 'No existe - Cancion inventada'],
    fetcher: seedFetch,
    dryRun: true,
  });
  assert(dryRunSeed.ok, 'previews seed playlist matches without creating a playlist');
  if (dryRunSeed.ok) {
    assertEqual(dryRunSeed.playlist, null, 'dry run does not create a Spotify playlist');
    assertEqual(dryRunSeed.matchedTracks.length, 1, 'dry run returns matched tracks');
    assertEqual(dryRunSeed.unmatchedQueries[0], 'No existe - Cancion inventada', 'dry run returns unmatched queries');
  }
  assertEqual(createPlaylistRequestCount, 0, 'dry run skips playlist creation');

  const seededPlaylist = await createSpotifyPlaylistFromQueries({
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    name: 'Baraja Seed Test',
    queries: ['Soda Stereo - De musica ligera', 'No existe - Cancion inventada'],
    fetcher: seedFetch,
  });
  assert(seededPlaylist.ok, 'creates a Spotify seed playlist');
  if (seededPlaylist.ok) {
    assertEqual(seededPlaylist.playlist?.spotifyUrl, 'https://open.spotify.com/playlist/seed-playlist', 'returns seeded playlist URL');
    assertEqual(seededPlaylist.addedTrackCount, 1, 'adds only matched tracks');
    assertEqual(seededPlaylist.unmatchedQueries.length, 1, 'keeps unmatched queries');
  }
  assertEqual(createPlaylistRequestCount, 1, 'creates one playlist');
  assertEqual(addPlaylistItemsRequestCount, 1, 'adds playlist items once');

  const updatedPlaylist = await createSpotifyPlaylistFromQueries({
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    name: 'Baraja Existing Seed Test',
    playlistUrl: 'https://open.spotify.com/playlist/existingplaylist',
    queries: ['Soda Stereo - De musica ligera', 'Charly Garcia - No voy en tren'],
    fetcher: seedFetch,
  });
  assert(updatedPlaylist.ok, 'updates an existing Spotify seed playlist');
  if (updatedPlaylist.ok) {
    assertEqual(updatedPlaylist.playlist?.spotifyUrl, 'https://open.spotify.com/playlist/existingplaylist', 'returns existing playlist URL');
    assertEqual(updatedPlaylist.addedTrackCount, 1, 'adds only one missing matched track');
    assertEqual(updatedPlaylist.matchedTracks.length, 2, 'still reports all matched rows');
  }
  assertEqual(createPlaylistRequestCount, 1, 'does not create a second playlist when playlistUrl is provided');
  assertEqual(updateExistingPlaylistItemsRequestCount, 1, 'adds missing items to the existing playlist once');

  let cachedSeedSearchRequestCount = 0;
  let cachedSeedAddRequestCount = 0;
  const cachedSeedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/search')) {
      cachedSeedSearchRequestCount += 1;
      return jsonResponse({ error: { message: 'Search should have been cached' } }, 500);
    }
    if (url.endsWith('/me/playlists')) {
      return jsonResponse({
        id: 'cached-seed-playlist',
        name: 'Cached Seed Test',
        external_urls: { spotify: 'https://open.spotify.com/playlist/cached-seed-playlist' },
      }, 201);
    }
    if (url.endsWith('/playlists/cached-seed-playlist/items')) {
      cachedSeedAddRequestCount += 1;
      const body = JSON.parse(String(init?.body ?? '{}')) as { uris?: unknown };
      const uris = Array.isArray(body.uris) ? body.uris : [];
      assertEqual(uris[0], 'spotify:track:cached-track-1', 'adds cached track uri');
      return jsonResponse({ snapshot_id: 'cached-snapshot' }, 201);
    }

    return jsonResponse({ error: { message: 'Not found' } }, 404);
  };
  const cachedSeed = await createSpotifyPlaylistFromQueries({
    cachedTrackMatches: {
      [normalizeSeedQueryKey('Soda Stereo - Sobredosis de TV')]: {
        query: 'Soda Stereo - Sobredosis de TV',
        uri: 'spotify:track:cached-track-1',
        id: 'cached-track-1',
        title: 'Sobredosis de TV',
        artists: ['Soda Stereo'],
        artistDisplayName: 'Soda Stereo',
        spotifyUrl: 'https://open.spotify.com/track/cached-track-1',
        imageUrl: null,
      },
    },
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    name: 'Cached Seed Test',
    queries: ['Soda Stereo - Sobredosis de TV'],
    fetcher: cachedSeedFetch,
  });
  assert(cachedSeed.ok, 'creates a playlist from cached Spotify track matches');
  if (cachedSeed.ok) {
    assertEqual(cachedSeed.matchedTracks.length, 1, 'reports cached matches');
    assertEqual(cachedSeed.addedTrackCount, 1, 'adds cached matches');
  }
  assertEqual(cachedSeedSearchRequestCount, 0, 'does not call Spotify search for cached queries');
  assertEqual(cachedSeedAddRequestCount, 1, 'adds cached query results to the playlist');

  const rateLimitedSearchFetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/search')) {
      return jsonResponse(
        { error: { message: 'Rate limit exceeded' } },
        429,
        { 'Retry-After': '9' },
      );
    }

    return jsonResponse({ error: { message: 'Unexpected request' } }, 500);
  };
  const rateLimitedSeed = await createSpotifyPlaylistFromQueries({
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    name: 'Baraja Rate Limit Seed Test',
    queries: ['Soda Stereo - De musica ligera'],
    fetcher: rateLimitedSearchFetch,
  });
  assert(!rateLimitedSeed.ok, 'returns a typed failure when Spotify rate-limits search');
  if (!rateLimitedSeed.ok) {
    assertEqual(rateLimitedSeed.reason, 'rate_limited', 'keeps rate-limit reason');
    assertEqual(rateLimitedSeed.operation, 'search_track', 'reports the rate-limited operation');
    assertEqual(rateLimitedSeed.failedQuery, 'Soda Stereo - De musica ligera', 'reports the query that hit the rate limit');
    assertEqual(rateLimitedSeed.retryAfterSeconds, 9, 'reports Retry-After seconds');
  }

  let duplicateCleanupDeleteCount = 0;
  const duplicateCleanupFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes('/api/token')) {
      return jsonResponse({ access_token: 'token' });
    }
    if (url.includes('/playlists/cleanupdemo/items')) {
      return jsonResponse({
        total: 4,
        next: null,
        items: [
          apiTrackItem('flaca-a', 'Flaca', 'Andres Calamaro'),
          apiTrackItem('jijiji', 'Jijiji', 'Los Redondos'),
          apiTrackItem('flaca-b', 'Flaca', 'Andres Calamaro'),
          apiTrackItem('flaca-c', 'Flaca', 'Andres Calamaro'),
        ],
      });
    }
    if (url.endsWith('/playlists/cleanupdemo/tracks')) {
      duplicateCleanupDeleteCount += 1;
      assertEqual(init?.method, 'DELETE', 'uses Spotify delete endpoint for cleanup');
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        tracks?: Array<{ uri?: string; positions?: number[] }>;
      };
      const positions = (body.tracks ?? []).flatMap((track) => track.positions ?? []);
      assertEqual(positions.join(','), '3,2', 'removes duplicate positions from the end first');
      return jsonResponse({ snapshot_id: 'snapshot-cleaned' });
    }

    return jsonResponse({ error: { message: 'Unexpected request' } }, 500);
  };
  const duplicateDryRun = await cleanupSpotifyPlaylistDuplicates({
    playlistUrl: 'https://open.spotify.com/playlist/cleanupdemo',
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    dryRun: true,
    fetcher: duplicateCleanupFetch,
    matchMode: 'song',
  });
  assert(duplicateDryRun.ok, 'dry-runs playlist duplicate cleanup');
  if (duplicateDryRun.ok) {
    assertEqual(duplicateDryRun.duplicateGroups.length, 1, 'groups duplicate songs');
    assertEqual(duplicateDryRun.duplicateTrackCount, 2, 'counts duplicate song occurrences');
    assertEqual(duplicateDryRun.removedTrackCount, 0, 'does not remove tracks in dry run');
  }
  assertEqual(duplicateCleanupDeleteCount, 0, 'dry run does not call delete');

  const duplicateApply = await cleanupSpotifyPlaylistDuplicates({
    playlistUrl: 'spotify:playlist:cleanupdemo',
    credentials: { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh' },
    dryRun: false,
    fetcher: duplicateCleanupFetch,
    matchMode: 'song',
  });
  assert(duplicateApply.ok, 'applies playlist duplicate cleanup');
  if (duplicateApply.ok) {
    assertEqual(duplicateApply.removedTrackCount, 2, 'reports removed duplicate tracks');
    assertEqual(duplicateApply.snapshotId, 'snapshot-cleaned', 'returns Spotify snapshot id');
  }
  assertEqual(duplicateCleanupDeleteCount, 1, 'apply calls delete once');
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
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

function apiTrackItem(id: string, title: string, artist: string): Record<string, unknown> {
  return {
    track: {
      id,
      name: title,
      type: 'track',
      is_local: false,
      duration_ms: 210000,
      artists: [{ name: artist }],
      album: {
        images: [{ url: `https://i.scdn.co/image/${id}`, width: 640, height: 640 }],
      },
      external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    },
  };
}

function apiSearchTrack(id: string, title: string, artist: string): Record<string, unknown> {
  return {
    id,
    uri: `spotify:track:${id}`,
    name: title,
    type: 'track',
    is_local: false,
    duration_ms: 210000,
    artists: [{ name: artist }],
    album: {
      images: [{ url: `https://i.scdn.co/image/${id}`, width: 640, height: 640 }],
    },
    external_urls: { spotify: `https://open.spotify.com/track/${id}` },
  };
}

function publicPlaylistHtml(
  playlistId: string,
  options: { totalCount?: number } = {},
): string {
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
            totalCount: options.totalCount ?? 2,
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
