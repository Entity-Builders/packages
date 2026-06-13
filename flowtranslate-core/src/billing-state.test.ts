import { describe, expect, it } from 'vitest';
import {
  mapFlowtranslateEntitlementToBillingState,
  mapFlowtranslateSubscriptionToBillingState,
  mapMercadoPagoProviderLookupToBillingState,
  resolveFlowtranslateBillingState,
} from './billing-state';

const NOW = '2026-06-13T15:00:00.000Z';
const START = '2026-06-01T00:00:00.000Z';
const END = '2026-07-01T00:00:00.000Z';
const VERIFIED = '2026-06-13T14:59:00.000Z';

describe('FlowTranslate billing state helpers', () => {
  it('returns the six canonical states with safe quota/action metadata', () => {
    const states = [
      resolveFlowtranslateBillingState({ accountKind: 'none', now: NOW }),
      resolveFlowtranslateBillingState({ accountKind: 'permanent', now: NOW }),
      resolveFlowtranslateBillingState({
        accountKind: 'permanent',
        entitlement: { status: 'pending', subscription_id: 'sub_123' },
        now: NOW,
      }),
      resolveFlowtranslateBillingState({
        accountKind: 'permanent',
        entitlement: {
          status: 'active',
          active_from: START,
          active_until: END,
          last_verified_at: VERIFIED,
        },
        now: NOW,
      }),
      resolveFlowtranslateBillingState({
        accountKind: 'permanent',
        entitlement: { status: 'failed', subscription_id: 'sub_123' },
        now: NOW,
      }),
      resolveFlowtranslateBillingState({
        accountKind: 'permanent',
        entitlement: { status: 'cancelled', subscription_id: 'sub_123' },
        now: NOW,
      }),
    ];

    expect(states.map((state) => state.id)).toEqual([
      'guest',
      'free',
      'pro_pending',
      'pro_active',
      'pro_failed',
      'pro_cancelled',
    ]);
    expect(states.map((state) => state.labelKey)).toEqual([
      'billing.guest',
      'billing.free',
      'billing.pro_pending',
      'billing.pro_active',
      'billing.pro_failed',
      'billing.pro_cancelled',
    ]);
    expect(states[3]).toMatchObject({
      hasProAccess: true,
      canUseProQuota: true,
      canRetryCheckout: false,
      shouldWaitForProvider: false,
      requiresSupport: false,
    });
    expect(states[4]).toMatchObject({
      hasProAccess: false,
      canUseProQuota: false,
      canRetryCheckout: true,
    });
  });

  it('keeps entitlement active state behind verification and a current window', () => {
    expect(
      mapFlowtranslateEntitlementToBillingState(
        {
          status: 'active',
          active_from: START,
          active_until: END,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ).id,
    ).toBe('pro_active');

    expect(
      mapFlowtranslateEntitlementToBillingState(
        {
          status: 'active',
          active_from: START,
          active_until: NOW,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ).id,
    ).toBe('pro_active');

    expect(
      mapFlowtranslateEntitlementToBillingState(
        {
          status: 'active',
          active_from: START,
          active_until: null,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ).id,
    ).toBe('pro_active');

    expect(
      mapFlowtranslateEntitlementToBillingState(
        {
          status: 'active',
          active_from: '2026-07-01T00:00:00.000Z',
          active_until: null,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ),
    ).toMatchObject({
      id: 'pro_pending',
      hasProAccess: false,
      shouldWaitForProvider: true,
      reason: 'future_window',
    });

    expect(
      mapFlowtranslateEntitlementToBillingState(
        {
          status: 'active',
          active_from: '2026-05-01T00:00:00.000Z',
          active_until: '2026-06-01T00:00:00.000Z',
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ),
    ).toMatchObject({
      id: 'pro_cancelled',
      hasProAccess: false,
      reason: 'inactive_window',
    });

    expect(
      mapFlowtranslateEntitlementToBillingState(
        {
          status: 'active',
          active_from: START,
          active_until: END,
          last_verified_at: null,
        },
        { accountKind: 'permanent', now: NOW },
      ),
    ).toMatchObject({
      id: 'pro_cancelled',
      hasProAccess: false,
      requiresSupport: true,
      reason: 'missing_verification',
    });
  });

  it('maps subscription rows conservatively before quota can trust them', () => {
    expect(
      mapFlowtranslateSubscriptionToBillingState(
        {
          normalized_status: 'active',
          current_period_start: START,
          current_period_end: END,
          last_verified_at: VERIFIED,
        },
        { accountKind: 'permanent', now: NOW },
      ).id,
    ).toBe('pro_active');

    expect(
      mapFlowtranslateSubscriptionToBillingState(
        {
          normalized_status: 'active',
          current_period_start: START,
          current_period_end: END,
          last_verified_at: null,
        },
        { accountKind: 'permanent', now: NOW },
      ),
    ).toMatchObject({
      id: 'pro_cancelled',
      hasProAccess: false,
      requiresSupport: true,
    });

    expect(
      ['pending', 'failed', 'cancelled', 'refunded', 'expired'].map((status) =>
        mapFlowtranslateSubscriptionToBillingState(
          { normalized_status: status },
          { accountKind: 'permanent', now: NOW },
        ).id,
      ),
    ).toEqual([
      'pro_pending',
      'pro_failed',
      'pro_cancelled',
      'pro_cancelled',
      'pro_cancelled',
    ]);

    expect(
      ['disputed', 'unverified'].map((status) =>
        mapFlowtranslateSubscriptionToBillingState(
          { normalized_status: status },
          { accountKind: 'permanent', now: NOW },
        ),
      ),
    ).toEqual([
      expect.objectContaining({
        id: 'pro_cancelled',
        requiresSupport: true,
        hasProAccess: false,
      }),
      expect.objectContaining({
        id: 'pro_cancelled',
        requiresSupport: true,
        hasProAccess: false,
      }),
    ]);
  });

  it('collapses Mercado Pago payment lookup statuses without silently granting Pro', () => {
    expect(
      mapMercadoPagoProviderLookupToBillingState({
        kind: 'payment',
        status: 'approved',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: true,
      }),
    ).toMatchObject({
      id: 'pro_active',
      hasProAccess: true,
      source: 'provider_lookup',
    });

    expect(
      ['approved', 'accredited'].map((status) =>
        mapMercadoPagoProviderLookupToBillingState({
          kind: 'payment',
          status,
          linkedToExpectedSubscription: true,
          hasVerifiedEntitlementWindow: false,
        }),
      ),
    ).toEqual([
      expect.objectContaining({
        id: 'pro_pending',
        hasProAccess: false,
        reason: 'missing_verification',
      }),
      expect.objectContaining({
        id: 'pro_pending',
        hasProAccess: false,
        reason: 'missing_verification',
      }),
    ]);

    expect(
      mapMercadoPagoProviderLookupToBillingState({
        kind: 'payment',
        status: 'approved',
        linkedToExpectedSubscription: false,
        hasVerifiedEntitlementWindow: true,
      }),
    ).toMatchObject({
      id: 'pro_cancelled',
      hasProAccess: false,
      requiresSupport: true,
      reason: 'unlinked_provider_status',
    });

    expect(
      ['pending', 'in_process'].map((status) =>
        mapMercadoPagoProviderLookupToBillingState({ kind: 'payment', status }).id,
      ),
    ).toEqual(['pro_pending', 'pro_pending']);

    expect(
      mapMercadoPagoProviderLookupToBillingState({
        kind: 'payment',
        status: 'rejected',
      }).id,
    ).toBe('pro_failed');

    expect(
      ['cancelled', 'refunded', 'charged_back', 'in_mediation', 'mystery'].map(
        (status) =>
          mapMercadoPagoProviderLookupToBillingState({
            kind: 'payment',
            status,
          }),
      ),
    ).toEqual([
      expect.objectContaining({ id: 'pro_cancelled', hasProAccess: false }),
      expect.objectContaining({ id: 'pro_cancelled', hasProAccess: false }),
      expect.objectContaining({
        id: 'pro_cancelled',
        hasProAccess: false,
        requiresSupport: true,
      }),
      expect.objectContaining({
        id: 'pro_cancelled',
        hasProAccess: false,
        requiresSupport: true,
      }),
      expect.objectContaining({
        id: 'pro_cancelled',
        hasProAccess: false,
        requiresSupport: true,
      }),
    ]);
  });

  it('normalizes subscription and authorized-payment provider states through the shared contract', () => {
    expect(
      mapMercadoPagoProviderLookupToBillingState({
        kind: 'subscription',
        status: 'authorized',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: true,
      }).id,
    ).toBe('pro_active');

    expect(
      ['pending', 'paused', 'cancelled', 'unknown'].map((status) =>
        mapMercadoPagoProviderLookupToBillingState({
          kind: 'subscription',
          status,
        }),
      ),
    ).toEqual([
      expect.objectContaining({ id: 'pro_pending', hasProAccess: false }),
      expect.objectContaining({ id: 'pro_cancelled', hasProAccess: false }),
      expect.objectContaining({ id: 'pro_cancelled', hasProAccess: false }),
      expect.objectContaining({
        id: 'pro_cancelled',
        hasProAccess: false,
        requiresSupport: true,
      }),
    ]);

    expect(
      mapMercadoPagoProviderLookupToBillingState({
        kind: 'authorized_payment',
        status: 'processed',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: true,
      }).id,
    ).toBe('pro_active');

    expect(
      mapMercadoPagoProviderLookupToBillingState({
        kind: 'authorized_payment',
        status: 'processed',
        linkedToExpectedSubscription: true,
        hasVerifiedEntitlementWindow: false,
      }),
    ).toMatchObject({
      id: 'pro_pending',
      hasProAccess: false,
      reason: 'missing_verification',
    });

    expect(
      ['waiting for gateway', 'recycling'].map((status) =>
        mapMercadoPagoProviderLookupToBillingState({
          kind: 'authorized_payment',
          status,
        }).id,
      ),
    ).toEqual(['pro_pending', 'pro_pending']);
  });

  it('returns privacy-safe metadata only', () => {
    const state = mapMercadoPagoProviderLookupToBillingState({
      kind: 'payment',
      status: 'charged_back',
    });

    expect(Object.keys(state).sort()).toEqual([
      'accountKind',
      'canRetryCheckout',
      'canUseProQuota',
      'hasProAccess',
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
