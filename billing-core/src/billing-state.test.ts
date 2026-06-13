import { describe, expect, it } from 'vitest';
import {
  mapEntityEntitlementToBillingState,
  mapEntitySubscriptionToBillingState,
  mapMercadoPagoProviderLookupToBillingState,
  resolveEntityBillingState,
} from './billing-state';
import type { EntityBillingProviderLookupDetails } from './billing-state';

const NOW = '2026-06-13T15:00:00.000Z';
const START = '2026-06-01T00:00:00.000Z';
const END = '2026-07-01T00:00:00.000Z';
const VERIFIED = '2026-06-13T14:59:00.000Z';

function mapPermanentMercadoPagoProviderLookupToBillingState(
  providerLookup: EntityBillingProviderLookupDetails,
) {
  return mapMercadoPagoProviderLookupToBillingState({
    accountKind: 'permanent',
    ...providerLookup,
  });
}

describe('Entity Billing shared state helpers', () => {
  it('returns reusable paid-state ids for every canonical billing state', () => {
    const states = [
      resolveEntityBillingState({ accountKind: 'none', now: NOW }),
      resolveEntityBillingState({ accountKind: 'permanent', now: NOW }),
      resolveEntityBillingState({
        accountKind: 'permanent',
        entitlement: { status: 'pending', subscription_id: 'sub_123' },
        now: NOW,
      }),
      resolveEntityBillingState({
        accountKind: 'permanent',
        entitlement: {
          status: 'active',
          active_from: START,
          active_until: END,
          last_verified_at: VERIFIED,
        },
        now: NOW,
      }),
      resolveEntityBillingState({
        accountKind: 'permanent',
        entitlement: { status: 'failed', subscription_id: 'sub_123' },
        now: NOW,
      }),
      resolveEntityBillingState({
        accountKind: 'permanent',
        entitlement: { status: 'cancelled', subscription_id: 'sub_123' },
        now: NOW,
      }),
    ];

    expect(states.map((state) => state.id)).toEqual([
      'guest',
      'free',
      'paid_pending',
      'paid_active',
      'paid_failed',
      'paid_cancelled',
    ]);
    expect(states[3]).toMatchObject({
      hasPaidAccess: true,
      canUsePaidQuota: true,
      canRetryCheckout: false,
      shouldWaitForProvider: false,
      requiresSupport: false,
    });
  });

  it('keeps active entitlements behind verification and a current window', () => {
    expect(
      mapEntityEntitlementToBillingState(
        {
          status: 'active',
          active_from: START,
          active_until: END,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ).id,
    ).toBe('paid_active');

    expect(
      mapEntityEntitlementToBillingState(
        {
          status: 'active',
          active_from: START,
          active_until: null,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ).id,
    ).toBe('paid_active');

    expect(
      mapEntityEntitlementToBillingState(
        {
          status: 'active',
          active_from: '2026-07-01T00:00:00.000Z',
          active_until: null,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ),
    ).toMatchObject({
      id: 'paid_pending',
      hasPaidAccess: false,
      shouldWaitForProvider: true,
      reason: 'future_window',
    });

    expect(
      mapEntityEntitlementToBillingState(
        {
          status: 'active',
          active_from: '2026-05-01T00:00:00.000Z',
          active_until: '2026-06-01T00:00:00.000Z',
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ),
    ).toMatchObject({
      id: 'paid_cancelled',
      hasPaidAccess: false,
      reason: 'inactive_window',
    });

    expect(
      mapEntityEntitlementToBillingState(
        {
          status: 'active',
          active_from: START,
          active_until: END,
          last_verified_at: null,
        },
        { accountKind: 'permanent', now: NOW },
      ),
    ).toMatchObject({
      id: 'paid_cancelled',
      hasPaidAccess: false,
      requiresSupport: true,
      reason: 'missing_verification',
    });
  });

  it('maps subscription rows conservatively before quota can trust them', () => {
    expect(
      mapEntitySubscriptionToBillingState(
        {
          normalized_status: 'active',
          current_period_start: START,
          current_period_end: END,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ).id,
    ).toBe('paid_active');

    expect(
      ['pending', 'failed', 'cancelled', 'refunded', 'expired'].map((status) =>
        mapEntitySubscriptionToBillingState(
          { normalized_status: status },
          { accountKind: 'permanent', now: NOW },
        ).id,
      ),
    ).toEqual([
      'paid_pending',
      'paid_failed',
      'paid_cancelled',
      'paid_cancelled',
      'paid_cancelled',
    ]);

    expect(
      ['disputed', 'unverified'].map((status) =>
        mapEntitySubscriptionToBillingState(
          { normalized_status: status },
          { accountKind: 'permanent', now: NOW },
        ),
      ),
    ).toEqual([
      expect.objectContaining({
        id: 'paid_cancelled',
        requiresSupport: true,
        hasPaidAccess: false,
      }),
      expect.objectContaining({
        id: 'paid_cancelled',
        requiresSupport: true,
        hasPaidAccess: false,
      }),
    ]);
  });

  it('normalizes Mercado Pago provider statuses without silently granting access', () => {
    expect(
      mapPermanentMercadoPagoProviderLookupToBillingState({
        kind: 'payment',
        status: 'approved',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: true,
      }),
    ).toMatchObject({
      id: 'paid_active',
      hasPaidAccess: true,
      source: 'provider_lookup',
    });

    expect(
      mapPermanentMercadoPagoProviderLookupToBillingState({
        kind: 'payment',
        status: 'approved',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: false,
      }),
    ).toMatchObject({
      id: 'paid_pending',
      hasPaidAccess: false,
      reason: 'missing_verification',
    });

    expect(
      mapPermanentMercadoPagoProviderLookupToBillingState({
        kind: 'payment',
        status: 'approved',
        linkedToExpectedSubscription: false,
        hasVerifiedEntitlementWindow: true,
      }),
    ).toMatchObject({
      id: 'paid_cancelled',
      hasPaidAccess: false,
      requiresSupport: true,
      reason: 'unlinked_provider_status',
    });

    expect(
      ['pending', 'in_process', 'rejected', 'refunded', 'charged_back'].map(
        (status) =>
          mapPermanentMercadoPagoProviderLookupToBillingState({
            kind: 'payment',
            status,
          }).id,
      ),
    ).toEqual([
      'paid_pending',
      'paid_pending',
      'paid_failed',
      'paid_cancelled',
      'paid_cancelled',
    ]);
  });

  it('fails closed when provider lookup lacks permanent account context', () => {
    expect(
      mapMercadoPagoProviderLookupToBillingState({
        kind: 'payment',
        status: 'approved',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: true,
      } as Parameters<typeof mapMercadoPagoProviderLookupToBillingState>[0]),
    ).toMatchObject({
      id: 'paid_cancelled',
      accountKind: 'none',
      hasPaidAccess: false,
      requiresSupport: true,
      reason: 'no_session',
    });

    expect(
      mapMercadoPagoProviderLookupToBillingState({
        accountKind: 'guest',
        kind: 'payment',
        status: 'approved',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: true,
      }),
    ).toMatchObject({
      id: 'paid_cancelled',
      accountKind: 'guest',
      hasPaidAccess: false,
      requiresSupport: true,
      reason: 'guest_account',
    });
  });

  it('keeps provider installment states in pending unless verified by the app', () => {
    expect(
      mapPermanentMercadoPagoProviderLookupToBillingState({
        kind: 'authorized_payment',
        status: 'processed',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: true,
      }).id,
    ).toBe('paid_active');

    expect(
      mapPermanentMercadoPagoProviderLookupToBillingState({
        kind: 'authorized_payment',
        status: 'processed',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: false,
      }),
    ).toMatchObject({
      id: 'paid_pending',
      hasPaidAccess: false,
      reason: 'missing_verification',
    });

    expect(
      ['waiting for gateway', 'recycling', 'scheduled'].map((status) =>
        mapPermanentMercadoPagoProviderLookupToBillingState({
          kind: 'authorized_payment',
          status,
        }).id,
      ),
    ).toEqual(['paid_pending', 'paid_pending', 'paid_pending']);
  });

  it('returns privacy-safe metadata only', () => {
    const state = mapPermanentMercadoPagoProviderLookupToBillingState({
      kind: 'payment',
      status: 'charged_back',
    });

    expect(Object.keys(state).sort()).toEqual([
      'accountKind',
      'canRetryCheckout',
      'canUsePaidQuota',
      'hasPaidAccess',
      'id',
      'labelKey',
      'reason',
      'requiresSupport',
      'shouldWaitForProvider',
      'source',
    ]);
    expect(JSON.stringify(state)).not.toMatch(
      /email|payer|payload|payment_id|access_token|secret|source_text|generated_text/i,
    );
  });
});
