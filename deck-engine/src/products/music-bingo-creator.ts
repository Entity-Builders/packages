import type { MusicBingoCell, MusicBingoSong, UseContext } from './types.js';
import {
  MUSIC_BINGO_DEMO_SONGS,
  MUSIC_BINGO_PRODUCT_ID,
} from './music-bingo.js';
import { applyMusicBingoSongArtworkCache } from './music-bingo-song-cache.js';

export type MusicBingoCreatorSongSource = 'baraja_theme' | 'manual';

export type MusicBingoCreatorUseContext = Extract<
  UseContext,
  'private_event' | 'venue_event' | 'professional_facilitation'
>;

export interface MusicBingoPlaylistReference {
  provider: 'spotify';
  title: string;
  url: string;
  note: string;
  coverImageUrl?: string;
}

export interface MusicBingoTheme {
  id: string;
  offeringId: string;
  title: string;
  summary: string;
  suggestedGameName: string;
  tags: string[];
  songs: MusicBingoSong[];
  playlist?: MusicBingoPlaylistReference;
}

export interface MusicBingoCardCountOption {
  cardCount: number;
  label: string;
  summary: string;
  founderPriceARS: number;
}

export type MusicBingoBoardSize = 3 | 4 | 5;

export interface MusicBingoBoardSizeOption {
  boardSize: MusicBingoBoardSize;
  label: string;
  summary: string;
}

export interface MusicBingoPriceQuote {
  cardCount: number;
  label: string;
  mode: 'founder_private' | 'proposal';
  summary: string;
}

export interface MusicBingoValidationResult {
  canPreview: boolean;
  boardSize: MusicBingoBoardSize;
  requiredSongCount: number;
  usableSongs: MusicBingoSong[];
  duplicateCount: number;
  errors: string[];
  warnings: string[];
}

export interface MusicBingoGenerateCardsInput {
  title: string;
  songs: MusicBingoSong[];
  cardCount: number;
  freeSpace: boolean;
  seed: string;
  boardSize?: MusicBingoBoardSize;
}

export interface GeneratedMusicBingoCard {
  id: string;
  title: string;
  cardNumber: number;
  boardSize: MusicBingoBoardSize;
  seed: string;
  cells: MusicBingoCell[];
}

export interface MusicBingoFairnessReport {
  totalSlots: number;
  songCount: number;
  targetMinAppearances: number;
  targetMaxAppearances: number;
  minSongAppearances: number;
  maxSongAppearances: number;
  maxSharedSongCount: number;
  duplicateLineCount: number;
  balanced: boolean;
  summary: string;
}

export interface MusicBingoPlaybackOrderRow {
  number: number;
  songId: string;
  artist: string;
  title: string;
}

export interface MusicBingoGenerateCardsResult {
  cards: GeneratedMusicBingoCard[];
  requiredSongCount: number;
  warnings: string[];
  fairnessReport?: MusicBingoFairnessReport;
  playbackOrder: MusicBingoPlaybackOrderRow[];
}

export interface MusicBingoManualParseResult {
  songs: MusicBingoSong[];
  ignoredLineCount: number;
}

export const MUSIC_BINGO_BOARD_SIZE = 5;
export const MUSIC_BINGO_CELL_COUNT = MUSIC_BINGO_BOARD_SIZE * MUSIC_BINGO_BOARD_SIZE;
export const MUSIC_BINGO_FREE_SPACE_INDEX = Math.floor(MUSIC_BINGO_CELL_COUNT / 2);

export const MUSIC_BINGO_BOARD_SIZE_OPTIONS: MusicBingoBoardSizeOption[] = [
  {
    boardSize: 3,
    label: '3 x 3',
    summary: 'Ronda rapida, pocas canciones y mesa chica.',
  },
  {
    boardSize: 4,
    label: '4 x 4',
    summary: 'Intermedio, sin casillero libre central.',
  },
  {
    boardSize: 5,
    label: '5 x 5',
    summary: 'Formato clasico para packs completos.',
  },
];

export const MUSIC_BINGO_CARD_COUNT_OPTIONS: MusicBingoCardCountOption[] = [
  {
    cardCount: 15,
    label: '15 cartones',
    summary: 'Para probar la dinamica en casa o mesa chica.',
    founderPriceARS: 4900,
  },
  {
    cardCount: 30,
    label: '30 cartones',
    summary: 'Para cumples, juntadas y mesas chicas.',
    founderPriceARS: 7900,
  },
  {
    cardCount: 50,
    label: '50 cartones',
    summary: 'Para juntadas grandes o salon chico.',
    founderPriceARS: 10900,
  },
  {
    cardCount: 70,
    label: '70 cartones',
    summary: 'Para eventos medianos con mas rotacion.',
    founderPriceARS: 13900,
  },
  {
    cardCount: 100,
    label: '100 cartones',
    summary: 'Para fiestas grandes o varias rondas.',
    founderPriceARS: 17900,
  },
  {
    cardCount: 150,
    label: '150 cartones',
    summary: 'Para bares chicos, colegios o doble tanda.',
    founderPriceARS: 24900,
  },
  {
    cardCount: 200,
    label: '200 cartones',
    summary: 'Para convocatorias grandes con margen de invitados.',
    founderPriceARS: 31900,
  },
  {
    cardCount: 250,
    label: '250 cartones',
    summary: 'Para eventos grandes antes de pasar a propuesta.',
    founderPriceARS: 39900,
  },
];

