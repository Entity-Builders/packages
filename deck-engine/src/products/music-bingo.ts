import type {
  BarajaProduct,
  BarajaProductCatalog,
  CampaignLanding,
  DigitalCompanion,
  GameEdition,
  GameTemplate,
  MusicBingoCell,
  MusicBingoSong,
  PrintablePack,
  ProductOffering,
} from './types.js';
import { applyMusicBingoSongArtworkCache } from './music-bingo-song-cache.js';

export const MUSIC_BINGO_PRODUCT_ID = 'bingo-musical';
export const MUSIC_BINGO_TEMPLATE_ID = 'music-bingo-standard';
export const MUSIC_BINGO_DEMO_EDITION_ID = 'bingo-musical-demo-bar';
export const MUSIC_BINGO_CAMPAIGN_ID = 'music_bingo';

export const MUSIC_BINGO_PRODUCT: BarajaProduct = {
  id: MUSIC_BINGO_PRODUCT_ID,
  slug: 'bingo-musical',
  brand: 'baraja',
  kind: 'music_bingo',
  family: 'printable_game',
  modes: ['prebuilt', 'custom', 'venue_event', 'campaign_pilot'],
  title: 'Bingo Musical',
  summary:
    'Cartones imprimibles, hoja de control, reglas, guia de dinamica y companion QR opcional para fiestas, juntadas, bares y eventos.',
  legal: {
    summary:
      'Baraja vende el juego y sus materiales. No vende musica, audio, derechos de reproduccion, permisos comerciales de streaming, impresion fisica ni envio.',
    exclusions: [
      { id: 'audio_files', label: 'Archivos de audio' },
      { id: 'music_rights', label: 'Derechos musicales' },
      { id: 'public_performance', label: 'Licencias de reproduccion publica' },
      { id: 'official_playlists', label: 'Playlists oficiales pagas' },
      { id: 'physical_printing', label: 'Impresion fisica' },
      { id: 'shipping', label: 'Envio o tracking' },
    ],
    organizerResponsibilities: [
      'Elegir plataforma o fuente de reproduccion musical.',
      'Resolver permisos o licencias aplicables al evento o comercio.',
      'Imprimir los materiales o coordinar su impresion con un tercero.',
    ],
  },
};

export const MUSIC_BINGO_TEMPLATE: GameTemplate = {
  id: MUSIC_BINGO_TEMPLATE_ID,
  kind: 'music_bingo',
  title: 'Bingo musical estandar',
  summary:
    'Juego de reconocimiento musical con cartones, lista de control, reglas y variantes para anfitrion.',
  requiredAssetKinds: ['cards_pdf', 'control_sheet', 'rules_guide', 'song_list'],
  optionalCompanionKinds: ['qr_player', 'host_view'],
  rulesSummary:
    'El anfitrion reproduce fragmentos. Los jugadores marcan canciones o consignas y ganan por linea, doble linea o carton completo.',
};

