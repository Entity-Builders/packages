export interface SpotifyCredentials {
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyPlaylistTrack {
  id: string | null;
  title: string;
  artists: string[];
  artistDisplayName: string;
  durationMs: number | null;
  spotifyUrl: string | null;
  imageUrl: string | null;
  isLocal: boolean;
}

export interface SpotifyPlaylistData {
  id: string;
  name: string;
  description: string | null;
  ownerDisplayName: string | null;
  snapshotId: string | null;
  spotifyUrl: string;
  images: SpotifyImage[];
  coverImageUrl: string | null;
  totalTracks: number | null;
  importedTrackCount: number;
  skippedTrackCount: number;
  importSource: 'web_api' | 'public_page';
  isPartial: boolean;
  tracks: SpotifyPlaylistTrack[];
}

export interface SpotifyUserPlaylistSummary {
  id: string;
  name: string;
  description: string | null;
  ownerDisplayName: string | null;
  spotifyUrl: string;
  images: SpotifyImage[];
  coverImageUrl: string | null;
  totalTracks: number | null;
  isCollaborative: boolean;
  isPublic: boolean | null;
}

export interface SpotifyPlaylistSeedTrackMatch {
  query: string;
  uri: string;
  id: string | null;
  title: string;
  artists: string[];
  artistDisplayName: string;
  spotifyUrl: string | null;
  imageUrl: string | null;
}

export interface SpotifySeededPlaylistSummary {
  id: string;
  name: string;
  spotifyUrl: string;
}

export type SpotifyPlaylistDuplicateMatchMode = 'song' | 'uri';

export interface SpotifyPlaylistTrackOccurrence {
  position: number;
  uri: string;
  id: string | null;
  title: string;
  artistDisplayName: string;
}

export interface SpotifyPlaylistDuplicateGroup {
  key: string;
  keptTrack: SpotifyPlaylistTrackOccurrence;
  duplicateTracks: SpotifyPlaylistTrackOccurrence[];
}

export type SpotifyPlaylistResolveFailureReason =
  | 'invalid_url'
  | 'not_configured'
  | 'unauthorized'
  | 'access_denied'
  | 'not_found'
  | 'rate_limited'
  | 'spotify_error'
  | 'network_error';

export type SpotifyApiOperation =
  | 'get_access_token'
  | 'get_playlist'
  | 'get_playlist_items'
  | 'get_existing_playlist_items'
  | 'list_user_playlists'
  | 'search_track'
  | 'create_playlist'
  | 'add_playlist_items'
  | 'remove_playlist_items'
  | 'public_playlist_page';

export type SpotifyPlaylistResolveResult =
  | {
      ok: true;
      playlist: SpotifyPlaylistData;
    }
  | {
      ok: false;
      reason: SpotifyPlaylistResolveFailureReason;
      message: string;
      status?: number;
      retryAfterSeconds?: number;
      operation?: SpotifyApiOperation;
    };

export type SpotifyUserPlaylistsResult =
  | {
      ok: true;
      playlists: SpotifyUserPlaylistSummary[];
    }
  | {
      ok: false;
      reason: SpotifyPlaylistResolveFailureReason;
      message: string;
      status?: number;
      retryAfterSeconds?: number;
      operation?: SpotifyApiOperation;
    };

export type SpotifyPlaylistSeedResult =
  | {
      ok: true;
      dryRun: boolean;
      playlist: SpotifySeededPlaylistSummary | null;
      matchedTracks: SpotifyPlaylistSeedTrackMatch[];
      unmatchedQueries: string[];
      addedTrackCount: number;
    }
  | {
      ok: false;
      reason: SpotifyPlaylistResolveFailureReason;
      message: string;
      status?: number;
      retryAfterSeconds?: number;
      operation?: SpotifyApiOperation;
      failedQuery?: string;
      matchedTracks?: SpotifyPlaylistSeedTrackMatch[];
      unmatchedQueries?: string[];
      matchedTrackCount?: number;
      unmatchedQueryCount?: number;
    };

export type SpotifyPlaylistDuplicateCleanupResult =
  | {
      ok: true;
      dryRun: boolean;
      playlistId: string;
      matchMode: SpotifyPlaylistDuplicateMatchMode;
      totalTrackCount: number;
      duplicateGroups: SpotifyPlaylistDuplicateGroup[];
      duplicateTrackCount: number;
      removedTrackCount: number;
      snapshotId: string | null;
    }
  | {
      ok: false;
      reason: SpotifyPlaylistResolveFailureReason;
      message: string;
      status?: number;
      retryAfterSeconds?: number;
      operation?: SpotifyApiOperation;
    };

export interface ResolveSpotifyPlaylistInput {
  playlistUrl: string;
  credentials: SpotifyCredentials;
  allowPublicPageFallback?: boolean;
  fetcher?: typeof fetch;
  maxTracks?: number;
  market?: string;
}

export interface ListSpotifyUserPlaylistsInput {
  credentials: SpotifyCredentials;
  fetcher?: typeof fetch;
  maxPlaylists?: number;
}

export interface CreateSpotifyPlaylistFromQueriesInput {
  credentials: SpotifyCredentials;
  name: string;
  queries: string[];
  cachedTrackMatches?: Record<string, SpotifyPlaylistSeedTrackMatch>;
  description?: string;
  isPublic?: boolean;
  playlistUrl?: string;
  dryRun?: boolean;
  fetcher?: typeof fetch;
  market?: string;
  maxQueries?: number;
  requestDelayMs?: number;
}

export interface CleanupSpotifyPlaylistDuplicatesInput {
  playlistUrl: string;
  credentials: SpotifyCredentials;
  dryRun?: boolean;
  fetcher?: typeof fetch;
  market?: string;
  matchMode?: SpotifyPlaylistDuplicateMatchMode;
}

interface SpotifyTokenResponse {
  access_token?: unknown;
  token_type?: unknown;
  expires_in?: unknown;
  error?: unknown;
  error_description?: unknown;
}

interface SpotifyPlaylistResponse {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  snapshot_id?: unknown;
  external_urls?: unknown;
  images?: unknown;
  owner?: unknown;
  tracks?: unknown;
}

interface SpotifyPlaylistItemsResponse {
  items?: unknown;
  next?: unknown;
  total?: unknown;
}

interface SpotifyUserPlaylistsResponse {
  items?: unknown;
  next?: unknown;
  total?: unknown;
}

interface SpotifySearchTracksResponse {
  tracks?: unknown;
}

interface SpotifyCreatedPlaylistResponse {
  id?: unknown;
  name?: unknown;
  external_urls?: unknown;
}

interface SpotifySnapshotResponse {
  snapshot_id?: unknown;
}

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const DEFAULT_MAX_TRACKS = 500;
const DEFAULT_MAX_USER_PLAYLISTS = 250;
const DEFAULT_MAX_SEED_QUERIES = 200;
const DEFAULT_MARKET = 'US';
const MAX_SPOTIFY_PAGE_SIZE = 50;
const MAX_SPOTIFY_ADD_ITEMS_BATCH_SIZE = 100;
const MAX_SPOTIFY_REMOVE_ITEMS_BATCH_SIZE = 100;

export function parseSpotifyPlaylistId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const uriMatch = trimmed.match(/^spotify:playlist:([A-Za-z0-9]+)$/);
  if (uriMatch) return uriMatch[1];

  try {
    const url = new URL(trimmed);
    const isSpotifyHost =
      url.hostname === 'open.spotify.com' || url.hostname.endsWith('.open.spotify.com');
    if (!isSpotifyHost) return null;

    const [kind, id] = url.pathname.split('/').filter(Boolean);
    if (kind !== 'playlist' || !id || !/^[A-Za-z0-9]+$/.test(id)) return null;
    return id;
  } catch {
    return null;
  }
}