const MUSIC_BINGO_PUBLIC_PLAYLIST_NOTE =
  'Playlist publica sugerida para el organizador. Baraja no vende musica ni derechos de reproduccion.';

const CUMBIA_RETRO_SONG_ARTWORK_CACHE = {
  'cumbia-01': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02b06815002913341f6d2a86a5',
    spotifyTrackUrl: 'https://open.spotify.com/track/68drjp77R32xEkzP1vxlF6',
  },
  'cumbia-02': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02191411b60f6b164e7a1c13dd',
    spotifyTrackUrl: 'https://open.spotify.com/track/3Iw4UVS7fo2TdD6Spmgqaj',
  },
  'cumbia-03': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02cb85fa5c1df3e84797fdef49',
    spotifyTrackUrl: 'https://open.spotify.com/track/32KF7V0vpeKalBGxt2quBe',
  },
  'cumbia-04': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02d81854aa03d18009bb540b72',
    spotifyTrackUrl: 'https://open.spotify.com/track/3trowLiYwwOoiwapLISNyk',
  },
  'cumbia-05': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02730d0bbda3970035cf3d96be',
    spotifyTrackUrl: 'https://open.spotify.com/track/33D63T3UWawJDiuGtdqs0a',
  },
  'cumbia-06': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e022adbc3da3444a0f52009d30c',
    spotifyTrackUrl: 'https://open.spotify.com/track/2ZkWTFZ9rQCl6ccNAOO79L',
  },
  'cumbia-07': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02d482e1d857092cb56257a822',
    spotifyTrackUrl: 'https://open.spotify.com/track/51AzUb1mSE4WfbSBAi2OYo',
  },
  'cumbia-08': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e027ddb246dc796d103623af1e3',
    spotifyTrackUrl: 'https://open.spotify.com/track/5XzVdBQbbexpDXQbwzxADj',
  },
  'cumbia-09': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02add4bc37b97982ef7b705a2a',
    spotifyTrackUrl: 'https://open.spotify.com/track/0LotS1yYfOqMcNmCEOf1RJ',
  },
  'cumbia-10': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02beb30965c7b38e9a023ac899',
    spotifyTrackUrl: 'https://open.spotify.com/track/3tddzXTgneWrkV2cYNUBZe',
  },
  'cumbia-11': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e029d0b54a8bdaf93494f32a7ba',
    spotifyTrackUrl: 'https://open.spotify.com/track/6gnbBWrui5jqGKyxy1CP89',
  },
  'cumbia-14': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02b92bc9f70f83959be25b1964',
    spotifyTrackUrl: 'https://open.spotify.com/track/4amGeAvkzFunJTHZ0KJZba',
  },
  'cumbia-15': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02982c3e905738122e9f72eff5',
    spotifyTrackUrl: 'https://open.spotify.com/track/1TvjOTe5HcnzxnlvQ8JRy8',
  },
  'cumbia-17': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02d1c789b9437355a150620a47',
    spotifyTrackUrl: 'https://open.spotify.com/track/79yOF3p0RbIAnrxxF8wiPS',
  },
  'cumbia-18': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0231f299af396e8346f6924b91',
    spotifyTrackUrl: 'https://open.spotify.com/track/5tjqwBcn9WsaoaqS2oGJq2',
  },
  'cumbia-20': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02d332159d5741258ea66ea72b',
    spotifyTrackUrl: 'https://open.spotify.com/track/2KEwTSXo7NDurF7pZwPuUD',
  },
  'cumbia-22': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e027ad06d18207b9a6de8397574',
    spotifyTrackUrl: 'https://open.spotify.com/track/2dfnK7rHRibkQR93iZn7Z2',
  },
  'cumbia-23': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02fb96c958e478e768c5cdc2f8',
    spotifyTrackUrl: 'https://open.spotify.com/track/5jMvnSyOgGY8JpvHqeyVOg',
  },
  'cumbia-24': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e025ef65e3a30d372a55b19dfa6',
    spotifyTrackUrl: 'https://open.spotify.com/track/347TStOSY6IOqMB84Rpxwk',
  },
  'cumbia-25': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0204cbbd1bb013f726d64fa064',
    spotifyTrackUrl: 'https://open.spotify.com/track/6jRZ33ifS5VOTMwmPxhPhN',
  },
};

