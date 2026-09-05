// ==================================================================
// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `yarn workspace @entity-builders/deck-engine sync` to update.
// ==================================================================

import { resolveDeck } from './loader.js';
import type { RawDeckContent } from './types.js';

import rawBarajaConEjerciciosParaAprenderIngles from './content/baraja-con-ejercicios-para-aprender-ingles.json';
import rawBarometro from './content/barometro.json';
import rawCableATierra from './content/cable-a-tierra.json';
import rawJuegoDeCartasParaJugarEntreAmigosEnUnaJuntada from './content/juego-de-cartas-para-jugar-entre-amigos-en-una-juntada.json';
import rawMazoDeIntrospecciNYAutoconocimiento from './content/mazo-de-introspecci-n-y-autoconocimiento.json';
import rawMazoDeTeamBuildingParaEquiposDeTrabajo from './content/mazo-de-team-building-para-equipos-de-trabajo.json';
import rawMazoParaRomperElHieloEnLaPrimeraCita from './content/mazo-para-romper-el-hielo-en-la-primera-cita.json';
import rawMazoSobreFutbolDeArgentina from './content/mazo-sobre-futbol-de-argentina.json';
import rawTriviaSobreCineArgentino from './content/trivia-sobre-cine-argentino.json';
import rawTriviaSobrePeliculasDeComediaRomantica from './content/trivia-sobre-peliculas-de-comedia-romantica.json';

export const RAW_DECKS = {
  'baraja-con-ejercicios-para-aprender-ingles': rawBarajaConEjerciciosParaAprenderIngles as unknown as RawDeckContent,
  'barometro': rawBarometro as unknown as RawDeckContent,
  'cable-a-tierra': rawCableATierra as unknown as RawDeckContent,
  'juego-de-cartas-para-jugar-entre-amigos-en-una-juntada': rawJuegoDeCartasParaJugarEntreAmigosEnUnaJuntada as unknown as RawDeckContent,
  'mazo-de-introspecci-n-y-autoconocimiento': rawMazoDeIntrospecciNYAutoconocimiento as unknown as RawDeckContent,
  'mazo-de-team-building-para-equipos-de-trabajo': rawMazoDeTeamBuildingParaEquiposDeTrabajo as unknown as RawDeckContent,
  'mazo-para-romper-el-hielo-en-la-primera-cita': rawMazoParaRomperElHieloEnLaPrimeraCita as unknown as RawDeckContent,
  'mazo-sobre-futbol-de-argentina': rawMazoSobreFutbolDeArgentina as unknown as RawDeckContent,
  'trivia-sobre-cine-argentino': rawTriviaSobreCineArgentino as unknown as RawDeckContent,
  'trivia-sobre-peliculas-de-comedia-romantica': rawTriviaSobrePeliculasDeComediaRomantica as unknown as RawDeckContent,
} as const;

export const DECKS = {
  'baraja-con-ejercicios-para-aprender-ingles': resolveDeck(RAW_DECKS['baraja-con-ejercicios-para-aprender-ingles']),
  'barometro': resolveDeck(RAW_DECKS['barometro']),
  'cable-a-tierra': resolveDeck(RAW_DECKS['cable-a-tierra']),
  'juego-de-cartas-para-jugar-entre-amigos-en-una-juntada': resolveDeck(RAW_DECKS['juego-de-cartas-para-jugar-entre-amigos-en-una-juntada']),
  'mazo-de-introspecci-n-y-autoconocimiento': resolveDeck(RAW_DECKS['mazo-de-introspecci-n-y-autoconocimiento']),
  'mazo-de-team-building-para-equipos-de-trabajo': resolveDeck(RAW_DECKS['mazo-de-team-building-para-equipos-de-trabajo']),
  'mazo-para-romper-el-hielo-en-la-primera-cita': resolveDeck(RAW_DECKS['mazo-para-romper-el-hielo-en-la-primera-cita']),
  'mazo-sobre-futbol-de-argentina': resolveDeck(RAW_DECKS['mazo-sobre-futbol-de-argentina']),
  'trivia-sobre-cine-argentino': resolveDeck(RAW_DECKS['trivia-sobre-cine-argentino']),
  'trivia-sobre-peliculas-de-comedia-romantica': resolveDeck(RAW_DECKS['trivia-sobre-peliculas-de-comedia-romantica']),
} as const;

export type DeckId = keyof typeof DECKS;