export function toSpotifyPlaylistUrl(playlistId: string): string {
  return `https://open.spotify.com/playlist/${playlistId}`;
}

export function formatSpotifyTrackForMusicBingo(track: SpotifyPlaylistTrack): string {
  return `${track.artistDisplayName} - ${track.title}`;
}

export async function resolveSpotifyPlaylist(
  input: ResolveSpotifyPlaylistInput,
): Promise<SpotifyPlaylistResolveResult> {
  const playlistId = parseSpotifyPlaylistId(input.playlistUrl);
  if (!playlistId) {
    return {
      ok: false,
      reason: 'invalid_url',
      message: 'La URL no parece ser una playlist valida de Spotify.',
    };
  }

  const fetcher = input.fetcher ?? fetch;
  const maxTracks = Math.max(1, Math.min(input.maxTracks ?? DEFAULT_MAX_TRACKS, DEFAULT_MAX_TRACKS));
  const market = normalizeMarket(input.market);
  const allowPublicPageFallback = input.allowPublicPageFallback !== false;
  const accessTokenResult = await getSpotifyAccessToken(input.credentials, fetcher);
  let spotifyApiFailure: Extract<SpotifyPlaylistResolveResult, { ok: false }> | null = null;

  if (accessTokenResult.ok) {
    const spotifyApiResult = await resolveSpotifyPlaylistWithApi(
      playlistId,
      accessTokenResult.accessToken,
      fetcher,
      maxTracks,
      market,
    );
    if (spotifyApiResult.ok) return spotifyApiResult;
    spotifyApiFailure = spotifyApiResult;
  } else {
    spotifyApiFailure = accessTokenResult;
  }

  if (allowPublicPageFallback) {
    const publicPageResult = await resolveSpotifyPlaylistFromPublicPage(playlistId, fetcher, maxTracks);
    if (publicPageResult.ok) return publicPageResult;
  }

  return spotifyApiFailure;
}

export async function listSpotifyUserPlaylists(
  input: ListSpotifyUserPlaylistsInput,
): Promise<SpotifyUserPlaylistsResult> {
  const fetcher = input.fetcher ?? fetch;
  const maxPlaylists = Math.max(
    1,
    Math.min(input.maxPlaylists ?? DEFAULT_MAX_USER_PLAYLISTS, DEFAULT_MAX_USER_PLAYLISTS),
  );
  const accessTokenResult = await getSpotifyAccessToken(input.credentials, fetcher);
  if (!accessTokenResult.ok) return accessTokenResult;

  const playlists: SpotifyUserPlaylistSummary[] = [];
  let offset = 0;

  while (playlists.length < maxPlaylists) {
    const limit = Math.min(MAX_SPOTIFY_PAGE_SIZE, maxPlaylists - playlists.length);
    const endpoint =
      `${SPOTIFY_API_BASE_URL}/me/playlists?limit=${limit}&offset=${offset}` +
      '&fields=items(id,name,description,external_urls,images,owner(display_name),tracks(total),collaborative,public),next,total';
    const pageResult = await spotifyJson<SpotifyUserPlaylistsResponse>(
      endpoint,
      accessTokenResult.accessToken,
      fetcher,
      undefined,
      'list_user_playlists',
    );
    if (!pageResult.ok) return pageResult;

    const items = Array.isArray(pageResult.body.items) ? pageResult.body.items : [];
    for (const item of items) {
      const playlist = normalizeUserPlaylistSummary(item);
      if (playlist) playlists.push(playlist);
      if (playlists.length >= maxPlaylists) break;
    }

    if (typeof pageResult.body.next !== 'string' || !pageResult.body.next || items.length === 0) {
      break;
    }
    offset += items.length;
  }

  return {
    ok: true,
    playlists,
  };
}

