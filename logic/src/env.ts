/**
 * Centralized Environment Manager for Entity Builders Universe
 * "Write once, sell everywhere"
 * 
 * Provides a reliable, cross-platform way to determine the current
 * application environment, handling both Node.js and React Native (Expo) contexts.
 */

export type AppEnvironment = 'development' | 'preview' | 'production';

/**
 * Safely parses an environment variable, protecting against bundlers
 * that might inject literal string "undefined" or "null" when missing.
 */
export const getValidEnv = (val: string | undefined | null): string | undefined => {
  if (!val || val === 'undefined' || val === 'null' || val === '') return undefined;
  return val;
};

/**
 * Determines the current environment based on EXPO_PUBLIC_APP_ENV,
 * falling back to React Native's __DEV__ or standard NODE_ENV.
 */
export const getAppEnv = (): AppEnvironment => {
  const explicitEnv = getValidEnv(process.env.EXPO_PUBLIC_APP_ENV) as AppEnvironment;
  if (explicitEnv === 'production') return 'production';
  if (explicitEnv === 'preview') return 'preview';
  if (explicitEnv === 'development') return 'development';
  
  // React Native fallback
  // @ts-ignore
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'development';
  }
  
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

/**
 * Returns true if the app is pointing to cloud infrastructure (eb-core or dedicated project).
 * In our architecture, both 'preview' (TestFlight/Staging) and 'production' are "Prod".
 */
export const isProdEnv = (): boolean => {
  const env = getAppEnv();
  return env === 'production' || env === 'preview';
};

/**
 * Returns true if the app is pointing to local infrastructure (e.g., localhost:54321).
 */
export const isDevEnv = (): boolean => {
  return getAppEnv() === 'development';
};
