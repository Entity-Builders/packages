import type {
  DeckCatalogCategoryId,
  DeckCatalogCollectionId,
  DeckCatalogPlacement,
  DeckSchema,
} from './types.js';

export interface DeckCatalogCollectionDefinition {
  id: DeckCatalogCollectionId;
  label: string;
  shortLabel: string;
}

export interface DeckCatalogCategoryDefinition {
  id: DeckCatalogCategoryId;
  collection: DeckCatalogCollectionId;
  label: string;
  shortLabel: string;
  summary: string;
}

export interface DeckCatalogFacet {
  collectionId: DeckCatalogCollectionId;
  collectionLabel: string;
  collectionShortLabel: string;
  categoryId: DeckCatalogCategoryId;
  categoryLabel: string;
  categoryShortLabel: string;
  summary: string;
}

export type DeckCatalogBreadcrumbKind = 'collection' | 'category' | 'deck';

export interface DeckCatalogBreadcrumbItem {
  kind: DeckCatalogBreadcrumbKind;
  label: string;
  id: string;
}

export const DECK_CATALOG_COLLECTIONS: Record<
  DeckCatalogCollectionId,
  DeckCatalogCollectionDefinition
> = {
  'self-work': {
    id: 'self-work',
    label: 'Autoconocimiento',
    shortLabel: 'Autoconocimiento',
  },
  'social-games': {
    id: 'social-games',
    label: 'Juegos sociales',
    shortLabel: 'Juegos sociales',
  },
  'couples-dating': {
    id: 'couples-dating',
    label: 'Parejas y citas',
    shortLabel: 'Parejas',
  },
  'team-tools': {
    id: 'team-tools',
    label: 'Equipos y talleres',
    shortLabel: 'Equipos',
  },
  'trivia-games': {
    id: 'trivia-games',
    label: 'Trivia',
    shortLabel: 'Trivia',
  },
  learning: {
    id: 'learning',
    label: 'Aprendizaje',
    shortLabel: 'Aprendizaje',
  },
  other: {
    id: 'other',
    label: 'Otros mazos',
    shortLabel: 'Otros',
  },
};

export const DECK_CATALOG_CATEGORIES: Record<
  DeckCatalogCategoryId,
  DeckCatalogCategoryDefinition
