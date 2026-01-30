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
import { useWaterStore, ExternalWaterBody } from '../../stores/waterStore';
import { useLocation } from '../../hooks/useLocation';
import { WaterMapView } from '../../components/WaterMapView';
import type { WaterBody } from '../../types/database';

type ViewMode = 'list' | 'map';

const RADIUS_OPTIONS = [25, 50, 100, 200];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(100); // Default 100 miles
  const [lastNearbySearch, setLastNearbySearch] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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

  // Trigger external search when database search returns no results
  useEffect(() => {
    if (
      !isSearching &&
      searchResults.length === 0 &&
      lastSearchQuery.length >= 2 &&
      externalResults.length === 0 &&
      !isSearchingExternal
    ) {
      // Small delay to avoid rapid API calls during typing
      const timer = setTimeout(() => {
        searchExternal(lastSearchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSearching, searchResults.length, lastSearchQuery, externalResults.length, isSearchingExternal, searchExternal]);

  const handleExternalWaterPress = useCallback(async (water: ExternalWaterBody) => {
    Alert.alert(
      'Add to Database',
      `Would you like to add "${water.name}" to the HatchMatch database? This will allow you to get fly recommendations and save it to favorites.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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

  const renderExternalWaterItem = useCallback(({ item }: { item: ExternalWaterBody }) => (
    <Pressable
      style={styles.externalWaterCard}
      onPress={() => handleExternalWaterPress(item)}
    >
      <View style={styles.waterInfo}>
        <View style={styles.externalNameRow}>
          <Text style={styles.waterName}>{item.name}</Text>
          <View style={styles.externalBadge}>
            <Text style={styles.externalBadgeText}>
              {item.source === 'usgs' ? 'USGS' : 'GNIS'}
            </Text>
          </View>
        </View>
        <Text style={styles.waterMeta}>
          {formatWaterType(item.type)} {item.state && `• ${item.state}`}
          {item.county && ` • ${item.county}`}
        </Text>
        <Text style={styles.externalHint}>Tap to add to database</Text>
      </View>
    </Pressable>
  ), [handleExternalWaterPress]);

  const renderWaterItem = useCallback(({ item }: { item: WaterBody & { distance?: number } }) => (
    <Pressable
      style={styles.waterCard}
      onPress={() => handleWaterPress(item)}
    >
      <View style={styles.waterInfo}>
        <Text style={styles.waterName}>{item.name}</Text>
        <Text style={styles.waterMeta}>
          {formatWaterType(item.type)} • {item.state}
          {item.city && ` • ${item.city}`}
        </Text>
        {item.species && item.species.length > 0 && (
          <Text style={styles.waterSpecies}>
            {item.species.slice(0, 3).join(', ')}
          </Text>
        )}
      </View>
      {item.distance !== undefined && (
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>
            {formatDistance(item.distance)}
          </Text>
        </View>
      )}
    </Pressable>
  ), [handleWaterPress]);

  const showError = error || locationError;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rivers, lakes, streams..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {isSearching && (
          <ActivityIndicator
            style={styles.searchSpinner}
            size="small"
            color="#2563eb"
          />
        )}
      </View>

      <View style={styles.nearbySection}>
        <View style={styles.radiusSelector}>
          <Text style={styles.radiusLabel}>Search radius:</Text>
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
        <Pressable
          style={[
            styles.nearbyButton,
            isLoadingLocation && styles.nearbyButtonDisabled,
          ]}
          onPress={handleNearbySearch}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.nearbyButtonText}>Find Waters Near Me</Text>
          )}
        </Pressable>
      </View>

      {showError && (
        <Pressable style={styles.errorBanner} onPress={clearError}>
          <Text style={styles.errorText}>{showError}</Text>
          <Text style={styles.errorDismiss}>Tap to dismiss</Text>
        </Pressable>
      )}

      {searchResults.length > 0 && (
        <View style={styles.viewToggleContainer}>
          <Text style={styles.resultsCount}>
            {searchResults.length} water{searchResults.length !== 1 ? 's' : ''} found
          </Text>
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>
                List
              </Text>
            </Pressable>
            <Pressable
              style={[styles.viewToggleButton, viewMode === 'map' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>
                Map
              </Text>
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
            <Text style={styles.noResultsTitle}>Not in Our Database</Text>
            <Text style={styles.noResultsSubtitle}>
              No curated waters found for "{searchQuery}"
            </Text>
          </View>

          {isSearchingExternal ? (
            <View style={styles.externalLoadingContainer}>
              <ActivityIndicator size="small" color="#6366f1" />
              <Text style={styles.externalLoadingText}>
                Searching USGS water databases...
              </Text>
            </View>
          ) : externalResults.length > 0 ? (
            <View style={styles.externalResultsSection}>
              <View style={styles.externalHeader}>
                <Text style={styles.externalTitle}>Found in USGS Database</Text>
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
            </View>
          ) : (
            <View style={styles.noExternalResults}>
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
          <Text style={styles.placeholderTitle}>No Waters Found</Text>
          <Text style={styles.placeholderText}>
            No fishing waters found within {searchRadius} miles of your location.
            Try increasing the search radius above.
          </Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Find Your Water</Text>
          <Text style={styles.placeholderText}>
            Search for a river or lake by name, or tap "Find Waters Near Me"
            to discover fishing spots nearby.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
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
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    padding: 16,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    paddingRight: 44,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchSpinner: {
    position: 'absolute',
    right: 28,
    top: 28,
  },
  nearbySection: {
    marginHorizontal: 16,
  },
  radiusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 10,
  },
  radiusOptions: {
    flexDirection: 'row',
    flex: 1,
  },
  radiusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  radiusChipSelected: {
    backgroundColor: '#2563eb',
  },
  radiusChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  radiusChipTextSelected: {
    color: '#ffffff',
  },
  nearbyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
  },
  nearbyButtonDisabled: {
    opacity: 0.7,
  },
  nearbyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  errorDismiss: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  viewToggleTextActive: {
    color: '#111827',
  },
  resultsList: {
    padding: 16,
    paddingTop: 8,
  },
  waterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterInfo: {
    flex: 1,
  },
  waterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  waterMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  waterSpecies: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 4,
  },
  distanceBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // No results / External search styles
  noResultsContainer: {
    flex: 1,
  },
  noResultsContent: {
    padding: 16,
  },
  noResultsHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  externalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
  },
  externalLoadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6366f1',
  },
  externalResultsSection: {
    marginTop: 8,
  },
  externalHeader: {
    marginBottom: 12,
  },
  externalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  externalDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  externalList: {
    gap: 8,
  },
  externalWaterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  externalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  externalBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  externalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4f46e5',
    textTransform: 'uppercase',
  },
  externalHint: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 6,
    fontStyle: 'italic',
  },
  noExternalResults: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  noExternalText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  noExternalHint: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