const HITS_2000_SONG_ARTWORK_CACHE = {
  'hits-2000-01': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02efc6988972cb04105f002cd4',
    spotifyTrackUrl: 'https://open.spotify.com/track/6I9VzXrHxO9rA9A5euc8Ak',
  },
  'hits-2000-02': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e021f400a1f4d821b00824cf58f',
    spotifyTrackUrl: 'https://open.spotify.com/track/3TY1PFZXmYeiLcXygB74My',
  },
  'hits-2000-03': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02002377d5a43602fcb14058ea',
    spotifyTrackUrl: 'https://open.spotify.com/track/709CndJJB3GTUhQD0LLFse',
  },
  'hits-2000-04': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02c091c40987e92a9256d2f210',
    spotifyTrackUrl: 'https://open.spotify.com/track/2EM9zpAc7PVeoAydmbfVIL',
  },
  'hits-2000-05': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0211b9999b620ef9bc0e957623',
    spotifyTrackUrl: 'https://open.spotify.com/track/5YoITs1m0q8UOQ4AW7N5ga',
  },
  'hits-2000-06': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0241ca8a8fdfcce2d6ff7f2d05',
    spotifyTrackUrl: 'https://open.spotify.com/track/0WajUW5XINeraP2w0F3F8E',
  },
  'hits-2000-07': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0201e44e04f9271ca74bf7fab2',
    spotifyTrackUrl: 'https://open.spotify.com/track/1Cafs1zrIyOzF8XPmkSI4p',
  },
  'hits-2000-08': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e026784cf9227f41a10b0146021',
    spotifyTrackUrl: 'https://open.spotify.com/track/56tOMi4N980gmsdUoyaLb3',
  },
  'hits-2000-09': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e021aebd1a7e4b81f84dade50ed',
    spotifyTrackUrl: 'https://open.spotify.com/track/3mU0DbuWtUX5KCaovOQZVK',
  },
  'hits-2000-10': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e020bd44f5ff9ecc99f7770acc5',
    spotifyTrackUrl: 'https://open.spotify.com/track/4kLLWz7srcuLKA7Et40PQR',
  },
  'hits-2000-11': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02e691217483df8798445c82e2',
    spotifyTrackUrl: 'https://open.spotify.com/track/1QV6tiMFM6fSOKOGLMHYYg',
  },
  'hits-2000-12': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02f9f27162ab1ed45b8d7a7e98',
    spotifyTrackUrl: 'https://open.spotify.com/track/49FYlytm3dAAraYgpoJZux',
  },
  'hits-2000-13': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0245680a4a57c97894490a01c1',
    spotifyTrackUrl: 'https://open.spotify.com/track/5IVuqXILoxVWvWEPm82Jxr',
  },
  'hits-2000-14': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02e21cc1db05580b6f2d2a3b6e',
    spotifyTrackUrl: 'https://open.spotify.com/track/1mea3bSkSGXuIRvnydlB5b',
  },
  'hits-2000-15': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02dc65d5638a3de4a0bdf3c05f',
    spotifyTrackUrl: 'https://open.spotify.com/track/1L5tZi0izXsi5Kk5OJf4W0',
  },
  'hits-2000-16': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e026e88eb6508fd94cd1b745ce2',
    spotifyTrackUrl: 'https://open.spotify.com/track/2PpruBYCo4H7WOBJ7Q2EwM',
  },
  'hits-2000-17': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02a6f439c8957170652f9410e2',
    spotifyTrackUrl: 'https://open.spotify.com/track/4wH4dJgrsxONID6KS2tDQM',
  },
  'hits-2000-18': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02f7ec724fbf97a30869d06240',
    spotifyTrackUrl: 'https://open.spotify.com/track/5xEM5hIgJ1jjgcEBfpkt2F',
  },
  'hits-2000-19': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0225f49ab23f0ec6332efef432',
    spotifyTrackUrl: 'https://open.spotify.com/track/0COqiPhxzoWICwFCS4eZcp',
  },
  'hits-2000-20': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02e2f039481babe23658fc719a',
    spotifyTrackUrl: 'https://open.spotify.com/track/60a0Rd6pjrkxjPbaKzXjfq',
  },
  'hits-2000-21': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e027cbbd0328713a05ea51d3eaf',
    spotifyTrackUrl: 'https://open.spotify.com/track/6NG2IIXZfC5Notpz0GIODU',
  },
  'hits-2000-22': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e027d034e2f88228534cb77367a',
    spotifyTrackUrl: 'https://open.spotify.com/track/4iRqE6awRWNmfz4a1xOMSs',
  },
  'hits-2000-23': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02a043fa84be801dca33dacca1',
    spotifyTrackUrl: 'https://open.spotify.com/track/100Tm6z29RfHTdUQ6NIs0s',
  },
  'hits-2000-24': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e021dcba4a728ca0b17cbd204a5',
    spotifyTrackUrl: 'https://open.spotify.com/track/6b37xrsNCWYIUphFBazqD6',
  },
  'hits-2000-25': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02622aefd794f6fe4d8e714358',
    spotifyTrackUrl: 'https://open.spotify.com/track/0d28khcov6AiegSCpG5TuT',
  },
};