> = {
  'emotional-regulation': {
    id: 'emotional-regulation',
    collection: 'self-work',
    label: 'Regulación emocional',
    shortLabel: 'Regulación',
    summary: 'Herramientas concretas para bajar intensidad y volver al cuerpo.',
  },
  introspection: {
    id: 'introspection',
    collection: 'self-work',
    label: 'Introspección',
    shortLabel: 'Introspección',
    summary: 'Preguntas y ejercicios para mirar hacia adentro con estructura.',
  },
  grounding: {
    id: 'grounding',
    collection: 'self-work',
    label: 'Cable a tierra',
    shortLabel: 'Cable a tierra',
    summary: 'Cartas breves para volver al cuerpo y recuperar piso.',
  },
  'anxiety-pause': {
    id: 'anxiety-pause',
    collection: 'self-work',
    label: 'Ansiedad y pausa',
    shortLabel: 'Ansiedad',
    summary: 'Intervenciones simples para bajar velocidad cuando todo sube.',
  },
  journaling: {
    id: 'journaling',
    collection: 'self-work',
    label: 'Journaling',
    shortLabel: 'Journaling',
    summary: 'Disparadores para escribir sin quedarse mirando la página.',
  },
  boundaries: {
    id: 'boundaries',
    collection: 'self-work',
    label: 'Límites',
    shortLabel: 'Límites',
    summary: 'Cartas para nombrar límites y sostenerlos con claridad.',
  },
  'decision-clarity': {
    id: 'decision-clarity',
    collection: 'self-work',
    label: 'Decisiones',
    shortLabel: 'Decisiones',
    summary: 'Preguntas para ordenar opciones cuando decidir cuesta.',
  },
  'between-friends': {
    id: 'between-friends',
    collection: 'social-games',
    label: 'Entre amigos',
    shortLabel: 'Entre amigos',
    summary: 'Preguntas y retos para mover una mesa de amigos.',
  },
  'dinner-table': {
    id: 'dinner-table',
    collection: 'social-games',
    label: 'Sobremesa',
    shortLabel: 'Sobremesa',
    summary: 'Cartas para estirar la noche cuando la mesa pide otra ronda.',
  },
  party: {
    id: 'party',
    collection: 'social-games',
    label: 'Fiesta y previa',
    shortLabel: 'Fiesta',
    summary: 'Juegos rápidos para encender un grupo sin explicar demasiado.',
  },
  family: {
    id: 'family',
    collection: 'social-games',
    label: 'Familia',
    shortLabel: 'Familia',
    summary: 'Preguntas jugables para mesas mezcladas y generaciones distintas.',
  },
  dates: {
    id: 'dates',
    collection: 'couples-dating',
    label: 'Citas',
    shortLabel: 'Citas',
    summary: 'Preguntas livianas para romper el hielo sin entrevista.',
  },
  'first-date': {
    id: 'first-date',
    collection: 'couples-dating',
    label: 'Primera cita',
    shortLabel: 'Primera cita',
    summary: 'Preguntas para revelar personalidad sin convertir la cita en entrevista.',
  },
  'couple-reconnection': {
    id: 'couple-reconnection',
    collection: 'couples-dating',
    label: 'Reconexión',
    shortLabel: 'Reconexión',
    summary: 'Cartas para parejas que quieren volver a escucharse con calma.',
  },
  'playful-intimacy': {
    id: 'playful-intimacy',
    collection: 'couples-dating',
    label: 'Juego y deseo',
    shortLabel: 'Juego',
    summary: 'Prompts para subir complicidad sin caer en lo obvio.',
  },
  'hard-conversations': {
    id: 'hard-conversations',
    collection: 'couples-dating',
    label: 'Conversaciones difíciles',
    shortLabel: 'Difíciles',
    summary: 'Estructura para hablar de lo que importa sin ir directo al choque.',
  },
  conversation: {
    id: 'conversation',
    collection: 'social-games',
    label: 'Conversación',
    shortLabel: 'Conversación',
    summary: 'Disparadores simples para hablar con un poco más de intención.',
  },
  confessions: {
    id: 'confessions',
    collection: 'social-games',
    label: 'Confesiones',
    shortLabel: 'Confesiones',
    summary: 'Preguntas y pequeñas verdades para grupos con confianza.',
  },
  office: {
    id: 'office',
    collection: 'team-tools',
    label: 'Oficina',
    shortLabel: 'Oficina',
    summary: 'Dinámicas breves para abrir conversación en equipos y talleres.',
  },
  facilitation: {
    id: 'facilitation',
    collection: 'team-tools',
    label: 'Facilitación',
    shortLabel: 'Facilitación',
    summary: 'Herramientas para guiar grupos, talleres y sesiones de trabajo.',
  },
  retrospectives: {
    id: 'retrospectives',
    collection: 'team-tools',
    label: 'Retrospectivas',
    shortLabel: 'Retros',
    summary: 'Cartas para revisar cómo trabajó un equipo sin caer en plantilla vacía.',
  },
  feedback: {
    id: 'feedback',
    collection: 'team-tools',
    label: 'Feedback',
    shortLabel: 'Feedback',
    summary: 'Prompts para dar y pedir feedback con menos defensiva.',
  },
  onboarding: {
    id: 'onboarding',
    collection: 'team-tools',
    label: 'Onboarding',
    shortLabel: 'Onboarding',
    summary: 'Dinámicas para que un equipo nuevo se entienda antes de correr.',
  },
  values: {
    id: 'values',
    collection: 'team-tools',
    label: 'Valores',
    shortLabel: 'Valores',
    summary: 'Cartas para convertir valores declarados en decisiones concretas.',
  },
  conflict: {
    id: 'conflict',
    collection: 'team-tools',
    label: 'Conflicto',
    shortLabel: 'Conflicto',
    summary: 'Preguntas para ordenar tensión sin apagar lo importante.',
  },
  'argentine-cinema': {
    id: 'argentine-cinema',
    collection: 'trivia-games',
    label: 'Cine argentino',
    shortLabel: 'Cine argentino',
    summary: 'Preguntas de cine argentino para jugar y discutir escenas.',
  },
  'romantic-comedy': {
    id: 'romantic-comedy',
    collection: 'trivia-games',
    label: 'Comedia romántica',
    shortLabel: 'Comedia romántica',
    summary: 'Preguntas de películas románticas para jugar entre amigos.',
  },
  'pop-culture': {
    id: 'pop-culture',
    collection: 'trivia-games',
    label: 'Cultura pop',
    shortLabel: 'Cultura pop',
    summary: 'Preguntas con respuesta para jugar sin preparar nada.',
  },
  music: {
    id: 'music',
    collection: 'trivia-games',
    label: 'Música',
    shortLabel: 'Música',
    summary: 'Trivia y conversación para discutir canciones, escenas y épocas.',
  },
  'argentina-latam': {
    id: 'argentina-latam',
    collection: 'trivia-games',
    label: 'Argentina y LATAM',
    shortLabel: 'Argentina/LATAM',
    summary: 'Preguntas culturales con textura local y debate de sobremesa.',
  },
  'language-practice': {
    id: 'language-practice',
    collection: 'learning',
    label: 'Práctica de idioma',
    shortLabel: 'Idioma',
    summary: 'Cartas para practicar lenguaje real con prompts concretos.',
  },
  'classroom-conversation': {
    id: 'classroom-conversation',
    collection: 'learning',
    label: 'Conversación de aula',
    shortLabel: 'Aula',
    summary: 'Prompts para hacer hablar a un grupo sin forzar exposición.',
  },
  'writing-prompts': {
    id: 'writing-prompts',
    collection: 'learning',
    label: 'Escritura',
    shortLabel: 'Escritura',
    summary: 'Disparadores narrativos para escribir una escena, voz o idea.',
  },
  debate: {
    id: 'debate',
    collection: 'learning',
    label: 'Debate',
    shortLabel: 'Debate',
    summary: 'Cartas para practicar opinión, argumento y escucha.',
  },
  creativity: {
    id: 'creativity',
    collection: 'learning',
    label: 'Creatividad',
    shortLabel: 'Creatividad',
    summary: 'Ejercicios para inventar conexiones, historias y posibilidades.',
  },
  football: {
    id: 'football',
    collection: 'trivia-games',
    label: 'Fútbol',
    shortLabel: 'Fútbol',
    summary: 'Preguntas para discutir historia, equipos e ídolos de cancha.',
  },
  other: {
    id: 'other',
    collection: 'other',
    label: 'Mazo digital',
    shortLabel: 'Mazo',
    summary: 'Una baraja digital para jugar, pensar o facilitar una sesión.',
  },
};

