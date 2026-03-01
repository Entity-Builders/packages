import type { AnalyticsProvider, AnalyticsConfig } from './types';

/**
 * PostHog React Native provider.
 * Uses posthog-react-native instead of posthog-js.
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
      });
      console.info('[Analytics] PostHog RN initialized.');
    } catch {
      console.warn('[Analytics] posthog-react-native not installed — tracking disabled.');
    }
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
}
