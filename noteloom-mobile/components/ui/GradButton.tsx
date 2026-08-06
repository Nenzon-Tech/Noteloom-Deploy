import React, { ReactNode } from 'react';
import { Pressable, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { Gradient as GradientTuple } from '../../lib/theme';

interface GradButtonProps {
  children: ReactNode;
  onPress?: () => void;
  colors?: GradientTuple;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  style?: object;
  textStyle?: object;
}

export const GradButton = ({
  children,
  onPress,
  colors,
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  style,
  textStyle,
}: GradButtonProps) => {
  const { theme } = useTheme();
  const gradient = colors || theme.gradientCta;

  const sizes = {
    sm: { py: 9, px: 12, fs: 11, radius: 10 },
    md: { py: 11, px: 14, fs: 12, radius: 10 },
    lg: { py: 16, px: 28, fs: 15, radius: 16 },
  } as const;
  const s = sizes[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        { alignSelf: fullWidth ? 'stretch' : 'auto' },
        fullWidth && styles.full,
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <Gradient
        colors={gradient}
        radius={s.radius}
        style={[styles.btn, { paddingVertical: s.py, paddingHorizontal: s.px, borderRadius: s.radius }, fullWidth && styles.full, style]}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              {icon && <View style={styles.icon}>{icon}</View>}
              <Text style={[styles.text, { fontSize: s.fs }, textStyle]}>{children}</Text>
            </>
          )}
        </View>
      </Gradient>
    </Pressable>
  );
};

interface GhostButtonProps {
  children: ReactNode;
  onPress?: () => void;
  style?: object;
  textStyle?: object;
}

export const GhostButton = ({ children, onPress, style, textStyle }: GhostButtonProps) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghost,
        {
          backgroundColor: theme.surface2,
          borderColor: theme.border,
        },
        pressed && { transform: [{ scale: 0.96 }] },
        style,
      ]}
    >
      <Text style={[styles.ghostText, { color: theme.muted }, textStyle]}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(147,51,234,0.35)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 4,
  },
  full: { width: '100%' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  icon: { marginRight: 6 },
  text: { color: '#fff', fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  ghost: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  ghostText: { fontSize: 11, fontWeight: '600' },
});

export default GradButton;