export function getDeckCatalogFacet(deck: DeckSchema): DeckCatalogFacet {
  const placement = getDeckCatalogPlacement(deck);
  const category = DECK_CATALOG_CATEGORIES[placement.category] ?? DECK_CATALOG_CATEGORIES.other;
  const collection = DECK_CATALOG_COLLECTIONS[category.collection] ?? DECK_CATALOG_COLLECTIONS.other;

  return {
    collectionId: collection.id,
    collectionLabel: collection.label,
    collectionShortLabel: collection.shortLabel,
    categoryId: category.id,
    categoryLabel: category.label,
    categoryShortLabel: category.shortLabel,
    summary: category.summary,
  };
}

export function getDeckCatalogBreadcrumb(deck: DeckSchema): DeckCatalogBreadcrumbItem[] {
  const facet = getDeckCatalogFacet(deck);

  return [
    {
      kind: 'collection',
      id: facet.collectionId,
      label: facet.collectionLabel,
    },
    {
      kind: 'category',
      id: facet.categoryId,
      label: facet.categoryLabel,
    },
    {
      kind: 'deck',
      id: deck.slug,
      label: deck.name,
    },
  ];
}

export function getDeckCatalogValidationErrors(deck: DeckSchema): string[] {
  const errors: string[] = [];
  const catalog = deck.digital?.catalog;

  if (deck.digital?.is_published !== true) {
    return errors;
  }

  if (!catalog) {
    return ['published digital decks must define digital.catalog'];
  }

  const collection = DECK_CATALOG_COLLECTIONS[catalog.collection];
  const category = DECK_CATALOG_CATEGORIES[catalog.category];

  if (!collection) {
    errors.push(`unknown catalog collection "${catalog.collection}"`);
  }

  if (!category) {
    errors.push(`unknown catalog category "${catalog.category}"`);
  }

  if (collection && category && category.collection !== catalog.collection) {
    errors.push(
      `catalog category "${catalog.category}" belongs to "${category.collection}", not "${catalog.collection}"`
    );
  }

  return errors;
}

function getDeckCatalogPlacement(deck: DeckSchema): DeckCatalogPlacement {
  const explicitPlacement = deck.digital?.catalog;

  if (explicitPlacement) {
    return explicitPlacement;
  }

  return inferLegacyCatalogPlacement(deck);
}

function inferLegacyCatalogPlacement(deck: DeckSchema): DeckCatalogPlacement {
  const category = deck.digital?.category;
  const tags = new Set(deck.digital?.tags ?? []);

  if (category === 'emotional-regulation') {
    return { collection: 'self-work', category: 'emotional-regulation' };
  }

  if (category === 'introspection') {
    return { collection: 'self-work', category: 'introspection' };
  }

  if (category === 'team-building') {
    return {
      collection: 'team-tools',
      category: tags.has('oficina') ? 'office' : 'facilitation',
    };
  }

  if (category === 'trivia') {
    if (tags.has('cine-argentino') || tags.has('nacionales')) {
      return { collection: 'trivia-games', category: 'argentine-cinema' };
    }

    if (tags.has('comedia-romantica')) {
      return { collection: 'trivia-games', category: 'romantic-comedy' };
    }

    if (tags.has('futbol') || tags.has('fútbol')) {
      return { collection: 'trivia-games', category: 'football' };
    }

    return { collection: 'trivia-games', category: 'pop-culture' };
  }

  if (category === 'conversation') {
    if (tags.has('citas') || tags.has('parejas')) {
      return { collection: 'couples-dating', category: 'first-date' };
    }

    if (tags.has('juntadas') || tags.has('amigos')) {
      return { collection: 'social-games', category: 'between-friends' };
    }

    return { collection: 'social-games', category: 'conversation' };
  }

  if (category === 'language-learning') {
    return { collection: 'learning', category: 'language-practice' };
  }

  return { collection: 'other', category: 'other' };
}
