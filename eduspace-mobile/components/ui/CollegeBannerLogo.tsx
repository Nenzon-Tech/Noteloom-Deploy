import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getSecure } from '../../lib/storage';

interface CollegeBannerLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { image: 24, font: 16 },
  md: { image: 32, font: 20 },
  lg: { image: 48, font: 24 },
};

export const CollegeBannerLogo = ({ size = 'md' }: CollegeBannerLogoProps) => {
  const { isDarkMode } = useTheme();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [collegeName, setCollegeName] = useState('Note Loom');
  const dims = sizeMap[size];

  useEffect(() => {
    getSecure('selectedCollegeLogo').then(setLogoUrl);
    getSecure('selectedCollegeName').then((name) => { if (name) setCollegeName(name); });
  }, []);

  if (logoUrl && !logoError) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: dims.image, height: dims.image }}
        resizeMode="contain"
        onError={() => setLogoError(true)}
      />
    );
  }

  return (
    <Text style={[styles.fallbackText, { fontSize: dims.font }]}>
      Note Loom
    </Text>
  );
};

const styles = StyleSheet.create({
  fallbackText: {
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#7c3aed',
  },
});

export default CollegeBannerLogo;
