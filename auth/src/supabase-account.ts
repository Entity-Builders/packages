import type { Provider, Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isEntityAuthMethodEnabled,
  resolveEntityAuthConfig,
  type EntityAuthConfig,
  type EntityAuthConfigInput,
  type EntityAuthMethodType,
} from './app-auth-config';

export type EntityBuildersAccountKind = 'none' | 'guest' | 'permanent';
export type GuestSignInSource = 'automatic' | 'manual';

export type GuestSignInOptions = {
  source?: GuestSignInSource;
};

export type AuthAnalyticsProperties = Record<
  string,
  string | number | boolean | null
>;

export type AuthAnalytics = {
  track: (event: string, properties?: AuthAnalyticsProperties) => void;
  captureError?: (
    error: Error | unknown,
    context?: AuthAnalyticsProperties,
  ) => void;
};

export type EmailOtpTokenPreparationInput = {
  email: string;
  token: string;
};

export type EmailOtpTokenPreparer = (
  input: EmailOtpTokenPreparationInput,
) => string | Promise<string>;

export type AuthErrorLike = {
  name?: string;
  status?: number;
  code?: string;
  message?: string;
};

export type OAuthErrorResult = {
  errorCode: string;
  errorDescription: string;
};

export type OAuthRecoveryState = {
  reason: 'identity_already_exists';
  provider: Provider;
};

export type OAuthSignInOptions = {
  forceSignIn?: boolean;
};

export type AccountAccessMessages = {
  supabaseNotConfigured: string;
  missingEmail: string;
  missingCredentials: string;
  codeSent: string;
  connected: string;
  guestReady: string;
  oauthStarted: string;
  oauthFailed: string;
  oauthLinkedIdentityError: string;
  authMethodUnavailable: string;
};

export type SupabaseAuthAccessClient = {
  auth: {
    getSession: () => Promise<{ data: { session: Session | null } }>;
    onAuthStateChange: (
      callback: (event: string, session: Session | null) => void,
    ) => {
      data: {
        subscription: {
          unsubscribe: () => void;
        };
      };
    };
    signInAnonymously: () => Promise<{
      data: { session: Session | null };
      error: AuthErrorLike | null;
    }>;
    signInWithOtp: (input: {
      email: string;
      options?: {
        emailRedirectTo?: string;
        data?: Record<string, unknown>;
      };
    }) => Promise<{ error: AuthErrorLike | null }>;
    verifyOtp: (input: {
      email: string;
      token: string;
      type: 'email';
    }) => Promise<{
      data?: { session?: Session | null };
      error: AuthErrorLike | null;
    }>;
    signInWithOAuth: (input: {
      provider: Provider;
      options?: { redirectTo?: string };
    }) => Promise<{ error: AuthErrorLike | null }>;
    linkIdentity?: (input: {
      provider: Provider;
      options?: { redirectTo?: string };
    }) => Promise<{ error: AuthErrorLike | null }>;
    signOut: () => Promise<{ error?: AuthErrorLike | null }>;
  };
};

export type SupabaseAccountAccessOptions = {
  client: SupabaseAuthAccessClient | null;
  isConfigured: boolean;
  appId?: string;
  authConfig?: EntityAuthConfig | EntityAuthConfigInput;
  analytics?: AuthAnalytics;
  messages?: Partial<AccountAccessMessages>;
  redirectTo?: string | (() => string);
  prepareEmailOtpToken?: EmailOtpTokenPreparer;
};

const OAUTH_LINKED_IDENTITY_ERROR = 'identity_already_exists';

const DEFAULT_MESSAGES: AccountAccessMessages = {
  supabaseNotConfigured: 'Supabase is not configured in this environment.',
  missingEmail: 'Enter an email to continue.',
  missingCredentials: 'Enter the email and code.',
  codeSent: 'Check your email and enter the code here.',
  connected: 'Account connected.',
  guestReady: 'Your guest trial is ready.',
  oauthStarted: 'Continue with the provider to finish signing in.',
  oauthFailed: 'Could not finish OAuth sign-in. Try again.',
  oauthLinkedIdentityError:
    'That identity is already connected to another account. You can keep using the current session or sign in with another method.',
  authMethodUnavailable: 'That sign-in method is not available for this app.',
};

