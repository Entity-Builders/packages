import type {
  BarajaProduct,
  BarajaProductCatalog,
  DigitalCompanion,
  GameEdition,
  GameTemplate,
  PrintablePack,
  ProductOffering,
  TriviaBingoAnswer,
  TriviaBingoEditionContent,
} from './types.js';

export const TRIVIA_BINGO_PRODUCT_ID = 'trivia-bingo';
export const TRIVIA_BINGO_TEMPLATE_ID = 'trivia-bingo-standard';
export const TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION_ID =
  'trivia-bingo-esto-es-muy-argentino-v1';
export const TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_OFFERING_ID =
  'trivia-bingo-esto-es-muy-argentino-pilot';

export const TRIVIA_BINGO_PRODUCT: BarajaProduct = {
  id: TRIVIA_BINGO_PRODUCT_ID,
  slug: 'bingo-trivia',
  brand: 'baraja',
  kind: 'trivia_bingo',
  family: 'printable_game',
  modes: ['prebuilt', 'campaign_pilot'],
  title: 'Trivia Bingo',
  summary:
    'Una pausa social de preguntas y cartones para activar mesas sin apps, clips ni producción en vivo.',
  legal: {
    summary:
      'Baraja vende un kit de trivia original para un evento. No vende medios de terceros, licencias de reproducción, impresión física, envío, conducción en sala ni derechos de reventa.',
    exclusions: [
      { id: 'third_party_audiovisual_media', label: 'Clips, películas, series o fotogramas de terceros' },
      { id: 'third_party_brands', label: 'Logos, marcas o personajes de terceros' },
      { id: 'audio_playlists', label: 'Audio, música, letras o playlists' },
      { id: 'physical_printing', label: 'Impresión física' },
      { id: 'shipping', label: 'Envío o seguimiento físico' },
      { id: 'live_hosting', label: 'Conducción, animación o soporte en sala' },
      { id: 'commercial_resale', label: 'Reventa, white-label o uso multi-evento' },
    ],
    organizerResponsibilities: [
      'Proyectar el archivo, imprimir los cartones y disponer de marcadores para cada mesa.',
      'Designar una persona para avanzar la partida y validar el cartón lleno con la guía.',
      'Resolver el premio del evento, si decide ofrecer uno.',
    ],
  },
};

export const TRIVIA_BINGO_TEMPLATE: GameTemplate = {
  id: TRIVIA_BINGO_TEMPLATE_ID,
  kind: 'trivia_bingo',
  title: 'Trivia Bingo de mesa',
  summary:
    'Preguntas proyectadas y cartones por mesa; se marca la respuesta revelada hasta que un único cartón se completa al final.',
  requiredAssetKinds: ['projection_pdf', 'cards_pdf', 'control_sheet'],
  optionalCompanionKinds: ['host_view'],
  rulesSummary:
    'Cada mesa conversa la respuesta. Tras la revelación oficial, marca su cartón si contiene esa respuesta. Gana la única mesa que completa el cartón al cierre de la partida.',
};

export const TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_ANSWERS: TriviaBingoAnswer[] = [
  { id: 'mate', label: 'Mate' },
  { id: 'alfajor', label: 'Alfajor' },
  { id: 'dulce-de-leche', label: 'Dulce de leche' },
  { id: 'asado', label: 'Asado' },
  { id: 'obelisco', label: 'Obelisco' },
  { id: 'cataratas-del-iguazu', label: 'Cataratas del Iguazú' },
  { id: 'glaciar-perito-moreno', label: 'Glaciar Perito Moreno' },
  { id: 'aconcagua', label: 'Aconcagua' },
  { id: 'hornero', label: 'Hornero' },
  { id: 'ceibo', label: 'Ceibo' },
  { id: 'tango', label: 'Tango' },
  { id: 'filete-porteno', label: 'Filete porteño' },
  { id: 'veinticinco-de-mayo', label: '25 de Mayo' },
  { id: 'manuel-belgrano', label: 'Manuel Belgrano' },
  { id: 'rosario', label: 'Rosario' },
  { id: 'chamame', label: 'Chamamé' },
  { id: 'cueva-de-las-manos', label: 'Cueva de las Manos' },
  { id: 'quebrada-de-humahuaca', label: 'Quebrada de Humahuaca' },
  { id: 'choripan', label: 'Choripán' },
  { id: 'empanada', label: 'Empanada' },
  { id: 'bandoneon', label: 'Bandoneón' },
  { id: 'condor', label: 'Cóndor' },
  { id: 'mar-del-plata', label: 'Mar del Plata' },
  { id: 'tilcara', label: 'Tilcara' },
  { id: 'lapacho', label: 'Lapacho' },
  { id: 'camino-de-los-siete-lagos', label: 'Camino de los Siete Lagos' },
];