const MUSIC_BINGO_DEMO_SONG_ARTWORK_CACHE = {
  'song-01': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e021bbe81fc1e928f05149e49ab',
    spotifyTrackUrl: 'https://open.spotify.com/track/4it4NYn9wNqGV54joA6oN0',
  },
  'song-02': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02353360f871d689ff74dd3712',
    spotifyTrackUrl: 'https://open.spotify.com/track/0VWBsKl936U9OO0zypvRCZ',
  },
  'song-03': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02df54506fd365623237335f21',
    spotifyTrackUrl: 'https://open.spotify.com/track/4iPA2yB8bK7T770EkkOi7s',
  },
  'song-04': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02a89f53c13537b933a43d2600',
    spotifyTrackUrl: 'https://open.spotify.com/track/29iIRrSuANyjnwag69PHOJ',
  },
  'song-05': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0201760d9291c8a82283da1013',
    spotifyTrackUrl: 'https://open.spotify.com/track/2RognU2ViRdA6HxnpAITJl',
  },
  'song-06': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02292c1ca632a1e120d1208c95',
    spotifyTrackUrl: 'https://open.spotify.com/track/1qWLCuCnNcQVVzJm4pu7Zv',
  },
  'song-07': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e021a242642520465ef5a9c1b68',
    spotifyTrackUrl: 'https://open.spotify.com/track/4AvQGX7JNmA0VkwT1JmL8D',
  },
  'song-08': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02af9e234f7bb89453544d6cb1',
    spotifyTrackUrl: 'https://open.spotify.com/track/6kUopck7LHVadAjAFcXiTj',
  },
  'song-09': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02e4b8ec3d2ffe1f77c7185d48',
    spotifyTrackUrl: 'https://open.spotify.com/track/1p7m9H4H8s0Y7SgRm7j3ED',
  },
  'song-10': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e024febc01367fbd2d1ec9f1d60',
    spotifyTrackUrl: 'https://open.spotify.com/track/0dsViRiDTIuexAL42Nc1Kh',
  },
  'song-11': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e028875cc2685c8d483e0e667f0',
    spotifyTrackUrl: 'https://open.spotify.com/track/6rg1MBZqggsQ5olFGTw0rr',
  },
  'song-12': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02bb0ebefc4052bc1faab428b3',
    spotifyTrackUrl: 'https://open.spotify.com/track/60IzIxSuVAtU71yCmHjxHH',
  },
  'song-13': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02a0fc7851f47a216e9a902aa6',
    spotifyTrackUrl: 'https://open.spotify.com/track/2PKkCGoCc4idF91R6RvFEN',
  },
  'song-14': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e024b471c4c2e9187e94ef7fc6b',
    spotifyTrackUrl: 'https://open.spotify.com/track/5zdazgWuhzFMMtwt5kdeFD',
  },
  'song-15': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0283abd9981ec15776b4ec964b',
    spotifyTrackUrl: 'https://open.spotify.com/track/3EsjrObXPhXA79Cr4QixY8',
  },
  'song-16': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0235bf8a2179962114b8ec7585',
    spotifyTrackUrl: 'https://open.spotify.com/track/6Pur3hWy6Nzc27ilmsp5HA',
  },
  'song-17': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02139d10e0ae979a7b4a811140',
    spotifyTrackUrl: 'https://open.spotify.com/track/6eOT73H5zfEwTCe1Y0FDCc',
  },
  'song-18': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02a54654c1c6a625909b473363',
    spotifyTrackUrl: 'https://open.spotify.com/track/3lvAzKmRH8vzXQ4xm19v78',
  },
  'song-19': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e024e43a1468d51f6b0cbcd4c3f',
    spotifyTrackUrl: 'https://open.spotify.com/track/7yPsoib9EoQVmK3loJgptI',
  },
  'song-20': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02d543f7c7de880da5370922c0',
    spotifyTrackUrl: 'https://open.spotify.com/track/3oqWr0jDWNXxWufNogGREp',
  },
  'song-21': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e0224a7874db45f85653ab70c4e',
    spotifyTrackUrl: 'https://open.spotify.com/track/1wIUWGdTdhVk5gIPd0ULxX',
  },
  'song-22': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e026961872106b3ce3d9cf7d230',
    spotifyTrackUrl: 'https://open.spotify.com/track/6zielPkg61vCK5DfqqvjE9',
  },
  'song-23': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02611223656448ed75b3188d34',
    spotifyTrackUrl: 'https://open.spotify.com/track/2zogXcCqvKJwh3o67W3GG3',
  },
  'song-24': {
    artworkUrl: 'https://i.scdn.co/image/ab67616d00001e02cdd8ead7c7be9879e30e7cb0',
    spotifyTrackUrl: 'https://open.spotify.com/track/0ZAJ660VP57lLK4U7NlGOy',
  },
};

