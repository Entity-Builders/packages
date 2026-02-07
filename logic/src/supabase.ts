import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

console.log(`[SharedPackage] Initializing Supabase with URL: ${supabaseUrl}`);

const SafeStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('[SafeStorage] getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('[SafeStorage] setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('[SafeStorage] removeItem error:', error);
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
