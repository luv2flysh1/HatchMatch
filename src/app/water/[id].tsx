import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWaterStore } from '../../stores/waterStore';
import { useRecommendationStore } from '../../stores/recommendationStore';
import { useAuthStore } from '../../stores/authStore';
import type { FlyRecommendation } from '../../types/database';

export default function WaterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    selectedWater,
    isLoading: isLoadingWater,
    error: waterError,
    getWaterBody,
    toggleFavorite,
    isFavorite,
  } = useWaterStore();

  const {
    recommendations,
    conditionsSummary,
    lastUpdated,
    isLoading: isLoadingRecs,
    error: recsError,
    getRecommendations,
    clearRecommendations,
  } = useRecommendationStore();

  const [isFav, setIsFav] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      getWaterBody(id);
      getRecommendations(id);
    }
    return () => {
      clearRecommendations();
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsFav(isFavorite(id));
    }
  }, [id, isFavorite]);

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    setIsRefreshing(true);
    await getRecommendations(id, true); // Force refresh
    setIsRefreshing(false);
  }, [id, getRecommendations]);

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

  if (isLoadingWater) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading water body...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (waterError || !selectedWater) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{waterError || 'Water body not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
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
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Fly Recommendations</Text>
              {conditionsSummary && (
                <Text style={styles.conditionsSummary}>{conditionsSummary}</Text>
              )}
              {lastUpdated && (
                <Text style={styles.lastUpdated}>
                  Updated {formatLastUpdated(lastUpdated)}
                </Text>
              )}
            </View>
            {!isLoadingRecs && (
              <Pressable onPress={handleRefresh} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </Pressable>
            )}
          </View>

          {isLoadingRecs ? (
            <View style={styles.recsLoading}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.recsLoadingText}>
                Getting AI recommendations...
              </Text>
            </View>
          ) : recsError ? (
            <View style={styles.recsError}>
              <Text style={styles.recsErrorText}>{recsError}</Text>
              <Pressable onPress={handleRefresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          ) : recommendations.length > 0 ? (
            recommendations.map((fly, index) => (
              <FlyCard key={fly.fly_id || index} fly={fly} rank={index + 1} />
            ))
          ) : (
            <Text style={styles.noRecs}>
              No recommendations available. Pull down to refresh.
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.addToTripButton}>
            <Text style={styles.addToTripButtonText}>Add to Trip</Text>
          </Pressable>
          <Pressable
            style={[styles.favoriteButton, isFav && styles.favoriteButtonActive]}
            onPress={handleToggleFavorite}
            disabled={isTogglingFav || !user}
          >
            {isTogglingFav ? (
              <ActivityIndicator size="small" color={isFav ? '#ffffff' : '#374151'} />
            ) : (
              <Text style={[styles.favoriteButtonText, isFav && styles.favoriteButtonTextActive]}>
                {!user ? 'Sign in to Save' : isFav ? 'Saved to Favorites' : 'Save to Favorites'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Fly recommendation card component
function FlyCard({ fly, rank }: { fly: FlyRecommendation; rank: number }) {
  return (
    <View style={styles.flyCard}>
      <View style={styles.flyHeader}>
        <Text style={styles.flyRank}>#{rank}</Text>
        <View style={styles.flyInfo}>
          <Text style={styles.flyName}>{fly.fly_name}</Text>
          <Text style={styles.flyMeta}>
            {fly.fly_type} • Size {fly.size}
          </Text>
        </View>
        <View style={[
          styles.confidence,
          fly.confidence >= 80 && styles.confidenceHigh,
          fly.confidence >= 60 && fly.confidence < 80 && styles.confidenceMed,
          fly.confidence < 60 && styles.confidenceLow,
        ]}>
          <Text style={[
            styles.confidenceValue,
            fly.confidence >= 80 && styles.confidenceValueHigh,
            fly.confidence >= 60 && fly.confidence < 80 && styles.confidenceValueMed,
            fly.confidence < 60 && styles.confidenceValueLow,
          ]}>
            {fly.confidence}%
          </Text>
        </View>
      </View>
      <Text style={styles.flyReasoning}>{fly.reasoning}</Text>
      <View style={styles.flyTechnique}>
        <Text style={styles.techniqueLabel}>Technique:</Text>
        <Text style={styles.techniqueValue}>{fly.technique}</Text>
      </View>
    </View>
  );
}

function formatWaterType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  conditionsSummary: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  refreshButtonText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  recsLoading: {
    padding: 32,
    alignItems: 'center',
  },
  recsLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  recsError: {
    padding: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignItems: 'center',
  },
  recsErrorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc2626',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  noRecs: {
    padding: 24,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceHigh: {
    backgroundColor: '#dcfce7',
  },
  confidenceMed: {
    backgroundColor: '#fef3c7',
  },
  confidenceLow: {
    backgroundColor: '#fee2e2',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceValueHigh: {
    color: '#16a34a',
  },
  confidenceValueMed: {
    color: '#ca8a04',
  },
  confidenceValueLow: {
    color: '#dc2626',
  },
  flyReasoning: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  flyTechnique: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  techniqueLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  techniqueValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
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
