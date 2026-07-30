import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';

type PopupType = 'error' | 'success' | 'info';

interface PopupData {
  message: string;
  type: PopupType;
}

interface ErrorPopupContextType {
  triggerPopup: (message: string, type?: PopupType) => void;
}

const ErrorPopupContext = createContext<ErrorPopupContextType>({ triggerPopup: () => {} });

export const ErrorPopupProvider = ({ children }: { children: ReactNode }) => {
  const { isDarkMode } = useTheme();
  const [popup, setPopup] = useState<PopupData | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (popup) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
      const timer = setTimeout(() => {
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => setPopup(null));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const triggerPopup = (message: string, type: PopupType = 'error') => {
    setPopup({ message, type });
  };

  const getIcon = () => {
    switch (popup?.type) {
      case 'error': return <AlertCircle size={20} color="#ef4444" />;
      case 'success': return <CheckCircle size={20} color="#22c55e" />;
      case 'info': return <Info size={20} color="#3b82f6" />;
      default: return <AlertCircle size={20} color="#ef4444" />;
    }
  };

  const getBgColor = () => {
    if (!popup) return '';
    switch (popup.type) {
      case 'error': return isDarkMode ? '#450a0a' : '#fef2f2';
      case 'success': return isDarkMode ? '#052e16' : '#f0fdf4';
      case 'info': return isDarkMode ? '#0c1929' : '#eff6ff';
      default: return isDarkMode ? '#450a0a' : '#fef2f2';
    }
  };

  const getBorderColor = () => {
    if (!popup) return '';
    switch (popup.type) {
      case 'error': return '#ef4444';
      case 'success': return '#22c55e';
      case 'info': return '#3b82f6';
      default: return '#ef4444';
    }
  };

  return (
    <ErrorPopupContext.Provider value={{ triggerPopup }}>
      {children}
      {popup && (
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: getBgColor(),
              borderColor: getBorderColor(),
              transform: [{ translateY }],
            },
          ]}
        >
          {getIcon()}
          <Text style={[styles.message, { color: isDarkMode ? '#e5e7eb' : '#374151' }]} numberOfLines={2}>
            {popup.message}
          </Text>
          <X size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} onPress={() => {
            Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => setPopup(null));
          }} />
        </Animated.View>
      )}
    </ErrorPopupContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    marginRight: 8,
  },
});

export const useErrorPopup = () => useContext(ErrorPopupContext);
