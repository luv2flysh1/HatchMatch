/**
 * HatchMatch Logo Component
 *
 * A scalable vector logo for the HatchMatch fly fishing app.
 * Uses react-native-svg for crisp rendering at any size.
 *
 * Logo Concept:
 * - Combines a stylized mayfly silhouette with water ripple elements
 * - The mayfly represents "hatch" (insect hatches)
 * - The circular ripple represents "match" (the moment of the rise)
 * - The overall design is modern, clean, and works well at small and large sizes
 *
 * Usage:
 * - Header: <Logo size={32} />
 * - Splash screen: <Logo size={120} />
 * - With text: <Logo size={48} variant="full" />
 *
 * Note: Requires react-native-svg to be installed:
 * npx expo install react-native-svg
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography } from '../theme';

export type LogoVariant = 'icon' | 'full' | 'stacked';
export type LogoColorScheme = 'primary' | 'white' | 'dark';

interface LogoProps {
  /**
   * Size of the logo icon in pixels
   * @default 48
   */
  size?: number;

  /**
   * Logo variant
   * - 'icon': Just the logo mark
   * - 'full': Logo mark with horizontal text
   * - 'stacked': Logo mark with text below
   * @default 'icon'
   */
  variant?: LogoVariant;

  /**
   * Color scheme for the logo
   * - 'primary': Brand colors (for light backgrounds)
   * - 'white': All white (for dark/colored backgrounds)
   * - 'dark': Dark version (for light backgrounds, more subtle)
   * @default 'primary'
   */
  colorScheme?: LogoColorScheme;

  /**
   * Whether to show gradient fill
   * @default true
   */
  useGradient?: boolean;
}

/**
 * HatchMatch Logo Mark
 *
 * The icon consists of:
 * 1. A stylized mayfly with spread wings (representing the hatch)
 * 2. Concentric ripple arcs below (representing the rise/match moment)
 * 3. All contained in a harmonious circular composition
 */
function LogoMark({
  size = 48,
  colorScheme = 'primary',
  useGradient = true,
}: Pick<LogoProps, 'size' | 'colorScheme' | 'useGradient'>) {
  // Color schemes
  const colorMap = {
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      accent: colors.accent[500],
      dark: colors.primary[700],
    },
    white: {
      main: '#FFFFFF',
      light: 'rgba(255, 255, 255, 0.8)',
      accent: '#FFFFFF',
      dark: 'rgba(255, 255, 255, 0.9)',
    },
    dark: {
      main: colors.neutral[800],
      light: colors.neutral[600],
      accent: colors.neutral[700],
      dark: colors.neutral[900],
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Gradient for the mayfly body */}
        <LinearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={scheme.light} />
          <Stop offset="100%" stopColor={scheme.main} />
        </LinearGradient>

        {/* Gradient for wings */}
        <LinearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={scheme.light} />
          <Stop offset="50%" stopColor={scheme.main} />
          <Stop offset="100%" stopColor={scheme.dark} />
        </LinearGradient>

        {/* Accent gradient for highlight elements */}
        <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={scheme.accent} />
          <Stop offset="100%" stopColor={scheme.main} />
        </LinearGradient>
      </Defs>

      <G>
        {/* Water ripple arcs - representing the "match" moment */}
        {/* Outer ripple */}
        <Path
          d="M 20 70 Q 50 55 80 70"
          fill="none"
          stroke={useGradient ? 'url(#wingGradient)' : scheme.main}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.4}
        />

        {/* Middle ripple */}
        <Path
          d="M 28 75 Q 50 63 72 75"
          fill="none"
          stroke={useGradient ? 'url(#wingGradient)' : scheme.main}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* Inner ripple */}
        <Path
          d="M 36 80 Q 50 71 64 80"
          fill="none"
          stroke={useGradient ? 'url(#wingGradient)' : scheme.main}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.8}
        />

        {/* Mayfly - representing the "hatch" */}
        {/* Left wing (upper) */}
        <Path
          d="M 50 35
             C 42 28, 28 22, 18 30
             C 22 35, 35 38, 50 40
             Z"
          fill={useGradient ? 'url(#wingGradient)' : scheme.main}
          opacity={0.9}
        />

        {/* Right wing (upper) */}
        <Path
          d="M 50 35
             C 58 28, 72 22, 82 30
             C 78 35, 65 38, 50 40
             Z"
          fill={useGradient ? 'url(#wingGradient)' : scheme.main}
          opacity={0.9}
        />

        {/* Left wing (lower, smaller) */}
        <Path
          d="M 50 42
             C 44 38, 34 36, 26 40
             C 30 44, 40 45, 50 46
             Z"
          fill={useGradient ? 'url(#wingGradient)' : scheme.main}
          opacity={0.7}
        />

        {/* Right wing (lower, smaller) */}
        <Path
          d="M 50 42
             C 56 38, 66 36, 74 40
             C 70 44, 60 45, 50 46
             Z"
          fill={useGradient ? 'url(#wingGradient)' : scheme.main}
          opacity={0.7}
        />

        {/* Mayfly body */}
        <Path
          d="M 50 30
             C 52 30, 54 35, 54 42
             L 54 58
             C 54 60, 52 62, 50 62
             C 48 62, 46 60, 46 58
             L 46 42
             C 46 35, 48 30, 50 30
             Z"
          fill={useGradient ? 'url(#bodyGradient)' : scheme.main}
        />

        {/* Mayfly head */}
        <Circle
          cx="50"
          cy="28"
          r="5"
          fill={useGradient ? 'url(#bodyGradient)' : scheme.main}
        />

        {/* Mayfly tails (three characteristic tails) */}
        <Path
          d="M 47 62 L 42 72"
          stroke={useGradient ? 'url(#accentGradient)' : scheme.main}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M 50 62 L 50 74"
          stroke={useGradient ? 'url(#accentGradient)' : scheme.main}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M 53 62 L 58 72"
          stroke={useGradient ? 'url(#accentGradient)' : scheme.main}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Antennae */}
        <Path
          d="M 47 24 C 45 20, 42 18, 38 16"
          fill="none"
          stroke={scheme.main}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <Path
          d="M 53 24 C 55 20, 58 18, 62 16"
          fill="none"
          stroke={scheme.main}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

