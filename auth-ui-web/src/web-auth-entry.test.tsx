import { createEntityAuthConfig } from '@entity-builders/auth';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountAccessPanel, type WebAuthEntryAccount } from './web-auth-entry';

const createAccount = (
  overrides: Partial<WebAuthEntryAccount> = {},
): WebAuthEntryAccount => ({
  session: null,
  authLoading: false,
  isSupabaseConfigured: true,
  isGuest: false,
  isPermanent: false,
  displayName: 'Cuenta',
  email: '',
  setEmail: vi.fn(),
  code: '',
  setCode: vi.fn(),
  codeSent: false,
  busy: false,
  message: '',
  error: '',
  submit: vi.fn().mockResolvedValue(undefined),
  requestCode: vi.fn().mockResolvedValue(undefined),
  signInAsGuest: vi.fn().mockResolvedValue(undefined),
  signInWithOAuth: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const config = createEntityAuthConfig({
  appId: 'flowtranslate',
  appName: 'FlowTranslate',
  methods: [
    { type: 'email_otp' },
    { type: 'oauth', provider: 'google' },
    { type: 'oauth', provider: 'github', enabled: false },
    { type: 'guest', label: 'Probar sin cuenta' },
  ],
  copy: {
    title: 'Cuenta',
    subtitle: 'Guarda tu historial.',
  },
});

afterEach(() => {
  cleanup();
});

describe('AccountAccessPanel', () => {
  it('renders enabled no-session methods without disabled providers', () => {
    const account = createAccount();

    render(<AccountAccessPanel config={config} account={account} />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /continuar con google/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /probar sin cuenta/i }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: /github/i })).toBeNull();
  });

  it('submits configured OAuth and guest actions', () => {
    const account = createAccount();

    render(<AccountAccessPanel config={config} account={account} />);

    fireEvent.click(
      screen.getByRole('button', { name: /continuar con google/i }),
    );
    expect(account.signInWithOAuth).toHaveBeenCalledWith('google');

    fireEvent.click(screen.getByRole('button', { name: /probar sin cuenta/i }));
    expect(account.signInAsGuest).toHaveBeenCalledTimes(1);
  });

  it('renders guest state with permanent account methods and slots', () => {
    const account = createAccount({
      session: { user: { id: 'guest' } },
      isGuest: true,
      displayName: 'Invitado',
    });

    render(
      <AccountAccessPanel
        config={config}
        account={account}
        slots={{ guestContent: <div>Conserva tu historial</div> }}
      />,
    );

    expect(screen.getByText('Modo invitado')).toBeTruthy();
    expect(screen.getByText('Invitado')).toBeTruthy();
    expect(screen.getByText('Conserva tu historial')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /conectar con google/i }),
    ).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
  });

  it('lets apps replace guest sign out with a continuation action', () => {
    const continueAsGuest = vi.fn();
    const account = createAccount({
      session: { user: { id: 'guest' } },
      isGuest: true,
      displayName: 'Invitado',
    });

    render(
      <AccountAccessPanel
        config={config}
        account={account}
        slots={{
          guestContent: <div>Guarda tus mejores respuestas</div>,
          guestContinuation: (
            <button type='button' onClick={continueAsGuest}>
              Seguir como invitado
            </button>
          ),
        }}
      />,
    );

    expect(screen.getByText('Guarda tus mejores respuestas')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /seguir como invitado/i }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: /cerrar sesion/i })).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: /seguir como invitado/i }),
    );
    expect(continueAsGuest).toHaveBeenCalledTimes(1);
    expect(account.signOut).not.toHaveBeenCalled();
  });

  it('renders permanent account slots and sign out', () => {
    const account = createAccount({
      session: { user: { id: 'permanent' } },
      isPermanent: true,
      displayName: 'juan@example.com',
    });

    render(
      <AccountAccessPanel
        config={config}
        account={account}
        slots={{ permanentContent: <div>Perfil profesional</div> }}
      />,
    );

    expect(screen.getByText('juan@example.com')).toBeTruthy();
    expect(screen.getByText('Perfil profesional')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesion/i }));
    expect(account.signOut).toHaveBeenCalledTimes(1);
  });

  it('renders unavailable state when Supabase is not configured', () => {
    const account = createAccount({ isSupabaseConfigured: false });

    render(<AccountAccessPanel config={config} account={account} />);

    expect(screen.getByText(/faltan variables de supabase/i)).toBeTruthy();
    expect(screen.queryByLabelText(/email/i)).toBeNull();
  });

  it('renders busy state by disabling method controls', () => {
    const account = createAccount({ busy: true });

    render(<AccountAccessPanel config={config} account={account} />);

    expect(
      (
        screen.getByRole('button', {
          name: /continuar con google/i,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole('button', {
          name: /revisando/i,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
