import posthog from 'posthog-js';
import type { AnalyticsProvider, AnalyticsConfig } from './types';

/**
 * PostHog analytics provider.
 * Wraps posthog-js with our standard AnalyticsProvider interface.
 */
export class PostHogProvider implements AnalyticsProvider {
  private initialized = false;

  init(config: AnalyticsConfig): void {
    if (this.initialized || !config.apiKey) {
      if (!config.apiKey) {
        console.warn('[Analytics] No API key provided. Tracking disabled.');
      }
      return;
    }

    posthog.init(config.apiKey, {
      api_host: config.apiHost || 'https://us.i.posthog.com',
      autocapture: config.autocapture ?? false,
      capture_pageview: false,
      capture_pageleave: false,
      persistence: 'localStorage',
      disable_session_recording: config.disableSessionRecording ?? false,
    });

    this.initialized = true;
    console.info('[Analytics] PostHog initialized.');
  }

  track(event: string, properties?: Record<string, unknown>): void {
    if (!this.initialized) return;
    posthog.capture(event, properties);
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.initialized) return;
    posthog.identify(userId, traits);
  }

  setGlobalProperties(properties: Record<string, unknown>): void {
    if (!this.initialized) return;
    posthog.register(properties);
  }

  reset(): void {
    if (!this.initialized) return;
    posthog.reset();
  }
}