const CUMBIA_RETRO_SONGS: MusicBingoSong[] = applyMusicBingoSongArtworkCache([
  { id: 'cumbia-01', artist: 'Los Palmeras', title: 'Bombon asesino' },
  { id: 'cumbia-02', artist: 'Rafaga', title: 'Mentirosa' },
  { id: 'cumbia-03', artist: 'Amar Azul', title: 'Yo tomo licor' },
  { id: 'cumbia-04', artist: 'Damas Gratis', title: 'No te creas tan importante' },
  { id: 'cumbia-05', artist: 'La Nueva Luna', title: 'Y ahora te vas' },
  { id: 'cumbia-06', artist: 'Karina', title: 'Corazon mentiroso' },
  { id: 'cumbia-07', artist: 'Gilda', title: 'No me arrepiento de este amor' },
  { id: 'cumbia-08', artist: 'Antonio Rios', title: 'Nunca me faltes' },
  { id: 'cumbia-09', artist: 'Leo Mattioli', title: 'Le pido a Dios' },
  { id: 'cumbia-10', artist: 'El Polaco', title: 'Deja de llorar' },
  { id: 'cumbia-11', artist: 'Los Charros', title: 'Amores como el nuestro' },
  { id: 'cumbia-12', artist: 'La Base', title: 'Sabrosura' },
  { id: 'cumbia-13', artist: 'Meta Guacha', title: 'La luna' },
  { id: 'cumbia-14', artist: 'Agapornis', title: 'Persiana americana' },
  { id: 'cumbia-15', artist: 'Nestor en Bloque', title: 'Una calle nos separa' },
  { id: 'cumbia-16', artist: 'Grupo Green', title: 'Nunca me dejes' },
  { id: 'cumbia-17', artist: 'Yerba Brava', title: 'La cumbia de los trapos' },
  { id: 'cumbia-18', artist: 'Pibes Chorros', title: 'Duraznito' },
  { id: 'cumbia-19', artist: 'La Repandilla', title: 'Campeon' },
  { id: 'cumbia-20', artist: 'Angela Leiva', title: 'Amiga traidora' },
  { id: 'cumbia-21', artist: 'Tambo Tambo', title: 'La ventanita' },
  { id: 'cumbia-22', artist: 'Sombras', title: 'La ventanita del amor' },
  { id: 'cumbia-23', artist: 'Rombai', title: 'Locuras contigo' },
  { id: 'cumbia-24', artist: 'Marama', title: 'Nena' },
  { id: 'cumbia-25', artist: 'Ke Personajes', title: 'Ya no vuelvas' },
], CUMBIA_RETRO_SONG_ARTWORK_CACHE);

const HITS_2000_SONGS: MusicBingoSong[] = applyMusicBingoSongArtworkCache([
  { id: 'hits-2000-01', artist: 'Britney Spears', title: 'Toxic' },
  { id: 'hits-2000-02', artist: 'Shakira', title: 'Suerte' },
  { id: 'hits-2000-03', artist: 'Chayanne', title: 'Torero' },
  { id: 'hits-2000-04', artist: 'Juanes', title: 'La camisa negra' },
  { id: 'hits-2000-05', artist: 'Daddy Yankee', title: 'Gasolina' },
  { id: 'hits-2000-06', artist: 'Miranda', title: 'Don' },
  { id: 'hits-2000-07', artist: 'Kudai', title: 'Sin despertar' },
  { id: 'hits-2000-08', artist: 'RBD', title: 'Rebelde' },
  { id: 'hits-2000-09', artist: 'Belanova', title: 'Rosa pastel' },
  { id: 'hits-2000-10', artist: 'Black Eyed Peas', title: 'I Gotta Feeling' },
  { id: 'hits-2000-11', artist: 'Lady Gaga', title: 'Poker Face' },
  { id: 'hits-2000-12', artist: 'Rihanna', title: 'Umbrella' },
  { id: 'hits-2000-13', artist: 'Beyonce', title: 'Crazy in Love' },
  { id: 'hits-2000-14', artist: 'Coldplay', title: 'Viva la vida' },
  { id: 'hits-2000-15', artist: 'Amy Winehouse', title: 'Rehab' },
  { id: 'hits-2000-16', artist: 'Outkast', title: 'Hey Ya' },
  { id: 'hits-2000-17', artist: 'Nelly Furtado', title: 'Maneater' },
  { id: 'hits-2000-18', artist: 'Avril Lavigne', title: 'Complicated' },
  { id: 'hits-2000-19', artist: 'Evanescence', title: 'Bring Me to Life' },
  { id: 'hits-2000-20', artist: 'Linkin Park', title: 'In the End' },
  { id: 'hits-2000-21', artist: 'Las Ketchup', title: 'Asereje' },
  { id: 'hits-2000-22', artist: 'Estopa', title: 'La raja de tu falda' },
  { id: 'hits-2000-23', artist: 'Julieta Venegas', title: 'Me voy' },
  { id: 'hits-2000-24', artist: 'Manu Chao', title: 'Me gustas tu' },
  { id: 'hits-2000-25', artist: 'Gorillaz', title: 'Feel Good Inc' },
], HITS_2000_SONG_ARTWORK_CACHE);

