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