export const TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT: TriviaBingoEditionContent = {
  contentVersion: 'v1',
  answers: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_ANSWERS,
  questions: [
    {
      id: 'arg-01-mate',
      prompt: '¿Qué infusión nacional se toma con yerba, agua caliente y bombilla?',
      correctAnswerId: 'mate',
      revealCopy: 'El mate fue declarado infusión nacional y se comparte en ronda o se toma de manera individual.',
      editorialSourceReference: 'https://www.argentina.gob.ar/pais/mate',
    },
    {
      id: 'arg-02-alfajor',
      prompt: '¿Cómo se llama el dulce de dos tapas que suele llevar relleno de dulce de leche?',
      correctAnswerId: 'alfajor',
      revealCopy: 'El alfajor tiene versiones regionales y muchísimas combinaciones, pero el relleno de dulce de leche es un clásico.',
      editorialSourceReference:
        'https://www.argentina.gob.ar/sites/default/files/guia_informativa_y_de_orientacion_cultural_0.pdf',
    },
    {
      id: 'arg-03-dulce-de-leche',
      prompt: '¿Cómo se llama la preparación dulce hecha a base de leche y azúcar?',
      correctAnswerId: 'dulce-de-leche',
      revealCopy: 'El dulce de leche aparece solo, en postres y como relleno de numerosos dulces.',
      editorialSourceReference:
        'https://www.argentina.gob.ar/sites/default/files/guia_informativa_y_de_orientacion_cultural_0.pdf',
    },
    {
      id: 'arg-04-asado',
      prompt: '¿Cómo se llama la comida de carnes hechas a la parrilla que suele convocar una reunión?',
      correctAnswerId: 'asado',
      revealCopy: 'El asado es comida y ritual: una excusa frecuente para reunirse alrededor de la parrilla.',
      editorialSourceReference:
        'https://www.argentina.gob.ar/sites/default/files/guia_informativa_y_de_orientacion_cultural_0.pdf',
    },
    {
      id: 'arg-05-obelisco',
      prompt: '¿Qué monumento está en el cruce de las avenidas Corrientes y 9 de Julio?',
      correctAnswerId: 'obelisco',
      revealCopy: 'El Obelisco es uno de los emblemas más reconocibles de la Ciudad de Buenos Aires.',
      editorialSourceReference:
        'https://buenosaires.gob.ar/gcaba_historico/circuito-san-nicolas/obelisco',
    },
    {
      id: 'arg-06-cataratas',
      prompt: '¿Cómo se llama el conjunto de saltos de agua del Parque Nacional Iguazú?',
      correctAnswerId: 'cataratas-del-iguazu',
      revealCopy: 'Las Cataratas del Iguazú están dentro del Parque Nacional Iguazú y son Patrimonio Mundial.',
      editorialSourceReference:
        'https://www.argentina.gob.ar/jefatura/turismo/viaja-por-argentina/conocer-las-cataratas-del-iguazu',
    },
    {
      id: 'arg-07-perito-moreno',
      prompt: '¿Qué glaciar se encuentra en la provincia de Santa Cruz?',
      correctAnswerId: 'glaciar-perito-moreno',
      revealCopy: 'El Glaciar Perito Moreno forma parte del paisaje del Parque Nacional Los Glaciares, en Santa Cruz.',
      editorialSourceReference:
        'https://www.argentina.gob.ar/ciencia/conae/educacion-y-formacion-masiva/materiales-educativos/glaciar-perito-moreno-argentina-cosmo-skymed-26-de-mayo-de-2010',
    },
    {
      id: 'arg-08-aconcagua',
      prompt: '¿Cómo se llama el cerro más alto del continente americano?',
      correctAnswerId: 'aconcagua',
      revealCopy: 'El Aconcagua está en Mendoza y es conocido como la cumbre de América.',
      editorialSourceReference: 'https://www.argentina.gob.ar/node/465038',
    },
    {
      id: 'arg-09-hornero',
      prompt: '¿Qué ave nacional es famosa por su nido con forma de horno?',
      correctAnswerId: 'hornero',
      revealCopy: 'El hornero fue declarado Ave Nacional en 1928.',
      editorialSourceReference:
        'https://www.argentina.gob.ar/noticias/5-de-octubre-dia-nacional-del-ave',
    },
    {
      id: 'arg-10-ceibo',
      prompt: '¿Cuál es la flor nacional argentina?',
      correctAnswerId: 'ceibo',
      revealCopy: 'La flor del ceibo fue declarada Flor Nacional Argentina en 1942.',
      editorialSourceReference: 'https://www.argentina.gob.ar/pais/ceibo',
    },
    {
      id: 'arg-11-tango',
      prompt: '¿Qué expresión de música, danza y poesía nació en la región del Río de la Plata?',
      correctAnswerId: 'tango',
      revealCopy: 'El tango es una tradición rioplatense, compartida por Argentina y Uruguay.',
      editorialSourceReference: 'https://ich.unesco.org/es/rl/el-tango-00258',
    },
    {
      id: 'arg-12-filete',
      prompt: '¿Cómo se llama la técnica pictórica porteña de colores vivos y letras ornamentales?',
      correctAnswerId: 'filete-porteno',
      revealCopy: 'El filete porteño puede verse en colectivos, camiones y carteles, y fue inscrito por UNESCO en 2015.',
      editorialSourceReference:
        'https://ich.unesco.org/es/RL/el-filete-porteno-de-buenos-aires-una-tecnica-pictorica-tradicional-01069',
    },
    {
      id: 'arg-13-revolucion-de-mayo',
      prompt: '¿Qué fecha patria recuerda la Revolución de Mayo y el primer gobierno patrio?',
      correctAnswerId: 'veinticinco-de-mayo',
      revealCopy: 'El 25 de mayo de 1810 se estableció la Primera Junta de Gobierno.',
      editorialSourceReference: 'https://www.argentina.gob.ar/node/431366',
    },
    {
      id: 'arg-14-belgrano',
      prompt: '¿Qué general creó la Bandera Nacional en 1812?',
      correctAnswerId: 'manuel-belgrano',
      revealCopy: 'Manuel Belgrano creó la Bandera Nacional el 27 de febrero de 1812.',
      editorialSourceReference: 'https://www.argentina.gob.ar/pais/simbolos/bandera',
    },
    {
      id: 'arg-15-rosario',
      prompt: '¿En qué ciudad fue creada la Bandera Nacional?',
      correctAnswerId: 'rosario',
      revealCopy: 'La bandera fue creada en el poblado de la Capilla del Rosario, hoy ciudad de Rosario.',
      editorialSourceReference: 'https://www.argentina.gob.ar/pais/simbolos/bandera',
    },
    {
      id: 'arg-16-chamame',
      prompt: '¿Qué expresión musical y de danza está especialmente extendida en Corrientes?',
      correctAnswerId: 'chamame',
      revealCopy: 'El chamamé es una expresión cultural ligada a Corrientes y a celebraciones comunitarias.',
      editorialSourceReference: 'https://ich.unesco.org/es/RL/el-chamame-01600',
    },
    {
      id: 'arg-17-cueva-de-las-manos',
      prompt: '¿Qué sitio argentino es conocido por su arte rupestre de manos prehistóricas?',
      correctAnswerId: 'cueva-de-las-manos',
      revealCopy: 'Cueva de las Manos, Río Pinturas, fue inscrita en la Lista del Patrimonio Mundial en 1999.',
      editorialSourceReference: 'https://whc.unesco.org/en/decisions/2561/',
    },
    {
      id: 'arg-18-quebrada-de-humahuaca',
      prompt: '¿Cómo se llama el valle cultural de Jujuy ligado al Camino del Inca?',
      correctAnswerId: 'quebrada-de-humahuaca',
      revealCopy: 'La Quebrada de Humahuaca es un paisaje cultural de Jujuy con huellas de más de 10.000 años de uso.',
      editorialSourceReference: 'https://whc.unesco.org/en/list/1116/',
    },
  ],
  guideSteps: [
    'Antes de empezar, repartí un cartón distinto y un marcador por mesa.',
    'Proyectá cada pregunta, dejá un momento breve para que la mesa converse y revelá la respuesta oficial.',
    'Cada mesa marca sólo la respuesta revelada si aparece en su cartón.',
    'Cuando una mesa complete el cartón, verificá sus nueve respuestas con la hoja de control antes de anunciar el ganador.',
  ],
  printInstructions: [
    'Imprimí el PDF de cartones en A4, a escala 100%.',
    'Entregá un cartón por mesa y conservá la guía de host junto a la proyección.',
    'El kit está diseñado para ocho mesas; no combines cartones de otra edición o semilla.',
  ],
  legalSummary:
    'El kit contiene preguntas, respuestas y visuales originales de Baraja. No incluye clips, música, logos, imágenes o material audiovisual de terceros.',
};

