import {
  mapEntityAccountKindToBillingState,
  mapEntityEntitlementToBillingState,
  mapEntitySubscriptionToBillingState,
  mapMercadoPagoProviderLookupToBillingState as mapSharedMercadoPagoProviderLookupToBillingState,
  resolveEntityBillingState,
  type EntityBillingAccountKind,
  type EntityBillingDate,
  type EntityBillingEntitlementRow,
  type EntityBillingEntitlementStatus,
  type EntityBillingProviderLookupDetails,
  type EntityBillingProviderLookupInput,
  type EntityBillingProviderLookupKind,
  type EntityBillingState,
  type EntityBillingStateReason,
  type EntityBillingStateSource,
  type EntityBillingSubscriptionNormalizedStatus,
  type EntityBillingSubscriptionRow,
  type ResolveEntityBillingStateInput,
} from '@eb-packages/billing-core';

export type FlowtranslateAccountKind = EntityBillingAccountKind;

export type FlowtranslateBillingStateId =
  | 'guest'
  | 'free'
  | 'pro_pending'
  | 'pro_active'
  | 'pro_failed'
  | 'pro_cancelled';

export type FlowtranslateBillingStateSource = EntityBillingStateSource;

export type FlowtranslateBillingLabelKey =
  | 'billing.guest'
  | 'billing.free'
  | 'billing.pro_pending'
  | 'billing.pro_active'
  | 'billing.pro_failed'
  | 'billing.pro_cancelled';

export type FlowtranslateBillingStateReason = EntityBillingStateReason;

export type FlowtranslateBillingState = {
  id: FlowtranslateBillingStateId;
  accountKind: FlowtranslateAccountKind;
  hasProAccess: boolean;
  canUseProQuota: boolean;
  canRetryCheckout: boolean;
  shouldWaitForProvider: boolean;
  requiresSupport: boolean;
  labelKey: FlowtranslateBillingLabelKey;
  source: FlowtranslateBillingStateSource;
  reason: FlowtranslateBillingStateReason;
};

export type FlowtranslateEntitlementStatus = EntityBillingEntitlementStatus;
export type FlowtranslateSubscriptionNormalizedStatus =
  EntityBillingSubscriptionNormalizedStatus;
export type FlowtranslateBillingDate = EntityBillingDate;
export type FlowtranslateEntitlementRow = EntityBillingEntitlementRow;
export type FlowtranslateSubscriptionRow = EntityBillingSubscriptionRow;
export type FlowtranslateProviderLookupKind = EntityBillingProviderLookupKind;
export type FlowtranslateProviderLookupDetails = EntityBillingProviderLookupDetails;
export type FlowtranslateProviderLookupInput = EntityBillingProviderLookupInput;
export type ResolveFlowtranslateBillingStateInput = ResolveEntityBillingStateInput;

const FLOWTRANSLATE_STATE_IDS: Record<
  EntityBillingState['id'],
  FlowtranslateBillingStateId
> = {
  guest: 'guest',
  free: 'free',
  paid_pending: 'pro_pending',
  paid_active: 'pro_active',
  paid_failed: 'pro_failed',
  paid_cancelled: 'pro_cancelled',
};

const FLOWTRANSLATE_LABEL_KEYS: Record<
  FlowtranslateBillingStateId,
  FlowtranslateBillingLabelKey
> = {
  guest: 'billing.guest',
  free: 'billing.free',
  pro_pending: 'billing.pro_pending',
  pro_active: 'billing.pro_active',
  pro_failed: 'billing.pro_failed',
  pro_cancelled: 'billing.pro_cancelled',
};

export function resolveFlowtranslateBillingState(
  input: ResolveFlowtranslateBillingStateInput,
): FlowtranslateBillingState {
  return toFlowtranslateBillingState(resolveEntityBillingState(input));
}

export function mapAccountKindToBillingState(
  accountKind: FlowtranslateAccountKind,
): FlowtranslateBillingState {
  return toFlowtranslateBillingState(mapEntityAccountKindToBillingState(accountKind));
}

export function mapFlowtranslateEntitlementToBillingState(
  entitlement: FlowtranslateEntitlementRow,
  options: {
    accountKind: FlowtranslateAccountKind;
    now?: FlowtranslateBillingDate;
  },
): FlowtranslateBillingState {
  return toFlowtranslateBillingState(
    mapEntityEntitlementToBillingState(entitlement, options),
  );
}

export function mapFlowtranslateSubscriptionToBillingState(
  subscription: FlowtranslateSubscriptionRow,
  options: {
    accountKind: FlowtranslateAccountKind;
    now?: FlowtranslateBillingDate;
  },
): FlowtranslateBillingState {
  return toFlowtranslateBillingState(
    mapEntitySubscriptionToBillingState(subscription, options),
  );
}

export function mapMercadoPagoProviderLookupToBillingState(
  providerLookup: FlowtranslateProviderLookupInput,
): FlowtranslateBillingState {
  return toFlowtranslateBillingState(
    mapSharedMercadoPagoProviderLookupToBillingState(providerLookup),
  );
}

function toFlowtranslateBillingState(
  sharedState: EntityBillingState,
): FlowtranslateBillingState {
  const id = FLOWTRANSLATE_STATE_IDS[sharedState.id];

  return {
    id,
    accountKind: sharedState.accountKind,
    hasProAccess: sharedState.hasPaidAccess,
    canUseProQuota: sharedState.canUsePaidQuota,
    canRetryCheckout: sharedState.canRetryCheckout,
    shouldWaitForProvider: sharedState.shouldWaitForProvider,
    requiresSupport: sharedState.requiresSupport,
    labelKey: FLOWTRANSLATE_LABEL_KEYS[id],
    source: sharedState.source,
    reason: sharedState.reason,
  };
}
