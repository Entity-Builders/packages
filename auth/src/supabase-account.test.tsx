import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEntityAuthConfig,
  findEntityAuthMethod,
  getEnabledEntityAuthMethods,
  getEntityAuthOAuthProviders,
  getEntityAuthMethodAvailability,
} from './app-auth-config';
import {
  createSupabaseAuthStorageKey,
  normalizeSupabaseAuthStorageScope,
} from './storage-key';
import {
  isAnonymousSession,
  useSupabaseAccountAccess,
  type SupabaseAuthAccessClient,
} from './supabase-account';

const guestSession = {
  access_token: 'guest-token',
  user: {
    id: 'guest-user',
    email: '',
    is_anonymous: true,
  },
};

const permanentSession = {
  access_token: 'permanent-token',
  user: {
    id: 'permanent-user',
    email: 'person@example.com',
    is_anonymous: false,
  },
};

const createClient = (
  initialSession: unknown = null,
  overrides: Partial<SupabaseAuthAccessClient['auth']> = {},
) => {
  const getSession = vi.fn().mockResolvedValue({
    data: { session: initialSession },
  });
  const onAuthStateChange = vi.fn().mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  });
  const auth = {
    getSession,
    onAuthStateChange,
    signInAnonymously: vi.fn().mockResolvedValue({
      data: { session: guestSession },
      error: null,
    }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({
      data: { session: permanentSession },
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    linkIdentity: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };

  return {
    client: { auth } as unknown as SupabaseAuthAccessClient,
    auth,
  };
};

describe('useSupabaseAccountAccess', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('resolves anonymous sessions as guest accounts', async () => {
    const { client } = createClient(guestSession);

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    expect(isAnonymousSession(result.current.session)).toBe(true);
    expect(result.current.accountKind).toBe('guest');
    expect(result.current.accessToken).toBe('guest-token');
  });

  it('recovers when persisted session restoration fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const getSession = vi.fn().mockRejectedValueOnce({
      name: 'AuthApiError',
      status: 400,
      message: 'Invalid Refresh Token: Refresh Token Not Found',
    });
    const { client, auth } = createClient(null, { getSession });

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    expect(result.current.accountKind).toBe('none');
    expect(result.current.session).toBeNull();
    expect(auth.signOut).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('requests and verifies email OTP without tracking the email or code', async () => {
    const { client, auth } = createClient();
    const track = vi.fn();

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        analytics: { track },
        redirectTo: 'http://localhost:5173',
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    act(() => result.current.setEmail('person@example.com'));
    await act(async () => {
      await result.current.requestCode();
    });

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      options: { emailRedirectTo: 'http://localhost:5173' },
    });
    expect(result.current.codeSent).toBe(true);

    act(() => result.current.setCode(' 123 456 '));
    await act(async () => {
      await result.current.verifyCode();
    });

    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      token: '123456',
      type: 'email',
    });
    expect(result.current.accountKind).toBe('permanent');

    const trackedPayloads = track.mock.calls.map(([, payload]) => payload);
    expect(JSON.stringify(trackedPayloads)).not.toContain('person@example.com');
    expect(JSON.stringify(trackedPayloads)).not.toContain('123456');
  });

  it('prepares email OTP tokens before verification without tracking sensitive values', async () => {
    const { client, auth } = createClient();
    const track = vi.fn();
    const prepareEmailOtpToken = vi
      .fn()
      .mockResolvedValue(' 654 321 ');

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        appId: 'postalpeek',
        analytics: { track },
        prepareEmailOtpToken,
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    act(() => result.current.setEmail('person@example.com'));
    act(() => result.current.setCode('123456'));

    await act(async () => {
      await result.current.verifyCode();
    });

    expect(prepareEmailOtpToken).toHaveBeenCalledWith({
      email: 'person@example.com',
      token: '123456',
    });
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      token: '654321',
      type: 'email',
    });

    const trackedPayloads = track.mock.calls.map(([, payload]) => payload);
    expect(JSON.stringify(trackedPayloads)).not.toContain('person@example.com');
    expect(JSON.stringify(trackedPayloads)).not.toContain('123456');
    expect(JSON.stringify(trackedPayloads)).not.toContain('654321');
  });

  it('does not call verifyOtp when email OTP token preparation fails', async () => {
    const { client, auth } = createClient();
    const track = vi.fn();
    const prepareEmailOtpToken = vi
      .fn()
      .mockRejectedValue(new Error('mailpit_unavailable'));

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        appId: 'postalpeek',
        analytics: { track },
        prepareEmailOtpToken,
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    act(() => result.current.setEmail('person@example.com'));
    act(() => result.current.setCode('123456'));

    await act(async () => {
      await result.current.verifyCode();
    });

    expect(auth.verifyOtp).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
    expect(track).toHaveBeenCalledWith(
      'auth_code_verification_failed',
      expect.objectContaining({
        method: 'email_otp',
        app_id: 'postalpeek',
        error_type: 'otp_token_preparation_failed',
      }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain('person@example.com');
    expect(JSON.stringify(track.mock.calls)).not.toContain('123456');
  });

  it('passes explicit app identity metadata with email OTP requests', async () => {
    const { client, auth } = createClient();

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        appId: 'flowtranslate',
        redirectTo: 'http://localhost:5173',
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    act(() => result.current.setEmail('person@example.com'));
    await act(async () => {
      await result.current.requestCode();
    });

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      options: {
        emailRedirectTo: 'http://localhost:5173',
        data: { app_name: 'flowtranslate' },
      },
    });
  });

  it('uses auth config app identity and analytics context for OTP requests', async () => {
    const { client, auth } = createClient();
    const track = vi.fn();

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        authConfig: {
          appId: 'flowtranslate',
          appName: 'FlowTranslate',
          redirectTo: 'http://localhost:5173',
          methods: [{ type: 'email_otp' }],
          analyticsContext: { surface: 'account_modal' },
        },
        analytics: { track },
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    act(() => result.current.setEmail('person@example.com'));
    await act(async () => {
      await result.current.requestCode();
    });

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      options: {
        emailRedirectTo: 'http://localhost:5173',
        data: { app_name: 'flowtranslate' },
      },
    });
    expect(track).toHaveBeenCalledWith(
      'auth_code_request_submitted',
      expect.objectContaining({
        method: 'email_otp',
        app_id: 'flowtranslate',
        surface: 'account_modal',
      }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain('person@example.com');
  });

  it('blocks auth methods that are disabled by app auth config', async () => {
    const { client, auth } = createClient();
    const track = vi.fn();

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        authConfig: {
          appId: 'flowtranslate',
          appName: 'FlowTranslate',
          methods: [
            { type: 'email_otp' },
            { type: 'oauth', provider: 'google' },
            { type: 'oauth', provider: 'github', enabled: false },
          ],
        },
        analytics: { track },
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    await act(async () => {
      await result.current.signInWithOAuth('github');
    });

    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
    expect(auth.linkIdentity).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/not available/i);
    expect(track).toHaveBeenCalledWith(
      'auth_method_blocked',
      expect.objectContaining({
        reason: 'method_disabled',
        method: 'oauth',
        provider: 'github',
        app_id: 'flowtranslate',
      }),
    );
  });

  it('uses linkIdentity for guest OAuth without signing out first', async () => {
    const { client, auth } = createClient(guestSession);

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        redirectTo: 'http://localhost:5173',
      }),
    );

    await waitFor(() => expect(result.current.accountKind).toBe('guest'));

    await act(async () => {
      await result.current.signInWithOAuth('google');
    });

    expect(auth.linkIdentity).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173' },
    });
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it('keeps guest state recoverable when guest OAuth linking fails', async () => {
    const { client, auth } = createClient(guestSession, {
      linkIdentity: vi.fn().mockResolvedValue({
        error: {
          name: 'AuthApiError',
          status: 400,
          code: 'identity_already_exists',
          message: 'Identity already linked',
        },
      }),
    });
    const track = vi.fn();

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client,
        isConfigured: true,
        analytics: { track },
      }),
    );

    await waitFor(() => expect(result.current.accountKind).toBe('guest'));

    await act(async () => {
      await result.current.signInWithOAuth('google');
    });

    expect(auth.signOut).not.toHaveBeenCalled();
    expect(result.current.accountKind).toBe('guest');
    expect(result.current.error).toMatch(/connected/i);
    expect(track).toHaveBeenCalledWith(
      'auth_oauth_failed',
      expect.objectContaining({
        provider: 'google',
        method: 'google_oauth_from_guest',
        error_code: 'identity_already_exists',
      }),
    );
  });

  it('reports unavailable Supabase configuration without throwing', async () => {
    const track = vi.fn();

    const { result } = renderHook(() =>
      useSupabaseAccountAccess({
        client: null,
        isConfigured: false,
        analytics: { track },
      }),
    );

    await waitFor(() => expect(result.current.authLoading).toBe(false));

    await act(async () => {
      await result.current.signInAsGuest();
    });

    expect(result.current.accountKind).toBe('none');
    expect(result.current.error).toMatch(/supabase/i);
    expect(track).toHaveBeenCalledWith(
      'auth_guest_blocked',
      expect.objectContaining({
        reason: 'supabase_not_configured',
      }),
    );
  });
});

