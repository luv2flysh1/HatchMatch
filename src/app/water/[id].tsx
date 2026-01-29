import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WaterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock data - will come from API
  const waterBody = {
    id,
    name: 'Sample River',
    type: 'river',
    state: 'CO',
    species: ['Rainbow Trout', 'Brown Trout'],
  };

  const recommendations = [
    {
      id: '1',
      name: 'Parachute Adams',
      type: 'dry',
      size: '14-18',
      confidence: 85,
      reasoning: 'PMD hatch expected in afternoon hours.',
    },
    {
      id: '2',
      name: 'Pheasant Tail Nymph',
      type: 'nymph',
      size: '16-18',
      confidence: 80,
      reasoning: 'Effective year-round subsurface pattern.',
    },
    {
      id: '3',
      name: 'Elk Hair Caddis',
      type: 'dry',
      size: '14-16',
      confidence: 75,
      reasoning: 'Caddis activity increasing this time of year.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.waterName}>{waterBody.name}</Text>
          <Text style={styles.waterMeta}>
            {waterBody.type} • {waterBody.state}
          </Text>
          <Text style={styles.species}>
            Species: {waterBody.species.join(', ')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fly Recommendations</Text>
          <Text style={styles.sectionSubtitle}>Based on current conditions</Text>

          {recommendations.map((fly, index) => (
            <View key={fly.id} style={styles.flyCard}>
              <View style={styles.flyHeader}>
                <Text style={styles.flyRank}>#{index + 1}</Text>
                <View style={styles.flyInfo}>
                  <Text style={styles.flyName}>{fly.name}</Text>
                  <Text style={styles.flyMeta}>
                    {fly.type} • Size {fly.size}
                  </Text>
                </View>
                <View style={styles.confidence}>
                  <Text style={styles.confidenceValue}>{fly.confidence}%</Text>
                </View>
              </View>
              <Text style={styles.flyReasoning}>{fly.reasoning}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.addToTripButton}>
            <Text style={styles.addToTripButtonText}>Add to Trip</Text>
          </Pressable>
          <Pressable style={styles.favoriteButton}>
            <Text style={styles.favoriteButtonText}>Save to Favorites</Text>
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
  waterName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  waterMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  species: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  flyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  flyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flyRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
    width: 30,
  },
  flyInfo: {
    flex: 1,
  },
  flyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  flyMeta: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  confidence: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  flyReasoning: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  addToTripButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addToTripButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  favoriteButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