export const MUSIC_BINGO_MVP_THEMES: MusicBingoTheme[] = [
  {
    id: 'rock-argentino',
    offeringId: 'rock-argentino-prebuilt',
    title: 'Rock Argentino',
    summary: 'Clasicos reconocibles para cantar, marcar y discutir en la mesa.',
    suggestedGameName: 'Noche Rock Argentino',
    tags: ['Rock nacional', 'Juntadas', 'Bares'],
    songs: MUSIC_BINGO_DEMO_SONGS,
    playlist: {
      provider: 'spotify',
      title: 'Rock Nacional: 100% Clasicos',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DWSo7PX7dbgH8',
      note: MUSIC_BINGO_PUBLIC_PLAYLIST_NOTE,
      coverImageUrl: 'https://i.scdn.co/image/ab67706f00000002b6df80d5a63d8cf5c1768464',
    },
  },
  {
    id: 'cumbia-retro',
    offeringId: 'cumbia-retro-prebuilt',
    title: 'Cumbia Retro',
    summary: 'Popular, directa y facil de conducir cuando la fiesta ya arranco.',
    suggestedGameName: 'Bingo Cumbia Retro',
    tags: ['Fiesta', 'Cumples', 'Baile'],
    songs: CUMBIA_RETRO_SONGS,
    playlist: {
      provider: 'spotify',
      title: '100% Cumbia',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX8yLfjPY8emY',
      note: MUSIC_BINGO_PUBLIC_PLAYLIST_NOTE,
      coverImageUrl: 'https://i.scdn.co/image/ab67706f000000024d9d8587caeca2ac1feaf69c',
    },
  },
  {
    id: 'hits-2000',
    offeringId: 'hits-2000-prebuilt',
    title: 'Hits 2000',
    summary: 'Nostalgia pop para grupos mixtos y momentos de memoria compartida.',
    suggestedGameName: 'Bingo Hits 2000',
    tags: ['Pop', 'Nostalgia', 'Eventos'],
    songs: HITS_2000_SONGS,
    playlist: {
      provider: 'spotify',
      title: 'All Out 2000s',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX4o1oenSJRJd',
      note: MUSIC_BINGO_PUBLIC_PLAYLIST_NOTE,
      coverImageUrl: 'https://i.scdn.co/image/ab67706f00000002043bfef44142136749fc2917',
    },
  },
];

export function parseMusicBingoManualSongs(input: string): MusicBingoManualParseResult {
  const songs: MusicBingoSong[] = [];
  let ignoredLineCount = 0;

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      ignoredLineCount += 1;
      return;
    }

    const parts = splitSongLine(line);
    songs.push({
      id: `manual-${index + 1}`,
      artist: parts.artist,
      title: parts.title,
    });
  });

  return { songs, ignoredLineCount };
}

export function getMusicBingoTheme(themeId: string): MusicBingoTheme | undefined {
  return MUSIC_BINGO_MVP_THEMES.find((theme) => theme.id === themeId);
}

export function getMusicBingoRequiredSongCount(freeSpace: boolean): number {
  return getMusicBingoRequiredSongCountForBoard(MUSIC_BINGO_BOARD_SIZE, freeSpace);
}

export function getMusicBingoRequiredSongCountForBoard(
  boardSize: MusicBingoBoardSize,
  freeSpace: boolean
): number {
  const cellCount = boardSize * boardSize;
  return hasMusicBingoFreeSpace(boardSize, freeSpace) ? cellCount - 1 : cellCount;
}

export function hasMusicBingoFreeSpace(
  boardSize: MusicBingoBoardSize,
  freeSpace: boolean
): boolean {
  return freeSpace && boardSize % 2 === 1;
}

export function validateMusicBingoDraftSongs(
  songs: MusicBingoSong[],
  freeSpace: boolean,
  boardSize: MusicBingoBoardSize = MUSIC_BINGO_BOARD_SIZE
): MusicBingoValidationResult {
  const requiredSongCount = getMusicBingoRequiredSongCountForBoard(boardSize, freeSpace);
  const { uniqueSongs, duplicateCount } = uniqueMusicBingoSongs(songs);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (uniqueSongs.length < requiredSongCount) {
    errors.push(
      `Necesitas al menos ${requiredSongCount} canciones distintas para este formato.`
    );
  }

  if (duplicateCount > 0) {
    warnings.push(
      `${duplicateCount} cancion${duplicateCount === 1 ? '' : 'es'} repetida${duplicateCount === 1 ? '' : 's'} no se usaran en la preview.`
    );
  }

  if (uniqueSongs.length === requiredSongCount) {
    warnings.push(
      'Con el minimo exacto de canciones, los cartones cambian el orden pero comparten el mismo repertorio.'
    );
  }

  if (freeSpace && !hasMusicBingoFreeSpace(boardSize, freeSpace)) {
    warnings.push('El formato 4 x 4 no usa casillero libre central.');
  }

  return {
    canPreview: errors.length === 0,
    boardSize,
    requiredSongCount,
    usableSongs: uniqueSongs,
    duplicateCount,
    errors,
    warnings,
  };
}

export function generateMusicBingoCards(
  input: MusicBingoGenerateCardsInput
): MusicBingoGenerateCardsResult {
  const boardSize = input.boardSize ?? MUSIC_BINGO_BOARD_SIZE;
  const validation = validateMusicBingoDraftSongs(input.songs, input.freeSpace, boardSize);

  if (!validation.canPreview) {
    return {
      cards: [],
      requiredSongCount: validation.requiredSongCount,
      warnings: validation.errors,
      playbackOrder: [],
    };
  }

  const cards = buildBalancedMusicBingoCards(input, validation, boardSize);
  const fairnessReport = buildMusicBingoFairnessReport(
    cards,
    validation.usableSongs,
    validation.requiredSongCount
  );
  const playbackOrder = buildPlaybackOrder(validation.usableSongs, input.seed);

  return {
    cards,
    requiredSongCount: validation.requiredSongCount,
    warnings: validation.warnings,
    fairnessReport,
    playbackOrder,
  };
}

