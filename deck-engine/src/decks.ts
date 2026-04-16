// ==================================================================
// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `yarn workspace @eb-packages/deck-engine sync` to update.
// ==================================================================

import { resolveDeck } from './loader.js';
import type { RawDeckContent } from './types.js';

import rawBarajaConEjerciciosParaAprenderIngles from './content/baraja-con-ejercicios-para-aprender-ingles.json';
import rawBarometro from './content/barometro.json';
import rawCableATierra from './content/cable-a-tierra.json';
import rawJuegoDeCartasParaJugarEntreAmigosEnUnaJuntada from './content/juego-de-cartas-para-jugar-entre-amigos-en-una-juntada.json';
import rawMazoDeTeamBuildingParaEquiposDeTrabajo from './content/mazo-de-team-building-para-equipos-de-trabajo.json';
import rawMazoParaRomperElHieloEnLaPrimeraCita from './content/mazo-para-romper-el-hielo-en-la-primera-cita.json';
import rawMazoSobreFutbolDeArgentina from './content/mazo-sobre-futbol-de-argentina.json';
import rawTriviaSobreCineArgentino from './content/trivia-sobre-cine-argentino.json';
import rawTriviaSobrePeliculasDeComediaRomantica from './content/trivia-sobre-peliculas-de-comedia-romantica.json';

export const DECKS = {
  'baraja-con-ejercicios-para-aprender-ingles': resolveDeck(rawBarajaConEjerciciosParaAprenderIngles as unknown as RawDeckContent),
  'barometro': resolveDeck(rawBarometro as unknown as RawDeckContent),
  'cable-a-tierra': resolveDeck(rawCableATierra as unknown as RawDeckContent),
  'juego-de-cartas-para-jugar-entre-amigos-en-una-juntada': resolveDeck(rawJuegoDeCartasParaJugarEntreAmigosEnUnaJuntada as unknown as RawDeckContent),
  'mazo-de-team-building-para-equipos-de-trabajo': resolveDeck(rawMazoDeTeamBuildingParaEquiposDeTrabajo as unknown as RawDeckContent),
  'mazo-para-romper-el-hielo-en-la-primera-cita': resolveDeck(rawMazoParaRomperElHieloEnLaPrimeraCita as unknown as RawDeckContent),
  'mazo-sobre-futbol-de-argentina': resolveDeck(rawMazoSobreFutbolDeArgentina as unknown as RawDeckContent),
  'trivia-sobre-cine-argentino': resolveDeck(rawTriviaSobreCineArgentino as unknown as RawDeckContent),
  'trivia-sobre-peliculas-de-comedia-romantica': resolveDeck(rawTriviaSobrePeliculasDeComediaRomantica as unknown as RawDeckContent),
} as const;

export type DeckId = keyof typeof DECKS;
