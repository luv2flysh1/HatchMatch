import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useWaterStore } from '../../stores/waterStore';
import { useLocation } from '../../hooks/useLocation';
import type { WaterBody } from '../../types/database';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    searchResults,
    isSearching,
    error,
    searchByName,
    searchNearby,
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
    if (text.trim().length >= 2) {
      searchByName(text);
    } else if (text.trim().length === 0) {
      clearSearch();
    }
  }, [searchByName, clearSearch]);

  const handleNearbySearch = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      searchNearby(location.latitude, location.longitude);
    }
  }, [getCurrentLocation, searchNearby]);

  const handleWaterPress = useCallback((water: WaterBody) => {
    router.push(`/water/${water.id}`);
  }, []);

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

      {showError && (
        <Pressable style={styles.errorBanner} onPress={clearError}>
          <Text style={styles.errorText}>{showError}</Text>
          <Text style={styles.errorDismiss}>Tap to dismiss</Text>
        </Pressable>
      )}

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderWaterItem}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.placeholder}>
          {searchQuery.length > 0 && !isSearching ? (
            <Text style={styles.placeholderText}>
              No waters found matching "{searchQuery}"
            </Text>
          ) : (
            <>
              <Text style={styles.placeholderTitle}>Find Your Water</Text>
              <Text style={styles.placeholderText}>
                Search for a river or lake by name, or tap "Find Waters Near Me"
                to discover fishing spots nearby.
              </Text>
            </>
          )}
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
  nearbyButton: {
    marginHorizontal: 16,
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
});
