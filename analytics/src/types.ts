/**
 * Analytics provider interface.
 * Implement this to swap PostHog for another provider (e.g., Mixpanel, Aptabase).
 */
export interface AnalyticsProvider {
  init(config: AnalyticsConfig): void;
  track(event: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  setGlobalProperties(properties: Record<string, unknown>): void;
  reset(): void;
  /** Read a feature flag value. Returns undefined if not loaded yet. */
  getFeatureFlag(key: string): string | boolean | undefined;
  /** Read the provider's current anonymous or identified analytics id when available. */
  getDistinctId?(): string | undefined;
  /** Register a callback for when feature flags are loaded. */
  onFeatureFlagsLoaded(callback: () => void): void;
  /** Capture an exception for error tracking (e.g., PostHog Error Tracking). */
  captureException?(error: Error, properties?: Record<string, unknown>): void;
}

export interface AnalyticsConfig {
  apiKey: string;
  apiHost?: string;
  /** Disable tracking entirely (e.g., in dev mode) */
  disabled?: boolean;
  /** Disable session recording (e.g., in dev) */
  disableSessionRecording?: boolean;
  /** Enable autocapture of clicks, inputs, etc. */
  autocapture?: boolean;
}