export async function cleanupSpotifyPlaylistDuplicates(
  input: CleanupSpotifyPlaylistDuplicatesInput,
): Promise<SpotifyPlaylistDuplicateCleanupResult> {
  const playlistId = parseSpotifyPlaylistId(input.playlistUrl);
  if (!playlistId) {
    return {
      ok: false,
      reason: 'invalid_url',
      message: 'La URL no parece ser una playlist valida de Spotify.',
    };
  }

  const fetcher = input.fetcher ?? fetch;
  const market = normalizeMarket(input.market);
  const matchMode = input.matchMode ?? 'song';
  const accessTokenResult = await getSpotifyAccessToken(input.credentials, fetcher);
  if (!accessTokenResult.ok) return accessTokenResult;

  const occurrenceResult = await fetchPlaylistTrackOccurrences(
    playlistId,
    accessTokenResult.accessToken,
    fetcher,
    market,
  );
  if (!occurrenceResult.ok) return occurrenceResult;

  const duplicateGroups = findSpotifyPlaylistDuplicateGroups(
    occurrenceResult.tracks,
    matchMode,
  );
  const duplicateTracks = duplicateGroups.flatMap((group) => group.duplicateTracks);
  const dryRun = input.dryRun !== false;

  if (!dryRun && duplicateTracks.length > 0) {
    const removeResult = await removeSpotifyPlaylistTracksByPosition(
      playlistId,
      duplicateTracks,
      accessTokenResult.accessToken,
      fetcher,
    );
    if (!removeResult.ok) return removeResult;

    return {
      ok: true,
      dryRun,
      playlistId,
      matchMode,
      totalTrackCount: occurrenceResult.totalTracks,
      duplicateGroups,
      duplicateTrackCount: duplicateTracks.length,
      removedTrackCount: duplicateTracks.length,
      snapshotId: removeResult.snapshotId,
    };
  }

  return {
    ok: true,
    dryRun,
    playlistId,
    matchMode,
    totalTrackCount: occurrenceResult.totalTracks,
    duplicateGroups,
    duplicateTrackCount: duplicateTracks.length,
    removedTrackCount: 0,
    snapshotId: null,
  };
}

export async function createSpotifyPlaylistFromQueries(
  input: CreateSpotifyPlaylistFromQueriesInput,
): Promise<SpotifyPlaylistSeedResult> {
  const fetcher = input.fetcher ?? fetch;
  const playlistName = input.name.trim();
  if (!playlistName) {
    return {
      ok: false,
      reason: 'spotify_error',
      message: 'La playlist necesita un nombre.',
    };
  }

  const queries = normalizeSeedQueries(input.queries, input.maxQueries ?? DEFAULT_MAX_SEED_QUERIES);
  if (queries.length === 0) {
    return {
      ok: false,
      reason: 'spotify_error',
      message: 'Agrega al menos una cancion para buscar en Spotify.',
    };
  }

  const market = normalizeMarket(input.market);
  const accessTokenResult = await getSpotifyAccessToken(input.credentials, fetcher);
  if (!accessTokenResult.ok) return accessTokenResult;

  const matchedTracks: SpotifyPlaylistSeedTrackMatch[] = [];
  const unmatchedQueries: string[] = [];

  const requestDelayMs = normalizeRequestDelayMs(input.requestDelayMs);
  let searchRequestCount = 0;
  for (let queryIndex = 0; queryIndex < queries.length; queryIndex += 1) {
    const query = queries[queryIndex];
    const cachedMatch = input.cachedTrackMatches?.[normalizeSeedQueryKey(query)];
    if (cachedMatch) {
      matchedTracks.push({ ...cachedMatch, query });
      continue;
    }

    if (searchRequestCount > 0 && requestDelayMs > 0) {
      await sleep(requestDelayMs);
    }
    searchRequestCount += 1;

    const matchResult = await searchSpotifyTrack(query, accessTokenResult.accessToken, fetcher, market);
    if (!matchResult.ok) {
      return {
        ...matchResult,
        failedQuery: query,
        matchedTracks,
        unmatchedQueries,
        matchedTrackCount: matchedTracks.length,
        unmatchedQueryCount: unmatchedQueries.length,
      };
    }

    if (matchResult.match) {
      matchedTracks.push(matchResult.match);
    } else {
      unmatchedQueries.push(query);
    }
  }

  const dryRun = input.dryRun === true;
  if (dryRun) {
    return {
      ok: true,
      dryRun,
      playlist: null,
      matchedTracks,
      unmatchedQueries,
      addedTrackCount: 0,
    };
  }

  if (matchedTracks.length === 0) {
    return {
      ok: false,
      reason: 'spotify_error',
      message: 'No encontramos tracks en Spotify para crear la playlist.',
    };
  }

  const matchedTrackUris = dedupeTrackUris(matchedTracks.map((track) => track.uri));
  const existingPlaylistId = input.playlistUrl ? parseSpotifyPlaylistId(input.playlistUrl) : null;
  if (input.playlistUrl && !existingPlaylistId) {
    return {
      ok: false,
      reason: 'invalid_url',
      message: 'La playlist existente no parece ser una URL valida de Spotify.',
    };
  }

  let playlist: SpotifySeededPlaylistSummary;
  let trackUrisToAdd = matchedTrackUris;

  if (existingPlaylistId) {
    const existingTracksResult = await fetchPlaylistTrackUris(
      existingPlaylistId,
      accessTokenResult.accessToken,
      fetcher,
    );
    if (!existingTracksResult.ok) {
      return {
        ...existingTracksResult,
        matchedTracks,
        unmatchedQueries,
        matchedTrackCount: matchedTracks.length,
        unmatchedQueryCount: unmatchedQueries.length,
      };
    }

    trackUrisToAdd = matchedTrackUris.filter((uri) => !existingTracksResult.uris.has(uri));
    playlist = {
      id: existingPlaylistId,
      name: playlistName,
      spotifyUrl: toSpotifyPlaylistUrl(existingPlaylistId),
    };
  } else {
    const playlistResult = await createSpotifyPlaylist(
      playlistName,
      input.description,
      input.isPublic === true,
      accessTokenResult.accessToken,
      fetcher,
    );
    if (!playlistResult.ok) {
      return {
        ...playlistResult,
        matchedTracks,
        unmatchedQueries,
        matchedTrackCount: matchedTracks.length,
        unmatchedQueryCount: unmatchedQueries.length,
      };
    }
    playlist = playlistResult.playlist;
  }

  if (trackUrisToAdd.length > 0) {
    const addResult = await addSpotifyPlaylistItems(
      playlist.id,
      trackUrisToAdd,
      accessTokenResult.accessToken,
      fetcher,
    );
    if (!addResult.ok) {
      return {
        ...addResult,
        matchedTracks,
        unmatchedQueries,
        matchedTrackCount: matchedTracks.length,
        unmatchedQueryCount: unmatchedQueries.length,
      };
    }
  }

  return {
    ok: true,
    dryRun,
    playlist,
    matchedTracks,
    unmatchedQueries,
    addedTrackCount: trackUrisToAdd.length,
  };
}

