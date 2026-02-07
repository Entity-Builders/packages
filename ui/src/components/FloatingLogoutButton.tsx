import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

interface FloatingLogoutButtonProps {
  onLogout: () => void;
}

export const FloatingLogoutButton: React.FC<FloatingLogoutButtonProps> = ({
  onLogout,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
      ]}
      onPress={onLogout}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>🚪 Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#DC2626', // red-600
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 50,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