describe('Entity auth app config', () => {
  it('normalizes configured auth methods into renderable descriptors', () => {
    const config = createEntityAuthConfig({
      appId: ' flowtranslate ',
      appName: ' FlowTranslate ',
      methods: [
        { type: 'email_otp' },
        { type: 'oauth', provider: 'google' },
        { type: 'oauth', provider: 'github', enabled: false },
        { type: 'guest', label: 'Probar gratis' },
      ],
    });

    expect(config.appId).toBe('flowtranslate');
    expect(config.appName).toBe('FlowTranslate');
    expect(config.methods).toEqual([
      expect.objectContaining({
        id: 'email_otp',
        type: 'email_otp',
        enabled: true,
        label: 'Codigo por email',
      }),
      expect.objectContaining({
        id: 'oauth:google',
        type: 'oauth',
        provider: 'google',
        enabled: true,
        label: 'Continuar con Google',
      }),
      expect.objectContaining({
        id: 'oauth:github',
        type: 'oauth',
        provider: 'github',
        enabled: false,
      }),
      expect.objectContaining({
        id: 'guest',
        type: 'guest',
        enabled: true,
        label: 'Probar gratis',
      }),
    ]);
    expect(getEnabledEntityAuthMethods(config).map((method) => method.id)).toEqual([
      'email_otp',
      'oauth:google',
      'guest',
    ]);
    expect(getEntityAuthOAuthProviders(config)).toEqual(['google']);
    expect(findEntityAuthMethod(config, 'oauth', 'github')).toEqual(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('reports method availability without exposing credentials', () => {
    const config = createEntityAuthConfig({
      appId: 'flowtranslate',
      appName: 'FlowTranslate',
      methods: [
        {
          type: 'oauth',
          provider: 'github',
          enabled: false,
          unavailableReason: 'provider_not_configured',
        },
      ],
    });

    expect(
      getEntityAuthMethodAvailability({
        method: config.methods[0],
        isSupabaseConfigured: true,
      }),
    ).toEqual({
      available: false,
      reason: 'provider_not_configured',
    });
    expect(
      getEntityAuthMethodAvailability({
        method: { ...config.methods[0], enabled: true },
        isSupabaseConfigured: false,
      }),
    ).toEqual({
      available: false,
      reason: 'supabase_not_configured',
    });
  });
});

describe('Supabase auth storage keys', () => {
  it('creates stable app-scoped storage keys', () => {
    expect(createSupabaseAuthStorageKey('flowtranslate')).toBe(
      'eb:flowtranslate:supabase-auth',
    );
    expect(createSupabaseAuthStorageKey('Minimal Money')).toBe(
      'eb:minimal-money:supabase-auth',
    );
  });

  it('normalizes unsafe app ids and falls back to the platform scope', () => {
    expect(normalizeSupabaseAuthStorageScope('  FlowTranslate.app  ')).toBe(
      'flowtranslate-app',
    );
    expect(createSupabaseAuthStorageKey('')).toBe(
      'eb:entity-builders:supabase-auth',
    );
    expect(createSupabaseAuthStorageKey(null)).toBe(
      'eb:entity-builders:supabase-auth',
    );
  });
});
