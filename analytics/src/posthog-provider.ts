import posthog from 'posthog-js';
import type { AnalyticsProvider, AnalyticsConfig } from './types';

/**
 * PostHog analytics provider.
 * Wraps posthog-js with our standard AnalyticsProvider interface.
 */
export class PostHogProvider implements AnalyticsProvider {
  private initialized = false;
  private disabled = false;

  init(config: AnalyticsConfig): void {
    if (config.disabled) {
      this.disabled = true;
      console.info('[Analytics] PostHog disabled by config.');
      return;
    }

    if (this.initialized || !config.apiKey) {
      if (!config.apiKey) {
        console.warn('[Analytics] No API key provided. Tracking disabled.');
      }
      return;
    }

    this.disabled = false;
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
    if (!this.initialized || this.disabled) return;
    posthog.capture(event, properties);
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.initialized || this.disabled) return;
    posthog.identify(userId, traits);
  }

  setGlobalProperties(properties: Record<string, unknown>): void {
    if (!this.initialized || this.disabled) return;
    posthog.register(properties);
  }

  reset(): void {
    if (!this.initialized || this.disabled) return;
    posthog.reset();
  }

  getFeatureFlag(key: string): string | boolean | undefined {
    if (!this.initialized || this.disabled) return undefined;
    return posthog.getFeatureFlag(key);
  }

  getDistinctId(): string | undefined {
    if (!this.initialized || this.disabled) return undefined;
    return posthog.get_distinct_id() || undefined;
  }

  onFeatureFlagsLoaded(callback: () => void): void {
    if (!this.initialized || this.disabled) return;
    posthog.onFeatureFlags(callback);
  }

  captureException(error: Error, properties?: Record<string, unknown>): void {
    if (!this.initialized || this.disabled) return;
    // Use the native SDK method — it correctly builds $exception_list,
    // $exception_message, $exception_type, and $exception_stack_trace_raw.
    // Manually calling posthog.capture('$exception', {...}) skips $exception_list
    // and causes PostHog ingestion to fail with a serde error.
    posthog.captureException(error, properties);
  }
}
