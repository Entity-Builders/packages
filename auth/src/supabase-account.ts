import type { Provider, Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
};

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
      options?: { emailRedirectTo?: string };
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
  analytics?: AuthAnalytics;
  messages?: Partial<AccountAccessMessages>;
  redirectTo?: string | (() => string);
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

export const useSupabaseAccountAccess = ({
  client,
  isConfigured,
  analytics,
  messages,
  redirectTo,
}: SupabaseAccountAccessOptions) => {
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

  useEffect(() => {
    if (!client || !isConfigured) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setEmail(data.session?.user.email || '');
      setAuthLoading(false);
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
      setError(copy.oauthLinkedIdentityError);
      return;
    }

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
        ...properties,
      });
      setError(copy.supabaseNotConfigured);
      return false;
    },
    [analytics, client, copy.supabaseNotConfigured, isConfigured],
  );

  const requestCode = useCallback(async () => {
    setError('');
    setMessage('');

    if (!guardConfigured('auth_code_request_blocked')) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      analytics?.track('auth_code_request_blocked', {
        reason: 'missing_email',
      });
      setError(copy.missingEmail);
      return;
    }

    setBusy(true);
    analytics?.track('auth_code_request_submitted', {
      method: 'email_otp',
    });
    const { error: signInError } = await client!.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: resolveRedirectTo(redirectTo),
      },
    });
    setBusy(false);

    if (signInError) {
      analytics?.track('auth_code_request_failed', {
        method: 'email_otp',
        ...authErrorProperties(signInError),
      });
      setError(signInError.message || copy.oauthFailed);
      return;
    }

    analytics?.track('auth_code_request_succeeded', {
      method: 'email_otp',
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
    guardConfigured,
    redirectTo,
  ]);

  const verifyCode = useCallback(async () => {
    setError('');
    setMessage('');

    if (!guardConfigured('auth_code_verification_blocked')) return;

    const token = code.trim().replace(/\s/g, '');
    if (!email.trim() || !token) {
      analytics?.track('auth_code_verification_blocked', {
        reason: 'missing_credentials',
      });
      setError(copy.missingCredentials);
      return;
    }

    setBusy(true);
    analytics?.track('auth_code_verification_submitted', {
      method: 'email_otp',
    });
    const { data, error: verifyError } = await client!.auth.verifyOtp({
      email: email.trim(),
      token,
      type: 'email',
    });
    setBusy(false);

    if (verifyError) {
      analytics?.track('auth_code_verification_failed', {
        method: 'email_otp',
        ...authErrorProperties(verifyError),
      });
      setError(verifyError.message || copy.oauthFailed);
      return;
    }

    if (data?.session) {
      setSession(data.session);
      setEmail(data.session.user.email || email.trim());
    }

    analytics?.track('auth_code_verification_succeeded', {
      method: 'email_otp',
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
    guardConfigured,
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

  const signInAsGuest = useCallback(
    async (options: GuestSignInOptions = {}) => {
      const source = options.source || 'manual';
      setError('');
      setMessage('');

      if (!guardConfigured('auth_guest_blocked', { source })) return;

      setBusy(true);
      analytics?.track('auth_guest_submitted', {
        method: 'anonymous',
        source,
      });

      const { data, error: signInError } =
        await client!.auth.signInAnonymously();
      setBusy(false);

      if (signInError) {
        analytics?.track('auth_guest_failed', {
          method: 'anonymous',
          source,
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
      });
      setCode('');
      setCodeSent(false);
      setMessage(source === 'manual' ? copy.guestReady : '');
    },
    [analytics, client, copy.guestReady, copy.oauthFailed, guardConfigured],
  );

  const signInWithOAuth = useCallback(
    async (provider: Provider) => {
      setError('');
      setMessage('');

      if (
        !guardConfigured('auth_oauth_blocked', {
          provider,
        })
      ) {
        return;
      }

      const method =
        accountKind === 'guest'
          ? `${provider}_oauth_from_guest`
          : `${provider}_oauth`;
      const nextRedirectTo = resolveRedirectTo(redirectTo);

      setBusy(true);
      analytics?.track('auth_oauth_submitted', {
        provider,
        method,
        account_kind: accountKind,
      });

      const input = {
        provider,
        options: nextRedirectTo ? { redirectTo: nextRedirectTo } : undefined,
      };
      const authResult =
        accountKind === 'guest' && client!.auth.linkIdentity
          ? await client!.auth.linkIdentity(input)
          : await client!.auth.signInWithOAuth(input);

      setBusy(false);

      if (authResult.error) {
        analytics?.track('auth_oauth_failed', {
          provider,
          method,
          account_kind: accountKind,
          ...authErrorProperties(authResult.error),
        });
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
      guardConfigured,
      redirectTo,
    ],
  );

  const signOut = useCallback(async () => {
    const signedOutAccountKind = accountKind;
    await client?.auth.signOut();
    analytics?.track('auth_signed_out', {
      account_kind: signedOutAccountKind,
    });
    setSession(null);
    setCode('');
    setCodeSent(false);
    setMessage('');
    setError('');
  }, [accountKind, analytics, client]);

  return {
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
    requestCode,
    verifyCode,
    submit,
    signInAsGuest,
    signInWithOAuth,
    signOut,
  };
};
