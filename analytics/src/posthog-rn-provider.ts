import type { AnalyticsProvider, AnalyticsConfig } from './types';

/**
 * PostHog React Native provider.
 * Uses posthog-react-native instead of posthog-js.
 *
 * Error tracking autocapture is enabled by default:
 * - uncaughtExceptions  → global JS errors
 * - unhandledRejections → unhandled promise rejections
 * - console['error', 'warn'] → console.error / warn calls
 *
 * NOTE: When using PostHogErrorBoundary, set console: [] to avoid
 * duplicate captures (React logs caught errors to console anyway).
 *
 * Install: yarn workspace potlink-mobile add posthog-react-native
 */
export class PostHogRNProvider implements AnalyticsProvider {
  private client: any = null;

  init(config: AnalyticsConfig): void {
    if (this.client) return;
    if (!config.apiKey) {
      console.warn('[Analytics] No PostHog API key — tracking disabled.');
      return;
    }

    try {
      // Dynamic require so this file doesn't crash in web workspaces
      // that don't have posthog-react-native installed.
      const { PostHog } = require('posthog-react-native');
      this.client = new PostHog(config.apiKey, {
        host: config.apiHost || 'https://us.i.posthog.com',
        disabled: config.disabled ?? false,
        // ── Error Tracking autocapture ──────────────────────────────────────
        // Catches uncaught JS errors, unhandled promise rejections, and
        // console.error/warn calls — all sent to PostHog as $exception events.
        // When PostHogErrorBoundary is used, set console: [] to avoid duplication.
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            // Disable console capture when PostHogErrorBoundary is in use
            // to avoid duplicate reports (React re-logs boundary errors).
            console: [],
          },
        },
      });
      console.info(
        '[Analytics] PostHog RN initialized (error tracking enabled).',
      );
    } catch {
      console.warn(
        '[Analytics] posthog-react-native not installed — tracking disabled.',
      );
    }
  }

  /** Expose the raw PostHog client for PostHogProvider/PostHogErrorBoundary */
  getClient(): any {
    return this.client;
  }

  track(event: string, properties?: Record<string, unknown>): void {
    this.client?.capture(event, properties);
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    this.client?.identify(userId, traits);
  }

  setGlobalProperties(properties: Record<string, unknown>): void {
    this.client?.register(properties);
  }

  reset(): void {
    this.client?.reset();
  }

  getFeatureFlag(key: string): string | boolean | undefined {
    return this.client?.getFeatureFlag?.(key);
  }

  onFeatureFlagsLoaded(callback: () => void): void {
    this.client?.onFeatureFlags?.(callback);
  }
}
