import { createEntityAuthConfig } from '@eb-packages/auth';
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
    { type: 'guest', label: 'Iniciar prueba gratis' },
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
      screen.getByRole('button', { name: /iniciar prueba gratis/i }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /github/i }),
    ).toBeNull();
  });

  it('submits configured OAuth and guest actions', () => {
    const account = createAccount();

    render(<AccountAccessPanel config={config} account={account} />);

    fireEvent.click(screen.getByRole('button', { name: /continuar con google/i }));
    expect(account.signInWithOAuth).toHaveBeenCalledWith('google');

    fireEvent.click(screen.getByRole('button', { name: /iniciar prueba gratis/i }));
    expect(account.signInAsGuest).toHaveBeenCalledTimes(1);
  });

  it('renders guest state with permanent account methods and slots', () => {
    const account = createAccount({
      session: { user: { id: 'guest' } },
      isGuest: true,
      displayName: 'Prueba gratis',
    });

    render(
      <AccountAccessPanel
        config={config}
        account={account}
        slots={{ guestContent: <div>Conserva tu historial</div> }}
      />,
    );

    expect(screen.getAllByText('Prueba gratis')).toHaveLength(2);
    expect(screen.getByText('Conserva tu historial')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /conectar con google/i }),
    ).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
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
      (screen.getByRole('button', {
        name: /continuar con google/i,
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole('button', {
        name: /revisando/i,
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
