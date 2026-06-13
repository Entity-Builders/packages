export type EntityBillingAccountKind = 'none' | 'guest' | 'permanent';

export type EntityBillingStateId =
  | 'guest'
  | 'free'
  | 'paid_pending'
  | 'paid_active'
  | 'paid_failed'
  | 'paid_cancelled';

export type EntityBillingStateSource =
  | 'auth'
  | 'entitlement'
  | 'subscription'
  | 'provider_lookup';

export type EntityBillingLabelKey =
  | 'billing.guest'
  | 'billing.free'
  | 'billing.paid_pending'
  | 'billing.paid_active'
  | 'billing.paid_failed'
  | 'billing.paid_cancelled';

export type EntityBillingStateReason =
  | 'no_session'
  | 'guest_account'
  | 'free_account'
  | 'pending_provider'
  | 'active_verified'
  | 'payment_failed'
  | 'cancelled'
  | 'refunded'
  | 'disputed'
  | 'expired'
  | 'unverified'
  | 'missing_verification'
  | 'future_window'
  | 'inactive_window'
  | 'unknown_provider_status'
  | 'unlinked_provider_status';

export type EntityBillingState = {
  id: EntityBillingStateId;
  accountKind: EntityBillingAccountKind;
  hasPaidAccess: boolean;
  canUsePaidQuota: boolean;
  canRetryCheckout: boolean;
  shouldWaitForProvider: boolean;
  requiresSupport: boolean;
  labelKey: EntityBillingLabelKey;
  source: EntityBillingStateSource;
  reason: EntityBillingStateReason;
};

export type EntityBillingEntitlementStatus =
  | 'guest'
  | 'free'
  | 'pending'
  | 'active'
  | 'failed'
  | 'cancelled';

export type EntityBillingSubscriptionNormalizedStatus =
  | 'pending'
  | 'active'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'disputed'
  | 'expired'
  | 'unverified';

export type EntityBillingDate = string | Date;

export type EntityBillingEntitlementRow = {
  status?: EntityBillingEntitlementStatus | string | null;
  account_kind?: string | null;
  plan?: string | null;
  source?: string | null;
  subscription_id?: string | null;
  active_from?: EntityBillingDate | null;
  active_until?: EntityBillingDate | null;
  last_verified_at?: EntityBillingDate | null;
};

export type EntityBillingSubscriptionRow = {
  normalized_status?: EntityBillingSubscriptionNormalizedStatus | string | null;
  current_period_start?: EntityBillingDate | null;
  current_period_end?: EntityBillingDate | null;
  last_verified_at?: EntityBillingDate | null;
};

export type EntityBillingProviderLookupKind =
  | 'payment'
  | 'subscription'
  | 'authorized_payment';

export type EntityBillingProviderLookupDetails = {
  kind: EntityBillingProviderLookupKind;
  status?: string | null;
  accountKind?: EntityBillingAccountKind;
  linkedToExpectedSubscription?: boolean;
  hasVerifiedEntitlementWindow?: boolean;
};

export type EntityBillingProviderLookupInput = Omit<
  EntityBillingProviderLookupDetails,
  'accountKind'
> & {
  accountKind: EntityBillingAccountKind;
};

export type ResolveEntityBillingStateInput = {
  accountKind: EntityBillingAccountKind;
  entitlement?: EntityBillingEntitlementRow | null;
  subscription?: EntityBillingSubscriptionRow | null;
  providerLookup?: EntityBillingProviderLookupDetails | null;
  now?: EntityBillingDate;
};

type CreateStateOptions = {
  requiresSupport?: boolean;
};

type WindowCheck =
  | { status: 'active' }
  | { status: 'missing_verification' }
  | { status: 'future_window' }
  | { status: 'inactive_window' };

const LABEL_KEYS: Record<EntityBillingStateId, EntityBillingLabelKey> = {
  guest: 'billing.guest',
  free: 'billing.free',
  paid_pending: 'billing.paid_pending',
  paid_active: 'billing.paid_active',
  paid_failed: 'billing.paid_failed',
  paid_cancelled: 'billing.paid_cancelled',
};

const BASE_FLAGS: Record<
  EntityBillingStateId,
  Pick<
    EntityBillingState,
    | 'hasPaidAccess'
    | 'canUsePaidQuota'
    | 'canRetryCheckout'
    | 'shouldWaitForProvider'
    | 'requiresSupport'
  >
