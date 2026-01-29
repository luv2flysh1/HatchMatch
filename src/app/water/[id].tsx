import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWaterStore } from '../../stores/waterStore';
import { useAuthStore } from '../../stores/authStore';

export default function WaterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    selectedWater,
    isLoading,
    error,
    getWaterBody,
    toggleFavorite,
    isFavorite,
  } = useWaterStore();

  const [isFav, setIsFav] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  useEffect(() => {
    if (id) {
      getWaterBody(id);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsFav(isFavorite(id));
    }
  }, [id, isFavorite]);

  const handleToggleFavorite = async () => {
    if (!user) {
      // TODO: Prompt to sign in
      return;
    }
    setIsTogglingFav(true);
    await toggleFavorite(id);
    setIsFav(isFavorite(id));
    setIsTogglingFav(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !selectedWater) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Water body not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mock recommendations - will be replaced with real AI recommendations
  const recommendations = [
    {
      id: '1',
      name: 'Parachute Adams',
      type: 'dry',
      size: '14-18',
      confidence: 85,
      reasoning: 'PMD hatch expected in afternoon hours based on current conditions.',
    },
    {
      id: '2',
      name: 'Pheasant Tail Nymph',
      type: 'nymph',
      size: '16-18',
      confidence: 80,
      reasoning: 'Effective year-round subsurface pattern for this water.',
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
          <Text style={styles.waterName}>{selectedWater.name}</Text>
          <Text style={styles.waterMeta}>
            {formatWaterType(selectedWater.type)} • {selectedWater.state}
            {selectedWater.city && ` • ${selectedWater.city}`}
          </Text>
          {selectedWater.species && selectedWater.species.length > 0 && (
            <Text style={styles.species}>
              Species: {selectedWater.species.join(', ')}
            </Text>
          )}
          {selectedWater.description && (
            <Text style={styles.description}>{selectedWater.description}</Text>
          )}
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
          <Pressable
            style={[styles.favoriteButton, isFav && styles.favoriteButtonActive]}
            onPress={handleToggleFavorite}
            disabled={isTogglingFav}
          >
            {isTogglingFav ? (
              <ActivityIndicator size="small" color={isFav ? '#ffffff' : '#374151'} />
            ) : (
              <Text style={[styles.favoriteButtonText, isFav && styles.favoriteButtonTextActive]}>
                {isFav ? 'Saved to Favorites' : 'Save to Favorites'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatWaterType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
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
    color: '#2563eb',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 12,
    lineHeight: 20,
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
    minHeight: 48,
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  favoriteButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButtonTextActive: {
    color: '#ffffff',
  },
});
