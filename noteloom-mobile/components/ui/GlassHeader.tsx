import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GlassHeaderProps {
  children: ReactNode;
  variant?: 'default' | 'dashboard';
}

export const GlassHeader = ({ children, variant = 'default' }: GlassHeaderProps) => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: variant === 'dashboard'
            ? (isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.8)')
            : 'transparent',
          borderBottomWidth: variant === 'dashboard' ? 1 : 0,
          borderBottomColor: variant === 'dashboard'
            ? (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
            : 'transparent',
          ...(variant === 'dashboard' ? {
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 8,
          } : {}),
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default GlassHeader;
