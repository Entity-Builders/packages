export { Analytics } from './analytics';
export { PostHogProvider } from './posthog-provider';
// PostHogRNProvider is NOT re-exported here to avoid dragging
// posthog-react-native into web builds (Vite can't resolve it).
// RN apps should import directly:
//   import { PostHogRNProvider } from '@entity-builders/analytics/src/posthog-rn-provider';
export type { AnalyticsProvider, AnalyticsConfig } from './types';