export function getMusicBingoPriceQuote(
  cardCount: number,
  useContext: MusicBingoCreatorUseContext
): MusicBingoPriceQuote {
  if (useContext === 'venue_event' || useContext === 'professional_facilitation') {
    return {
      cardCount,
      label: 'Propuesta para bar/evento',
      mode: 'proposal',
      summary:
        'Definimos alcance, uso, QR y condiciones antes de confirmar precio.',
    };
  }

  const tier = MUSIC_BINGO_CARD_COUNT_OPTIONS.find((option) => option.cardCount === cardCount);

  return {
    cardCount,
    label: tier ? formatArgentineFounderPrice(tier.founderPriceARS) : `${cardCount} cartones - consultar`,
    mode: 'founder_private',
    summary: tier
      ? `Precio fundador Argentina para ${tier.label}. Incluye PDF imprimible, hoja de control, reglas y guia de dinamica.`
      : 'Pago y entrega se confirman por WhatsApp en este MVP.',
  };
}

function formatArgentineFounderPrice(priceARS: number): string {
  return `$${priceARS.toLocaleString('es-AR')} ARS`;
}

function splitSongLine(line: string): { artist: string; title: string } {
  const separators = [' - ', ' – ', ' — ', ' | ', ';'];
  const separator = separators.find((candidate) => line.includes(candidate));

  if (!separator) {
    return { artist: 'Sin artista', title: line };
  }

  const [first = '', ...rest] = line.split(separator);
  const second = rest.join(separator).trim();

  if (!second) {
    return { artist: 'Sin artista', title: first.trim() };
  }

  return {
    artist: first.trim() || 'Sin artista',
    title: second,
  };
}

function uniqueMusicBingoSongs(songs: MusicBingoSong[]): {
  uniqueSongs: MusicBingoSong[];
  duplicateCount: number;
} {
  const seen = new Set<string>();
  const uniqueSongs: MusicBingoSong[] = [];
  let duplicateCount = 0;

  songs.forEach((song) => {
    const title = song.title.trim();
    const artist = song.artist.trim() || 'Sin artista';
    if (!title) return;

    const key = `${artist.toLowerCase()}::${title.toLowerCase()}`;
    if (seen.has(key)) {
      duplicateCount += 1;
      return;
    }

    seen.add(key);
    uniqueSongs.push({
      ...song,
      id: song.id,
      artist,
      title,
    });
  });

  return { uniqueSongs, duplicateCount };
}

function buildCardCells(
  songs: MusicBingoSong[],
  freeSpace: boolean,
  cardNumber: number,
  boardSize: MusicBingoBoardSize
): MusicBingoCell[] {
  const cells: MusicBingoCell[] = [];
  let songIndex = 0;
  const cellCount = boardSize * boardSize;
  const freeSpaceIndex = Math.floor(cellCount / 2);
  const shouldUseFreeSpace = hasMusicBingoFreeSpace(boardSize, freeSpace);

  for (let index = 0; index < cellCount; index += 1) {
    if (shouldUseFreeSpace && index === freeSpaceIndex) {
      cells.push({
        id: `card-${cardNumber}-free`,
        label: 'Baraja',
        hint: 'Casillero libre',
        free: true,
      });
      continue;
    }

    const song = songs[songIndex];
    songIndex += 1;

    cells.push({
      id: `card-${cardNumber}-cell-${index + 1}`,
      label: song.title,
      hint: song.artist,
      songId: song.id,
    });
  }

  return cells;
}

function buildBalancedMusicBingoCards(
  input: MusicBingoGenerateCardsInput,
  validation: MusicBingoValidationResult,
  boardSize: MusicBingoBoardSize
): GeneratedMusicBingoCard[] {
  const remainingAppearances = buildTargetAppearanceCounts(
    validation.usableSongs,
    input.cardCount * validation.requiredSongCount,
    `${input.seed}:targets`
  );
  const previousCardSongSets: Set<string>[] = [];
  const lineCounts = new Map<string, number>();

  return Array.from({ length: input.cardCount }, (_, index) => {
    const cardNumber = index + 1;
    const seed = `${input.seed}:${cardNumber}`;
    const selectedSongs = selectBalancedCardSongs({
      songs: validation.usableSongs,
      remainingAppearances,
      previousCardSongSets,
      requiredSongCount: validation.requiredSongCount,
      remainingCardsIncludingCurrent: input.cardCount - index,
      seed: `${seed}:songs`,
    });
    const cells = buildLeastDuplicatedCardCells({
      songs: selectedSongs,
      freeSpace: input.freeSpace,
      cardNumber,
      boardSize,
      lineCounts,
      seed: `${seed}:cells`,
    });

    registerLineKeys(lineCounts, getCardLineKeys(cells, boardSize));
    previousCardSongSets.push(new Set(getCardSongIds(cells)));

    return {
      id: `${slugify(input.title)}-${cardNumber}`,
      title: input.title,
      cardNumber,
      boardSize,
      seed,
      cells,
    };
  });
}

