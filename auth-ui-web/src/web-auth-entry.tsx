import type {
  EntityAuthConfig,
  EntityAuthMethodDescriptor,
  OAuthSignInOptions,
} from '@eb-packages/auth';
import { getEntityAuthMethodAvailability } from '@eb-packages/auth';
import {
  EbButton,
  EbModalShell,
  EbNotice,
  EbTextField,
} from '@eb-packages/ui-web';
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
  signInWithOAuth: (
    provider: Provider,
    options?: OAuthSignInOptions,
  ) => Promise<void>;
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
      <EbNotice tone='danger'>{error}</EbNotice>
    ) : null}

    {message ? (
      <EbNotice tone='success'>{message}</EbNotice>
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
  <EbButton
    disabled={disabled}
    fullWidth
    onClick={onClick}
    variant={variant}
  >
    {children}
  </EbButton>
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
    <form onSubmit={submit} className='eb-auth-form'>
      <div className='eb-auth-section-title'>{method.label}</div>

      <EbTextField
        type='email'
        value={account.email}
        onChange={(event) => account.setEmail(event.target.value)}
        disabled={account.busy || !availability.available}
        label={copy.emailLabel || 'Email'}
        placeholder={copy.emailPlaceholder || 'you@example.com'}
      />

      {account.codeSent ? (
        <EbTextField
          inputMode='numeric'
          inputClassName='eb-auth-code-input'
          value={account.code}
          onChange={(event) => account.setCode(event.target.value)}
          disabled={account.busy || !availability.available}
          label={copy.codeLabel || 'Codigo'}
          placeholder={copy.codePlaceholder || '000000'}
        />
      ) : null}

      <EbButton
        type='submit'
        disabled={account.busy || !availability.available}
        fullWidth
        variant='primary'
      >
        {account.busy
          ? 'Revisando'
          : account.codeSent
            ? copy.verifyCodeLabel || 'Verificar codigo'
            : copy.requestCodeLabel || 'Enviar codigo'}
      </EbButton>

      {account.codeSent ? (
        <EbButton
          onClick={() => void account.requestCode()}
          disabled={account.busy || !availability.available}
          fullWidth
        >
          {copy.resendCodeLabel || 'Enviar nuevo codigo'}
        </EbButton>
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
    <div className='eb-stack'>
      {emailMethod ? (
        <EmailOtpForm config={config} account={account} method={emailMethod} />
      ) : null}

      {oauthMethods.length ? (
        <div className='eb-stack' data-gap='tight'>
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
      <div className='eb-stack'>
        {slots?.header}
        <EbNotice tone='warning'>
          {copy.unavailableLabel ||
            `Faltan variables de Supabase para acceder a ${config.appName}.`}
        </EbNotice>
      </div>
    );
  }

  if (account.authLoading) {
    return (
      <EbNotice tone='neutral'>
        Revisando cuenta...
      </EbNotice>
    );
  }

  if (account.session) {
    return (
      <div className='eb-stack' data-gap='loose'>
        {slots?.header}
        <div className='eb-stack' data-gap='tight'>
          <div className='eb-auth-kicker'>
            {account.isGuest
              ? copy.guestStateLabel || 'Modo invitado'
              : copy.permanentStateLabel || 'Cuenta conectada'}
          </div>
          <div className='eb-auth-display-name'>
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
    <div className='eb-stack'>
      {slots?.header || (
        <div>
          <h2 className='eb-auth-heading'>
            {copy.title || `Entrar a ${config.appName}`}
          </h2>
          {copy.subtitle ? (
            <p className='eb-auth-body'>{copy.subtitle}</p>
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
    <EbModalShell
      closeLabel={closeLabel}
      onClose={onClose}
      title={config.copy?.title || 'Cuenta'}
    >
      <AccountAccessPanel
        config={config}
        account={account}
        slots={panelSlots}
      />
    </EbModalShell>
  );
};
