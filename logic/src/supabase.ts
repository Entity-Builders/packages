import { createClient } from '@supabase/supabase-js';
import { getValidEnv, isProdEnv } from './env';

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

// Allow explicit env vars (for graduated apps), fallback to shared eb-core, fallback to local
export const supabaseUrl = getValidEnv(process.env.EXPO_PUBLIC_SUPABASE_URL) || getValidEnv(process.env.VITE_SUPABASE_URL) || defaultUrl;
export const supabaseAnonKey = getValidEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) || getValidEnv(process.env.VITE_SUPABASE_ANON_KEY) || defaultAnonKey;

console.log(`[SharedPackage] Initializing Supabase (Prod: ${isProd}) with URL: ${supabaseUrl}`);

const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
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

const supabaseSchema = process.env.EXPO_PUBLIC_SUPABASE_SCHEMA || process.env.VITE_SUPABASE_SCHEMA || 'public';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
