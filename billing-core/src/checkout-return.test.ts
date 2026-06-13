import { describe, expect, it } from 'vitest';
import { readEntityCheckoutReturnFromUrl } from './checkout-return';

const options = {
  returnPath: '/billing/return',
  fallbackOrigin: 'https://example.entitybuilders.com',
};

describe('Entity checkout return parser', () => {
  it('returns null outside the configured checkout return path', () => {
    expect(readEntityCheckoutReturnFromUrl('https://example.com/', options)).toBeNull();
    expect(
      readEntityCheckoutReturnFromUrl(
        'https://example.com/responder?status=approved',
        options,
      ),
    ).toBeNull();
  });

  it('maps provider return statuses safely', () => {
    const cases = [
      ['approved', 'success'],
      ['accredited', 'success'],
      ['success', 'success'],
      ['authorized', 'success'],
      ['pending', 'pending'],
      ['in_process', 'pending'],
      ['processing', 'pending'],
      ['scheduled', 'pending'],
      ['rejected', 'failed'],
      ['failed', 'failed'],
      ['failure', 'failed'],
      ['error', 'failed'],
      ['cancelled', 'cancelled'],
      ['canceled', 'cancelled'],
      ['cancel', 'cancelled'],
    ] as const;

    for (const [status, state] of cases) {
      expect(
        readEntityCheckoutReturnFromUrl(
          `https://example.com/billing/return?status=${status}`,
          options,
        ),
      ).toMatchObject({ state });
    }
  });

  it('uses fallback status params and returns only safe reference booleans', () => {
    expect(
      readEntityCheckoutReturnFromUrl(
        'https://example.com/billing/return?collection_status=rejected&payment_id=123&merchant_order_id=456&external_reference=entitybuilders:app:plan:abc',
        options,
      ),
    ).toEqual({
      state: 'failed',
      rawStatus: 'rejected',
      hasExternalReference: true,
      hasProviderReference: true,
    });
  });

  it('treats unclear checkout returns as unknown instead of success', () => {
    expect(
      readEntityCheckoutReturnFromUrl('https://example.com/billing/return', options),
    ).toMatchObject({
      state: 'unknown',
      rawStatus: null,
    });
    expect(
      readEntityCheckoutReturnFromUrl(
        'https://example.com/billing/return?status=mystery',
        options,
      ),
    ).toMatchObject({
      state: 'unknown',
      rawStatus: 'mystery',
    });
  });
});
