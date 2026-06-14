import type {
  EntityAuthConfig,
  EntityAuthMethodDescriptor,
} from '@eb-packages/auth';
import { getEntityAuthMethodAvailability } from '@eb-packages/auth';
import type { Provider } from '@supabase/supabase-js';
import type { FormEvent, ReactNode } from 'react';

export type WebAuthEntryAccount = {
  session: unknown | null;
  authLoading: boolean;
  isSupabaseConfigured: boolean;
  isGuest: boolean;
  isPermanent: boolean;
  displayName: string;
  email: string;
  setEmail: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  codeSent: boolean;
  busy: boolean;
  message: string;
  error: string;
  submit: (event?: { preventDefault: () => void }) => Promise<void>;
  requestCode: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
};

export type WebAuthEntrySlots = {
  header?: ReactNode;
  noSessionContent?: ReactNode;
  accountSummary?: ReactNode;
  accountDetails?: ReactNode;
  guestContent?: ReactNode;
  permanentContent?: ReactNode;
  footer?: ReactNode;
};

export type AccountAccessPanelProps = {
  config: EntityAuthConfig;
  account: WebAuthEntryAccount;
  slots?: WebAuthEntrySlots;
};

export type AccountAccessModalProps = AccountAccessPanelProps & {
  onClose: () => void;
  closeLabel?: string;
};

const getMethods = (config: EntityAuthConfig, type: EntityAuthMethodDescriptor['type']) =>
  config.methods.filter((method) => method.type === type && method.enabled);

const getEmailMethod = (config: EntityAuthConfig) =>
  getMethods(config, 'email_otp')[0] || null;

const getGuestMethod = (config: EntityAuthConfig) =>
  getMethods(config, 'guest')[0] || null;

const getOAuthMethods = (config: EntityAuthConfig) =>
  getMethods(config, 'oauth').filter((method) => method.provider);

const getOAuthLabel = (
  method: EntityAuthMethodDescriptor,
  account: WebAuthEntryAccount,
) => {
  if (!account.isGuest) return method.label;
  return method.label.replace(/^Continuar con /i, 'Conectar con ');
};

export const AuthFeedback = ({
  error,
  message,
}: {
  error: string;
  message: string;
}) => (
  <>
    {error ? (
      <div className='rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700'>
        {error}
      </div>
    ) : null}

    {message ? (
      <div className='rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'>
        {message}
      </div>
    ) : null}
  </>
);

