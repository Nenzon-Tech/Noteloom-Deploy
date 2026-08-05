import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = true }: LoadingSpinnerProps) => {
  const { isDarkMode, theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const spinClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinCounterClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const content = (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.outerRing,
            {
              borderColor: theme.violet,
              borderLeftColor: 'transparent',
              transform: [{ rotate: spinClockwise }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.innerRing,
            {
              borderTopColor: theme.blue,
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent',
              borderRightColor: 'transparent',
              transform: [{ rotate: spinCounterClockwise }],
            },
          ]}
        />
        <ActivityIndicator size="small" color={theme.violet} style={styles.centerIcon} />
      </View>
      <Text style={[styles.message, { color: theme.faint }]}>{message}</Text>
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.bg }]}>
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
