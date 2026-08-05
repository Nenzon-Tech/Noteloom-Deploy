import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { Gradient as GradientTuple } from '../../lib/theme';

interface GradientProps {
  colors: GradientTuple;
  style?: ViewStyle | ViewStyle[];
  angle?: number;
  children?: ReactNode;
  radius?: number;
}

export const Gradient = ({ colors, style, angle = 135, children, radius = 0 }: GradientProps) => {
  const rad = (angle * Math.PI) / 180;
  const x1 = 0.5 - 0.5 * Math.cos(rad);
  const y1 = 0.5 - 0.5 * Math.sin(rad);
  const x2 = 0.5 + 0.5 * Math.cos(rad);
  const y2 = 0.5 + 0.5 * Math.sin(rad);

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id={`grad-${colors.join('-')}`} x1={x1} y1={y1} x2={x2} y2={y2}>
            {colors.map((c, i) => (
              <Stop key={i} offset={colors.length === 1 ? 0 : i / (colors.length - 1)} stopColor={c} />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#grad-${colors.join('-')})`} />
      </Svg>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
});

export default Gradient;
