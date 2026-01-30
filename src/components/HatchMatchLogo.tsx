import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface HatchMatchLogoProps {
  size?: number;
  color?: string;
  showBackground?: boolean;
}

export function HatchMatchLogo({
  size = 120,
  color = colors.neutral[0],
  showBackground = true
}: HatchMatchLogoProps) {
  const scale = size / 120;

  return (
    <View style={[styles.container, showBackground && styles.background, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size * 0.75} height={size * 0.75} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="flyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        <G>
          {/* Hook - curved fishing hook shape */}
          <Path
            d="M 70 25
               Q 80 25, 85 35
               Q 90 50, 80 65
               Q 70 80, 50 82
               Q 35 83, 28 75
               Q 22 68, 25 60
               Q 28 52, 38 52
               Q 45 52, 48 58"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Hook point/barb */}
          <Path
            d="M 28 75 L 22 70 L 28 68"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Fly body - elongated oval at hook bend */}
          <Path
            d="M 65 28 Q 72 30, 70 38 Q 68 45, 60 43 Q 55 40, 58 33 Q 60 28, 65 28"
            fill={color}
            opacity="0.9"
          />

          {/* Fly wing 1 - upper */}
          <Path
            d="M 62 32
               Q 45 18, 25 22
               Q 35 28, 55 35"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Fly wing 2 - lower */}
          <Path
            d="M 60 38
               Q 42 30, 22 38
               Q 35 40, 55 40"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Hackle fibers - feathery details */}
          <Path
            d="M 68 33 Q 75 28, 78 20"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <Path
            d="M 70 36 Q 78 33, 82 26"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <Path
            d="M 70 40 Q 80 40, 85 35"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Tail fibers */}
          <Path
            d="M 65 28 Q 60 20, 55 12"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <Path
            d="M 67 27 Q 65 18, 62 10"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <Path
            d="M 69 27 Q 70 17, 70 9"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Eye of hook */}
          <Circle
            cx="70"
            cy="25"
            r="3"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />

          {/* Water ripple underneath - subtle */}
          <Path
            d="M 20 88 Q 35 85, 50 88 Q 65 91, 80 88"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <Path
            d="M 30 94 Q 45 91, 60 94 Q 70 96, 75 94"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.25"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
