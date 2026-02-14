import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';

export interface SharedHeaderProps {
  /** Current Supabase session (null if not authenticated) */
  session: Session | null;
  /** Callback to navigate to login screen */
  onLogin: () => void;
  /** Callback to perform logout */
  onLogout: () => void;
  /** Optional app title */
  title?: string;
  /** Optional logo component */
  logo?: React.ReactNode;
  /** Theme color for buttons and accents */
  themeColor?: string;
  /** Additional action components to display in the header */
  actions?: React.ReactNode[];
  /** Whether to show user info (email/name) */
  showUserInfo?: boolean;
  /** Optional user display name (defaults to email) */
  userName?: string;
  /** Optional user avatar component */
  userAvatar?: React.ReactNode;
  /** Variant for light/dark mode */
  variant?: 'light' | 'dark';
  /** Custom container style */
  containerStyle?: ViewStyle;
}

export const SharedHeader: React.FC<SharedHeaderProps> = ({
  session,
  onLogin,
  onLogout,
  title,
  logo,
  themeColor = '#007AFF',
  actions = [],
  showUserInfo = false,
  userName,
  userAvatar,
  variant = 'light',
  containerStyle,
}) => {
  const isDark = variant === 'dark';
  const userEmail = session?.user?.email;
  const displayName = userName || userEmail || 'User';

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
        containerStyle,
      ]}
    >
      {/* Left Section: Logo/Title */}
      <View style={styles.leftSection}>
        {logo && <View style={styles.logoContainer}>{logo}</View>}
        {title && (
          <Text
            style={[
              styles.title,
              isDark ? styles.titleDark : styles.titleLight,
            ]}
          >
            {title}
          </Text>
        )}
      </View>

      {/* Center Section: Additional Actions */}
      {actions.length > 0 && (
        <View style={styles.centerSection}>
          {actions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              {action}
            </View>
          ))}
        </View>
      )}

      {/* Right Section: User Info & Auth Button */}
      <View style={styles.rightSection}>
        {session ? (
          <>
            {/* User Info */}
            {showUserInfo && (
              <View style={styles.userInfo}>
                {userAvatar ? (
                  <View style={styles.avatarContainer}>{userAvatar}</View>
                ) : (
                  <View
                    style={[
                      styles.defaultAvatar,
                      isDark
                        ? styles.defaultAvatarDark
                        : styles.defaultAvatarLight,
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.userName,
                    isDark ? styles.userNameDark : styles.userNameLight,
                  ]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </View>
            )}

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.authButton, styles.logoutButton]}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Login Button */
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: themeColor }]}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleLight: {
    color: '#1F2937',
  },
  titleDark: {
    color: '#F9FAFB',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  actionItem: {
    // Individual action items can have their own styles
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 150,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatarLight: {
    backgroundColor: '#E5E7EB',
  },
  defaultAvatarDark: {
    backgroundColor: '#374151',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  userNameLight: {
    color: '#374151',
  },
  userNameDark: {
    color: '#D1D5DB',
  },
  authButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  logoutButton: {
    backgroundColor: '#EF4444',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
