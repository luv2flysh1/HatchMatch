import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripsScreen() {
  const trips: any[] = []; // Will be populated from state/API

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Pressable style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Plan New Trip</Text>
      </Pressable>

      {trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No trips planned</Text>
          <Text style={styles.emptyStateText}>
            Create a trip to get fly recommendations for your upcoming fishing
            adventures.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <Text style={styles.tripName}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  createButton: {
    margin: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