> = {
  guest: {
    hasPaidAccess: false,
    canUsePaidQuota: false,
    canRetryCheckout: false,
    shouldWaitForProvider: false,
    requiresSupport: false,
  },
  free: {
    hasPaidAccess: false,
    canUsePaidQuota: false,
    canRetryCheckout: true,
    shouldWaitForProvider: false,
    requiresSupport: false,
  },
  paid_pending: {
    hasPaidAccess: false,
    canUsePaidQuota: false,
    canRetryCheckout: true,
    shouldWaitForProvider: true,
    requiresSupport: false,
  },
  paid_active: {
    hasPaidAccess: true,
    canUsePaidQuota: true,
    canRetryCheckout: false,
    shouldWaitForProvider: false,
    requiresSupport: false,
  },
  paid_failed: {
    hasPaidAccess: false,
    canUsePaidQuota: false,
    canRetryCheckout: true,
    shouldWaitForProvider: false,
    requiresSupport: false,
  },
  paid_cancelled: {
    hasPaidAccess: false,
    canUsePaidQuota: false,
    canRetryCheckout: true,
    shouldWaitForProvider: false,
    requiresSupport: false,
  },
};

export function resolveEntityBillingState(
  input: ResolveEntityBillingStateInput,
): EntityBillingState {
  if (input.entitlement) {
    return mapEntityEntitlementToBillingState(input.entitlement, {
      accountKind: input.accountKind,
      now: input.now,
    });
  }

  if (input.subscription) {
    return mapEntitySubscriptionToBillingState(input.subscription, {
      accountKind: input.accountKind,
      now: input.now,
    });
  }

  if (input.providerLookup) {
    return mapMercadoPagoProviderLookupToBillingState({
      ...input.providerLookup,
      accountKind: input.providerLookup.accountKind ?? input.accountKind,
    });
  }

  return mapEntityAccountKindToBillingState(input.accountKind);
}

export function mapEntityAccountKindToBillingState(
  accountKind: EntityBillingAccountKind,
): EntityBillingState {
  if (accountKind === 'permanent') {
    return createState('free', accountKind, 'auth', 'free_account');
  }

  return createState(
    'guest',
    accountKind,
    'auth',
    accountKind === 'none' ? 'no_session' : 'guest_account',
  );
}

export function mapEntityEntitlementToBillingState(
  entitlement: EntityBillingEntitlementRow,
  options: {
    accountKind: EntityBillingAccountKind;
    now?: EntityBillingDate;
  },
): EntityBillingState {
  const status = normalizeStatus(entitlement.status);

  if (status === 'guest' || status === 'free') {
    return mapEntityAccountKindToBillingState(options.accountKind);
  }

  if (status === 'pending') {
    return createState(
      'paid_pending',
      options.accountKind,
      'entitlement',
      'pending_provider',
    );
  }

  if (status === 'failed') {
    return createState(
      'paid_failed',
      options.accountKind,
      'entitlement',
      'payment_failed',
    );
  }

  if (status === 'cancelled') {
    return createState(
      'paid_cancelled',
      options.accountKind,
      'entitlement',
      'cancelled',
    );
  }

  if (status === 'active') {
    if (!hasActivePaidEntitlementShape(entitlement)) {
      return createState(
        'paid_cancelled',
        options.accountKind,
        'entitlement',
        'unverified',
        { requiresSupport: true },
      );
    }

    return mapVerifiedWindowToState(
      {
        activeFrom: entitlement.active_from,
        activeUntil: entitlement.active_until,
        lastVerifiedAt: entitlement.last_verified_at,
      },
      {
        accountKind: options.accountKind,
        source: 'entitlement',
        now: options.now,
      },
    );
  }

  return createState(
    'paid_cancelled',
    options.accountKind,
    'entitlement',
    'unverified',
    { requiresSupport: true },
  );
}

function hasActivePaidEntitlementShape(
  entitlement: EntityBillingEntitlementRow,
) {
  const source = normalizeStatus(entitlement.source);

  return normalizeStatus(entitlement.account_kind) === 'pro' &&
    normalizeStatus(entitlement.plan) === 'pro' &&
    (source === 'mercado_pago' || source === 'manual');
}

