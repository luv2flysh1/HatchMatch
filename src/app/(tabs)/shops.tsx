import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useLocation } from '../../hooks/useLocation';
import { supabase } from '../../services/supabase';

interface FlyShop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  distance: number;
  distanceMiles: string;
  coordinates: { latitude: number; longitude: number };
  imageUrl: string;
  url: string;
  categories: string[];
  isFlyShop: boolean;
}

export default function ShopsScreen() {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    waterName?: string;
  }>();

  const [shops, setShops] = useState<FlyShop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
  } | null>(null);

  const { getCurrentLocation, isLoading: isLoadingLocation } = useLocation();

  // Check for passed location params on mount
  useEffect(() => {
    if (params.latitude && params.longitude) {
      const lat = parseFloat(params.latitude);
      const lng = parseFloat(params.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSearchLocation({
          latitude: lat,
          longitude: lng,
          name: params.waterName,
        });
      }
    }
  }, [params.latitude, params.longitude, params.waterName]);

  // Auto-search when location is set
  useEffect(() => {
    if (searchLocation) {
      searchNearLocation(searchLocation.latitude, searchLocation.longitude);
    }
  }, [searchLocation]);

  const searchNearLocation = async (latitude: number, longitude: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('search-fly-shops', {
        body: { latitude, longitude, radius: 40000 },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      setShops(data.shops || []);

      if (data.shops?.length === 0) {
        setError('No fly shops found within 25 miles. Try searching a different area.');
      }
    } catch (err) {
      console.error('Error searching fly shops:', err);
      setError('Failed to search for fly shops. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchNearMe = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      setSearchLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        name: 'your location',
      });
    }
  }, [getCurrentLocation]);

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`);
    }
  };

  const handleDirections = (shop: FlyShop) => {
    const { latitude, longitude } = shop.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleOpenYelp = (url: string) => {
    Linking.openURL(url);
  };

  const renderShopItem = ({ item }: { item: FlyShop }) => (
    <View style={styles.shopCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.shopImage} />
      ) : (
        <View style={[styles.shopImage, styles.shopImagePlaceholder]}>
          <Text style={styles.shopImagePlaceholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isFlyShop && (
            <View style={styles.flyShopBadge}>
              <Text style={styles.flyShopBadgeText}>Fly Shop</Text>
            </View>
          )}
        </View>

        <View style={styles.shopMeta}>
          {item.rating > 0 && (
            <Text style={styles.rating}>
              {'★'.repeat(Math.round(item.rating))} {item.rating.toFixed(1)} ({item.reviewCount})
            </Text>
          )}
          <Text style={styles.distance}>{item.distanceMiles} mi</Text>
        </View>

        <Text style={styles.address} numberOfLines={2}>
          {item.address}
        </Text>

        {item.categories.length > 0 && (
          <Text style={styles.categories} numberOfLines={1}>
            {item.categories.slice(0, 3).join(' • ')}
          </Text>
        )}

        <View style={styles.shopActions}>
          {item.phone && (
            <Pressable
              style={styles.actionButton}
              onPress={() => handleCall(item.phone)}
            >
              <Text style={styles.actionButtonText}>Call</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.actionButton}
            onPress={() => handleDirections(item)}
          >
            <Text style={styles.actionButtonText}>Directions</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={() => handleOpenYelp(item.url)}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>
              Yelp
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Pressable
        style={[styles.nearbyButton, isLoadingLocation && styles.nearbyButtonDisabled]}
        onPress={handleSearchNearMe}
        disabled={isLoadingLocation || isLoading}
      >
        {isLoadingLocation ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.nearbyButtonText}>Find Fly Shops Near Me</Text>
        )}
      </Pressable>

      {searchLocation && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            Showing fly shops near {searchLocation.name || 'selected location'}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Searching for fly shops...</Text>
        </View>
      ) : shops.length > 0 ? (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={renderShopItem}
          contentContainerStyle={styles.shopsList}
          showsVerticalScrollIndicator={false}
        />
      ) : !searchLocation ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Fly Shop Finder</Text>
          <Text style={styles.placeholderText}>
            Find fly shops near your location or near a fishing destination.
            Tap "Find Fly Shops Near Me" to get started.
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  nearbyButton: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  nearbyButtonDisabled: {
    opacity: 0.7,
  },
  nearbyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInfoText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  errorBanner: {
    margin: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
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
  shopsList: {
    padding: 16,
    paddingTop: 8,
  },
  shopCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shopImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
  },
  shopImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopImagePlaceholderText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  shopInfo: {
    padding: 12,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  flyShopBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  flyShopBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 13,
    color: '#f59e0b',
    marginRight: 12,
  },
  distance: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  address: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  categories: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  shopActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtonTextOutline: {
    color: '#6b7280',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
