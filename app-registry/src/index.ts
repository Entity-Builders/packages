export const ENTITY_BUILDERS_DEFAULT_APP_ID = 'entitybuilders';

export const ENTITY_BUILDERS_APP_IDS = [
  'entitybuilders',
  'baraja',
  'flowtranslate',
  'postalpeek',
  'tablia',
  'zigzag',
  'minimal-money',
  'shrinkle',
  'anecdotia',
] as const;

export type EntityBuildersAppId = (typeof ENTITY_BUILDERS_APP_IDS)[number];

export type EntityBuildersAppEmailConfig = {
  templateDir: string;
  fromName: string;
  replyTo?: string;
};

export type EntityBuildersAppAuthConfig = {
  redirectPath?: string;
};

export type EntityBuildersAppWhatsappConfig = {
  defaultMessage?: string;
  displayNumber: string;
  phoneNumberE164: string;
};

export type EntityBuildersAppContactConfig = {
  whatsapp?: EntityBuildersAppWhatsappConfig;
};

export type EntityBuildersAppDefinition = {
  appId: EntityBuildersAppId;
  displayName: string;
  analyticsAppId: string;
  urls: {
    canonical: string;
    productionDomains: readonly string[];
    localPorts?: readonly string[];
  };
  auth?: EntityBuildersAppAuthConfig;
  contact?: EntityBuildersAppContactConfig;
  email: EntityBuildersAppEmailConfig;
};

export type DetectEntityBuildersAppInput = {
  redirectTo?: string | null;
  appIdHint?: string | null;
};

const ENTITY_BUILDERS_SHARED_WHATSAPP = {
  displayNumber: '+54 9 11 2394-6828',
  phoneNumberE164: '+5491123946828',
} as const satisfies Pick<
  EntityBuildersAppWhatsappConfig,
  'displayNumber' | 'phoneNumberE164'
>;

export const ENTITY_BUILDERS_APP_REGISTRY = {
  entitybuilders: {
    appId: 'entitybuilders',
    displayName: 'Entity Builders',
    analyticsAppId: 'entitybuilders',
    urls: {
      canonical: 'https://entitybuilders.ai',
      productionDomains: ['entitybuilders.ai', 'entitybuilders.com'],
    },
    contact: {
      whatsapp: {
        ...ENTITY_BUILDERS_SHARED_WHATSAPP,
        defaultMessage: 'Hola, quiero consultar por Entity Builders.',
      },
    },
    email: {
      templateDir: 'entitybuilders',
      fromName: 'Entity Builders',
    },
  },
  baraja: {
    appId: 'baraja',
    displayName: 'Baraja',
    analyticsAppId: 'baraja',
    urls: {
      canonical: 'https://baraja.cards',
      productionDomains: ['baraja.cards'],
    },
    contact: {
      whatsapp: {
        ...ENTITY_BUILDERS_SHARED_WHATSAPP,
        defaultMessage: 'Hola, quiero consultar por Baraja.',
      },
    },
    email: {
      templateDir: 'entitybuilders',
      fromName: 'Baraja',
    },
  },
  flowtranslate: {
    appId: 'flowtranslate',
    displayName: 'FlowTranslate',
    analyticsAppId: 'flowtranslate',
    urls: {
      canonical: 'https://flowtranslate.app',
      productionDomains: ['flowtranslate.app'],
      localPorts: ['5173'],
    },
    email: {
      templateDir: 'flowtranslate',
      fromName: 'FlowTranslate',
    },
  },
  postalpeek: {
    appId: 'postalpeek',
    displayName: 'PostalPeek',
    analyticsAppId: 'postalpeek',
    urls: {
      canonical: 'https://postalpeek.app',
      productionDomains: [
        'postalpeek.app',
        'staging.postalpeek.app',
        'postalpeek.local',
      ],
      localPorts: ['5174', '3001'],
    },
    email: {
      templateDir: 'postalpeek',
      fromName: 'PostalPeek',
    },
  },
  tablia: {
    appId: 'tablia',
    displayName: 'Tablia',
    analyticsAppId: 'tablia',
    urls: {
      canonical: 'https://tablia.io',
      productionDomains: ['tablia.io', 'tablia.local'],
      localPorts: ['5175', '3002'],
    },
    auth: {
      redirectPath: '/dashboard',
    },
    email: {
      templateDir: 'tablia',
      fromName: 'Tablia',
    },
  },
  zigzag: {
    appId: 'zigzag',
    displayName: 'ZigZag',
    analyticsAppId: 'zigzag',
    urls: {
      canonical: 'https://zigzag.entitybuilders.ai',
      productionDomains: [
        'zigzag.entitybuilders.ai',
        'zigzag.entitybuilders.com',
      ],
      localPorts: ['5176'],
    },
    email: {
      templateDir: 'entitybuilders',
      fromName: 'ZigZag',
    },
  },
  'minimal-money': {
    appId: 'minimal-money',
    displayName: 'Minimal Money',
    analyticsAppId: 'minimal-money',
    urls: {
      canonical: 'https://minimalmoney.entitybuilders.ai',
      productionDomains: [
        'minimalmoney.entitybuilders.ai',
        'minimalmoney.entitybuilders.com',
      ],
      localPorts: ['5177'],
    },
    email: {
      templateDir: 'entitybuilders',
      fromName: 'Minimal Money',
    },
  },
  shrinkle: {
    appId: 'shrinkle',
    displayName: 'Shrinkle',
    analyticsAppId: 'shrinkle',
    urls: {
      canonical: 'https://shrinkle.entitybuilders.ai',
      productionDomains: [
        'shrinkle.entitybuilders.ai',
        'shrinkle.entitybuilders.com',
      ],
    },
    email: {
      templateDir: 'entitybuilders',
      fromName: 'Shrinkle',
    },
  },
  anecdotia: {
    appId: 'anecdotia',
    displayName: 'Anecdotia',
    analyticsAppId: 'anecdotia',
    urls: {
      canonical: 'https://anecdotia.entitybuilders.com',
      productionDomains: ['anecdotia.entitybuilders.com'],
      localPorts: ['5178'],
    },
    email: {
      templateDir: 'entitybuilders',
      fromName: 'Anecdotia',
    },
  },
} as const satisfies Record<EntityBuildersAppId, EntityBuildersAppDefinition>;