export const TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION: GameEdition = {
  id: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION_ID,
  productId: TRIVIA_BINGO_PRODUCT_ID,
  templateId: TRIVIA_BINGO_TEMPLATE_ID,
  slug: 'esto-es-muy-argentino',
  route: '/bingo-trivia',
  title: 'Esto es muy argentino',
  locale: 'es',
  status: 'active',
  summary:
    '18 preguntas para que ocho mesas conversen, marquen y lleguen a un único cartón lleno al final.',
  audience: 'Bares, after-office y equipos de hasta ocho mesas',
  designedUseContexts: ['private_event', 'venue_event'],
  eventContext: {
    audience: 'Hasta ocho mesas',
    duration: '15 a 20 minutos',
  },
  content: {
    triviaBingo: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_CONTENT,
  },
};

export const TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_PRINTABLE_PACK: PrintablePack = {
  id: 'trivia-bingo-esto-es-muy-argentino-printable-pack',
  editionId: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION_ID,
  title: 'Kit imprimible Esto es muy argentino',
  assets: [
    {
      id: 'trivia-bingo-argentina-projection',
      kind: 'projection_pdf',
      title: 'Proyección de la partida',
      status: 'planned',
    },
    {
      id: 'trivia-bingo-argentina-cards',
      kind: 'cards_pdf',
      title: 'Cartones de mesa A4',
      status: 'planned',
    },
    {
      id: 'trivia-bingo-argentina-host-control',
      kind: 'control_sheet',
      title: 'Guía de host y hoja de control',
      status: 'planned',
    },
  ],
};

