import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

console.log(`[SharedPackage] Initializing Supabase with URL: ${supabaseUrl}`);

const isBrowser = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const SafeStorage = {
  getItem: async (key: string) => {
    // console.log('[SafeStorage] getItem called for key:', key, 'isBrowser:', isBrowser());
    try {
      if (isBrowser()) {
        const val = await AsyncStorage.getItem(key);
        // console.log('[SafeStorage] getItem result:', val);
        return val;
      }
    } catch (error) {
      console.warn('[SafeStorage] getItem error:', error);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    try {
      if (isBrowser()) {
        return await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      // ignore
    }
  },
  removeItem: async (key: string) => {
    try {
      if (isBrowser()) {
        return await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      // ignore
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