export const MUSIC_BINGO_DEMO_SONGS: MusicBingoSong[] = applyMusicBingoSongArtworkCache([
  { id: 'song-01', artist: 'Soda Stereo', title: 'De musica ligera' },
  { id: 'song-02', artist: 'Los Redondos', title: 'Jijiji' },
  { id: 'song-03', artist: 'Soda Stereo', title: 'Persiana americana' },
  { id: 'song-04', artist: 'Charly Garcia', title: 'Demoliendo hoteles' },
  { id: 'song-05', artist: 'Fito Paez', title: 'Mariposa tecknicolor' },
  { id: 'song-06', artist: 'Virus', title: 'Luna de miel en la mano' },
  { id: 'song-07', artist: 'Los Abuelos de la Nada', title: 'Mil horas' },
  { id: 'song-08', artist: 'Patricio Rey', title: 'Un angel para tu soledad' },
  { id: 'song-09', artist: 'Andres Calamaro', title: 'Flaca' },
  { id: 'song-10', artist: 'Babasonicos', title: 'Irresponsables' },
  { id: 'song-11', artist: 'Divididos', title: 'Spaghetti del rock' },
  { id: 'song-12', artist: 'Las Pelotas', title: 'Sera' },
  { id: 'song-13', artist: 'Bersuit Vergarabat', title: 'Yo tomo' },
  { id: 'song-14', artist: 'La Renga', title: 'El final es en donde parti' },
  { id: 'song-15', artist: 'Los Fabulosos Cadillacs', title: 'Matador' },
  { id: 'song-16', artist: 'Enanitos Verdes', title: 'Lamento boliviano' },
  { id: 'song-17', artist: 'Los Rodriguez', title: 'Sin documentos' },
  { id: 'song-18', artist: 'Sui Generis', title: 'Rasguna las piedras' },
  { id: 'song-19', artist: 'Seru Giran', title: 'Seminare' },
  { id: 'song-20', artist: 'Gustavo Cerati', title: 'Crimen' },
  { id: 'song-21', artist: 'La Vela Puerca', title: 'Zafar' },
  { id: 'song-22', artist: 'Catupecu Machu', title: 'Magia veneno' },
  { id: 'song-23', artist: 'Attaque 77', title: 'Arrancacorazones' },
  { id: 'song-24', artist: 'Intoxicados', title: 'Nunca quise' },
], MUSIC_BINGO_DEMO_SONG_ARTWORK_CACHE);

export const MUSIC_BINGO_DEMO_BOARD: MusicBingoCell[] = [
  { id: 'cell-01', label: 'Musica ligera', hint: 'Soda Stereo', songId: 'song-01' },
  { id: 'cell-02', label: 'Jijiji', hint: 'Los Redondos', songId: 'song-02' },
  { id: 'cell-03', label: 'Persiana', hint: 'Soda Stereo', songId: 'song-03' },
  { id: 'cell-04', label: 'Demoliendo', hint: 'Charly Garcia', songId: 'song-04' },
  { id: 'cell-05', label: 'Mariposa', hint: 'Fito Paez', songId: 'song-05' },
  { id: 'cell-06', label: 'Luna de miel', hint: 'Virus', songId: 'song-06' },
  { id: 'cell-07', label: 'Mil horas', hint: 'Los Abuelos', songId: 'song-07' },
  { id: 'cell-08', label: 'Un angel', hint: 'Patricio Rey', songId: 'song-08' },
  { id: 'cell-09', label: 'Flaca', hint: 'Calamaro', songId: 'song-09' },
  { id: 'cell-10', label: 'Irresponsable', hint: 'Babasonicos', songId: 'song-10' },
  { id: 'cell-11', label: 'Spaghetti', hint: 'Divididos', songId: 'song-11' },
  { id: 'cell-12', label: 'Sera', hint: 'Las Pelotas', songId: 'song-12' },
  { id: 'cell-free', label: 'Baraja', hint: 'Casillero libre', free: true },
  { id: 'cell-13', label: 'Yo tomo', hint: 'Bersuit', songId: 'song-13' },
  { id: 'cell-14', label: 'El final', hint: 'La Renga', songId: 'song-14' },
  { id: 'cell-15', label: 'Matador', hint: 'Cadillacs', songId: 'song-15' },
  { id: 'cell-16', label: 'Lamento', hint: 'Enanitos Verdes', songId: 'song-16' },
  { id: 'cell-17', label: 'Sin docs', hint: 'Los Rodriguez', songId: 'song-17' },
  { id: 'cell-18', label: 'Rasguna', hint: 'Sui Generis', songId: 'song-18' },
  { id: 'cell-19', label: 'Seminare', hint: 'Seru Giran', songId: 'song-19' },
  { id: 'cell-20', label: 'Crimen', hint: 'Cerati', songId: 'song-20' },
  { id: 'cell-21', label: 'Zafar', hint: 'La Vela Puerca', songId: 'song-21' },
  { id: 'cell-22', label: 'Magia veneno', hint: 'Catupecu', songId: 'song-22' },
  { id: 'cell-23', label: 'Arranca', hint: 'Attaque 77', songId: 'song-23' },
  { id: 'cell-24', label: 'Nunca quise', hint: 'Intoxicados', songId: 'song-24' },
];