export function mapEntitySubscriptionToBillingState(
  subscription: EntityBillingSubscriptionRow,
  options: {
    accountKind: EntityBillingAccountKind;
    now?: EntityBillingDate;
  },
): EntityBillingState {
  const status = normalizeStatus(subscription.normalized_status);

  if (status === 'pending') {
    return createState(
      'paid_pending',
      options.accountKind,
      'subscription',
      'pending_provider',
    );
  }

  if (status === 'failed') {
    return createState(
      'paid_failed',
      options.accountKind,
      'subscription',
      'payment_failed',
    );
  }

  if (status === 'active') {
    return mapVerifiedWindowToState(
      {
        activeFrom: subscription.current_period_start,
        activeUntil: subscription.current_period_end,
        lastVerifiedAt: subscription.last_verified_at,
      },
      {
        accountKind: options.accountKind,
        source: 'subscription',
        now: options.now,
      },
    );
  }

  if (status === 'refunded') {
    return createState(
      'paid_cancelled',
      options.accountKind,
      'subscription',
      'refunded',
    );
  }

  if (status === 'disputed') {
    return createState(
      'paid_cancelled',
      options.accountKind,
      'subscription',
      'disputed',
      { requiresSupport: true },
    );
  }

  if (status === 'expired') {
    return createState(
      'paid_cancelled',
      options.accountKind,
      'subscription',
      'expired',
    );
  }

  if (status === 'unverified') {
    return createState(
      'paid_cancelled',
      options.accountKind,
      'subscription',
      'unverified',
      { requiresSupport: true },
    );
  }

  return createState(
    'paid_cancelled',
    options.accountKind,
    'subscription',
    status === 'cancelled' ? 'cancelled' : 'unknown_provider_status',
    { requiresSupport: status !== 'cancelled' },
  );
}

export function mapMercadoPagoProviderLookupToBillingState(
  providerLookup: EntityBillingProviderLookupInput,
): EntityBillingState {
  if (!providerLookup.accountKind) {
    return createState(
      'paid_cancelled',
      'none',
      'provider_lookup',
      'no_session',
      { requiresSupport: true },
    );
  }

  const accountKind = providerLookup.accountKind;
  const status = normalizeStatus(providerLookup.status);

  if (providerLookup.kind === 'payment') {
    return mapMercadoPagoPaymentStatus(status, providerLookup, accountKind);
  }

  if (providerLookup.kind === 'subscription') {
    return mapMercadoPagoSubscriptionStatus(status, providerLookup, accountKind);
  }

  return mapMercadoPagoAuthorizedPaymentStatus(status, providerLookup, accountKind);
}

function mapMercadoPagoPaymentStatus(
  status: string,
  providerLookup: EntityBillingProviderLookupInput,
  accountKind: EntityBillingAccountKind,
): EntityBillingState {
  if (status === 'approved' || status === 'accredited') {
    return mapProviderApprovedStatus(providerLookup, accountKind);
  }

  if (status === 'pending' || status === 'in_process' || status === 'authorized') {
    return createState(
      'paid_pending',
      accountKind,
      'provider_lookup',
      'pending_provider',
    );
  }

  if (status === 'rejected') {
    return createState(
      'paid_failed',
      accountKind,
      'provider_lookup',
      'payment_failed',
    );
  }

  if (status === 'refunded') {
    return createState(
      'paid_cancelled',
      accountKind,
      'provider_lookup',
      'refunded',
    );
  }

  if (status === 'charged_back' || status === 'in_mediation') {
    return createState(
      'paid_cancelled',
      accountKind,
      'provider_lookup',
      'disputed',
      { requiresSupport: true },
    );
  }

  return createState(
    'paid_cancelled',
    accountKind,
    'provider_lookup',
    status === 'cancelled' ? 'cancelled' : 'unknown_provider_status',
    { requiresSupport: status !== 'cancelled' },
  );
}

function mapMercadoPagoSubscriptionStatus(
  status: string,
  providerLookup: EntityBillingProviderLookupInput,
  accountKind: EntityBillingAccountKind,
): EntityBillingState {
  if (status === 'active' || status === 'authorized') {
    return mapProviderApprovedStatus(providerLookup, accountKind);
  }

  if (status === 'pending') {
    return createState(
      'paid_pending',
      accountKind,
      'provider_lookup',
      'pending_provider',
    );
  }

  if (status === 'paused' || status === 'cancelled' || status === 'canceled') {
    return createState(
      'paid_cancelled',
      accountKind,
      'provider_lookup',
      'cancelled',
    );
  }

  if (status === 'expired') {
    return createState('paid_cancelled', accountKind, 'provider_lookup', 'expired');
  }

  return createState(
    'paid_cancelled',
    accountKind,
    'provider_lookup',
    'unknown_provider_status',
    { requiresSupport: true },
  );
}

