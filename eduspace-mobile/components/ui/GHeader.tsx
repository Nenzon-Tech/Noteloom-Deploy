import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface GHeaderProps {
  avatar?: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  left?: ReactNode;
}

export const GHeader = ({ avatar, title, subtitle, actions, left }: GHeaderProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.headerBorder,
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          {left}
          {avatar}
          {title && (
            <View style={styles.titleWrap}>
              <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: theme.muted }]} numberOfLines={1}>{subtitle}</Text>
              )}
            </View>
          )}
        </View>
        {actions && <View style={styles.actions}>{actions}</View>}
      </View>
    </View>
  );
};

export const IconBtn = ({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: object;
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.iconBtn, { backgroundColor: theme.surface2, borderColor: theme.border }, style]}>
      {React.cloneElement(children as React.ReactElement<any>, { onPress })}
    </View>
  );
};

export const Wordmark = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.wordmark}>
      <Text style={[styles.wordmarkText, { color: theme.indigo }]}>EduSpace</Text>
      <View style={styles.beta}>
        <Text style={styles.betaText}>Beta</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginHorizontal: -16,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  wordmarkText: { fontSize: 17, fontWeight: '700', letterSpacing: -0.5 },
  beta: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  betaText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});

export default GHeader;