export const MUSIC_BINGO_DEMO_EDITION: GameEdition = {
  id: MUSIC_BINGO_DEMO_EDITION_ID,
  productId: MUSIC_BINGO_PRODUCT_ID,
  templateId: MUSIC_BINGO_TEMPLATE_ID,
  slug: 'demo-bar',
  route: '/bingo-musical/demo-bar',
  title: 'Noche Rock Argentino',
  locale: 'es',
  status: 'demo',
  summary:
    'Un bingo musical para cantar, marcar y discutir clasicos sin convertir la noche en una clase de historia.',
  audience: 'Mesas de 2 a 6 personas',
  designedUseContexts: ['private_event', 'venue_event'],
  eventContext: {
    venueId: 'la-previa-demo',
    venueName: 'La Previa Bar',
    eventName: 'Noche Rock Argentino',
    dateLabel: 'Muestra interna Baraja',
    audience: 'Mesas de 2 a 6 personas',
    duration: '35 a 45 minutos',
  },
  content: {
    musicBingo: {
      songs: MUSIC_BINGO_DEMO_SONGS,
      board: MUSIC_BINGO_DEMO_BOARD,
      guideSteps: [
        'El anfitrion reproduce fragmentos desde la plataforma/licencia del lugar.',
        'Cada mesa marca canciones, artistas o consignas cuando reconoce el tema.',
        'Gana linea, doble linea o carton completo segun la duracion elegida.',
        'El desempate puede ser cantar un estribillo, nombrar la banda o responder una consigna.',
      ],
    },
  },
};

export const MUSIC_BINGO_DEMO_PRINTABLE_PACK: PrintablePack = {
  id: 'bingo-musical-demo-bar-printable-pack',
  editionId: MUSIC_BINGO_DEMO_EDITION_ID,
  title: 'Kit imprimible demo para bar',
  assets: [
    { id: 'demo-bar-cartons', kind: 'cards_pdf', title: 'Cartones imprimibles', status: 'planned' },
    { id: 'demo-bar-control-sheet', kind: 'control_sheet', title: 'Hoja de control para quien conduce', status: 'planned' },
    { id: 'demo-bar-rules', kind: 'rules_guide', title: 'Reglas y variantes', status: 'planned' },
    { id: 'demo-bar-song-list', kind: 'song_list', title: 'Lista sugerida de canciones', status: 'planned' },
  ],
};

export const MUSIC_BINGO_DEMO_COMPANION: DigitalCompanion = {
  id: 'bingo-musical-demo-bar-player',
  editionId: MUSIC_BINGO_DEMO_EDITION_ID,
  kind: 'qr_player',
  route: '/bingo-musical/demo-bar/jugar',
  status: 'demo',
  stateMode: 'local_only',
  qrEnabled: true,
  title: 'Carton digital demo',
};

