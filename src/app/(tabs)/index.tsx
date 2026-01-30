import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWaterStore, ExternalWaterBody } from '../../stores/waterStore';
import { useLocation } from '../../hooks/useLocation';
import { WaterMapView } from '../../components/WaterMapView';
import { colors, gradients, shadows, spacing, borderRadius, layout } from '../../theme';
import type { WaterBody } from '../../types/database';

type ViewMode = 'list' | 'map';

const RADIUS_OPTIONS = [25, 50, 100, 200];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(100);
  const [lastNearbySearch, setLastNearbySearch] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [externalSearchAttempted, setExternalSearchAttempted] = useState(false);

  const {
    searchResults,
    externalResults,
    isSearching,
    isSearchingExternal,
    isLoading,
    error,
    lastSearchQuery,
    searchByName,
    searchNearby,
    searchExternal,
    refreshExternalSearch,
    addExternalWaterToDatabase,
    clearSearch,
    clearError,
  } = useWaterStore();

  const {
    getCurrentLocation,
    isLoading: isLoadingLocation,
    error: locationError,
  } = useLocation();

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setLastNearbySearch(false);
    setExternalSearchAttempted(false);
    if (text.trim().length >= 2) {
      searchByName(text);
    } else if (text.trim().length === 0) {
      clearSearch();
    }
  }, [searchByName, clearSearch]);

  const handleNearbySearch = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      setLastNearbySearch(true);
      setUserLocation(location);
      searchNearby(location.latitude, location.longitude, searchRadius);
    }
  }, [getCurrentLocation, searchNearby, searchRadius]);

  const toggleViewMode = useCallback(() => {
    setViewMode((current) => (current === 'list' ? 'map' : 'list'));
  }, []);

  const handleRadiusChange = useCallback((radius: number) => {
    setSearchRadius(radius);
  }, []);

  const handleWaterPress = useCallback((water: WaterBody) => {
    router.push(`/water/${water.id}`);
  }, []);

  useEffect(() => {
    if (
      !isSearching &&
      searchResults.length === 0 &&
      lastSearchQuery.length >= 2 &&
      !externalSearchAttempted &&
      !isSearchingExternal
    ) {
      const timer = setTimeout(() => {
        setExternalSearchAttempted(true);
        searchExternal(lastSearchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSearching, searchResults.length, lastSearchQuery, externalSearchAttempted, isSearchingExternal, searchExternal]);

  const handleExternalWaterPress = useCallback(async (water: ExternalWaterBody) => {
    Alert.alert(
      'Add to Database',
      `Would you like to add "${water.name}" to the HatchMatch database? This will allow you to get fly recommendations and save it to favorites.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            const added = await addExternalWaterToDatabase(water);
            if (added) {
              router.push(`/water/${added.id}`);
            }
          },
        },
      ]
    );
  }, [addExternalWaterToDatabase]);

  const handleRefreshExternalSearch = useCallback(() => {
    setExternalSearchAttempted(true);
    refreshExternalSearch();
  }, [refreshExternalSearch]);

  const renderExternalWaterItem = useCallback(({ item }: { item: ExternalWaterBody }) => (
    <Pressable
      style={({ pressed }) => [
        styles.externalWaterCard,
        pressed && styles.cardPressed,
      ]}
      onPress={() => handleExternalWaterPress(item)}
    >
      <View style={styles.externalCardIcon}>
        <Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />
      </View>
      <View style={styles.waterInfo}>
        <View style={styles.externalNameRow}>
          <Text style={styles.waterName}>{item.name}</Text>
          <View style={[
            styles.externalBadge,
            item.source === 'usgs' ? styles.usgsBadge : styles.gnisBadge
          ]}>
            <Text style={styles.externalBadgeText}>
              {item.source === 'usgs' ? 'USGS' : 'GNIS'}
            </Text>
          </View>
        </View>
        <Text style={styles.waterMeta}>
          {formatWaterType(item.type)} {item.state && `in ${item.state}`}
          {item.county && ` - ${item.county}`}
        </Text>
        <View style={styles.externalHintRow}>
          <Ionicons name="information-circle-outline" size={14} color={colors.primary[400]} />
          <Text style={styles.externalHint}>Tap to add to HatchMatch</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
    </Pressable>
  ), [handleExternalWaterPress]);

  const renderWaterItem = useCallback(({ item }: { item: WaterBody & { distance?: number } }) => (
    <Pressable
      style={({ pressed }) => [
        styles.waterCard,
        pressed && styles.cardPressed,
      ]}
      onPress={() => handleWaterPress(item)}
    >
      <View style={styles.waterIconContainer}>
        <MaterialCommunityIcons
          name={getWaterIcon(item.type)}
          size={28}
          color={colors.primary[500]}
        />
      </View>
      <View style={styles.waterInfo}>
        <Text style={styles.waterName}>{item.name}</Text>
        <Text style={styles.waterMeta}>
          {formatWaterType(item.type)} in {item.state}
          {item.city && ` near ${item.city}`}
        </Text>
        {item.species && item.species.length > 0 && (
          <View style={styles.speciesRow}>
            <Ionicons name="fish-outline" size={12} color={colors.secondary[500]} />
            <Text style={styles.waterSpecies}>
              {item.species.slice(0, 3).join(', ')}
            </Text>
          </View>
        )}
      </View>
      {item.distance !== undefined && (
        <View style={styles.distanceBadge}>
          <Ionicons name="location-outline" size={12} color={colors.primary[600]} />
          <Text style={styles.distanceText}>
            {formatDistance(item.distance)}
          </Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
    </Pressable>
  ), [handleWaterPress]);

  const showError = error || locationError;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Hero Search Section */}
      <View style={styles.heroSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rivers, lakes, streams..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor={colors.neutral[400]}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {isSearching && (
              <ActivityIndicator
                style={styles.searchSpinner}
                size="small"
                color={colors.primary[500]}
              />
            )}
          </View>
        </View>

        {/* Radius Selector */}
        <View style={styles.radiusSelector}>
          <Text style={styles.radiusLabel}>Radius:</Text>
          <View style={styles.radiusOptions}>
            {RADIUS_OPTIONS.map((radius) => (
              <Pressable
                key={radius}
                style={[
                  styles.radiusChip,
                  searchRadius === radius && styles.radiusChipSelected,
                ]}
                onPress={() => handleRadiusChange(radius)}
              >
                <Text
                  style={[
                    styles.radiusChipText,
                    searchRadius === radius && styles.radiusChipTextSelected,
                  ]}
                >
                  {radius} mi
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Nearby Search Button */}
        <Pressable
          style={({ pressed }) => [
            styles.nearbyButton,
            pressed && styles.nearbyButtonPressed,
            isLoadingLocation && styles.nearbyButtonDisabled,
          ]}
          onPress={handleNearbySearch}
          disabled={isLoadingLocation}
        >
          <LinearGradient
            colors={gradients.secondaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nearbyButtonGradient}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="navigate" size={20} color={colors.text.inverse} />
                <Text style={styles.nearbyButtonText}>Find Waters Near Me</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      {showError && (
        <Pressable style={styles.errorBanner} onPress={clearError}>
          <Ionicons name="alert-circle" size={20} color={colors.error.main} />
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>{showError}</Text>
            <Text style={styles.errorDismiss}>Tap to dismiss</Text>
          </View>
        </Pressable>
      )}

      {searchResults.length > 0 && (
        <View style={styles.viewToggleContainer}>
          <View style={styles.resultsInfo}>
            <Ionicons name="water-outline" size={16} color={colors.neutral[500]} />
            <Text style={styles.resultsCount}>
              {searchResults.length} water{searchResults.length !== 1 ? 's' : ''} found
            </Text>
          </View>
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === 'list' ? colors.primary[500] : colors.neutral[400]}
              />
            </Pressable>
            <Pressable
              style={[styles.viewToggleButton, viewMode === 'map' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons
                name="map"
                size={18}
                color={viewMode === 'map' ? colors.primary[500] : colors.neutral[400]}
              />
            </Pressable>
          </View>
        </View>
      )}

      {searchResults.length > 0 ? (
        viewMode === 'list' ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderWaterItem}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <WaterMapView
            waters={searchResults}
            onWaterPress={handleWaterPress}
            userLocation={userLocation}
          />
        )
      ) : searchQuery.length > 0 && !isSearching ? (
        <ScrollView style={styles.noResultsContainer} contentContainerStyle={styles.noResultsContent}>
          <View style={styles.noResultsHeader}>
            <View style={styles.noResultsIconContainer}>
              <Ionicons name="search" size={32} color={colors.neutral[400]} />
            </View>
            <Text style={styles.noResultsTitle}>Not in Our Database</Text>
            <Text style={styles.noResultsSubtitle}>
              No curated waters found for "{searchQuery}"
            </Text>
          </View>

          {isSearchingExternal ? (
            <View style={styles.externalLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <Text style={styles.externalLoadingText}>
                Searching USGS water databases...
              </Text>
            </View>
          ) : externalResults.length > 0 ? (
            <View style={styles.externalResultsSection}>
              <View style={styles.externalHeader}>
                <View style={styles.externalTitleRow}>
                  <MaterialCommunityIcons name="database-search" size={20} color={colors.primary[600]} />
                  <Text style={styles.externalTitle}>Found in USGS Database</Text>
                </View>
                <Text style={styles.externalDescription}>
                  These waters were found in government databases. Tap to add one to HatchMatch and get fly recommendations.
                </Text>
              </View>
              <FlatList
                data={externalResults}
                keyExtractor={(item) => item.id}
                renderItem={renderExternalWaterItem}
                scrollEnabled={false}
                contentContainerStyle={styles.externalList}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.refreshExternalButton,
                  pressed && styles.cardPressed,
                ]}
                onPress={handleRefreshExternalSearch}
                disabled={isSearchingExternal}
              >
                {isSearchingExternal ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={18} color={colors.primary[600]} />
                    <Text style={styles.refreshExternalButtonText}>Search USGS Again</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.noExternalResults}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.neutral[300]} />
              <Text style={styles.noExternalText}>
                No matching waters found in external databases either.
              </Text>
              <Text style={styles.noExternalHint}>
                Try a different search term or check spelling.
              </Text>
            </View>
          )}
        </ScrollView>
      ) : lastNearbySearch && !isSearching ? (
        <View style={styles.placeholder}>
          <View style={styles.placeholderIconContainer}>
            <Ionicons name="location-outline" size={48} color={colors.neutral[300]} />
          </View>
          <Text style={styles.placeholderTitle}>No Waters Found</Text>
          <Text style={styles.placeholderText}>
            No fishing waters found within {searchRadius} miles of your location.
            Try increasing the search radius above.
          </Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.placeholderIconContainer}>
            <LinearGradient
              colors={[colors.primary[100], colors.background.water]}
              style={styles.placeholderIconGradient}
            >
              <MaterialCommunityIcons name="fish" size={48} color={colors.primary[500]} />
            </LinearGradient>
          </View>
          <Text style={styles.placeholderTitle}>Find Your Water</Text>
          <Text style={styles.placeholderText}>
            Search for a river or lake by name, or tap "Find Waters Near Me"
            to discover fishing spots nearby.
          </Text>
          <View style={styles.placeholderFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={16} color={colors.accent[500]} />
              <Text style={styles.featureText}>AI-powered fly recommendations</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up" size={16} color={colors.secondary[500]} />
              <Text style={styles.featureText}>Real-time hatch data</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="location" size={16} color={colors.primary[500]} />
              <Text style={styles.featureText}>Local fly shop finder</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function getWaterIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type.toLowerCase()) {
    case 'river':
      return 'waves'; // Flowing water waves
    case 'stream':
      return 'wave'; // Smaller wave for streams
    case 'creek':
      return 'water-outline'; // Small water body
    case 'lake':
      return 'circle-slice-8'; // Circular still water
    case 'reservoir':
      return 'water-well'; // Man-made water storage
    case 'pond':
      return 'circle-outline'; // Small still water
    case 'spring':
      return 'water-pump'; // Water source
    case 'canal':
      return 'pipe'; // Man-made channel
    default:
      return 'fish'; // Generic water body
  }
}

function formatWaterType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDistance(miles: number): string {
  if (miles < 1) {
    return `${(miles * 10).toFixed(0)}00 ft`;
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  heroSection: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
    ...shadows.md,
  },
  searchContainer: {
    marginBottom: spacing[4],
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.text.primary,
  },
  searchSpinner: {
    marginLeft: spacing[2],
  },
  radiusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  radiusLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: spacing[2],
    fontWeight: '500',
  },
  radiusOptions: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing[2],
  },
  radiusChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  radiusChipSelected: {
    backgroundColor: colors.primary[500],
  },
  radiusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  radiusChipTextSelected: {
    color: colors.text.inverse,
  },
  nearbyButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.primaryGlow,
  },
  nearbyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  nearbyButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  nearbyButtonDisabled: {
    opacity: 0.7,
  },
  nearbyButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.error.main,
    gap: spacing[2],
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    color: colors.error.main,
    fontSize: 14,
    fontWeight: '500',
  },
  errorDismiss: {
    color: colors.neutral[400],
    fontSize: 12,
    marginTop: 2,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    backgroundColor: colors.background.primary,
    marginTop: spacing[2],
    marginHorizontal: spacing[4],
    borderRadius: borderRadius.base,
    ...shadows.sm,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  resultsCount: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.sm,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  resultsList: {
    padding: spacing[4],
    paddingTop: spacing[2],
  },
  waterCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  waterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.water,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  waterInfo: {
    flex: 1,
  },
  waterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  waterMeta: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    gap: spacing[1],
  },
  waterSpecies: {
    fontSize: 12,
    color: colors.secondary[600],
    fontWeight: '500',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[600],
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  placeholderIconContainer: {
    marginBottom: spacing[6],
  },
  placeholderIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  placeholderText: {
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing[6],
  },
  placeholderFeatures: {
    marginTop: spacing[8],
    gap: spacing[3],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  featureText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
  },
  noResultsContent: {
    padding: spacing[4],
  },
  noResultsHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
    padding: spacing[6],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  noResultsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  externalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    gap: spacing[4],
  },
  externalLoadingText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500',
  },
  externalResultsSection: {
    marginTop: spacing[2],
  },
  externalHeader: {
    marginBottom: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  externalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  externalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[700],
  },
  externalDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  externalList: {
    gap: spacing[2],
  },
  externalWaterCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  externalCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  externalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  externalBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  usgsBadge: {
    backgroundColor: colors.primary[100],
  },
  gnisBadge: {
    backgroundColor: colors.accent[100],
  },
  externalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary[700],
    textTransform: 'uppercase',
  },
  externalHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    gap: 4,
  },
  externalHint: {
    fontSize: 12,
    color: colors.primary[500],
    fontWeight: '500',
  },
  noExternalResults: {
    alignItems: 'center',
    padding: spacing[8],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  noExternalText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[1],
  },
  noExternalHint: {
    fontSize: 13,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  refreshExternalButton: {
    marginTop: spacing[4],
    padding: spacing[3.5],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  refreshExternalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary[600],
  },
});
