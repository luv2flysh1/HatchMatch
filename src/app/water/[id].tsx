import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWaterStore } from '../../stores/waterStore';
import { useRecommendationStore, FishingReport } from '../../stores/recommendationStore';
import { useAuthStore } from '../../stores/authStore';
import { useFlyBoxStore } from '../../stores/flyBoxStore';
import { getRegulationsUrl, hasRegulationsInfo } from '../../utils/fishingRegulations';
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
    fishingReport,
    lastUpdated,
    isLoading: isLoadingRecs,
    error: recsError,
    getRecommendations,
    clearRecommendations,
  } = useRecommendationStore();

  const { addFly, isInBox } = useFlyBoxStore();

  const [isFav, setIsFav] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [boxCreated, setBoxCreated] = useState(false);

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

  const handleGetDirections = useCallback(() => {
    if (!selectedWater) return;

    const { latitude, longitude, name } = selectedWater;
    const encodedName = encodeURIComponent(name);

    // Use platform-specific URL schemes for best native experience
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodedName}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedName})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web URL if native scheme fails
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  }, [selectedWater]);

  const handleViewRegulations = useCallback(() => {
    if (!selectedWater?.state) return;

    const regulationsUrl = getRegulationsUrl(selectedWater.state);
    if (regulationsUrl) {
      Linking.openURL(regulationsUrl).catch((err) => {
        console.error('Failed to open regulations URL:', err);
      });
    }
  }, [selectedWater]);

  const handleCreateBoxForMe = useCallback(() => {
    if (!selectedWater || recommendations.length === 0) return;

    // Add top recommendations with sensible quantities based on confidence
    const topFlies = recommendations.slice(0, 6);
    topFlies.forEach((fly) => {
      const quantity = fly.confidence >= 80 ? 3 : fly.confidence >= 60 ? 2 : 1;
      addFly({
        flyName: fly.fly_name,
        flyType: fly.fly_type,
        size: fly.size,
        quantity,
        addedFrom: selectedWater.name,
      });
    });
    setBoxCreated(true);
  }, [selectedWater, recommendations, addFly]);

  const handleAddFlyToBox = useCallback((fly: FlyRecommendation) => {
    if (!selectedWater) return;
    addFly({
      flyName: fly.fly_name,
      flyType: fly.fly_type,
      size: fly.size,
      quantity: 1,
      addedFrom: selectedWater.name,
    });
  }, [selectedWater, addFly]);

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
          <Pressable style={styles.directionsButton} onPress={handleGetDirections}>
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </Pressable>
          {selectedWater.state && hasRegulationsInfo(selectedWater.state) && (
            <Pressable style={styles.regulationsButton} onPress={handleViewRegulations}>
              <Text style={styles.regulationsButtonText}>
                View {selectedWater.state} Fishing Regulations
              </Text>
            </Pressable>
          )}
        </View>

        {/* Fishing Report Section */}
        {fishingReport && (
          <View style={styles.fishingReportSection}>
            <View style={styles.fishingReportHeader}>
              <Text style={styles.fishingReportTitle}>Current Fishing Report</Text>
              <Text style={styles.fishingReportSource}>
                From {fishingReport.source_name}
              </Text>
            </View>
            {fishingReport.effectiveness_notes && (
              <Text style={styles.fishingReportNotes}>
                {fishingReport.effectiveness_notes}
              </Text>
            )}
            {fishingReport.extracted_flies && fishingReport.extracted_flies.length > 0 && (
              <View style={styles.fishingReportFlies}>
                <Text style={styles.fishingReportFliesLabel}>Hot Flies:</Text>
                <Text style={styles.fishingReportFliesList}>
                  {fishingReport.extracted_flies.join(', ')}
                </Text>
              </View>
            )}
            {fishingReport.conditions && Object.keys(fishingReport.conditions).length > 0 && (
              <View style={styles.fishingReportConditions}>
                {fishingReport.conditions.water_temp && (
                  <View style={styles.conditionChip}>
                    <Text style={styles.conditionChipText}>
                      Water: {fishingReport.conditions.water_temp}
                    </Text>
                  </View>
                )}
                {fishingReport.conditions.water_clarity && (
                  <View style={styles.conditionChip}>
                    <Text style={styles.conditionChipText}>
                      {fishingReport.conditions.water_clarity}
                    </Text>
                  </View>
                )}
                {fishingReport.conditions.water_level && (
                  <View style={styles.conditionChip}>
                    <Text style={styles.conditionChipText}>
                      {fishingReport.conditions.water_level}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <Text style={styles.fishingReportDate}>
              Updated {formatReportDate(fishingReport.report_date)}
            </Text>
          </View>
        )}

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
            <>
              <Pressable
                style={[styles.createBoxButton, boxCreated && styles.createBoxButtonDone]}
                onPress={handleCreateBoxForMe}
                disabled={boxCreated}
              >
                <Text style={[styles.createBoxButtonText, boxCreated && styles.createBoxButtonTextDone]}>
                  {boxCreated ? 'Added to Fly Box' : 'Create Box for Me'}
                </Text>
              </Pressable>
              {recommendations.map((fly, index) => (
                <FlyCard
                  key={fly.fly_id || index}
                  fly={fly}
                  rank={index + 1}
                  onAddToBox={() => handleAddFlyToBox(fly)}
                  isInBox={isInBox(fly.fly_name, fly.size)}
                />
              ))}
            </>
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
function FlyCard({
  fly,
  rank,
  onAddToBox,
  isInBox,
}: {
  fly: FlyRecommendation;
  rank: number;
  onAddToBox: () => void;
  isInBox: boolean;
}) {
  return (
    <View style={styles.flyCard}>
      <View style={styles.flyHeader}>
        <Text style={styles.flyRank}>#{rank}</Text>
        {fly.image_url ? (
          <Image
            source={{ uri: fly.image_url }}
            style={styles.flyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.flyImagePlaceholder}>
            <Text style={styles.flyImagePlaceholderText}>
              {fly.fly_type.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
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
      <View style={styles.flyCardFooter}>
        <View style={styles.flyTechnique}>
          <Text style={styles.techniqueLabel}>Technique:</Text>
          <Text style={styles.techniqueValue}>{fly.technique}</Text>
        </View>
        <Pressable
          style={[styles.addToBoxButton, isInBox && styles.addToBoxButtonDone]}
          onPress={onAddToBox}
        >
          <Text style={[styles.addToBoxButtonText, isInBox && styles.addToBoxButtonTextDone]}>
            {isInBox ? 'In Box' : '+ Add'}
          </Text>
        </Pressable>
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

function formatReportDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  } catch {
    return 'recently';
  }
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
  directionsButton: {
    marginTop: 16,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  directionsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  regulationsButton: {
    marginTop: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  regulationsButtonText: {
    color: '#92400e',
    fontSize: 15,
    fontWeight: '600',
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
  flyImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  flyImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyImagePlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
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
  flyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  flyTechnique: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  addToBoxButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addToBoxButtonDone: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  addToBoxButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  addToBoxButtonTextDone: {
    color: '#15803d',
  },
  createBoxButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  createBoxButtonDone: {
    backgroundColor: '#dcfce7',
  },
  createBoxButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  createBoxButtonTextDone: {
    color: '#16a34a',
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
  // Fishing Report Styles
  fishingReportSection: {
    backgroundColor: '#eff6ff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  fishingReportHeader: {
    marginBottom: 12,
  },
  fishingReportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  fishingReportSource: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 2,
  },
  fishingReportNotes: {
    fontSize: 14,
    color: '#1e3a5f',
    lineHeight: 20,
    marginBottom: 12,
  },
  fishingReportFlies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fishingReportFliesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    marginRight: 6,
  },
  fishingReportFliesList: {
    fontSize: 13,
    color: '#1e3a5f',
    flex: 1,
  },
  fishingReportConditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  conditionChip: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionChipText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  fishingReportDate: {
    fontSize: 11,
    color: '#6b7280',
  },
});