async function resolveSpotifyPlaylistWithApi(
  playlistId: string,
  accessToken: string,
  fetcher: typeof fetch,
  maxTracks: number,
  market: string,
): Promise<SpotifyPlaylistResolveResult> {
  try {
    const playlistResult = await spotifyJson<SpotifyPlaylistResponse>(
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}?market=${encodeURIComponent(market)}&fields=id,name,description,external_urls,images,snapshot_id,owner(display_name),tracks(total)`,
      accessToken,
      fetcher,
      undefined,
      'get_playlist',
    );

    const tracksResult = await fetchPlaylistTracks(playlistId, accessToken, fetcher, maxTracks, market);
    if (!tracksResult.ok) return tracksResult;

    const playlist = normalizePlaylist(
      playlistId,
      playlistResult.ok ? playlistResult.body : { id: playlistId, tracks: { total: tracksResult.totalTracks } },
      tracksResult.tracks,
    );
    const totalTracks = tracksResult.totalTracks ?? playlist.totalTracks;
    return {
      ok: true,
      playlist: {
        ...playlist,
        totalTracks,
        skippedTrackCount: Math.max(0, tracksResult.seenItemCount - tracksResult.tracks.length),
        isPartial: typeof totalTracks === 'number' ? tracksResult.seenItemCount < totalTracks : false,
      },
    };
  } catch {
    return {
      ok: false,
      reason: 'network_error',
      message: 'No pudimos conectar con Spotify en este momento.',
    };
  }
}

async function resolveSpotifyPlaylistFromPublicPage(
  playlistId: string,
  fetcher: typeof fetch,
  maxTracks: number,
): Promise<SpotifyPlaylistResolveResult> {
  const publicUrl = toSpotifyPlaylistUrl(playlistId);

  try {
    const response = await fetcher(publicUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return mapPublicPageError(response);
    }

    const html = await response.text();
    const playlist = normalizePublicPlaylist(playlistId, html, maxTracks);
    if (!playlist) {
      return {
        ok: false,
        reason: 'spotify_error',
        message: 'Spotify no incluyo canciones importables en la pagina publica de esa playlist.',
        status: response.status,
      };
    }

    return {
      ok: true,
      playlist,
    };
  } catch {
    return {
      ok: false,
      reason: 'network_error',
      message: 'No pudimos conectar con Spotify en este momento.',
    };
  }
}

async function getSpotifyAccessToken(
  credentials: SpotifyCredentials,
  fetcher: typeof fetch,
): Promise<{ ok: true; accessToken: string } | Extract<SpotifyPlaylistResolveResult, { ok: false }>> {
  const accessToken = credentials.accessToken?.trim();
  if (accessToken) {
    return { ok: true, accessToken };
  }

  const clientId = credentials.clientId?.trim();
  const clientSecret = credentials.clientSecret?.trim();
  if (!clientId || !clientSecret) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'La conexion server-side con Spotify no esta configurada.',
      operation: 'get_access_token',
    };
  }

  const body = new URLSearchParams();
  const refreshToken = credentials.refreshToken?.trim();
  if (refreshToken) {
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);
  } else {
    body.set('grant_type', 'client_credentials');
  }

  try {
    const response = await fetcher(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${base64Encode(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const tokenBody = await readJson<SpotifyTokenResponse>(response);

    if (!response.ok) {
      return {
        ok: false,
        reason: response.status === 401 ? 'unauthorized' : 'spotify_error',
        message: 'Spotify rechazo las credenciales configuradas.',
        status: response.status,
        operation: 'get_access_token',
      };
    }

    if (typeof tokenBody.access_token !== 'string') {
      return {
        ok: false,
        reason: 'spotify_error',
        message: 'Spotify no devolvio un token valido.',
        status: response.status,
        operation: 'get_access_token',
      };
    }

    return { ok: true, accessToken: tokenBody.access_token };
  } catch {
    return {
      ok: false,
      reason: 'network_error',
      message: 'No pudimos conectar con Spotify en este momento.',
      operation: 'get_access_token',
    };
  }
}

async function fetchPlaylistTracks(
  playlistId: string,
  accessToken: string,
  fetcher: typeof fetch,
  maxTracks: number,
  market: string,
): Promise<
  | {
      ok: true;
      tracks: SpotifyPlaylistTrack[];
      totalTracks: number | null;
      seenItemCount: number;
    }
  | Extract<SpotifyPlaylistResolveResult, { ok: false }>
> {
  const tracks: SpotifyPlaylistTrack[] = [];
  let totalTracks: number | null = null;
  let seenItemCount = 0;
  let offset = 0;

  while (tracks.length < maxTracks) {
    const limit = Math.min(MAX_SPOTIFY_PAGE_SIZE, maxTracks - tracks.length);
    const endpoint =
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/items` +
      `?market=${encodeURIComponent(market)}&limit=${limit}&offset=${offset}` +
      '&fields=items(is_local,item(id,name,type,is_local,duration_ms,artists(name),album(images),external_urls),track(id,name,type,is_local,duration_ms,artists(name),album(images),external_urls)),next,total';
    const pageResult = await spotifyJson<SpotifyPlaylistItemsResponse>(
      endpoint,
      accessToken,
      fetcher,
      undefined,
      'get_playlist_items',
    );
    if (!pageResult.ok) return pageResult;

    const items = Array.isArray(pageResult.body.items) ? pageResult.body.items : [];
    if (typeof pageResult.body.total === 'number') {
      totalTracks = pageResult.body.total;
    }

    for (const item of items) {
      seenItemCount += 1;
      const track = normalizeTrackItem(item);
      if (track) tracks.push(track);
      if (tracks.length >= maxTracks) break;
    }

    if (typeof pageResult.body.next !== 'string' || !pageResult.body.next || items.length === 0) {
      break;
    }
    offset += items.length;
  }

  return { ok: true, tracks, totalTracks, seenItemCount };
}

async function searchSpotifyTrack(
  query: string,
  accessToken: string,
  fetcher: typeof fetch,
  market: string,
): Promise<
  | {
      ok: true;
      match: SpotifyPlaylistSeedTrackMatch | null;
    }
  | Extract<SpotifyPlaylistSeedResult, { ok: false }>
