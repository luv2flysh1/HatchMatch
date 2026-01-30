import { Pressable, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFlyBoxStore } from '../stores/flyBoxStore';

export function FlyBoxHeaderButton() {
  const itemCount = useFlyBoxStore((state) => state.getItemCount());

  const handlePress = () => {
    router.push('/flybox');
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Text style={styles.icon}>📦</Text>
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
