import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = true }: LoadingSpinnerProps) => {
  const { isDarkMode } = useTheme();

  const content = (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <View style={[styles.outerRing, { borderColor: isDarkMode ? '#3b82f6' : '#3b82f6', borderLeftColor: 'transparent' }]} />
        <View style={[styles.innerRing, { borderTopColor: isDarkMode ? '#a78bfa' : '#a78bfa', borderLeftColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: 'transparent' }]} />
        <ActivityIndicator size="small" color="#3b82f6" style={styles.centerIcon} />
      </View>
      <Text style={[styles.message, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{message}</Text>
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  outerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
  },
  innerRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  centerIcon: {
    position: 'absolute',
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default LoadingSpinner;