> {
  const endpoint =
    `${SPOTIFY_API_BASE_URL}/search?type=track&limit=1` +
    `&market=${encodeURIComponent(market)}` +
    `&q=${encodeURIComponent(query)}`;
  const searchResult = await spotifyJson<SpotifySearchTracksResponse>(
    endpoint,
    accessToken,
    fetcher,
    undefined,
    'search_track',
  );
  if (!searchResult.ok) return searchResult;

  const tracks = isRecord(searchResult.body.tracks) && Array.isArray(searchResult.body.tracks.items)
    ? searchResult.body.tracks.items
    : [];
  const firstTrack = tracks[0];
  const match = normalizeSeedTrackMatch(query, firstTrack);

  return {
    ok: true,
    match,
  };
}

async function createSpotifyPlaylist(
  name: string,
  description: string | undefined,
  isPublic: boolean,
  accessToken: string,
  fetcher: typeof fetch,
): Promise<
  | {
      ok: true;
      playlist: SpotifySeededPlaylistSummary;
    }
  | Extract<SpotifyPlaylistSeedResult, { ok: false }>
> {
  const playlistResult = await spotifyJson<SpotifyCreatedPlaylistResponse>(
    `${SPOTIFY_API_BASE_URL}/me/playlists`,
    accessToken,
    fetcher,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    },
    'create_playlist',
  );
  if (!playlistResult.ok) return playlistResult;

  const playlist = normalizeSeededPlaylist(playlistResult.body);
  if (!playlist) {
    return {
      ok: false,
      reason: 'spotify_error',
      message: 'Spotify creo la playlist pero no devolvio un identificador valido.',
    };
  }

  return {
    ok: true,
    playlist,
  };
}

async function addSpotifyPlaylistItems(
  playlistId: string,
  uris: string[],
  accessToken: string,
  fetcher: typeof fetch,
): Promise<{ ok: true } | Extract<SpotifyPlaylistSeedResult, { ok: false }>> {
  for (let index = 0; index < uris.length; index += MAX_SPOTIFY_ADD_ITEMS_BATCH_SIZE) {
    const batch = uris.slice(index, index + MAX_SPOTIFY_ADD_ITEMS_BATCH_SIZE);
    const addResult = await spotifyJson<SpotifySnapshotResponse>(
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/items`,
      accessToken,
      fetcher,
      {
        method: 'POST',
        body: JSON.stringify({ uris: batch }),
      },
      'add_playlist_items',
    );
    if (!addResult.ok) return addResult;
  }

  return { ok: true };
}

async function fetchPlaylistTrackUris(
  playlistId: string,
  accessToken: string,
  fetcher: typeof fetch,
): Promise<{ ok: true; uris: Set<string> } | Extract<SpotifyPlaylistSeedResult, { ok: false }>> {
  const uris = new Set<string>();
  let offset = 0;

  while (true) {
    const endpoint =
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/items` +
      `?limit=${MAX_SPOTIFY_PAGE_SIZE}&offset=${offset}` +
      '&fields=items(is_local,item(type,uri,id),track(type,uri,id)),next,total';
    const pageResult = await spotifyJson<SpotifyPlaylistItemsResponse>(
      endpoint,
      accessToken,
      fetcher,
      undefined,
      'get_existing_playlist_items',
    );
    if (!pageResult.ok) return pageResult;

    const items = Array.isArray(pageResult.body.items) ? pageResult.body.items : [];
    for (const item of items) {
      const uri = normalizePlaylistTrackUri(item);
      if (uri) uris.add(uri);
    }

    if (typeof pageResult.body.next !== 'string' || !pageResult.body.next || items.length === 0) {
      break;
    }
    offset += items.length;
  }

  return { ok: true, uris };
}

async function fetchPlaylistTrackOccurrences(
  playlistId: string,
  accessToken: string,
  fetcher: typeof fetch,
  market: string,
): Promise<
  | {
      ok: true;
      tracks: SpotifyPlaylistTrackOccurrence[];
      totalTracks: number;
    }
  | Extract<SpotifyPlaylistDuplicateCleanupResult, { ok: false }>
> {
  const tracks: SpotifyPlaylistTrackOccurrence[] = [];
  let totalTracks = 0;
  let position = 0;
  let offset = 0;

  while (true) {
    const endpoint =
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/items` +
      `?market=${encodeURIComponent(market)}&limit=${MAX_SPOTIFY_PAGE_SIZE}&offset=${offset}` +
      '&fields=items(is_local,item(id,uri,name,type,is_local,artists(name)),track(id,uri,name,type,is_local,artists(name))),next,total';
    const pageResult = await spotifyJson<SpotifyPlaylistItemsResponse>(
      endpoint,
      accessToken,
      fetcher,
      undefined,
      'get_playlist_items',
    );
    if (!pageResult.ok) return pageResult;

    const items = Array.isArray(pageResult.body.items) ? pageResult.body.items : [];
    if (typeof pageResult.body.total === 'number') {
      totalTracks = pageResult.body.total;
    }

    for (const item of items) {
      const occurrence = normalizePlaylistTrackOccurrence(item, position);
      if (occurrence) tracks.push(occurrence);
      position += 1;
    }

    if (typeof pageResult.body.next !== 'string' || !pageResult.body.next || items.length === 0) {
      break;
    }
    offset += items.length;
  }

  return {
    ok: true,
    tracks,
    totalTracks: totalTracks || position,
  };
}

function findSpotifyPlaylistDuplicateGroups(
  tracks: SpotifyPlaylistTrackOccurrence[],
  matchMode: SpotifyPlaylistDuplicateMatchMode,
): SpotifyPlaylistDuplicateGroup[] {
  const groups = new Map<string, SpotifyPlaylistTrackOccurrence[]>();

  for (const track of tracks) {
    const key = getSpotifyPlaylistDuplicateKey(track, matchMode);
    if (!key) continue;

    const current = groups.get(key) ?? [];
    current.push(track);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .filter(([, groupTracks]) => groupTracks.length > 1)
    .map(([key, groupTracks]) => ({
      key,
      keptTrack: groupTracks[0],
      duplicateTracks: groupTracks.slice(1),
    }));
}

async function removeSpotifyPlaylistTracksByPosition(
  playlistId: string,
  tracks: SpotifyPlaylistTrackOccurrence[],
  accessToken: string,
  fetcher: typeof fetch,
): Promise<
  | {
      ok: true;
      snapshotId: string | null;
    }
  | Extract<SpotifyPlaylistDuplicateCleanupResult, { ok: false }>
> {
  let snapshotId: string | null = null;
  const descendingTracks = [...tracks].sort((left, right) => right.position - left.position);

  for (let index = 0; index < descendingTracks.length; index += MAX_SPOTIFY_REMOVE_ITEMS_BATCH_SIZE) {
    const batch = descendingTracks.slice(index, index + MAX_SPOTIFY_REMOVE_ITEMS_BATCH_SIZE);
    const removeResult = await spotifyJson<SpotifySnapshotResponse>(
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`,
      accessToken,
      fetcher,
      {
        method: 'DELETE',
        body: JSON.stringify({
          tracks: batch.map((track) => ({
            uri: track.uri,
            positions: [track.position],
          })),
        }),
      },
      'remove_playlist_items',
    );
    if (!removeResult.ok) return removeResult;

    snapshotId =
      typeof removeResult.body.snapshot_id === 'string'
        ? removeResult.body.snapshot_id
        : snapshotId;
  }

  return { ok: true, snapshotId };
}