function mapMercadoPagoAuthorizedPaymentStatus(
  status: string,
  providerLookup: EntityBillingProviderLookupInput,
  accountKind: EntityBillingAccountKind,
): EntityBillingState {
  if (status === 'processed' || status === 'approved') {
    return mapProviderApprovedStatus(providerLookup, accountKind);
  }

  if (
    status === 'pending' ||
    status === 'scheduled' ||
    status === 'waiting_for_gateway' ||
    status === 'recycling'
  ) {
    return createState(
      'paid_pending',
      accountKind,
      'provider_lookup',
      'pending_provider',
    );
  }

  if (status === 'rejected' || status === 'failed') {
    return createState(
      'paid_failed',
      accountKind,
      'provider_lookup',
      'payment_failed',
    );
  }

  if (status === 'refunded') {
    return createState(
      'paid_cancelled',
      accountKind,
      'provider_lookup',
      'refunded',
    );
  }

  if (status === 'charged_back') {
    return createState(
      'paid_cancelled',
      accountKind,
      'provider_lookup',
      'disputed',
      { requiresSupport: true },
    );
  }

  return createState(
    'paid_cancelled',
    accountKind,
    'provider_lookup',
    status === 'cancelled' || status === 'canceled'
      ? 'cancelled'
      : 'unknown_provider_status',
    { requiresSupport: status !== 'cancelled' && status !== 'canceled' },
  );
}

function mapProviderApprovedStatus(
  providerLookup: EntityBillingProviderLookupInput,
  accountKind: EntityBillingAccountKind,
): EntityBillingState {
  if (accountKind !== 'permanent') {
    return createState(
      'paid_cancelled',
      accountKind,
      'provider_lookup',
      accountKind === 'none' ? 'no_session' : 'guest_account',
      { requiresSupport: true },
    );
  }

  if (!providerLookup.linkedToExpectedSubscription) {
    return createState(
      'paid_cancelled',
      accountKind,
      'provider_lookup',
      'unlinked_provider_status',
      { requiresSupport: true },
    );
  }

  if (!providerLookup.hasVerifiedEntitlementWindow) {
    return createState(
      'paid_pending',
      accountKind,
      'provider_lookup',
      'missing_verification',
    );
  }

  return createState(
    'paid_active',
    accountKind,
    'provider_lookup',
    'active_verified',
  );
}

function mapVerifiedWindowToState(
  window: {
    activeFrom?: EntityBillingDate | null;
    activeUntil?: EntityBillingDate | null;
    lastVerifiedAt?: EntityBillingDate | null;
  },
  options: {
    accountKind: EntityBillingAccountKind;
    source: 'entitlement' | 'subscription';
    now?: EntityBillingDate;
  },
): EntityBillingState {
  const windowCheck = getWindowCheck(window, options.now);

  if (windowCheck.status === 'active') {
    return createState(
      'paid_active',
      options.accountKind,
      options.source,
      'active_verified',
    );
  }

  if (windowCheck.status === 'future_window') {
    return createState(
      'paid_pending',
      options.accountKind,
      options.source,
      'future_window',
    );
  }

  return createState(
    'paid_cancelled',
    options.accountKind,
    options.source,
    windowCheck.status === 'missing_verification'
      ? 'missing_verification'
      : 'inactive_window',
    { requiresSupport: windowCheck.status === 'missing_verification' },
  );
}

function getWindowCheck(
  window: {
    activeFrom?: EntityBillingDate | null;
    activeUntil?: EntityBillingDate | null;
    lastVerifiedAt?: EntityBillingDate | null;
  },
  nowInput?: EntityBillingDate,
): WindowCheck {
  if (!toTimestamp(window.lastVerifiedAt)) {
    return { status: 'missing_verification' };
  }

  const now = toTimestamp(nowInput) ?? Date.now();
  const activeFrom = toTimestamp(window.activeFrom);
  const activeUntil = toTimestamp(window.activeUntil);

  if (activeFrom && now < activeFrom) {
    return { status: 'future_window' };
  }

  if (activeUntil && now > activeUntil) {
    return { status: 'inactive_window' };
  }

  return { status: 'active' };
}

function createState(
  id: EntityBillingStateId,
  accountKind: EntityBillingAccountKind,
  source: EntityBillingStateSource,
  reason: EntityBillingStateReason,
  options: CreateStateOptions = {},
): EntityBillingState {
  const baseFlags = BASE_FLAGS[id];

  return {
    id,
    accountKind,
    hasPaidAccess: baseFlags.hasPaidAccess,
    canUsePaidQuota: baseFlags.canUsePaidQuota,
    canRetryCheckout: baseFlags.canRetryCheckout,
    shouldWaitForProvider: baseFlags.shouldWaitForProvider,
    requiresSupport: options.requiresSupport ?? baseFlags.requiresSupport,
    labelKey: LABEL_KEYS[id],
    source,
    reason,
  };
}

function normalizeStatus(status: string | null | undefined): string {
  return (status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function toTimestamp(value: EntityBillingDate | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}
