import type { Provider } from '@supabase/supabase-js';

export type EntityAuthMethodType = 'email_otp' | 'guest' | 'oauth';

export type EntityAuthMethodInput =
  | {
      type: 'email_otp';
      enabled?: boolean;
      label?: string;
      unavailableReason?: string;
    }
  | {
      type: 'guest';
      enabled?: boolean;
      label?: string;
      unavailableReason?: string;
    }
  | {
      type: 'oauth';
      provider: Provider;
      enabled?: boolean;
      label?: string;
      unavailableReason?: string;
    };

export type EntityAuthCopy = {
  title?: string;
  subtitle?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  codeLabel?: string;
  codePlaceholder?: string;
  requestCodeLabel?: string;
  verifyCodeLabel?: string;
  resendCodeLabel?: string;
  guestLabel?: string;
  signOutLabel?: string;
  signedInLabel?: string;
  guestStateLabel?: string;
  permanentStateLabel?: string;
  unavailableLabel?: string;
};

export type EntityAuthAnalyticsContext = Record<
  string,
  string | number | boolean | null
>;

export type EntityAuthConfigInput = {
  appId: string;
  appName: string;
  methods: EntityAuthMethodInput[];
  redirectTo?: string | (() => string);
  copy?: EntityAuthCopy;
  analyticsContext?: EntityAuthAnalyticsContext;
};

export type EntityAuthMethodDescriptor = {
  id: string;
  type: EntityAuthMethodType;
  enabled: boolean;
  label: string;
  provider?: Provider;
  unavailableReason?: string;
};

export type EntityAuthConfig = Omit<EntityAuthConfigInput, 'methods'> & {
  methods: EntityAuthMethodDescriptor[];
};

export type EntityAuthMethodAvailability = {
  available: boolean;
  reason: string | null;
};

const DEFAULT_EMAIL_LABEL = 'Codigo por email';
const DEFAULT_GUEST_LABEL = 'Seguir sin cuenta';

const providerLabels: Record<string, string> = {
  apple: 'Continuar con Apple',
  azure: 'Continuar con Microsoft',
  bitbucket: 'Continuar con Bitbucket',
  discord: 'Continuar con Discord',
  facebook: 'Continuar con Facebook',
  figma: 'Continuar con Figma',
  github: 'Continuar con GitHub',
  gitlab: 'Continuar con GitLab',
  google: 'Continuar con Google',
  kakao: 'Continuar con Kakao',
  keycloak: 'Continuar con Keycloak',
  linkedin: 'Continuar con LinkedIn',
  notion: 'Continuar con Notion',
  slack: 'Continuar con Slack',
  spotify: 'Continuar con Spotify',
  twitch: 'Continuar con Twitch',
  twitter: 'Continuar con X',
  workos: 'Continuar con WorkOS',
  zoom: 'Continuar con Zoom',
};

export const getEntityAuthProviderLabel = (provider: Provider): string =>
  providerLabels[provider] ||
  `Continuar con ${provider.charAt(0).toUpperCase()}${provider.slice(1)}`;

export const createEntityAuthMethodId = (
  method: Pick<EntityAuthMethodInput, 'type'> & { provider?: Provider },
) => (method.type === 'oauth' ? `oauth:${method.provider}` : method.type);

export const normalizeEntityAuthMethod = (
  method: EntityAuthMethodInput,
): EntityAuthMethodDescriptor => {
  if (method.type === 'oauth') {
    return {
      id: createEntityAuthMethodId(method),
      type: method.type,
      provider: method.provider,
      enabled: method.enabled !== false,
      label: method.label || getEntityAuthProviderLabel(method.provider),
      unavailableReason: method.unavailableReason,
    };
  }

  return {
    id: createEntityAuthMethodId(method),
    type: method.type,
    enabled: method.enabled !== false,
    label:
      method.label ||
      (method.type === 'email_otp' ? DEFAULT_EMAIL_LABEL : DEFAULT_GUEST_LABEL),
    unavailableReason: method.unavailableReason,
  };
};

export const createEntityAuthConfig = (
  input: EntityAuthConfigInput,
): EntityAuthConfig => ({
  ...input,
  appId: input.appId.trim(),
  appName: input.appName.trim(),
  methods: input.methods.map(normalizeEntityAuthMethod),
});

export const resolveEntityAuthConfig = (
  config: EntityAuthConfig | EntityAuthConfigInput,
): EntityAuthConfig =>
  config.methods.some((method) => 'id' in method)
    ? (config as EntityAuthConfig)
    : createEntityAuthConfig(config as EntityAuthConfigInput);

export const getEnabledEntityAuthMethods = (
  config: EntityAuthConfig | EntityAuthConfigInput,
) => {
  const normalized = resolveEntityAuthConfig(config);
  return normalized.methods.filter((method) => method.enabled);
};

export const getEntityAuthOAuthProviders = (
  config: EntityAuthConfig | EntityAuthConfigInput,
): Provider[] =>
  resolveEntityAuthConfig(config).methods
    .filter(
      (
        method,
      ): method is EntityAuthMethodDescriptor & {
        type: 'oauth';
        provider: Provider;
      } => method.type === 'oauth' && method.enabled && Boolean(method.provider),
    )
    .map((method) => method.provider);

export const findEntityAuthMethod = (
  config: EntityAuthConfig | EntityAuthConfigInput,
  type: EntityAuthMethodType,
  provider?: Provider,
) => {
  const normalized = resolveEntityAuthConfig(config);
  return normalized.methods.find((method) => {
    if (method.type !== type) return false;
    if (type !== 'oauth') return true;
    return method.provider === provider;
  });
};

export const isEntityAuthMethodEnabled = (
  config: EntityAuthConfig | EntityAuthConfigInput | null | undefined,
  type: EntityAuthMethodType,
  provider?: Provider,
) => {
  if (!config) return true;
  return findEntityAuthMethod(config, type, provider)?.enabled === true;
};

export const getEntityAuthMethodAvailability = ({
  method,
  isSupabaseConfigured,
}: {
  method: EntityAuthMethodDescriptor;
  isSupabaseConfigured: boolean;
}): EntityAuthMethodAvailability => {
  if (!method.enabled) {
    return {
      available: false,
      reason: method.unavailableReason || 'method_disabled',
    };
  }

  if (!isSupabaseConfigured) {
    return {
      available: false,
      reason: 'supabase_not_configured',
    };
  }

  return { available: true, reason: null };
};
