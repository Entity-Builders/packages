import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { supabase } from '@eb-packages/logic';
import { Auth } from './Auth';

export interface AuthScreenProps {
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
  title?: string;
  themeColor?: string;
  // Any other props we might want to pass down to the presentation component
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
  title = 'Guita Control',
  themeColor = '#000',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      onLoginSuccess?.();
    } catch (e: any) {
      setError(e.message);
      Alert.alert('Authentication Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (error) throw error;
      Alert.alert(
        'Registro exitoso',
        '¡Cuenta creada! Revisa tu email o inicia sesión.',
      );
      onRegisterSuccess?.();
    } catch (e: any) {
      setError(e.message);
      Alert.alert('Authentication Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Auth
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loading}
        error={error}
        title={title}
        themeColor={themeColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // The previous implementation had backgroundColor: '#000' on the container
    // But Auth component has internal styles. We might want to pass usage styles or keep it flexible.
    // For now, let's keep it simple or allow the parent to style it if needed,
    // but the previous code had a specific black background container.
    // However, the Auth component itself has a white card and gray background.
    // Let's stick to what packages/ui/Auth.tsx expects, but the wrapper in app had #000.
    // I will use 'transparent' here and let the consumer or the inner Auth handle it,
    // OR considering the user asked to move "loading y demas", maybe I should preserve the styling preference if it was specific.
    // The previous app code had:
    // container: { flex: 1, backgroundColor: '#000' }
    // AND it wrapped Auth in SafeAreaView.
    // The Shared component might not want to enforce SafeAreaView as it might be used inside one.
    // But `Auth` component has `backgroundColor: '#F5F5F5'` on its container.
    // If I put it in a #000 container, it might look odd if Auth takes full size.
    // Let's look at Auth.tsx again. It has `flex: 1` in `container`.
    // So it will fill the parent.
    // If I want to exactly replicate the App's behavior, I should probably expose the container style or just render Auth.
    // I'll make this a simple wrapper for logic.
  },
});
