import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  contentContainerStyle?: object;
  hasHeader?: boolean;
}

export const Screen = ({ children, refreshControl, contentContainerStyle, hasHeader = true, ...rest }: ScreenProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const topPadding = hasHeader ? 0 : insets.top + 14;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding, paddingBottom: insets.bottom + 100 },
          contentContainerStyle,
        ]}
        refreshControl={refreshControl}
        {...rest}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16 },
});

export default Screen;