async function spotifyJson<T>(
  url: string,
  accessToken: string,
  fetcher: typeof fetch,
  init?: RequestInit,
  operation?: SpotifyApiOperation,
): Promise<{ ok: true; body: T } | Extract<SpotifyPlaylistResolveResult, { ok: false }>> {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Accept', 'application/json');
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetcher(url, {
    ...init,
    headers,
  });
  const body = await readJson<unknown>(response);

  if (response.ok) {
    return { ok: true, body: body as T };
  }

  return mapSpotifyError(response, body, operation);
}

function mapSpotifyError(
  response: Response,
  body: unknown,
  operation?: SpotifyApiOperation,
): Extract<SpotifyPlaylistResolveResult, { ok: false }> {
  const retryAfter = response.headers.get('Retry-After');
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : undefined;
  const spotifyMessage = getSpotifyErrorMessage(body);

  if (response.status === 401) {
    return {
      ok: false,
      reason: 'unauthorized',
      message: 'Spotify pidio volver a autorizar la conexion configurada.',
      status: response.status,
      operation,
    };
  }
  if (response.status === 403) {
    return {
      ok: false,
      reason: 'access_denied',
      message:
        spotifyMessage ||
        'Spotify no permite leer los items de esta playlist con la conexion configurada.',
      status: response.status,
      operation,
    };
  }
  if (response.status === 404) {
    return {
      ok: false,
      reason: 'not_found',
      message: 'Spotify no encontro esa playlist o no esta disponible para la conexion configurada.',
      status: response.status,
      operation,
    };
  }
  if (response.status === 429) {
    return {
      ok: false,
      reason: 'rate_limited',
      message: 'Spotify limito temporalmente la importacion. Proba de nuevo en unos minutos.',
      status: response.status,
      retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
      operation,
    };
  }

  return {
    ok: false,
    reason: 'spotify_error',
    message: spotifyMessage || 'Spotify no pudo procesar la playlist.',
    status: response.status,
    operation,
  };
}

function normalizePlaylist(
  fallbackId: string,
  body: SpotifyPlaylistResponse,
  tracks: SpotifyPlaylistTrack[],
): SpotifyPlaylistData {
  const externalUrls = isRecord(body.external_urls) ? body.external_urls : {};
  const owner = isRecord(body.owner) ? body.owner : {};
  const tracksMeta = isRecord(body.tracks) ? body.tracks : {};
  const id = typeof body.id === 'string' ? body.id : fallbackId;
  const images = normalizeImages(body.images);

  return {
    id,
    name: typeof body.name === 'string' && body.name.trim() ? body.name : 'Playlist de Spotify',
    description: typeof body.description === 'string' && body.description.trim() ? body.description : null,
    ownerDisplayName:
      typeof owner.display_name === 'string' && owner.display_name.trim() ? owner.display_name : null,
    snapshotId: typeof body.snapshot_id === 'string' ? body.snapshot_id : null,
    spotifyUrl: typeof externalUrls.spotify === 'string' ? externalUrls.spotify : toSpotifyPlaylistUrl(id),
    images,
    coverImageUrl: images[0]?.url ?? null,
    totalTracks: typeof tracksMeta.total === 'number' ? tracksMeta.total : null,
    importedTrackCount: tracks.length,
    skippedTrackCount: 0,
    importSource: 'web_api',
    isPartial: false,
    tracks,
  };
}

function normalizeUserPlaylistSummary(item: unknown): SpotifyUserPlaylistSummary | null {
  if (!isRecord(item)) return null;

  const id = typeof item.id === 'string' && item.id.trim() ? item.id : null;
  const name = typeof item.name === 'string' && item.name.trim() ? item.name : null;
  if (!id || !name) return null;

  const externalUrls = isRecord(item.external_urls) ? item.external_urls : {};
  const owner = isRecord(item.owner) ? item.owner : {};
  const tracksMeta = isRecord(item.tracks) ? item.tracks : {};
  const images = normalizeImages(item.images);

  return {
    id,
    name,
    description: typeof item.description === 'string' && item.description.trim() ? item.description : null,
    ownerDisplayName:
      typeof owner.display_name === 'string' && owner.display_name.trim() ? owner.display_name : null,
    spotifyUrl: typeof externalUrls.spotify === 'string' ? externalUrls.spotify : toSpotifyPlaylistUrl(id),
    images,
    coverImageUrl: images[0]?.url ?? null,
    totalTracks: typeof tracksMeta.total === 'number' ? tracksMeta.total : null,
    isCollaborative: item.collaborative === true,
    isPublic: typeof item.public === 'boolean' ? item.public : null,
  };
}

function normalizeSeedQueries(queries: string[], maxQueries: number): string[] {
  const normalizedQueries: string[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    const normalizedQuery = typeof query === 'string' ? query.trim().replace(/\s+/g, ' ') : '';
    const dedupeKey = normalizeSeedQueryKey(normalizedQuery);
    if (!normalizedQuery || seen.has(dedupeKey)) continue;

    normalizedQueries.push(normalizedQuery);
    seen.add(dedupeKey);
    if (normalizedQueries.length >= maxQueries) break;
  }

  return normalizedQueries;
}

