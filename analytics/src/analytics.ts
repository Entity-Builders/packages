import type { AnalyticsProvider, AnalyticsConfig } from './types';

/**
 * Analytics service — shared across all Entity Builders apps.
 *
 * Usage (React Native):
 * ```ts
 * import { Analytics, PostHogRNProvider } from '@eb-packages/analytics';
 *
 * const analytics = new Analytics(new PostHogRNProvider());
 * analytics.init({ apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY! });
 * analytics.captureError(new Error('Something failed'), { screen: 'AuthScreen' });
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
   * Capture an error with optional context (screen, action, etc.).
   */
  captureError(error: Error | unknown, context?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[Analytics] Error captured:', err.message, context);
    this.provider.track('app_error', {
      error_message: err.message,
      error_name: err.name,
      error_stack: err.stack,
      ...context,
    });
  }

  /**
   * Capture a network request failure with URL, status and message.
   */
  captureNetworkError(
    url: string,
    status: number | string,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    console.error(`[Analytics] Network error: ${status} ${url} — ${message}`);
    this.provider.track('network_error', {
      url,
      status,
      message,
      ...context,
    });
  }

  /**
   * Identify a user (e.g., after login).
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    this.provider.identify(userId, traits);
  }

  /**
   * Set persistent properties sent with every event.
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
