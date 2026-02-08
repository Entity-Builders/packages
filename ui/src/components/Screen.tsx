import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Screen wrapper component that provides consistent SafeAreaView behavior
 * across all screens in the application using react-native-safe-area-context.
 */
export const Screen = ({ children, style }: ScreenProps) => {
  return (
    <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
