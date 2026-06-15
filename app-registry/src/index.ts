export const ENTITY_BUILDERS_DEFAULT_APP_ID = 'entitybuilders';

export const ENTITY_BUILDERS_APP_IDS = [
  'entitybuilders',
  'flowtranslate',
  'postalpeek',
  'tablia',
  'zigzag',
  'minimal-money',
  'shrinkle',
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
  email: EntityBuildersAppEmailConfig;
};

export type DetectEntityBuildersAppInput = {
  redirectTo?: string | null;
  appIdHint?: string | null;
};

export const ENTITY_BUILDERS_APP_REGISTRY = {
  entitybuilders: {
    appId: 'entitybuilders',
    displayName: 'Entity Builders',
    analyticsAppId: 'entitybuilders',
    urls: {
      canonical: 'https://entitybuilders.ai',
      productionDomains: ['entitybuilders.ai', 'entitybuilders.com'],
    },
    email: {
      templateDir: 'entitybuilders',
      fromName: 'Entity Builders',
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
