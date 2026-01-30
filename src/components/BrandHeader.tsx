import { View, Text, StyleSheet } from 'react-native';
import { HatchMatchLogo } from './HatchMatchLogo';
import { colors } from '../theme';

interface BrandHeaderProps {
  size?: 'small' | 'medium';
}

export function BrandHeader({ size = 'small' }: BrandHeaderProps) {
  const logoSize = size === 'small' ? 28 : 36;
  const fontSize = size === 'small' ? 18 : 22;

  return (
    <View style={styles.container}>
      <HatchMatchLogo size={logoSize} color={colors.text.inverse} showBackground={false} />
      <Text style={[styles.title, { fontSize }]}>HatchMatch</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '700',
    color: colors.text.inverse,
    letterSpacing: -0.5,
  },
});