export const MUSIC_BINGO_OFFERINGS: ProductOffering[] = [
  {
    id: 'rock-argentino-prebuilt',
    productId: MUSIC_BINGO_PRODUCT_ID,
    title: 'Bingo Rock Argentino',
    audience: 'Cumples, previas y juntadas con nostalgia',
    description:
      'Un bingo musical con clasicos reconocibles, guiado para cantar, discutir y levantar la mesa sin ponerse enciclopedico.',
    tags: ['Prearmado', 'Rock nacional', 'Pedido directo'],
    sampleItems: ['De musica ligera', 'Ji ji ji', 'Persiana americana'],
    salesMode: 'whatsapp',
    licenseScope: 'private_event',
    commercialResaleAllowed: false,
    pricingMode: 'hidden',
    analyticsOfferType: 'prebuilt_music_bingo',
    messageLines: [
      'Hola, quiero pedir el Bingo Rock Argentino de Baraja.',
      '',
      'Me interesa el prearmado con PDF imprimible y guia de dinamica.',
      'Quiero saber precio, plazo de entrega y como seguimos con el link de pago.',
    ],
  },
  {
    id: 'cumbia-retro-prebuilt',
    productId: MUSIC_BINGO_PRODUCT_ID,
    title: 'Bingo Cumbia Retro',
    audience: 'Fiestas, despedidas y sobremesas largas',
    description:
      'Cartones y dinamica para una ronda popular, rapida y facil de conducir cuando la noche pide algo mas que una playlist.',
    tags: ['Prearmado', 'Fiesta', 'Pedido directo'],
    sampleItems: ['Bombon asesino', 'No te creas tan importante', 'Aguita'],
    salesMode: 'whatsapp',
    licenseScope: 'private_event',
    commercialResaleAllowed: false,
    pricingMode: 'hidden',
    analyticsOfferType: 'prebuilt_music_bingo',
    messageLines: [
      'Hola, quiero pedir el Bingo Cumbia Retro de Baraja.',
      '',
      'Me interesa el prearmado con PDF imprimible y guia de dinamica.',
      'Quiero saber precio, plazo de entrega y como seguimos con el link de pago.',
    ],
  },
  {
    id: 'hits-2000-prebuilt',
    productId: MUSIC_BINGO_PRODUCT_ID,
    title: 'Bingo Hits 2000',
    audience: 'Grupos mixtos, eventos y nostalgia pop',
    description:
      'Un set de canciones reconocibles para equipos, premios chicos y momentos de "me habia olvidado de este tema".',
    tags: ['Prearmado', 'Pop', 'Pedido directo'],
    sampleItems: ['Toxic', 'Torero', 'La camisa negra'],
    salesMode: 'whatsapp',
    licenseScope: 'private_event',
    commercialResaleAllowed: false,
    pricingMode: 'hidden',
    analyticsOfferType: 'prebuilt_music_bingo',
    messageLines: [
      'Hola, quiero pedir el Bingo Hits 2000 de Baraja.',
      '',
      'Me interesa el prearmado con PDF imprimible y guia de dinamica.',
      'Quiero saber precio, plazo de entrega y como seguimos con el link de pago.',
    ],
  },
  {
    id: 'personalized-music-bingo',
    productId: MUSIC_BINGO_PRODUCT_ID,
    title: 'Bingo Musical Personalizado',
    audience: 'Cumples, casamientos, equipos, clases o despedidas',
    description:
      'Armamos cartones y dinamica desde tus canciones, tematica, audiencia y cantidad aproximada de personas.',
    tags: ['Personalizado', 'Propuesta manual'],
    sampleItems: ['Canciones provistas', 'Canciones sugeridas', 'Cartones a medida'],
    salesMode: 'proposal',
    licenseScope: 'private_event',
    commercialResaleAllowed: false,
    pricingMode: 'proposal',
    analyticsOfferType: 'personalized_bingo',
    messageLines: [
      'Hola, quiero armar un Bingo Musical personalizado con Baraja.',
      '',
      'Tengo canciones, una tematica o un evento y quiero recibir cartones imprimibles, lista sugerida y guia de dinamica.',
    ],
  },
  {
    id: 'bar-event-music-bingo',
    productId: MUSIC_BINGO_PRODUCT_ID,
    title: 'Bingo Musical Para Bar',
    audience: 'Bares, eventos comerciales, peñas o noches tematicas',
    description:
      'Consulta para definir alcance, licencia de uso, dinamica self-run y companion QR si aplica.',
    tags: ['Bares y eventos', 'Uso consultivo'],
    sampleItems: ['Uso comercial consultivo', 'Pack self-run', 'Sin licencia musical incluida'],
    salesMode: 'proposal',
    licenseScope: 'venue_event',
    commercialResaleAllowed: false,
    pricingMode: 'proposal',
    analyticsOfferType: 'bar_event_bingo',
    messageLines: [
      'Hola, quiero consultar por un Bingo Musical o pack imprimible para un bar/evento.',
      '',
      'Necesito entender alcance, licencia de uso, precio y como se conduce la dinamica.',
    ],
  },
  {
    id: 'demo-bar-music-bingo',
    productId: MUSIC_BINGO_PRODUCT_ID,
    editionId: MUSIC_BINGO_DEMO_EDITION_ID,
    title: 'Demo con QR para bar',
    audience: 'Muestra interna para validar el paquete de bar',
    description:
      'Kit demo con QR player local asociado a un establecimiento ficticio.',
    tags: ['Demo', 'QR', 'Mobile-first'],
    sampleItems: ['Carton digital', 'Kit imprimible', 'Guia de dinamica'],
    salesMode: 'proposal',
    licenseScope: 'venue_event',
    commercialResaleAllowed: false,
    pricingMode: 'hidden',
    analyticsOfferType: 'music_bingo_demo',
    messageLines: [
      'Hola, quiero una demo de Bingo Musical con QR para mi bar o evento.',
      '',
      'Vi la muestra de La Previa Bar y quiero entender alcance, precio y entrega.',
    ],
  },
];