export const authErrorProperties = (error: AuthErrorLike) => ({
  error_type: error.name || 'auth_error',
  error_status: typeof error.status === 'number' ? error.status : null,
  error_code: error.code || null,
});

export const isAnonymousSession = (session: Session | null) =>
  (session?.user as { is_anonymous?: boolean | null } | undefined)
    ?.is_anonymous === true;

export const getAccountKind = (
  session: Session | null,
): EntityBuildersAccountKind => {
  if (!session) return 'none';
  return isAnonymousSession(session) ? 'guest' : 'permanent';
};

export const readOAuthErrorFromUrl = (url: string): OAuthErrorResult => {
  const parsedUrl = new URL(url, 'http://localhost');
  const params = parsedUrl.searchParams;
  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
  const errorCode =
    params.get('error_code') ||
    hashParams.get('error_code') ||
    params.get('error') ||
    hashParams.get('error') ||
    '';
  const errorDescription =
    params.get('error_description') ||
    hashParams.get('error_description') ||
    '';

  return { errorCode, errorDescription };
};

const readOAuthErrorFromWindow = (): OAuthErrorResult => {
  if (typeof window === 'undefined') {
    return { errorCode: '', errorDescription: '' };
  }

  return readOAuthErrorFromUrl(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
};

const clearOAuthErrorFromWindow = () => {
  if (typeof window === 'undefined') return;
  if (!window.location.search && !window.location.hash) return;
  window.history.replaceState(
    window.history.state,
    document.title,
    window.location.pathname,
  );
};

const resolveRedirectTo = (
  redirectTo: SupabaseAccountAccessOptions['redirectTo'],
) => {
  if (typeof redirectTo === 'function') return redirectTo();
  if (redirectTo) return redirectTo;
  if (typeof window !== 'undefined') return window.location.origin;
  return undefined;
};

const buildEmailOtpOptions = ({
  redirectTo,
  appId,
}: {
  redirectTo: SupabaseAccountAccessOptions['redirectTo'];
  appId?: string;
}):
  | {
      emailRedirectTo?: string;
      data?: Record<string, unknown>;
    }
  | undefined => {
  const resolvedRedirectTo = resolveRedirectTo(redirectTo);
  const cleanAppId = appId?.trim();
  const options: {
    emailRedirectTo?: string;
    data?: Record<string, unknown>;
  } = {};

  if (resolvedRedirectTo) options.emailRedirectTo = resolvedRedirectTo;
  if (cleanAppId) options.data = { app_name: cleanAppId };

  return Object.keys(options).length > 0 ? options : undefined;
};

export const useSupabaseAccountAccess = ({
  client,
  isConfigured,
  appId,
  authConfig,
  analytics,
  messages,
  redirectTo,
  prepareEmailOtpToken,
}: SupabaseAccountAccessOptions) => {
  const resolvedAuthConfig = useMemo(
    () => (authConfig ? resolveEntityAuthConfig(authConfig) : null),
    [authConfig],
  );
  const resolvedAppId = appId || resolvedAuthConfig?.appId;
  const resolvedRedirectTo = redirectTo || resolvedAuthConfig?.redirectTo;
  const copy = useMemo(
    () => ({ ...DEFAULT_MESSAGES, ...messages }),
    [messages],
  );
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [oauthRecovery, setOauthRecovery] =
    useState<OAuthRecoveryState | null>(null);

  useEffect(() => {
    if (!client || !isConfigured) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    client.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setEmail(data.session?.user.email || '');
        setAuthLoading(false);
      })
      .catch((error: unknown) => {
        console.warn(
          '[useSupabaseAccountAccess] Failed to restore Supabase session',
          error,
        );
        if (!mounted) return;
        setSession(null);
        setEmail('');
        setAuthLoading(false);
        void client.auth.signOut().catch(() => undefined);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setEmail(nextSession?.user.email || '');
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [client, isConfigured]);

  useEffect(() => {
    if (!client || !isConfigured) return;

    const { errorCode, errorDescription } = readOAuthErrorFromWindow();
    if (!errorCode) return;

    analytics?.track('auth_oauth_returned_error', {
      provider: 'google',
      error_code: errorCode,
      has_error_description: Boolean(errorDescription),
    });

    clearOAuthErrorFromWindow();

    if (errorCode === OAUTH_LINKED_IDENTITY_ERROR) {
      setOauthRecovery({
        reason: 'identity_already_exists',
        provider: 'google',
      });
      setError(copy.oauthLinkedIdentityError);
      return;
    }

    setOauthRecovery(null);
    setError(errorDescription || copy.oauthFailed);
  }, [
    analytics,
    client,
    copy.oauthFailed,
    copy.oauthLinkedIdentityError,
    isConfigured,
  ]);

  const accountKind = getAccountKind(session);

  const guardConfigured = useCallback(
    (eventName: string, properties?: AuthAnalyticsProperties) => {
      if (client && isConfigured) return true;

      analytics?.track(eventName, {
        reason: 'supabase_not_configured',
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
        ...properties,
      });
      setError(copy.supabaseNotConfigured);
      return false;
    },
    [
      analytics,
      client,
      copy.supabaseNotConfigured,
      isConfigured,
      resolvedAppId,
      resolvedAuthConfig?.analyticsContext,
    ],
  );

  const guardAuthMethodEnabled = useCallback(
    (
      method: EntityAuthMethodType,
      provider?: Provider,
      properties?: AuthAnalyticsProperties,
    ) => {
      if (isEntityAuthMethodEnabled(resolvedAuthConfig, method, provider)) {
        return true;
      }

      analytics?.track('auth_method_blocked', {
        reason: 'method_disabled',
        method,
        provider: provider || null,
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
        ...properties,
      });
      setError(copy.authMethodUnavailable);
      return false;
    },
    [
      analytics,
      copy.authMethodUnavailable,
      resolvedAppId,
      resolvedAuthConfig,
    ],
  );

  const requestCode = useCallback(async () => {
    setError('');
    setMessage('');
    setOauthRecovery(null);

    if (!guardConfigured('auth_code_request_blocked')) return;
    if (!guardAuthMethodEnabled('email_otp')) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      analytics?.track('auth_code_request_blocked', {
        reason: 'missing_email',
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
      });
      setError(copy.missingEmail);
      return;
    }

    setBusy(true);
    analytics?.track('auth_code_request_submitted', {
      method: 'email_otp',
      app_id: resolvedAppId || null,
      ...resolvedAuthConfig?.analyticsContext,
    });
    const { error: signInError } = await client!.auth.signInWithOtp({
      email: trimmedEmail,
      options: buildEmailOtpOptions({
        redirectTo: resolvedRedirectTo,
        appId: resolvedAppId,
      }),
    });
    setBusy(false);

    if (signInError) {
      analytics?.track('auth_code_request_failed', {
        method: 'email_otp',
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
        ...authErrorProperties(signInError),
      });
      setError(signInError.message || copy.oauthFailed);
      return;
    }

    analytics?.track('auth_code_request_succeeded', {
      method: 'email_otp',
      app_id: resolvedAppId || null,
      ...resolvedAuthConfig?.analyticsContext,
    });
    setCodeSent(true);
    setCode('');
    setMessage(copy.codeSent);
  }, [
    analytics,
    client,
    copy.codeSent,
    copy.missingEmail,
    copy.oauthFailed,
    email,
    guardAuthMethodEnabled,
    guardConfigured,
    resolvedAppId,
    resolvedAuthConfig?.analyticsContext,
    resolvedRedirectTo,
  ]);

  const verifyCode = useCallback(async () => {
    setError('');
    setMessage('');
    setOauthRecovery(null);

    if (!guardConfigured('auth_code_verification_blocked')) return;
    if (!guardAuthMethodEnabled('email_otp')) return;

    const trimmedEmail = email.trim();
    const token = code.trim().replace(/\s/g, '');
    if (!trimmedEmail || !token) {
      analytics?.track('auth_code_verification_blocked', {
        reason: 'missing_credentials',
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
      });
      setError(copy.missingCredentials);
      return;
    }

    setBusy(true);
    analytics?.track('auth_code_verification_submitted', {
      method: 'email_otp',
      app_id: resolvedAppId || null,
      ...resolvedAuthConfig?.analyticsContext,
    });

    let tokenToVerify = token;
    if (prepareEmailOtpToken) {
      try {
        const preparedToken = await prepareEmailOtpToken({
          email: trimmedEmail,
          token,
        });
        tokenToVerify = preparedToken.trim().replace(/\s/g, '');

        if (!tokenToVerify) {
          throw new Error('otp_token_preparation_empty');
        }
      } catch (error) {
        setBusy(false);
        analytics?.captureError?.(error, {
          action: 'prepare_email_otp_token',
          method: 'email_otp',
          app_id: resolvedAppId || null,
          ...resolvedAuthConfig?.analyticsContext,
        });
        analytics?.track('auth_code_verification_failed', {
          method: 'email_otp',
          app_id: resolvedAppId || null,
          ...resolvedAuthConfig?.analyticsContext,
          error_type: 'otp_token_preparation_failed',
          error_code: null,
        });
        setError(copy.oauthFailed);
        return;
      }
    }

    const { data, error: verifyError } = await client!.auth.verifyOtp({
      email: trimmedEmail,
      token: tokenToVerify,
      type: 'email',
    });
    setBusy(false);

    if (verifyError) {
      analytics?.track('auth_code_verification_failed', {
        method: 'email_otp',
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
        ...authErrorProperties(verifyError),
      });
      setError(verifyError.message || copy.oauthFailed);
      return;
    }

    if (data?.session) {
      setSession(data.session);
      setEmail(data.session.user.email || trimmedEmail);
    }

    analytics?.track('auth_code_verification_succeeded', {
      method: 'email_otp',
      app_id: resolvedAppId || null,
      ...resolvedAuthConfig?.analyticsContext,
    });
    setMessage(copy.connected);
    setCode('');
    setCodeSent(false);
  }, [
    analytics,
    client,
    code,
    copy.connected,
    copy.missingCredentials,
    copy.oauthFailed,
    email,
    guardAuthMethodEnabled,
    guardConfigured,
    prepareEmailOtpToken,
    resolvedAppId,
    resolvedAuthConfig?.analyticsContext,
  ]);

  const submit = useCallback(
    async (event?: { preventDefault: () => void }) => {
      event?.preventDefault();

      if (!codeSent && !code.trim()) {
        await requestCode();
        return;
      }

      await verifyCode();
    },
    [code, codeSent, requestCode, verifyCode],
  );

  const resetCodeRequest = useCallback(() => {
    setCode('');
    setCodeSent(false);
    setMessage('');
    setError('');
    setOauthRecovery(null);
  }, []);

  const signInAsGuest = useCallback(
    async (options: GuestSignInOptions = {}) => {
      const source = options.source || 'manual';
      setError('');
      setMessage('');
      setOauthRecovery(null);

      if (!guardConfigured('auth_guest_blocked', { source })) return;
      if (!guardAuthMethodEnabled('guest', undefined, { source })) return;

      setBusy(true);
      analytics?.track('auth_guest_submitted', {
        method: 'anonymous',
        source,
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
      });

      const { data, error: signInError } =
        await client!.auth.signInAnonymously();
      setBusy(false);

      if (signInError) {
        analytics?.track('auth_guest_failed', {
          method: 'anonymous',
          source,
          app_id: resolvedAppId || null,
          ...resolvedAuthConfig?.analyticsContext,
          ...authErrorProperties(signInError),
        });
        setError(signInError.message || copy.oauthFailed);
        return;
      }

      if (data.session) {
        setSession(data.session);
        setEmail(data.session.user.email || '');
      }

      analytics?.track('auth_guest_succeeded', {
        method: 'anonymous',
        source,
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
      });
      setCode('');
      setCodeSent(false);
      setMessage(source === 'manual' ? copy.guestReady : '');
    },
    [
      analytics,
      client,
      copy.guestReady,
      copy.oauthFailed,
      guardAuthMethodEnabled,
      guardConfigured,
      resolvedAppId,
      resolvedAuthConfig?.analyticsContext,
    ],
  );

  const signInWithOAuth = useCallback(
    async (provider: Provider, options: OAuthSignInOptions = {}) => {
      setError('');
      setMessage('');
      setOauthRecovery(null);

      if (
        !guardConfigured('auth_oauth_blocked', {
          provider,
        })
      ) {
        return;
      }
      if (!guardAuthMethodEnabled('oauth', provider, { provider })) return;

      const method =
        accountKind === 'guest' && options.forceSignIn
          ? `${provider}_oauth_existing_identity`
          : accountKind === 'guest'
          ? `${provider}_oauth_from_guest`
          : `${provider}_oauth`;
      const nextRedirectTo = resolveRedirectTo(resolvedRedirectTo);

      setBusy(true);
      analytics?.track('auth_oauth_submitted', {
        provider,
        method,
        account_kind: accountKind,
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
      });

      const input = {
        provider,
        options: nextRedirectTo ? { redirectTo: nextRedirectTo } : undefined,
      };

      if (accountKind === 'guest' && options.forceSignIn) {
        const { error: signOutError } = await client!.auth.signOut();

        if (signOutError) {
          setBusy(false);
          analytics?.track('auth_oauth_failed', {
            provider,
            method,
            account_kind: accountKind,
            app_id: resolvedAppId || null,
            ...resolvedAuthConfig?.analyticsContext,
            ...authErrorProperties(signOutError),
          });
          setError(signOutError.message || copy.oauthFailed);
          return;
        }

        setSession(null);
        setEmail('');
      }

      const authResult =
        accountKind === 'guest' && !options.forceSignIn && client!.auth.linkIdentity
          ? await client!.auth.linkIdentity(input)
          : await client!.auth.signInWithOAuth(input);

      setBusy(false);

      if (authResult.error) {
        analytics?.track('auth_oauth_failed', {
          provider,
          method,
          account_kind: accountKind,
          app_id: resolvedAppId || null,
          ...resolvedAuthConfig?.analyticsContext,
          ...authErrorProperties(authResult.error),
        });
        if (authResult.error.code === OAUTH_LINKED_IDENTITY_ERROR) {
          setOauthRecovery({
            reason: 'identity_already_exists',
            provider,
          });
        }
        setError(
          authResult.error.code === OAUTH_LINKED_IDENTITY_ERROR
            ? copy.oauthLinkedIdentityError
            : authResult.error.message || copy.oauthFailed,
        );
        return;
      }

      analytics?.track('auth_oauth_started', {
        provider,
        method,
        account_kind: accountKind,
        app_id: resolvedAppId || null,
        ...resolvedAuthConfig?.analyticsContext,
      });
      setMessage(copy.oauthStarted);
    },
    [
      accountKind,
      analytics,
      client,
      copy.oauthFailed,
      copy.oauthLinkedIdentityError,
      copy.oauthStarted,
      guardAuthMethodEnabled,
      guardConfigured,
      resolvedAppId,
      resolvedAuthConfig?.analyticsContext,
      resolvedRedirectTo,
    ],
  );

  const signOut = useCallback(async () => {
    const signedOutAccountKind = accountKind;
    await client?.auth.signOut();
    analytics?.track('auth_signed_out', {
      account_kind: signedOutAccountKind,
      app_id: resolvedAppId || null,
      ...resolvedAuthConfig?.analyticsContext,
    });
    setSession(null);
    setCode('');
    setCodeSent(false);
    setMessage('');
    setError('');
    setOauthRecovery(null);
  }, [accountKind, analytics, client, resolvedAppId, resolvedAuthConfig?.analyticsContext]);

  return {
    authConfig: resolvedAuthConfig as EntityAuthConfig | null,
    authMethods: resolvedAuthConfig?.methods || [],
    session,
    accessToken: session?.access_token || '',
    userEmail: session?.user.email || '',
    displayName:
      accountKind === 'guest' ? 'Guest trial' : session?.user.email || 'Account',
    accountKind,
    isGuest: accountKind === 'guest',
    isPermanent: accountKind === 'permanent',
    authLoading,
    isSupabaseConfigured: isConfigured,
    email,
    setEmail,
    code,
    setCode,
    codeSent,
    busy,
    message,
    error,
    oauthRecovery,
    requestCode,
    verifyCode,
    submit,
    resetCodeRequest,
    signInAsGuest,
    signInWithOAuth,
    signOut,
  };
};