export const TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_HOST_COMPANION: DigitalCompanion = {
  id: 'trivia-bingo-esto-es-muy-argentino-host-view',
  editionId: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION_ID,
  kind: 'host_view',
  route: '/bingo-trivia/host',
  status: 'active',
  stateMode: 'local_only',
  qrEnabled: false,
  title: 'Player de host · Esto es muy argentino',
};

export const TRIVIA_BINGO_OFFERINGS: ProductOffering[] = [
  {
    id: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_OFFERING_ID,
    productId: TRIVIA_BINGO_PRODUCT_ID,
    editionId: TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION_ID,
    title: 'Trivia Bingo: Esto es muy argentino',
    audience: 'Bares, after-office y equipos que quieren activar hasta ocho mesas',
    description:
      'Kit fijo para un evento: proyección, ocho cartones 3×3 y guía de host para una partida de 15 a 20 minutos.',
    tags: ['Edición piloto', '8 mesas', 'Un ganador', 'Listo para proyectar e imprimir'],
    sampleItems: ['Pregunta proyectada', 'Cartón 3×3', 'Guía de host'],
    salesMode: 'checkout',
    licenseScope: 'venue_event',
    commercialResaleAllowed: false,
    pricingMode: 'fixed',
    analyticsOfferType: 'trivia_bingo_pilot',
    messageLines: [
      'Hola, necesito ayuda con mi Trivia Bingo de Baraja.',
      '',
      'Compré o quiero organizar la edición Esto es muy argentino para ocho mesas.',
    ],
  },
];

export const TRIVIA_BINGO_PRODUCT_CATALOG: BarajaProductCatalog = {
  products: [TRIVIA_BINGO_PRODUCT],
  templates: [TRIVIA_BINGO_TEMPLATE],
  editions: [TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_EDITION],
  printablePacks: [TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_PRINTABLE_PACK],
  digitalCompanions: [TRIVIA_BINGO_ESTO_ES_MUY_ARGENTINO_HOST_COMPANION],
  offerings: TRIVIA_BINGO_OFFERINGS,
  campaignLandings: [],
  customProjects: [],
};
