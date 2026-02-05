import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTripStore } from '../../stores/tripStore';
import { useFlyBoxStore } from '../../stores/flyBoxStore';
import { colors, spacing, borderRadius, shadows, gradients, layout } from '../../theme';
import type { TripWater, TripFlyRecommendation } from '../../types/database';

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  if (!endDate) {
    return start.toLocaleDateString('en-US', options);
  }

  const end = new Date(endDate + 'T00:00:00');
  const shortOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', shortOpts)} - ${end.toLocaleDateString('en-US', options)}`;
  }

  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

function getWaterTypeIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type?.toLowerCase()) {
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
  switch (type?.toLowerCase()) {
    case 'dry': return 'feather';
    case 'nymph': return 'hook';
    case 'streamer': return 'fish';
    case 'emerger': return 'water-outline';
    case 'wet': return 'waves';
    default: return 'hook';
  }
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    currentTrip, isLoading, error,
    tripRecommendations, isLoadingRecs, recsError, recsProgress,
    fetchTrip, updateTrip, deleteTrip, removeWaterFromTrip,
    fetchTripRecommendations, clearTripRecommendations, clearCurrentTrip,
  } = useTripStore();

  const { addFly, isInBox } = useFlyBoxStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [boxAdded, setBoxAdded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrip(id);
    }
    return () => {
      clearCurrentTrip();
    };
  }, [id]);

  useEffect(() => {
    if (currentTrip?.notes !== undefined) {
      setNotesText(currentTrip.notes || '');
    }
  }, [currentTrip?.notes]);

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    setIsRefreshing(true);
    await fetchTrip(id);
    setIsRefreshing(false);
  }, [id, fetchTrip]);

  const handleDeleteTrip = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(id);
            router.back();
          },
        },
      ],
    );
  };

  const handleRemoveWater = (waterBodyId: string, waterName: string) => {
    Alert.alert(
      'Remove Water',
      `Remove ${waterName} from this trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeWaterFromTrip(id, waterBodyId);
            // Clear recommendations since they're now stale
            clearTripRecommendations();
          },
        },
      ],
    );
  };

  const handleSaveNotes = async () => {
    await updateTrip(id, { notes: notesText.trim() || null });
    setIsEditingNotes(false);
  };

  const handleAddAllToBox = useCallback(() => {
    if (tripRecommendations.length === 0 || !currentTrip) return;

    const topFlies = tripRecommendations.slice(0, 8);
    topFlies.forEach((fly) => {
      const quantity = fly.waters.length >= 2 ? 3 : fly.confidence >= 80 ? 2 : 1;
      addFly({
        flyName: fly.fly_name,
        flyType: fly.fly_type,
        size: fly.size,
        quantity,
        addedFrom: currentTrip.name,
      });
    });
    setBoxAdded(true);
  }, [tripRecommendations, currentTrip, addFly]);

  const handleAddFlyToBox = useCallback((fly: TripFlyRecommendation) => {
    if (!currentTrip) return;
    addFly({
      flyName: fly.fly_name,
      flyType: fly.fly_type,
      size: fly.size,
      quantity: 1,
      addedFrom: currentTrip.name,
    });
  }, [currentTrip, addFly]);

  if (isLoading && !currentTrip) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentTrip) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error.main} />
          <Text style={styles.errorText}>{error || 'Trip not found'}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const waters = currentTrip.trip_waters || [];

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
        <LinearGradient
          colors={gradients.forest}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTitleRow}>
              <Text style={styles.tripName}>{currentTrip.name}</Text>
              <Pressable
                style={styles.editIconButton}
                onPress={() => router.push(`/trip/edit?id=${id}`)}
              >
                <Ionicons name="pencil" size={18} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </View>
            <View style={styles.heroMetaRow}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroDates}>
                {formatDateRange(currentTrip.start_date, currentTrip.end_date)}
              </Text>
            </View>
            {waters.length > 0 && (
              <View style={styles.heroMetaRow}>
                <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroWaterCount}>
                  {waters.length} {waters.length === 1 ? 'water' : 'waters'}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Waters Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waters</Text>

          {waters.map((tw: TripWater) => {
            const water = tw.water_body;
            if (!water) return null;

            return (
              <Pressable
                key={tw.id}
                style={styles.waterCard}
                onPress={() => router.push(`/water/${tw.water_body_id}`)}
              >
                <View style={styles.waterCardLeft}>
                  <View style={styles.waterIconContainer}>
                    <MaterialCommunityIcons
                      name={getWaterTypeIcon(water.type)}
                      size={20}
                      color={colors.primary[500]}
                    />
                  </View>
                  <View style={styles.waterCardInfo}>
                    <Text style={styles.waterName}>{water.name}</Text>
                    <View style={styles.waterMeta}>
                      <Text style={styles.waterType}>
                        {water.type.charAt(0).toUpperCase() + water.type.slice(1)}
                      </Text>
                      <Text style={styles.waterState}>{water.state}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.waterCardActions}>
                  <Pressable
                    style={styles.removeWaterButton}
                    onPress={() => handleRemoveWater(tw.water_body_id, water.name)}
                  >
                    <Ionicons name="close" size={18} color={colors.error.main} />
                  </Pressable>
                  <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
                </View>
              </Pressable>
            );
          })}

          <Pressable
            style={styles.addWaterButton}
            onPress={() => router.push(`/trip/add-water?tripId=${id}`)}
          >
            <Ionicons name="add" size={20} color={colors.primary[500]} />
            <Text style={styles.addWaterButtonText}>Add Water</Text>
          </Pressable>
        </View>

        {/* Trip Fly Selection */}
        <View style={styles.section}>
          <View style={styles.recsSectionHeader}>
            <View style={styles.recsTitleRow}>
              <MaterialCommunityIcons name="hook" size={22} color={colors.accent[500]} />
              <View>
                <Text style={styles.sectionTitle}>Trip Fly Selection</Text>
                <Text style={styles.recsSubtitle}>
                  What to bring for this trip
                </Text>
              </View>
            </View>
          </View>

          {/* Get Recommendations Button */}
          {tripRecommendations.length === 0 && !isLoadingRecs && (
            <Pressable
              style={({ pressed }) => [
                styles.getRecsButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={fetchTripRecommendations}
              disabled={waters.length === 0}
            >
              <LinearGradient
                colors={waters.length > 0 ? gradients.accentButton : [colors.neutral[300], colors.neutral[400]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.getRecsButtonGradient}
              >
                <MaterialCommunityIcons name="auto-fix" size={20} color={colors.text.inverse} />
                <Text style={styles.getRecsButtonText}>
                  {waters.length === 0
                    ? 'Add waters first'
                    : `Get Fly Recommendations for ${waters.length} ${waters.length === 1 ? 'Water' : 'Waters'}`
                  }
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {/* Loading State */}
          {isLoadingRecs && (
            <View style={styles.recsLoading}>
              <ActivityIndicator size="small" color={colors.accent[500]} />
              <Text style={styles.recsLoadingText}>
                {recsProgress
                  ? `Analyzing ${recsProgress.done} of ${recsProgress.total} waters...`
                  : 'Getting recommendations...'
                }
              </Text>
              {recsProgress && (
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${(recsProgress.done / recsProgress.total) * 100}%` },
                  ]} />
                </View>
              )}
            </View>
          )}

          {/* Error State */}
          {recsError && !isLoadingRecs && (
            <View style={styles.recsError}>
              <Ionicons name="cloud-offline-outline" size={28} color={colors.error.main} />
              <Text style={styles.recsErrorText}>{recsError}</Text>
              <Pressable
                style={styles.retryButton}
                onPress={fetchTripRecommendations}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          )}

          {/* Recommendations List */}
          {tripRecommendations.length > 0 && (
            <>
              {/* Add All to Fly Box */}
              <Pressable
                style={({ pressed }) => [
                  styles.addAllToBoxButton,
                  boxAdded && styles.addAllToBoxButtonDone,
                  pressed && !boxAdded && { opacity: 0.9 },
                ]}
                onPress={handleAddAllToBox}
                disabled={boxAdded}
              >
                <LinearGradient
                  colors={boxAdded
                    ? [colors.success.light, colors.success.light]
                    : gradients.secondaryButton
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addAllToBoxGradient}
                >
                  <Ionicons
                    name={boxAdded ? 'checkmark-circle' : 'briefcase-outline'}
                    size={20}
                    color={boxAdded ? colors.success.main : colors.text.inverse}
                  />
                  <Text style={[
                    styles.addAllToBoxText,
                    boxAdded && styles.addAllToBoxTextDone,
                  ]}>
                    {boxAdded ? 'Added to Fly Box' : 'Add All to Fly Box'}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Refresh Recs Button */}
              <View style={styles.recsRefreshRow}>
                <Text style={styles.recsCount}>
                  {tripRecommendations.length} {tripRecommendations.length === 1 ? 'fly' : 'flies'} recommended
                </Text>
                <Pressable
                  style={styles.refreshRecsButton}
                  onPress={() => {
                    clearTripRecommendations();
                    setBoxAdded(false);
                    fetchTripRecommendations();
                  }}
                >
                  <Ionicons name="refresh" size={14} color={colors.primary[500]} />
                  <Text style={styles.refreshRecsText}>Refresh</Text>
                </Pressable>
              </View>

              {/* Fly Cards */}
              {tripRecommendations.map((fly, index) => (
                <TripFlyCard
                  key={`${fly.fly_name}-${fly.size}`}
                  fly={fly}
                  rank={index + 1}
                  onAddToBox={() => handleAddFlyToBox(fly)}
                  alreadyInBox={isInBox(fly.fly_name, fly.size)}
                />
              ))}
            </>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.notesTitleRow}>
            <Text style={styles.sectionTitle}>Notes</Text>
            {!isEditingNotes && (
              <Pressable onPress={() => setIsEditingNotes(true)}>
                <Ionicons name="pencil-outline" size={16} color={colors.primary[500]} />
              </Pressable>
            )}
          </View>

          {isEditingNotes ? (
            <View>
              <TextInput
                style={styles.notesInput}
                value={notesText}
                onChangeText={setNotesText}
                placeholder="Add notes about your trip..."
                placeholderTextColor={colors.neutral[400]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.notesActions}>
                <Pressable style={styles.notesSaveButton} onPress={handleSaveNotes}>
                  <Text style={styles.notesSaveText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.notesCancelButton}
                  onPress={() => {
                    setNotesText(currentTrip.notes || '');
                    setIsEditingNotes(false);
                  }}
                >
                  <Text style={styles.notesCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.notesDisplay}
              onPress={() => setIsEditingNotes(true)}
            >
              <Text style={styles.notesText}>
                {currentTrip.notes || 'Tap to add notes...'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.editTripButton}
            onPress={() => router.push(`/trip/edit?id=${id}`)}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.editTripButtonText}>Edit Trip</Text>
          </Pressable>

          <Pressable
            style={styles.deleteTripButton}
            onPress={handleDeleteTrip}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error.main} />
            <Text style={styles.deleteTripButtonText}>Delete Trip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Trip Fly Recommendation Card
