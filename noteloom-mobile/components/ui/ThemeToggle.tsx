import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} style={[styles.container, { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }]}>
      <View style={styles.icons}>
        <Sun size={14} color="white" style={{ opacity: isDarkMode ? 0.3 : 0 }} />
        <Moon size={14} color="white" style={{ opacity: isDarkMode ? 0 : 0.4 }} />
      </View>
      <View style={[styles.puck, isDarkMode ? styles.puckDark : styles.puckLight]}>
        <Sun size={10} color="#f59e0b" style={{ position: 'absolute', opacity: isDarkMode ? 0 : 1 }} />
        <Moon size={10} color="white" style={{ position: 'absolute', opacity: isDarkMode ? 1 : 0 }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  puck: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puckLight: {
    left: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  puckDark: {
    right: 4,
    backgroundColor: 'rgba(99,102,241,0.8)',
  },
});

export default ThemeToggle;