/**
 * Wordmark component for the logo text
 */
function LogoWordmark({
  colorScheme = 'primary',
  size = 'normal',
}: {
  colorScheme: LogoColorScheme;
  size?: 'small' | 'normal' | 'large';
}) {
  const textColorMap = {
    primary: colors.text.primary,
    white: '#FFFFFF',
    dark: colors.neutral[900],
  };

  const accentColorMap = {
    primary: colors.primary[500],
    white: 'rgba(255, 255, 255, 0.9)',
    dark: colors.neutral[700],
  };

  const fontSizeMap = {
    small: 16,
    normal: 22,
    large: 32,
  };

  return (
    <View style={styles.wordmarkContainer}>
      <Text
        style={[
          styles.wordmark,
          {
            fontSize: fontSizeMap[size],
            color: textColorMap[colorScheme],
          },
        ]}
      >
        Hatch
      </Text>
      <Text
        style={[
          styles.wordmarkAccent,
          {
            fontSize: fontSizeMap[size],
            color: accentColorMap[colorScheme],
          },
        ]}
      >
        Match
      </Text>
    </View>
  );
}

/**
 * Main Logo Component
 */
export function Logo({
  size = 48,
  variant = 'icon',
  colorScheme = 'primary',
  useGradient = true,
}: LogoProps) {
  if (variant === 'icon') {
    return <LogoMark size={size} colorScheme={colorScheme} useGradient={useGradient} />;
  }

  if (variant === 'full') {
    return (
      <View style={styles.fullContainer}>
        <LogoMark size={size} colorScheme={colorScheme} useGradient={useGradient} />
        <View style={styles.wordmarkSpacerHorizontal} />
        <LogoWordmark
          colorScheme={colorScheme}
          size={size > 60 ? 'large' : size > 36 ? 'normal' : 'small'}
        />
      </View>
    );
  }

  // Stacked variant
  return (
    <View style={styles.stackedContainer}>
      <LogoMark size={size} colorScheme={colorScheme} useGradient={useGradient} />
      <View style={styles.wordmarkSpacerVertical} />
      <LogoWordmark
        colorScheme={colorScheme}
        size={size > 80 ? 'large' : size > 48 ? 'normal' : 'small'}
      />
    </View>
  );
}

/**
 * Simplified Logo for small sizes (favicons, tab bar icons)
 * Uses simpler shapes for better visibility at small sizes
 */
export function LogoSimplified({
  size = 24,
  colorScheme = 'primary',
}: Pick<LogoProps, 'size' | 'colorScheme'>) {
  const colorMap = {
    primary: colors.primary[500],
    white: '#FFFFFF',
    dark: colors.neutral[800],
  };

  const color = colorMap[colorScheme];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Simplified mayfly shape */}
      <Path
        d="M 12 4
           C 14 4, 15 6, 15 8
           L 15 14
           C 15 15, 14 16, 12 16
           C 10 16, 9 15, 9 14
           L 9 8
           C 9 6, 10 4, 12 4
           Z"
        fill={color}
      />

      {/* Simplified wings */}
      <Path
        d="M 12 7 L 4 5 L 8 9 Z"
        fill={color}
        opacity={0.8}
      />
      <Path
        d="M 12 7 L 20 5 L 16 9 Z"
        fill={color}
        opacity={0.8}
      />

      {/* Single ripple */}
      <Path
        d="M 6 20 Q 12 17 18 20"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.7}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedContainer: {
    alignItems: 'center',
  },
  wordmarkContainer: {
    flexDirection: 'row',
  },
  wordmarkSpacerHorizontal: {
    width: 10,
  },
  wordmarkSpacerVertical: {
    height: 8,
  },
  wordmark: {
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  wordmarkAccent: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});

export default Logo;
