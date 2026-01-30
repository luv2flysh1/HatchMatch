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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWaterStore } from '../../stores/waterStore';
import { useRecommendationStore, FishingReport } from '../../stores/recommendationStore';
import { useAuthStore } from '../../stores/authStore';
import { useFlyBoxStore } from '../../stores/flyBoxStore';
import { getRegulationsUrl, hasRegulationsInfo } from '../../utils/fishingRegulations';
import { colors, gradients, shadows, spacing, borderRadius, layout } from '../../theme';
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
    await getRecommendations(id, true);
    setIsRefreshing(false);
  }, [id, getRecommendations]);

  const handleToggleFavorite = async () => {
    if (!user) {
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

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodedName}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedName})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.openURL(url).catch(() => {
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
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
          <Text style={styles.loadingText}>Loading water body...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (waterError || !selectedWater) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error.main} />
          </View>
          <Text style={styles.errorText}>{waterError || 'Water body not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Hero Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={gradients.river}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.waterTypeIconContainer}>
                <MaterialCommunityIcons
                  name={getWaterTypeIcon(selectedWater.type)}
                  size={32}
                  color={colors.text.inverse}
                />
              </View>
              <Text style={styles.waterName}>{selectedWater.name}</Text>
              <View style={styles.waterMetaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>{formatWaterType(selectedWater.type)}</Text>
                </View>
                <Text style={styles.waterLocation}>
                  {selectedWater.state}
                  {selectedWater.city && ` | ${selectedWater.city}`}
                </Text>
              </View>
              {selectedWater.species && selectedWater.species.length > 0 && (
                <View style={styles.speciesRow}>
                  <Ionicons name="fish-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.speciesText}>
                    {selectedWater.species.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.quickActionButton,
              styles.directionsButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGetDirections}
          >
            <Ionicons name="navigate" size={20} color={colors.text.inverse} />
            <Text style={styles.quickActionText}>Directions</Text>
          </Pressable>
          {selectedWater.state && hasRegulationsInfo(selectedWater.state) && (
            <Pressable
              style={({ pressed }) => [
                styles.quickActionButton,
                styles.regulationsButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleViewRegulations}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.accent[700]} />
              <Text style={styles.regulationsButtonText}>Regulations</Text>
            </Pressable>
          )}
        </View>

        {/* Description */}
        {selectedWater.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{selectedWater.description}</Text>
          </View>
        )}

        {/* Fishing Report Section */}
        {fishingReport && (
          <View style={styles.fishingReportSection}>
            <View style={styles.fishingReportHeader}>
              <View style={styles.reportTitleRow}>
                <Ionicons name="newspaper-outline" size={18} color={colors.info.main} />
                <Text style={styles.fishingReportTitle}>Current Fishing Report</Text>
              </View>
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
                <View style={styles.hotFliesBadge}>
                  <Ionicons name="flame" size={12} color={colors.warning.main} />
                  <Text style={styles.hotFliesLabel}>Hot Flies</Text>
                </View>
                <Text style={styles.fishingReportFliesList}>
                  {fishingReport.extracted_flies.join(', ')}
                </Text>
              </View>
            )}
            {fishingReport.conditions && Object.keys(fishingReport.conditions).length > 0 && (
              <View style={styles.fishingReportConditions}>
                {fishingReport.conditions.water_temp && (
                  <View style={styles.conditionChip}>
                    <Ionicons name="thermometer-outline" size={12} color={colors.info.main} />
                    <Text style={styles.conditionChipText}>
                      {fishingReport.conditions.water_temp}
                    </Text>
                  </View>
                )}
                {fishingReport.conditions.water_clarity && (
                  <View style={styles.conditionChip}>
                    <Ionicons name="eye-outline" size={12} color={colors.info.main} />
                    <Text style={styles.conditionChipText}>
                      {fishingReport.conditions.water_clarity}
                    </Text>
                  </View>
                )}
                {fishingReport.conditions.water_level && (
                  <View style={styles.conditionChip}>
                    <Ionicons name="water-outline" size={12} color={colors.info.main} />
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

        {/* Fly Recommendations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="hook" size={20} color={colors.primary[500]} />
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
            </View>
            {!isLoadingRecs && (
              <Pressable
                onPress={handleRefresh}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons name="refresh" size={16} color={colors.primary[500]} />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </Pressable>
            )}
          </View>

          {isLoadingRecs ? (
            <View style={styles.recsLoading}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <Text style={styles.recsLoadingText}>
                Getting AI recommendations...
              </Text>
            </View>
          ) : recsError ? (
            <View style={styles.recsError}>
              <Ionicons name="cloud-offline-outline" size={32} color={colors.error.main} />
              <Text style={styles.recsErrorText}>{recsError}</Text>
              <Pressable
                onPress={handleRefresh}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          ) : recommendations.length > 0 ? (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.createBoxButton,
                  boxCreated && styles.createBoxButtonDone,
                  pressed && !boxCreated && styles.buttonPressed,
                ]}
                onPress={handleCreateBoxForMe}
                disabled={boxCreated}
              >
                <LinearGradient
                  colors={boxCreated ? [colors.success.light, colors.success.light] : gradients.primaryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBoxButtonGradient}
                >
                  <Ionicons
                    name={boxCreated ? 'checkmark-circle' : 'sparkles'}
                    size={20}
                    color={boxCreated ? colors.success.main : colors.text.inverse}
                  />
                  <Text style={[styles.createBoxButtonText, boxCreated && styles.createBoxButtonTextDone]}>
                    {boxCreated ? 'Added to Fly Box' : 'Create Box for Me'}
                  </Text>
                </LinearGradient>
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
            <View style={styles.noRecsContainer}>
              <Ionicons name="fish-outline" size={40} color={colors.neutral[300]} />
              <Text style={styles.noRecs}>
                No recommendations available. Pull down to refresh.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.addToTripButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={gradients.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addToTripButtonGradient}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.text.inverse} />
              <Text style={styles.addToTripButtonText}>Add to Trip</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.favoriteButton,
              isFav && styles.favoriteButtonActive,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleToggleFavorite}
            disabled={isTogglingFav || !user}
          >
            {isTogglingFav ? (
              <ActivityIndicator size="small" color={isFav ? colors.text.inverse : colors.text.secondary} />
            ) : (
              <>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFav ? colors.text.inverse : colors.text.secondary}
                />
                <Text style={[styles.favoriteButtonText, isFav && styles.favoriteButtonTextActive]}>
                  {!user ? 'Sign in to Save' : isFav ? 'Saved' : 'Save to Favorites'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
        <View style={styles.flyRankContainer}>
          <Text style={styles.flyRank}>#{rank}</Text>
        </View>
        {fly.image_url ? (
          <Image
            source={{ uri: fly.image_url }}
            style={styles.flyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.flyImagePlaceholder}>
            <MaterialCommunityIcons
              name={getFlyTypeIcon(fly.fly_type)}
              size={24}
              color={colors.primary[400]}
            />
          </View>
        )}
        <View style={styles.flyInfo}>
          <Text style={styles.flyName}>{fly.fly_name}</Text>
          <Text style={styles.flyMeta}>
            {fly.fly_type} | Size {fly.size}
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
          <Ionicons name="hand-right-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.techniqueValue}>{fly.technique}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addToBoxButton,
            isInBox && styles.addToBoxButtonDone,
            pressed && !isInBox && { opacity: 0.8 },
          ]}
          onPress={onAddToBox}
          disabled={isInBox}
        >
          <Ionicons
            name={isInBox ? 'checkmark' : 'add'}
            size={14}
            color={isInBox ? colors.success.dark : colors.success.main}
          />
          <Text style={[styles.addToBoxButtonText, isInBox && styles.addToBoxButtonTextDone]}>
            {isInBox ? 'In Box' : 'Add'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getWaterTypeIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type.toLowerCase()) {
    case 'river':
    case 'stream':
      return 'waves';
    case 'lake':
    case 'reservoir':
      return 'waves';
    case 'creek':
      return 'water';
    default:
      return 'water-outline';
  }
}

function getFlyTypeIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type.toLowerCase()) {
    case 'dry':
      return 'feather';
    case 'nymph':
      return 'hook';
    case 'streamer':
      return 'fish';
    case 'emerger':
      return 'water-outline';
    case 'wet':
      return 'waves';
    case 'terrestrial':
      return 'bug';
    default:
      return 'hook';
  }
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
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  loadingIconContainer: {
    marginBottom: spacing[4],
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  errorIconContainer: {
    marginBottom: spacing[4],
  },
  errorText: {
    fontSize: 16,
    color: colors.error.main,
    textAlign: 'center',
  },
  // Hero Header
  header: {
    marginBottom: spacing[4],
  },
  headerGradient: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
    borderBottomLeftRadius: borderRadius['3xl'],
    borderBottomRightRadius: borderRadius['3xl'],
  },
  headerContent: {
    alignItems: 'center',
  },
  waterTypeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  waterName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.inverse,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  waterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  metaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
  waterLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  speciesText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: -spacing[6],
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
    ...shadows.md,
  },
  directionsButton: {
    backgroundColor: colors.secondary[500],
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  regulationsButton: {
    backgroundColor: colors.accent[100],
    borderWidth: 1,
    borderColor: colors.accent[500],
  },
  regulationsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent[700],
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  // Description
  descriptionCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  // Fishing Report
  fishingReportSection: {
    backgroundColor: colors.info.light,
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing[4],
    padding: spacing[4],
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.info.main,
  },
  fishingReportHeader: {
    marginBottom: spacing[3],
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  fishingReportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info.dark,
  },
  fishingReportSource: {
    fontSize: 12,
    color: colors.info.main,
    marginTop: spacing[0.5],
    marginLeft: spacing[6],
  },
  fishingReportNotes: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  fishingReportFlies: {
    marginBottom: spacing[3],
  },
  hotFliesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[1],
  },
  hotFliesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning.main,
  },
  fishingReportFliesList: {
    fontSize: 13,
    color: colors.text.secondary,
    marginLeft: spacing[5],
  },
  fishingReportConditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.chip,
    gap: spacing[1],
  },
  conditionChipText: {
    fontSize: 12,
    color: colors.info.main,
    fontWeight: '500',
  },
  fishingReportDate: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  // Section
  section: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  conditionsSummary: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[50],
    gap: spacing[1],
  },
  refreshButtonText: {
    fontSize: 13,
    color: colors.primary[500],
    fontWeight: '500',
  },
  recsLoading: {
    padding: spacing[8],
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
  recsLoadingText: {
    marginTop: spacing[3],
    fontSize: 14,
    color: colors.text.tertiary,
  },
  recsError: {
    padding: spacing[6],
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.card,
    alignItems: 'center',
  },
  recsErrorText: {
    fontSize: 14,
    color: colors.error.main,
    textAlign: 'center',
    marginVertical: spacing[3],
  },
  retryButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.error.main,
    borderRadius: borderRadius.base,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  noRecsContainer: {
    padding: spacing[8],
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
  noRecs: {
    marginTop: spacing[3],
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  // Create Box Button
  createBoxButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  createBoxButtonDone: {
    ...shadows.none,
  },
  createBoxButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3.5],
    gap: spacing[2],
  },
  createBoxButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
  createBoxButtonTextDone: {
    color: colors.success.main,
  },
  // Fly Card
  flyCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.md,
  },
  flyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  flyRankContainer: {
    width: 32,
    alignItems: 'center',
  },
  flyRank: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[500],
  },
  flyImage: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.base,
    marginRight: spacing[3],
    backgroundColor: colors.neutral[100],
  },
  flyImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.base,
    marginRight: spacing[3],
    backgroundColor: colors.background.water,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyInfo: {
    flex: 1,
  },
  flyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  flyMeta: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  confidence: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.chip,
  },
  confidenceHigh: {
    backgroundColor: colors.success.light,
  },
  confidenceMed: {
    backgroundColor: colors.warning.light,
  },
  confidenceLow: {
    backgroundColor: colors.error.light,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  confidenceValueHigh: {
    color: colors.success.main,
  },
  confidenceValueMed: {
    color: colors.warning.main,
  },
  confidenceValueLow: {
    color: colors.error.main,
  },
  flyReasoning: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  flyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  flyTechnique: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    flex: 1,
  },
  techniqueValue: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  addToBoxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.light,
    borderWidth: 1,
    borderColor: colors.success.main,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    gap: spacing[1],
  },
  addToBoxButtonDone: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  addToBoxButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success.main,
  },
  addToBoxButtonTextDone: {
    color: colors.success.dark,
  },
  // Actions
  actions: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  addToTripButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  addToTripButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  addToTripButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  favoriteButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  favoriteButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButtonTextActive: {
    color: colors.text.inverse,
  },
});