export const AuthMethodButton = ({
  children,
  disabled,
  onClick,
  variant = 'secondary',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    className={
      variant === 'primary'
        ? 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-300'
        : 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:text-slate-300'
    }
  >
    {children}
  </button>
);

export const EmailOtpForm = ({
  config,
  account,
  method,
}: {
  config: EntityAuthConfig;
  account: WebAuthEntryAccount;
  method: EntityAuthMethodDescriptor;
}) => {
  const copy = config.copy || {};
  const availability = getEntityAuthMethodAvailability({
    method,
    isSupabaseConfigured: account.isSupabaseConfigured,
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void account.submit(event);
  };

  return (
    <form onSubmit={submit} className='space-y-4 border-t border-slate-200 pt-4'>
      <div className='text-sm font-black text-slate-900'>{method.label}</div>

      <label className='block'>
        <span className='mb-2 block text-sm font-bold text-slate-700'>
          {copy.emailLabel || 'Email'}
        </span>
        <input
          type='email'
          value={account.email}
          onChange={(event) => account.setEmail(event.target.value)}
          disabled={account.busy || !availability.available}
          className='h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-slate-500 disabled:bg-slate-50'
          placeholder={copy.emailPlaceholder || 'you@example.com'}
        />
      </label>

      {account.codeSent ? (
        <label className='block'>
          <span className='mb-2 block text-sm font-bold text-slate-700'>
            {copy.codeLabel || 'Codigo'}
          </span>
          <input
            inputMode='numeric'
            value={account.code}
            onChange={(event) => account.setCode(event.target.value)}
            disabled={account.busy || !availability.available}
            className='h-11 w-full rounded-md border border-slate-200 px-3 text-lg font-bold tracking-normal outline-none focus:border-slate-500 disabled:bg-slate-50'
            placeholder={copy.codePlaceholder || '000000'}
          />
        </label>
      ) : null}

      <button
        type='submit'
        disabled={account.busy || !availability.available}
        className='h-11 w-full rounded-md bg-slate-950 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-300'
      >
        {account.busy
          ? 'Revisando'
          : account.codeSent
            ? copy.verifyCodeLabel || 'Verificar codigo'
            : copy.requestCodeLabel || 'Enviar codigo'}
      </button>

      {account.codeSent ? (
        <button
          type='button'
          onClick={() => void account.requestCode()}
          disabled={account.busy || !availability.available}
          className='h-11 w-full rounded-md border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:text-slate-300'
        >
          {copy.resendCodeLabel || 'Enviar nuevo codigo'}
        </button>
      ) : null}
    </form>
  );
};

export const OAuthProviderButton = ({
  account,
  method,
}: {
  account: WebAuthEntryAccount;
  method: EntityAuthMethodDescriptor;
}) => {
  if (!method.provider) return null;

  return (
    <AuthMethodButton
      disabled={account.busy}
      onClick={() => void account.signInWithOAuth(method.provider as Provider)}
      variant={account.session ? 'secondary' : 'primary'}
    >
      {getOAuthLabel(method, account)}
    </AuthMethodButton>
  );
};

const renderPermanentMethods = (
  config: EntityAuthConfig,
  account: WebAuthEntryAccount,
) => {
  const emailMethod = getEmailMethod(config);
  const oauthMethods = getOAuthMethods(config);

  return (
    <div className='space-y-4'>
      {emailMethod ? (
        <EmailOtpForm config={config} account={account} method={emailMethod} />
      ) : null}

      {oauthMethods.length ? (
        <div className='space-y-2'>
          {oauthMethods.map((method) => (
            <OAuthProviderButton
              key={method.id}
              account={account}
              method={method}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const AccountAccessPanel = ({
  config,
  account,
  slots,
}: AccountAccessPanelProps) => {
  const copy = config.copy || {};
  const guestMethod = getGuestMethod(config);

  if (!account.isSupabaseConfigured) {
    return (
      <div className='space-y-4'>
        {slots?.header}
        <div className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'>
          {copy.unavailableLabel ||
            `Faltan variables de Supabase para acceder a ${config.appName}.`}
        </div>
      </div>
    );
  }

  if (account.authLoading) {
    return (
      <div className='rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600'>
        Revisando cuenta...
      </div>
    );
  }

  if (account.session) {
    return (
      <div className='space-y-5'>
        {slots?.header}
        <div className='space-y-1'>
          <div className='text-xs font-bold uppercase text-slate-400'>
            {account.isGuest
              ? copy.guestStateLabel || 'Modo invitado'
              : copy.permanentStateLabel || 'Cuenta conectada'}
          </div>
          <div className='truncate text-base font-bold text-slate-950'>
            {account.displayName}
          </div>
        </div>

        {slots?.accountSummary}
        {slots?.accountDetails}
        {account.isGuest ? slots?.guestContent : slots?.permanentContent}

        <AuthFeedback error={account.error} message={account.message} />

        {account.isGuest ? renderPermanentMethods(config, account) : null}

        <AuthMethodButton
          disabled={account.busy}
          onClick={() => void account.signOut()}
        >
          {copy.signOutLabel || 'Cerrar sesion'}
        </AuthMethodButton>

        {slots?.footer}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {slots?.header || (
        <div className='space-y-1'>
          <h2 className='text-lg font-bold text-slate-950'>
            {copy.title || `Entrar a ${config.appName}`}
          </h2>
          {copy.subtitle ? (
            <p className='text-sm leading-5 text-slate-500'>{copy.subtitle}</p>
          ) : null}
        </div>
      )}

      {slots?.noSessionContent}
      {renderPermanentMethods(config, account)}

      {guestMethod ? (
        <AuthMethodButton
          disabled={account.busy}
          onClick={() => void account.signInAsGuest()}
        >
          {guestMethod.label || copy.guestLabel || 'Seguir sin cuenta'}
        </AuthMethodButton>
      ) : null}

      <AuthFeedback error={account.error} message={account.message} />
      {slots?.footer}
    </div>
  );
};

export const AccountAccessModal = ({
  config,
  account,
  slots,
  onClose,
  closeLabel = 'Cerrar',
}: AccountAccessModalProps) => {
  const panelSlots = { ...slots, header: slots?.header ?? <></> };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'>
      <div className='max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-md bg-white p-5 shadow-xl'>
        <div className='mb-5 flex items-center justify-between gap-4'>
          <h2 className='text-lg font-bold'>{config.copy?.title || 'Cuenta'}</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            title={closeLabel}
            aria-label={closeLabel}
          >
            x
          </button>
        </div>

        <AccountAccessPanel
          config={config}
          account={account}
          slots={panelSlots}
        />
      </div>
    </div>
  );
};
