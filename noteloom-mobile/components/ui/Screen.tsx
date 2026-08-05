import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  contentContainerStyle?: object;
}

export const Screen = ({ children, refreshControl, contentContainerStyle, ...rest }: ScreenProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 100 },
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
