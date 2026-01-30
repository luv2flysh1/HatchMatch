import { Pressable, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFlyBoxStore } from '../stores/flyBoxStore';
import { colors, spacing, borderRadius } from '../theme';

export function FlyBoxHeaderButton() {
  const itemCount = useFlyBoxStore((state) => state.getItemCount());

  const handlePress = () => {
    router.push('/flybox');
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <MaterialCommunityIcons name="box-variant" size={24} color={colors.text.inverse} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="check"
            size={10}
            color={colors.text.inverse}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[2],
    marginRight: spacing[2],
    position: 'relative',
    borderRadius: borderRadius.base,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badge: {
    position: 'absolute',
    top: spacing[0.5],
    right: spacing[0.5],
    backgroundColor: colors.secondary[500],
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: colors.primary[700],
  },
});
