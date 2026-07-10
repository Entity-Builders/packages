import type { MusicBingoSong, UseContext } from './types.js';
import {
  generateMusicBingoCards,
  getRecommendedMusicBingoEventRuleProfile,
  validateMusicBingoDraftSongs,
  type GeneratedMusicBingoCard,
  type MusicBingoBoardSize,
  type MusicBingoEventRuleProfile,
  type MusicBingoFairnessReport,
  type MusicBingoPlaylistFitReport,
  type MusicBingoPlaylistReference,
} from './music-bingo-creator.js';
import { MUSIC_BINGO_PRODUCT } from './music-bingo.js';

export type MusicBingoPrintPackUseContext = Extract<
  UseContext,
  'private_event' | 'venue_event' | 'professional_facilitation'
>;

export interface MusicBingoPrintPackInput {
  title: string;
  songs: MusicBingoSong[];
  cardCount: number;
  boardSize?: MusicBingoBoardSize;
  freeSpace: boolean;
  seed: string;
  useContext: MusicBingoPrintPackUseContext;
  sourceLabel: string;
  priceLabel?: string;
  playlist?: MusicBingoPlaylistReference;
}

export interface MusicBingoControlSheetRow {
  number: number;
  artist: string;
  title: string;
}

export interface MusicBingoPrintPack {
  title: string;
  subtitle: string;
  cardCount: number;
  boardSize: MusicBingoBoardSize;
  songCount: number;
  freeSpace: boolean;
  seed: string;
  useContext: MusicBingoPrintPackUseContext;
  sourceLabel: string;
  priceLabel?: string;
  playlist?: MusicBingoPlaylistReference;
  cards: GeneratedMusicBingoCard[];
  controlSheet: MusicBingoControlSheetRow[];
  playlistFit: MusicBingoPlaylistFitReport;
  eventRuleProfile: MusicBingoEventRuleProfile;
  fairnessReport?: MusicBingoFairnessReport;
  setupSteps: string[];
  playRules: string[];
  variants: string[];
  tieBreakers: string[];
  printGuide: string[];
  legalSummary: string;
  organizerResponsibilities: string[];
  warnings: string[];
  errors: string[];
}

export function buildMusicBingoPrintPack(
  input: MusicBingoPrintPackInput
): MusicBingoPrintPack {
  const boardSize = input.boardSize ?? 5;
  const validation = validateMusicBingoDraftSongs(input.songs, input.freeSpace, boardSize, {
    cardCount: input.cardCount,
  });
  const eventRuleProfile = getRecommendedMusicBingoEventRuleProfile(input.cardCount);
  const generated = validation.canPreview
    ? generateMusicBingoCards({
        title: input.title,
        songs: validation.usableSongs,
        cardCount: input.cardCount,
        boardSize,
        freeSpace: input.freeSpace,
        seed: input.seed,
      })
    : null;

  return {
    title: input.title,
    subtitle: getPackSubtitle(input.useContext),
    cardCount: input.cardCount,
    boardSize,
    songCount: validation.usableSongs.length,
    freeSpace: input.freeSpace,
    seed: input.seed,
    useContext: input.useContext,
    sourceLabel: input.sourceLabel,
    priceLabel: input.priceLabel,
    playlist: input.playlist,
    cards: generated?.cards ?? [],
    controlSheet: (generated?.playbackOrder ?? validation.usableSongs).map((song, index) => ({
      number: index + 1,
      artist: song.artist,
      title: song.title,
    })),
    playlistFit: validation.playlistFit,
    eventRuleProfile,
    fairnessReport: generated?.fairnessReport,
    setupSteps: [
      'Imprimi los cartones necesarios y separa una copia de la hoja de control para quien conduce.',
      input.playlist
        ? `Abri la playlist sugerida "${input.playlist.title}" o prepara tu propia fuente de reproduccion autorizada.`
        : 'Prepara la playlist o fuente de reproduccion desde la plataforma y permisos del organizador.',
      `Dinamica sugerida: ${eventRuleProfile.label}. ${eventRuleProfile.pacingNotes[0]}`,
      'Explica que cada persona marca una casilla cuando reconoce la cancion, artista o consigna.',
    ],
    playRules: [
      'El anfitrion reproduce fragmentos siguiendo la hoja de control como orden sugerido o activando shuffle en la playlist.',
      'Los jugadores marcan canciones reconocidas en su carton.',
      'El centro Baraja cuenta como casillero libre cuando esta activado.',
      'El ganador debe cantar bingo y el anfitrion valida con la hoja de control.',
    ],
    variants: [
      'Linea simple: gana quien complete una fila, columna o diagonal.',
      'Doble linea: exige dos lineas para alargar la ronda.',
      'Carton completo: ideal para una final o premio principal.',
      'Equipos por mesa: una sola tarjeta por mesa y decision grupal.',
    ],
    tieBreakers: [
      'Cantar un fragmento del estribillo.',
      'Nombrar el artista sin mirar la hoja.',
      'Decir el ano aproximado o una trivia corta del tema.',
      'Elegir una cancion bonus y gana quien la reconozca primero.',
    ],
    printGuide: [
      'Imprimir en A4, escala 100%, sin ajustar al area imprimible si el navegador lo permite.',
      'El PDF agrupa la mayor cantidad legible de cartones por hoja para reducir gasto de papel.',
      'Usar papel comun para pruebas y papel de mayor gramaje para evento.',
      'Cortar o repartir las hojas completas segun la dinamica del lugar.',
      'Guardar este archivo como PDF desde el dialogo de impresion si necesitas reenviarlo.',
    ],
    legalSummary: MUSIC_BINGO_PRODUCT.legal.summary,
    organizerResponsibilities: MUSIC_BINGO_PRODUCT.legal.organizerResponsibilities,
    warnings: generated?.warnings ?? validation.warnings,
    errors: validation.errors,
  };
}

function getPackSubtitle(useContext: MusicBingoPrintPackUseContext): string {
  if (useContext === 'venue_event') {
    return 'Pack imprimible para bar o evento';
  }

  if (useContext === 'professional_facilitation') {
    return 'Pack imprimible para conduccion profesional';
  }

  return 'Pack imprimible para evento privado';
}