function buildTargetAppearanceCounts(
  songs: MusicBingoSong[],
  totalSlots: number,
  seed: string
): Map<string, number> {
  const baseCount = Math.floor(totalSlots / songs.length);
  const extraCount = totalSlots % songs.length;
  const counts = new Map(songs.map((song) => [song.id, baseCount]));
  const shuffledSongs = shuffleSongs(songs, createSeededRandom(seed));

  shuffledSongs.slice(0, extraCount).forEach((song) => {
    counts.set(song.id, (counts.get(song.id) ?? 0) + 1);
  });

  return counts;
}

function selectBalancedCardSongs({
  songs,
  remainingAppearances,
  previousCardSongSets,
  requiredSongCount,
  remainingCardsIncludingCurrent,
  seed,
}: {
  songs: MusicBingoSong[];
  remainingAppearances: Map<string, number>;
  previousCardSongSets: Set<string>[];
  requiredSongCount: number;
  remainingCardsIncludingCurrent: number;
  seed: string;
}): MusicBingoSong[] {
  const rng = createSeededRandom(seed);
  const selectedSongs: MusicBingoSong[] = [];
  const selectedIds = new Set<string>();

  while (selectedSongs.length < requiredSongCount) {
    const candidates = songs
      .filter((song) => !selectedIds.has(song.id) && (remainingAppearances.get(song.id) ?? 0) > 0)
      .map((song) => {
        const remaining = remainingAppearances.get(song.id) ?? 0;
        const projectedSelectedIds = new Set(selectedIds);
        projectedSelectedIds.add(song.id);

        return {
          song,
          mustPick: remaining === remainingCardsIncludingCurrent ? 1 : 0,
          urgency: remaining / remainingCardsIncludingCurrent,
          projectedMaxOverlap: getProjectedMaxSharedSongCount(
            projectedSelectedIds,
            previousCardSongSets
          ),
          recentOverlap: getRecentOverlapCount(song.id, previousCardSongSets),
          tieBreaker: rng(),
        };
      });

    if (candidates.length === 0) break;

    candidates.sort((left, right) => {
      if (right.mustPick !== left.mustPick) return right.mustPick - left.mustPick;
      if (right.urgency !== left.urgency) return right.urgency - left.urgency;
      if (left.projectedMaxOverlap !== right.projectedMaxOverlap) {
        return left.projectedMaxOverlap - right.projectedMaxOverlap;
      }
      if (left.recentOverlap !== right.recentOverlap) {
        return left.recentOverlap - right.recentOverlap;
      }
      return left.tieBreaker - right.tieBreaker;
    });

    const nextSong = candidates[0]?.song;
    if (!nextSong) break;

    selectedSongs.push(nextSong);
    selectedIds.add(nextSong.id);
    remainingAppearances.set(
      nextSong.id,
      Math.max(0, (remainingAppearances.get(nextSong.id) ?? 0) - 1)
    );
  }

  return selectedSongs;
}

function getProjectedMaxSharedSongCount(
  selectedIds: Set<string>,
  previousCardSongSets: Set<string>[]
): number {
  return previousCardSongSets.reduce((maxShared, previousSet) => {
    let sharedCount = 0;
    selectedIds.forEach((songId) => {
      if (previousSet.has(songId)) sharedCount += 1;
    });
    return Math.max(maxShared, sharedCount);
  }, 0);
}

function getRecentOverlapCount(songId: string, previousCardSongSets: Set<string>[]): number {
  return previousCardSongSets.slice(-5).reduce((count, previousSet) => {
    return previousSet.has(songId) ? count + 1 : count;
  }, 0);
}

function buildLeastDuplicatedCardCells({
  songs,
  freeSpace,
  cardNumber,
  boardSize,
  lineCounts,
  seed,
}: {
  songs: MusicBingoSong[];
  freeSpace: boolean;
  cardNumber: number;
  boardSize: MusicBingoBoardSize;
  lineCounts: Map<string, number>;
  seed: string;
}): MusicBingoCell[] {
  const rng = createSeededRandom(seed);
  let bestCells = buildCardCells(shuffleSongs(songs, rng), freeSpace, cardNumber, boardSize);
  let bestScore = scoreDuplicateLines(bestCells, boardSize, lineCounts);

  for (let attempt = 0; attempt < 18 && bestScore > 0; attempt += 1) {
    const candidateCells = buildCardCells(shuffleSongs(songs, rng), freeSpace, cardNumber, boardSize);
    const candidateScore = scoreDuplicateLines(candidateCells, boardSize, lineCounts);

    if (candidateScore < bestScore) {
      bestCells = candidateCells;
      bestScore = candidateScore;
    }
  }

  return bestCells;
}

function scoreDuplicateLines(
  cells: MusicBingoCell[],
  boardSize: MusicBingoBoardSize,
  lineCounts: Map<string, number>
): number {
  return getCardLineKeys(cells, boardSize).reduce(
    (score, lineKey) => score + (lineCounts.get(lineKey) ?? 0),
    0
  );
}