function TripFlyCard({
  fly,
  rank,
  onAddToBox,
  alreadyInBox,
}: {
  fly: TripFlyRecommendation;
  rank: number;
  onAddToBox: () => void;
  alreadyInBox: boolean;
}) {
  const isMultiWater = fly.waters.length > 1;

  return (
    <View style={[styles.flyCard, isMultiWater && styles.flyCardMultiWater]}>
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
              size={22}
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

      {/* Water attribution badges */}
      <View style={styles.waterBadges}>
        {fly.waters.map((w) => (
          <View key={w} style={[
            styles.waterBadge,
            isMultiWater && styles.waterBadgeHighlight,
          ]}>
            <Ionicons name="water-outline" size={10} color={
              isMultiWater ? colors.accent[600] : colors.text.tertiary
            } />
            <Text style={[
              styles.waterBadgeText,
              isMultiWater && styles.waterBadgeTextHighlight,
            ]}>
              {w}
            </Text>
          </View>
        ))}
        {isMultiWater && (
          <View style={styles.multiWaterLabel}>
            <Ionicons name="star" size={10} color={colors.accent[500]} />
            <Text style={styles.multiWaterLabelText}>Must-have</Text>
          </View>
        )}
      </View>

      <Text style={styles.flyReasoning}>{fly.reasoning}</Text>

      <View style={styles.flyCardFooter}>
        <View style={styles.flyTechnique}>
          <Ionicons name="hand-right-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.techniqueValue}>{fly.technique}</Text>
        </View>
        <Pressable
          style={[
            styles.addToBoxBtn,
            alreadyInBox && styles.addToBoxBtnDone,
          ]}
          onPress={onAddToBox}
          disabled={alreadyInBox}
        >
          <Ionicons
            name={alreadyInBox ? 'checkmark' : 'add'}
            size={14}
            color={alreadyInBox ? colors.success.dark : colors.success.main}
          />
          <Text style={[styles.addToBoxBtnText, alreadyInBox && styles.addToBoxBtnTextDone]}>
            {alreadyInBox ? 'In Box' : 'Add'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
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
  loadingText: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing[3],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  errorText: {
    fontSize: 16,
    color: colors.error.main,
    textAlign: 'center',
    marginTop: spacing[3],
  },
  backButton: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2.5],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.button,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  // Hero
  heroHeader: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
    borderBottomLeftRadius: borderRadius['3xl'],
    borderBottomRightRadius: borderRadius['3xl'],
  },
  heroContent: {
    gap: spacing[2],
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.inverse,
    flex: 1,
    marginRight: spacing[3],
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  heroDates: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  heroWaterCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  // Sections
  section: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing[5],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  // Water card
  waterCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[3.5],
    marginBottom: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  waterCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing[3],
  },
  waterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.water,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterCardInfo: {
    flex: 1,
  },
  waterName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  waterMeta: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[0.5],
  },
  waterType: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  waterState: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  waterCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  removeWaterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWaterButton: {
    borderRadius: borderRadius.card,
    padding: spacing[3.5],
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary[300],
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  addWaterButtonText: {
    color: colors.primary[500],
    fontSize: 15,
    fontWeight: '600',
  },
  // Trip Fly Selection
  recsSectionHeader: {
    marginBottom: spacing[1],
  },
  recsTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  recsSubtitle: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: spacing[0.5],
    marginBottom: spacing[2],
  },
  getRecsButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  getRecsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  getRecsButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Loading
  recsLoading: {
    padding: spacing[6],
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
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    marginTop: spacing[3],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 2,
  },
  // Error
  recsError: {
    padding: spacing[5],
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.card,
    alignItems: 'center',
  },
  recsErrorText: {
    fontSize: 14,
    color: colors.error.main,
    textAlign: 'center',
    marginVertical: spacing[2],
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
    fontSize: 13,
  },
  // Add All to Box
  addAllToBoxButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing[3],
    ...shadows.md,
  },
  addAllToBoxButtonDone: {
    ...shadows.none,
  },
  addAllToBoxGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3.5],
    gap: spacing[2],
  },
  addAllToBoxText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
  addAllToBoxTextDone: {
    color: colors.success.main,
  },
  // Refresh / count
  recsRefreshRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  recsCount: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  refreshRecsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[50],
  },
  refreshRecsText: {
    fontSize: 13,
    color: colors.primary[500],
    fontWeight: '500',
  },
  // Fly Card
  flyCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.md,
  },
  flyCardMultiWater: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent[500],
  },
  flyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  flyRankContainer: {
    width: 30,
    alignItems: 'center',
  },
  flyRank: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary[500],
  },
  flyImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.base,
    marginRight: spacing[3],
    backgroundColor: colors.neutral[100],
  },
  flyImagePlaceholder: {
    width: 48,
    height: 48,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  flyMeta: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
    marginTop: 1,
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
    fontSize: 13,
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
  // Water badges
  waterBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
    marginBottom: spacing[2],
  },
  waterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.chip,
  },
  waterBadgeHighlight: {
    backgroundColor: colors.accent[50],
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  waterBadgeText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  waterBadgeTextHighlight: {
    color: colors.accent[700],
  },
  multiWaterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
  },
  multiWaterLabelText: {
    fontSize: 11,
    color: colors.accent[500],
    fontWeight: '600',
  },
  flyReasoning: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    marginBottom: spacing[3],
  },
  flyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2.5],
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
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  addToBoxBtn: {
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
  addToBoxBtnDone: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  addToBoxBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success.main,
  },
  addToBoxBtnTextDone: {
    color: colors.success.dark,
  },
  // Notes
  notesTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  notesDisplay: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    ...shadows.sm,
  },
  notesText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  notesActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  notesSaveButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  notesSaveText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  notesCancelButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  notesCancelText: {
    color: colors.text.tertiary,
    fontSize: 14,
    fontWeight: '500',
  },
  // Actions
  actions: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  editTripButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3.5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  editTripButtonText: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: '600',
  },
  deleteTripButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing[3.5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.error.light,
  },
  deleteTripButtonText: {
    color: colors.error.main,
    fontSize: 16,
    fontWeight: '600',
  },
});
