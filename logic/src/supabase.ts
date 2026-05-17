import { createClient } from '@supabase/supabase-js';
import { getValidEnv, isProdEnv, getAppEnv } from './env';

// ── Shared eb-core Database Configuration ──
// Used as the default production fallback for all apps sharing the core monolithic DB
const EB_CORE_URL = 'https://xfcvuzcxvdpzkqpnahyx.supabase.co';
const EB_CORE_ANON_KEY = 'REDACTED_SUPABASE_PROD_ANON_KEY';

// ── Local Dev Configuration ──
const LOCAL_URL = 'http://localhost:54321';
const LOCAL_ANON_KEY = 'your-anon-key-placeholder'; // Usually overridden by .env.local

const isProd = isProdEnv();
const defaultUrl = isProd ? EB_CORE_URL : LOCAL_URL;
const defaultAnonKey = isProd ? EB_CORE_ANON_KEY : LOCAL_ANON_KEY;

const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

let expoExtra: any = {};
if (isReactNative) {
  try {
    // Metro doesn't inline EXPO_PUBLIC_ vars in workspace packages automatically.
    // However, app.config.js spreads process.env into extra.
    // We use a dynamic require so Vite doesn't break when compiling web apps.
    // @ts-ignore
    const Constants = require('expo-constants').default;
    expoExtra = Constants?.expoConfig?.extra || {};
  } catch (e) {
    console.warn('[SharedPackage] Failed to load expo-constants', e);
  }
}

// Allow explicit env vars (for graduated apps), fallback to shared eb-core, fallback to local
let configuredUrl = getValidEnv(expoExtra.EXPO_PUBLIC_SUPABASE_URL) || getValidEnv(process.env.EXPO_PUBLIC_SUPABASE_URL) || getValidEnv(process.env.VITE_SUPABASE_URL);

// Anti-Leakage Defense: If we are in a production/preview environment but the loaded URL
// is a local IP (e.g. from a leaked .env file during an OTA update), ignore it.
if (isProd && configuredUrl && (configuredUrl.includes('192.168.') || configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1') || configuredUrl.includes('10.0.'))) {
  console.warn(`[SharedPackage] WARNING: Local IP detected in production build! Ignoring leaked local URL: ${configuredUrl}`);
  configuredUrl = undefined;
}

export const supabaseUrl = configuredUrl || defaultUrl;
export const supabaseAnonKey = getValidEnv(expoExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY) || getValidEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) || getValidEnv(process.env.VITE_SUPABASE_ANON_KEY) || defaultAnonKey;


console.log(`[SharedPackage] Initializing Supabase (Prod: ${isProd}) with URL: ${supabaseUrl}`);

let AsyncStorage: any = null;


if (isReactNative) {
  try {
    // Only require in React Native environment
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('[SharedPackage] Failed to load AsyncStorage', error);
  }
}

const SafeStorage = {
  getItem: async (key: string) => {
    try {
      if (AsyncStorage) return await AsyncStorage.getItem(key);
      else if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('[SafeStorage] getItem error:', error);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    try {
      if (AsyncStorage) await AsyncStorage.setItem(key, value);
      else if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('[SafeStorage] setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (AsyncStorage) await AsyncStorage.removeItem(key);
      else if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
    } catch (error) {
      console.warn('[SafeStorage] removeItem error:', error);
    }
  },
};

const supabaseSchema = expoExtra.EXPO_PUBLIC_SUPABASE_SCHEMA || process.env.EXPO_PUBLIC_SUPABASE_SCHEMA || process.env.VITE_SUPABASE_SCHEMA || 'public';

console.log(`[SharedPackage] Resolved Supabase Schema: '${supabaseSchema}' (AppEnv: '${getAppEnv()}')`);
let finalUrl = supabaseUrl;
try {
  // Validate URL to prevent Uncaught Error that breaks the app
  new URL(finalUrl);
} catch (e) {
  console.error(`[SharedPackage] CRITICAL: Invalid supabaseUrl detected! Value was: '${finalUrl}'. Falling back to local URL.`);
  finalUrl = LOCAL_URL;
}

export const supabase = createClient(finalUrl, supabaseAnonKey, {
  auth: {
    storage: SafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: supabaseSchema,
  },
});