function registerLineKeys(lineCounts: Map<string, number>, lineKeys: string[]): void {
  lineKeys.forEach((lineKey) => {
    lineCounts.set(lineKey, (lineCounts.get(lineKey) ?? 0) + 1);
  });
}

function buildMusicBingoFairnessReport(
  cards: GeneratedMusicBingoCard[],
  songs: MusicBingoSong[],
  requiredSongCount: number
): MusicBingoFairnessReport {
  const appearanceCounts = new Map(songs.map((song) => [song.id, 0]));

  cards.forEach((card) => {
    getCardSongIds(card.cells).forEach((songId) => {
      appearanceCounts.set(songId, (appearanceCounts.get(songId) ?? 0) + 1);
    });
  });

  const totalSlots = cards.length * requiredSongCount;
  const targetMinAppearances = Math.floor(totalSlots / songs.length);
  const targetMaxAppearances = Math.ceil(totalSlots / songs.length);
  const counts = [...appearanceCounts.values()];
  const minSongAppearances = Math.min(...counts);
  const maxSongAppearances = Math.max(...counts);
  const maxSharedSongCount = getMaxSharedSongCount(cards);
  const duplicateLineCount = getDuplicateLineCount(cards);
  const balanced =
    minSongAppearances >= targetMinAppearances &&
    maxSongAppearances <= targetMaxAppearances;

  return {
    totalSlots,
    songCount: songs.length,
    targetMinAppearances,
    targetMaxAppearances,
    minSongAppearances,
    maxSongAppearances,
    maxSharedSongCount,
    duplicateLineCount,
    balanced,
    summary: balanced
      ? `Canciones distribuidas ${minSongAppearances}-${maxSongAppearances} veces por pack.`
      : `Distribucion ${minSongAppearances}-${maxSongAppearances}; objetivo ${targetMinAppearances}-${targetMaxAppearances}.`,
  };
}

function buildPlaybackOrder(
  songs: MusicBingoSong[],
  seed: string
): MusicBingoPlaybackOrderRow[] {
  return shuffleSongs(songs, createSeededRandom(`${seed}:playback`)).map((song, index) => ({
    number: index + 1,
    songId: song.id,
    artist: song.artist,
    title: song.title,
  }));
}

function getCardSongIds(cells: MusicBingoCell[]): string[] {
  return cells.flatMap((cell) => (cell.songId ? [cell.songId] : []));
}

function getMaxSharedSongCount(cards: GeneratedMusicBingoCard[]): number {
  const cardSongSets = cards.map((card) => new Set(getCardSongIds(card.cells)));
  let maxShared = 0;

  for (let leftIndex = 0; leftIndex < cardSongSets.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < cardSongSets.length; rightIndex += 1) {
      const leftSet = cardSongSets[leftIndex];
      const rightSet = cardSongSets[rightIndex];
      if (!leftSet || !rightSet) continue;

      let sharedCount = 0;
      leftSet.forEach((songId) => {
        if (rightSet.has(songId)) sharedCount += 1;
      });
      maxShared = Math.max(maxShared, sharedCount);
    }
  }

  return maxShared;
}

function getDuplicateLineCount(cards: GeneratedMusicBingoCard[]): number {
  const lineCounts = new Map<string, number>();

  cards.forEach((card) => {
    getCardLineKeys(card.cells, card.boardSize).forEach((lineKey) => {
      lineCounts.set(lineKey, (lineCounts.get(lineKey) ?? 0) + 1);
    });
  });

  return [...lineCounts.values()].reduce(
    (duplicateCount, count) => duplicateCount + Math.max(0, count - 1),
    0
  );
}

function getCardLineKeys(cells: MusicBingoCell[], boardSize: MusicBingoBoardSize): string[] {
  const cellKeys = cells.map((cell) => cell.songId ?? 'FREE');
  const lineGroups: string[][] = [];

  for (let row = 0; row < boardSize; row += 1) {
    lineGroups.push(cellKeys.slice(row * boardSize, row * boardSize + boardSize));
  }

  for (let column = 0; column < boardSize; column += 1) {
    const columnKeys: string[] = [];
    for (let row = 0; row < boardSize; row += 1) {
      columnKeys.push(cellKeys[row * boardSize + column] ?? 'FREE');
    }
    lineGroups.push(columnKeys);
  }

  lineGroups.push(
    Array.from({ length: boardSize }, (_, index) => cellKeys[index * boardSize + index] ?? 'FREE')
  );
  lineGroups.push(
    Array.from(
      { length: boardSize },
      (_, index) => cellKeys[index * boardSize + (boardSize - 1 - index)] ?? 'FREE'
    )
  );

  return lineGroups.map((line) => line.slice().sort().join('|'));
}

function shuffleSongs(songs: MusicBingoSong[], rng: () => number): MusicBingoSong[] {
  const copy = [...songs];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function createSeededRandom(seed: string): () => number {
  let value = hashSeed(seed);

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || MUSIC_BINGO_PRODUCT_ID;
}
