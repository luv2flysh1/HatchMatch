import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Pressable style={styles.nearbyButton}>
        <Text style={styles.nearbyButtonText}>Find Fly Shops Near Me</Text>
      </Pressable>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Fly Shop Finder</Text>
        <Text style={styles.placeholderText}>
          Find fly shops near your location or along your trip route. Get
          directions, hours, and contact info.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  nearbyButton: {
    margin: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  nearbyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
