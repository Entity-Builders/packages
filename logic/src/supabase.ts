import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

console.log(`[SharedPackage] Initializing Supabase with URL: ${supabaseUrl}`);

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
