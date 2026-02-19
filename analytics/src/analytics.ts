import type { AnalyticsProvider, AnalyticsConfig } from './types';

/**
 * Analytics service — shared across all Entity Builders apps.
 *
 * Usage:
 * ```ts
 * import { Analytics, PostHogProvider } from '@eb-packages/analytics';
 *
 * const analytics = new Analytics(new PostHogProvider());
 * analytics.init({ apiKey: 'phc_xxx' });
 * analytics.track('app_launched', { platform: 'mac' });
 * ```
 */
export class Analytics {
  private provider: AnalyticsProvider;

  constructor(provider: AnalyticsProvider) {
    this.provider = provider;
  }

  init(config: AnalyticsConfig): void {
    this.provider.init(config);
  }

  /**
   * Track a custom event with optional properties.
   */
  track(event: string, properties?: Record<string, unknown>): void {
    this.provider.track(event, {
      platform:
        typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      ...properties,
    });
  }

  /**
   * Identify a user (e.g., after license validation or API key setup).
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    this.provider.identify(userId, traits);
  }

  /**
   * Set persistent properties that will be sent with every event.
   */
  setGlobalProperties(properties: Record<string, unknown>): void {
    this.provider.setGlobalProperties(properties);
  }

  /**
   * Reset tracking (e.g., on logout).
   */
  reset(): void {
    this.provider.reset();
  }
}
