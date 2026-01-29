import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock data - will come from API
  const trip = {
    id,
    name: 'Colorado Summer Trip',
    startDate: '2026-07-15',
    endDate: '2026-07-18',
    waters: [
      { id: '1', name: 'South Platte River', state: 'CO' },
      { id: '2', name: 'Arkansas River', state: 'CO' },
    ],
    notes: 'Annual summer fishing trip with the crew.',
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <Text style={styles.tripDates}>
            {trip.startDate} - {trip.endDate}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waters</Text>
          {trip.waters.map((water) => (
            <Pressable key={water.id} style={styles.waterCard}>
              <Text style={styles.waterName}>{water.name}</Text>
              <Text style={styles.waterState}>{water.state}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.addWaterButton}>
            <Text style={styles.addWaterButtonText}>+ Add Water</Text>
          </Pressable>
        </View>

        {trip.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{trip.notes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh Recommendations</Text>
          </Pressable>
          <Pressable style={styles.findShopsButton}>
            <Text style={styles.findShopsButtonText}>Find Fly Shops Along Route</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tripName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  tripDates: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  waterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  waterState: {
    fontSize: 14,
    color: '#6b7280',
  },
  addWaterButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
  },
  addWaterButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  findShopsButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  findShopsButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
