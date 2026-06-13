import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
