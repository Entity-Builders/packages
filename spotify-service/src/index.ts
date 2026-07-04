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
  tracks: SpotifyPlaylistTrack[];
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
    };

export interface ResolveSpotifyPlaylistInput {
  playlistUrl: string;
  credentials: SpotifyCredentials;
  allowPublicPageFallback?: boolean;
  fetcher?: typeof fetch;
  maxTracks?: number;
  market?: string;
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

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const DEFAULT_MAX_TRACKS = 200;
const DEFAULT_MARKET = 'US';
const MAX_SPOTIFY_PAGE_SIZE = 100;

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
    );
    if (!playlistResult.ok) return playlistResult;

    const tracksResult = await fetchPlaylistTracks(playlistId, accessToken, fetcher, maxTracks, market);
    if (!tracksResult.ok) return tracksResult;

    const playlist = normalizePlaylist(playlistId, playlistResult.body, tracksResult.tracks);
    return {
      ok: true,
      playlist: {
        ...playlist,
        totalTracks: tracksResult.totalTracks ?? playlist.totalTracks,
        skippedTrackCount: Math.max(0, tracksResult.seenItemCount - tracksResult.tracks.length),
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
      };
    }

    if (typeof tokenBody.access_token !== 'string') {
      return {
        ok: false,
        reason: 'spotify_error',
        message: 'Spotify no devolvio un token valido.',
        status: response.status,
      };
    }

    return { ok: true, accessToken: tokenBody.access_token };
  } catch {
    return {
      ok: false,
      reason: 'network_error',
      message: 'No pudimos conectar con Spotify en este momento.',
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
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks` +
      `?market=${encodeURIComponent(market)}&limit=${limit}&offset=${offset}` +
      '&fields=items(track(id,name,type,is_local,duration_ms,artists(name),album(images),external_urls)),next,total';
    const pageResult = await spotifyJson<SpotifyPlaylistItemsResponse>(endpoint, accessToken, fetcher);
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

async function spotifyJson<T>(
  url: string,
  accessToken: string,
  fetcher: typeof fetch,
): Promise<{ ok: true; body: T } | Extract<SpotifyPlaylistResolveResult, { ok: false }>> {
  const response = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  const body = await readJson<unknown>(response);

  if (response.ok) {
    return { ok: true, body: body as T };
  }

  return mapSpotifyError(response, body);
}

function mapSpotifyError(
  response: Response,
  body: unknown,
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
    };
  }
  if (response.status === 404) {
    return {
      ok: false,
      reason: 'not_found',
      message: 'Spotify no encontro esa playlist o no esta disponible para la conexion configurada.',
      status: response.status,
    };
  }
  if (response.status === 429) {
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
    reason: 'spotify_error',
    message: spotifyMessage || 'Spotify no pudo procesar la playlist.',
    status: response.status,
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
    tracks,
  };
}

function normalizeTrackItem(item: unknown): SpotifyPlaylistTrack | null {
  if (!isRecord(item) || !isRecord(item.track)) return null;

  const track = item.track;
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
    isLocal: track.is_local === true,
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
    totalTracks: typeof content.totalCount === 'number' ? content.totalCount : null,
    importedTrackCount: tracks.length,
    skippedTrackCount: Math.max(0, rawItems.length - tracks.length),
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