export function normalizeSeedQueryKey(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

function dedupeTrackUris(uris: string[]): string[] {
  const dedupedUris: string[] = [];
  const seen = new Set<string>();

  for (const uri of uris) {
    if (seen.has(uri)) continue;
    dedupedUris.push(uri);
    seen.add(uri);
  }

  return dedupedUris;
}

function normalizeRequestDelayMs(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeSeedTrackMatch(query: string, item: unknown): SpotifyPlaylistSeedTrackMatch | null {
  if (!isRecord(item) || item.type !== 'track') return null;

  const uri = typeof item.uri === 'string' && item.uri.startsWith('spotify:track:')
    ? item.uri
    : null;
  if (!uri) return null;

  const normalizedTrack = normalizeTrackItem({ item });
  if (!normalizedTrack) return null;

  return {
    query,
    uri,
    id: normalizedTrack.id,
    title: normalizedTrack.title,
    artists: normalizedTrack.artists,
    artistDisplayName: normalizedTrack.artistDisplayName,
    spotifyUrl: normalizedTrack.spotifyUrl,
    imageUrl: normalizedTrack.imageUrl,
  };
}

function normalizeSeededPlaylist(body: SpotifyCreatedPlaylistResponse): SpotifySeededPlaylistSummary | null {
  const id = typeof body.id === 'string' && body.id.trim() ? body.id : null;
  const name = typeof body.name === 'string' && body.name.trim() ? body.name : null;
  if (!id || !name) return null;

  const externalUrls = isRecord(body.external_urls) ? body.external_urls : {};

  return {
    id,
    name,
    spotifyUrl: typeof externalUrls.spotify === 'string' ? externalUrls.spotify : toSpotifyPlaylistUrl(id),
  };
}

function normalizePlaylistTrackUri(item: unknown): string | null {
  if (!isRecord(item)) return null;

  const track = isRecord(item.item) ? item.item : isRecord(item.track) ? item.track : null;
  if (!track || track.type !== 'track') return null;

  const uri = typeof track.uri === 'string' && track.uri.startsWith('spotify:track:')
    ? track.uri
    : null;
  if (uri) return uri;

  const id = typeof track.id === 'string' && track.id.trim() ? track.id : null;
  return id ? `spotify:track:${id}` : null;
}

function normalizePlaylistTrackOccurrence(
  item: unknown,
  position: number,
): SpotifyPlaylistTrackOccurrence | null {
  if (!isRecord(item)) return null;

  const track = isRecord(item.item) ? item.item : isRecord(item.track) ? item.track : null;
  if (!track || track.type !== 'track') return null;

  const uri = normalizePlaylistTrackUri(item);
  const title = typeof track.name === 'string' ? track.name.trim() : '';
  if (!uri || !title) return null;

  const artists = Array.isArray(track.artists)
    ? track.artists
        .map((artist) => (isRecord(artist) && typeof artist.name === 'string' ? artist.name.trim() : ''))
        .filter(Boolean)
    : [];

  return {
    position,
    uri,
    id: typeof track.id === 'string' ? track.id : null,
    title,
    artistDisplayName: artists.length > 0 ? artists.join(', ') : 'Artista desconocido',
  };
}

function getSpotifyPlaylistDuplicateKey(
  track: SpotifyPlaylistTrackOccurrence,
  matchMode: SpotifyPlaylistDuplicateMatchMode,
): string {
  if (matchMode === 'uri') return track.uri;

  return `${track.artistDisplayName.trim().toLowerCase()}::${track.title.trim().toLowerCase()}`;
}

function normalizeTrackItem(item: unknown): SpotifyPlaylistTrack | null {
  if (!isRecord(item)) return null;

  const track = isRecord(item.item) ? item.item : isRecord(item.track) ? item.track : null;
  if (!track) return null;
  if (track.type !== 'track') return null;
  const title = typeof track.name === 'string' ? track.name.trim() : '';
  if (!title) return null;

  const artists = Array.isArray(track.artists)
    ? track.artists
        .map((artist) => (isRecord(artist) && typeof artist.name === 'string' ? artist.name.trim() : ''))
        .filter(Boolean)
    : [];
  const artistDisplayName = artists.length > 0 ? artists.join(', ') : 'Artista desconocido';
  const externalUrls = isRecord(track.external_urls) ? track.external_urls : {};
  const album = isRecord(track.album) ? track.album : {};
  const albumImages = normalizeImages(album.images);

  return {
    id: typeof track.id === 'string' ? track.id : null,
    title,
    artists,
    artistDisplayName,
    durationMs: typeof track.duration_ms === 'number' ? track.duration_ms : null,
    spotifyUrl: typeof externalUrls.spotify === 'string' ? externalUrls.spotify : null,
    imageUrl: albumImages[0]?.url ?? null,
    isLocal: track.is_local === true || item.is_local === true,
  };
}

function normalizePublicPlaylist(
  fallbackId: string,
  html: string,
  maxTracks: number,
): SpotifyPlaylistData | null {
  const initialState = parsePublicInitialState(html);
  if (!initialState) return null;

  const playlist = findPublicPlaylistEntity(initialState, fallbackId);
  if (!playlist) return null;

  const content = isRecord(playlist.content) ? playlist.content : {};
  const rawItems = Array.isArray(content.items) ? content.items : [];
  const tracks: SpotifyPlaylistTrack[] = [];

  for (const item of rawItems) {
    const track = normalizePublicTrackItem(item);
    if (track) tracks.push(track);
    if (tracks.length >= maxTracks) break;
  }

  if (tracks.length === 0) return null;

  const ownerV2 = isRecord(playlist.ownerV2) ? playlist.ownerV2 : {};
  const ownerData = isRecord(ownerV2.data) ? ownerV2.data : {};
  const images = normalizePublicImageCollection(playlist.images);
  const id = typeof playlist.id === 'string' && playlist.id.trim() ? playlist.id : fallbackId;
  const totalTracks = typeof content.totalCount === 'number' ? content.totalCount : null;

  return {
    id,
    name:
      typeof playlist.name === 'string' && playlist.name.trim()
        ? playlist.name
        : 'Playlist de Spotify',
    description:
      typeof playlist.description === 'string' && playlist.description.trim()
        ? playlist.description
        : null,
    ownerDisplayName:
      typeof ownerData.name === 'string' && ownerData.name.trim() ? ownerData.name : null,
    snapshotId: null,
    spotifyUrl: toSpotifyPlaylistUrl(id),
    images,
    coverImageUrl: images[0]?.url ?? null,
    totalTracks,
    importedTrackCount: tracks.length,
    skippedTrackCount: Math.max(0, rawItems.length - tracks.length),
    importSource: 'public_page',
    isPartial: typeof totalTracks === 'number' ? rawItems.length < totalTracks : false,
    tracks,
  };
}

function parsePublicInitialState(html: string): unknown | null {
  const initialStateMatch = html.match(
    /<script\b[^>]*id=["']initialState["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  const encodedInitialState = initialStateMatch?.[1]?.trim();
  if (!encodedInitialState) return null;

  try {
    return JSON.parse(base64DecodeUtf8(encodedInitialState));
  } catch {
    return null;
  }
}

function findPublicPlaylistEntity(initialState: unknown, playlistId: string): Record<string, unknown> | null {
  if (!isRecord(initialState) || !isRecord(initialState.entities)) return null;

  const items = isRecord(initialState.entities.items) ? initialState.entities.items : {};
  const playlistUri = `spotify:playlist:${playlistId}`;
  const directPlaylist = items[playlistUri];
  if (isRecord(directPlaylist)) return directPlaylist;

  for (const item of Object.values(items)) {
    if (isRecord(item) && item.uri === playlistUri) return item;
  }

  return null;
}

function normalizePublicTrackItem(item: unknown): SpotifyPlaylistTrack | null {
  if (!isRecord(item) || !isRecord(item.itemV2)) return null;

  const itemData = isRecord(item.itemV2.data) ? item.itemV2.data : null;
  if (!itemData || itemData.__typename !== 'Track') return null;

  const title = typeof itemData.name === 'string' ? itemData.name.trim() : '';
  if (!title) return null;

  const uri = typeof itemData.uri === 'string' ? itemData.uri : null;
  const artistsRecord = isRecord(itemData.artists) ? itemData.artists : {};
  const artists = Array.isArray(artistsRecord.items)
    ? artistsRecord.items
        .map((artist) => {
          if (!isRecord(artist) || !isRecord(artist.profile)) return '';
          return typeof artist.profile.name === 'string' ? artist.profile.name.trim() : '';
        })
        .filter(Boolean)
    : [];
  const artistDisplayName = artists.length > 0 ? artists.join(', ') : 'Artista desconocido';
  const duration = isRecord(itemData.duration) ? itemData.duration : {};
  const album = isRecord(itemData.albumOfTrack) ? itemData.albumOfTrack : {};
  const coverArt = isRecord(album.coverArt) ? album.coverArt : {};
  const albumImages = normalizePublicImageSources(coverArt.sources);

  return {
    id: uri ? parseSpotifyUriId(uri, 'track') : null,
    title,
    artists,
    artistDisplayName,
    durationMs: typeof duration.totalMilliseconds === 'number' ? duration.totalMilliseconds : null,
    spotifyUrl: uri ? spotifyUriToOpenUrl(uri) : null,
    imageUrl: albumImages[0]?.url ?? null,
    isLocal: false,
  };
}

function normalizeImages(value: unknown): SpotifyImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((image): SpotifyImage | null => {
      if (!isRecord(image) || typeof image.url !== 'string' || !image.url.trim()) {
        return null;
      }

      return {
        url: image.url,
        height: typeof image.height === 'number' ? image.height : null,
        width: typeof image.width === 'number' ? image.width : null,
      };
    })
    .filter((image): image is SpotifyImage => image !== null);
}

function normalizePublicImageCollection(value: unknown): SpotifyImage[] {
  if (!isRecord(value) || !Array.isArray(value.items)) return [];

  const sources = value.items.flatMap((item) => {
    if (!isRecord(item) || !Array.isArray(item.sources)) return [];
    return item.sources;
  });

  return normalizePublicImageSources(sources);
}

function normalizePublicImageSources(value: unknown): SpotifyImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((image): SpotifyImage | null => {
      if (!isRecord(image) || typeof image.url !== 'string' || !image.url.trim()) {
        return null;
      }

      return {
        url: image.url,
        height: typeof image.height === 'number' ? image.height : null,
        width: typeof image.width === 'number' ? image.width : null,
      };
    })
    .filter((image): image is SpotifyImage => image !== null)
    .sort((left, right) => getImageArea(right) - getImageArea(left));
}

function getImageArea(image: SpotifyImage): number {
  return (image.width ?? 0) * (image.height ?? 0);
}

function normalizeMarket(value: string | undefined): string {
  const market = value?.trim().toUpperCase();
  return market && /^[A-Z]{2}$/.test(market) ? market : DEFAULT_MARKET;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

function getSpotifyErrorMessage(body: unknown): string | null {
  if (!isRecord(body)) return null;
  const error = body.error;
  if (typeof error === 'string') return error;
  if (!isRecord(error)) return null;

  if (typeof error.message === 'string') return error.message;
  if (typeof body.error_description === 'string') return body.error_description;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapPublicPageError(response: Response): Extract<SpotifyPlaylistResolveResult, { ok: false }> {
  if (response.status === 404) {
    return {
      ok: false,
      reason: 'not_found',
      message: 'Spotify no encontro esa playlist publica.',
      status: response.status,
    };
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const retryAfterSeconds = retryAfter ? Number(retryAfter) : undefined;
    return {
      ok: false,
      reason: 'rate_limited',
      message: 'Spotify limito temporalmente la importacion. Proba de nuevo en unos minutos.',
      status: response.status,
      retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
    };
  }

  return {
    ok: false,
    reason: response.status === 403 ? 'access_denied' : 'spotify_error',
    message: 'Spotify no permitio leer la pagina publica de esa playlist.',
    status: response.status,
  };
}

function parseSpotifyUriId(uri: string, expectedType: string): string | null {
  const match = uri.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/);
  if (!match || match[1] !== expectedType) return null;
  return match[2];
}

function spotifyUriToOpenUrl(uri: string): string | null {
  const match = uri.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/);
  if (!match) return null;
  return `https://open.spotify.com/${match[1]}/${match[2]}`;
}

function base64DecodeUtf8(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64Encode(value: string): string {
  return btoa(value);
}