export const MUSIC_BINGO_CAMPAIGN_LANDING: CampaignLanding = {
  id: MUSIC_BINGO_CAMPAIGN_ID,
  slug: 'bingo-musical',
  route: '/bingo-musical',
  productId: MUSIC_BINGO_PRODUCT_ID,
  featuredEditionIds: [MUSIC_BINGO_DEMO_EDITION_ID],
  offeringIds: MUSIC_BINGO_OFFERINGS.map((offering) => offering.id),
  purpose: 'validation',
  status: 'active',
  title: 'Bingo musical imprimible',
  summary:
    'Landing de campana para validar bingos musicales prearmados, personalizados y de bar/evento.',
};

export const MUSIC_BINGO_PRODUCT_CATALOG: BarajaProductCatalog = {
  products: [MUSIC_BINGO_PRODUCT],
  templates: [MUSIC_BINGO_TEMPLATE],
  editions: [MUSIC_BINGO_DEMO_EDITION],
  printablePacks: [MUSIC_BINGO_DEMO_PRINTABLE_PACK],
  digitalCompanions: [MUSIC_BINGO_DEMO_COMPANION],
  offerings: MUSIC_BINGO_OFFERINGS,
  campaignLandings: [MUSIC_BINGO_CAMPAIGN_LANDING],
  customProjects: [],
};

export const MUSIC_BINGO_PREBUILT_OFFERINGS = MUSIC_BINGO_OFFERINGS.filter(
  (offering) => offering.analyticsOfferType === 'prebuilt_music_bingo'
);

export const MUSIC_BINGO_CUSTOM_OFFERING = MUSIC_BINGO_OFFERINGS.find(
  (offering) => offering.id === 'personalized-music-bingo'
) as ProductOffering;

export const MUSIC_BINGO_BAR_EVENT_OFFERING = MUSIC_BINGO_OFFERINGS.find(
  (offering) => offering.id === 'bar-event-music-bingo'
) as ProductOffering;

export const MUSIC_BINGO_DEMO_OFFERING = MUSIC_BINGO_OFFERINGS.find(
  (offering) => offering.id === 'demo-bar-music-bingo'
) as ProductOffering;