const ENTITY_BUILDERS_APPS = Object.values(
  ENTITY_BUILDERS_APP_REGISTRY,
) as readonly EntityBuildersAppDefinition[];

export const normalizeEntityBuildersAppId = (value: string): string =>
  value.trim().toLowerCase().replace(/[_\s]+/g, '-');

export const isEntityBuildersAppId = (
  value: string | null | undefined,
): value is EntityBuildersAppId =>
  Boolean(value && ENTITY_BUILDERS_APP_IDS.includes(value as EntityBuildersAppId));

export const getEntityBuildersApp = (
  appId: string | null | undefined,
): EntityBuildersAppDefinition | null => {
  if (!appId) return null;

  const normalized = normalizeEntityBuildersAppId(appId);
  if (!isEntityBuildersAppId(normalized)) return null;
  return ENTITY_BUILDERS_APP_REGISTRY[normalized];
};

export const getEntityBuildersAppOrFallback = (
  appId: string | null | undefined,
): EntityBuildersAppDefinition =>
  getEntityBuildersApp(appId) ||
  ENTITY_BUILDERS_APP_REGISTRY[ENTITY_BUILDERS_DEFAULT_APP_ID];

export const buildEntityBuildersAuthRedirectUrl = (
  appId: string,
  origin: string,
): string => {
  const app = getEntityBuildersAppOrFallback(appId);
  const cleanOrigin = origin.replace(/\/+$/, '');
  const redirectPath = app.auth?.redirectPath || '';

  return `${cleanOrigin}${redirectPath}`;
};

const getWhatsappDigits = (phoneNumberE164: string): string =>
  phoneNumberE164.replace(/\D/g, '');

export const buildEntityBuildersWhatsappUrl = (
  phoneNumberE164: string,
  message?: string,
): string => {
  const baseUrl = `https://wa.me/${getWhatsappDigits(phoneNumberE164)}`;
  const cleanMessage = message?.trim();

  return cleanMessage
    ? `${baseUrl}?text=${encodeURIComponent(cleanMessage)}`
    : baseUrl;
};

export const getEntityBuildersAppWhatsapp = (
  appId: string | null | undefined,
): EntityBuildersAppWhatsappConfig | null =>
  getEntityBuildersApp(appId)?.contact?.whatsapp ?? null;

export const getEntityBuildersAppWhatsappOrFallback = (
  appId: string | null | undefined,
): EntityBuildersAppWhatsappConfig =>
  getEntityBuildersAppWhatsapp(appId) ||
  ENTITY_BUILDERS_APP_REGISTRY[ENTITY_BUILDERS_DEFAULT_APP_ID].contact
    ?.whatsapp ||
  {
    ...ENTITY_BUILDERS_SHARED_WHATSAPP,
    defaultMessage: 'Hola, quiero consultar por Entity Builders.',
  };

const getHostnameAppId = (hostname: string): EntityBuildersAppId | null => {
  const cleanHostname = hostname.toLowerCase();
  let bestMatch: { appId: EntityBuildersAppId; domainLength: number } | null =
    null;

  for (const app of ENTITY_BUILDERS_APPS) {
    for (const domain of app.urls.productionDomains) {
      const cleanDomain = domain.toLowerCase();
      if (
        cleanHostname === cleanDomain ||
        cleanHostname.endsWith(`.${cleanDomain}`)
      ) {
        if (!bestMatch || cleanDomain.length > bestMatch.domainLength) {
          bestMatch = {
            appId: app.appId,
            domainLength: cleanDomain.length,
          };
        }
      }
    }
  }

  return bestMatch?.appId || null;
};

const getLocalPortAppId = (port: string): EntityBuildersAppId | null => {
  for (const app of ENTITY_BUILDERS_APPS) {
    if (app.urls.localPorts?.includes(port)) {
      return app.appId;
    }
  }

  return null;
};

export const detectEntityBuildersAppId = ({
  redirectTo,
  appIdHint,
}: DetectEntityBuildersAppInput): EntityBuildersAppId | null => {
  const hintAppId = getEntityBuildersApp(appIdHint)?.appId || null;

  if (redirectTo) {
    try {
      const url = new URL(redirectTo);
      const hostname = url.hostname.toLowerCase();
      const domainAppId = getHostnameAppId(hostname);
      if (domainAppId) return domainAppId;

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        if (hintAppId) return hintAppId;

        const portAppId = url.port ? getLocalPortAppId(url.port) : null;
        if (portAppId) return portAppId;
      }
    } catch {
      return hintAppId;
    }
  }

  return hintAppId;
};

export const detectEntityBuildersAppIdOrFallback = (
  input: DetectEntityBuildersAppInput,
): EntityBuildersAppId =>
  detectEntityBuildersAppId(input) || ENTITY_BUILDERS_DEFAULT_APP_ID;
