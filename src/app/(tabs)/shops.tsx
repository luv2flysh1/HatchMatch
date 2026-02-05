import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../hooks/useLocation';
import { supabase } from '../../services/supabase';
import { colors, spacing, borderRadius, shadows, layout } from '../../theme';

interface FlyShop {
  id: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  distance?: number;
}

function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ShopsScreen() {
  const [shops, setShops] = useState<FlyShop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const { getCurrentLocation, isLoading: isLoadingLocation } = useLocation();

  const handleSearchNearMe = useCallback(async () => {
    const location = await getCurrentLocation();
    if (!location) return;

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Query fly_shops table directly
      const { data, error: dbError } = await supabase
        .from('fly_shops')
        .select('*');

      if (dbError) {
        throw new Error(dbError.message);
      }

      if (!data || data.length === 0) {
        setShops([]);
        setError('No fly shops in our database yet. This feature is coming soon.');
        return;
      }

      // Calculate distances and sort
      const withDistance = data
        .map(shop => ({
          ...shop,
          distance: calculateDistance(
            location.latitude, location.longitude,
            shop.latitude, shop.longitude
          ),
        }))
        .filter(shop => shop.distance <= 100)
        .sort((a, b) => a.distance - b.distance);

      setShops(withDistance);

      if (withDistance.length === 0) {
        setError('No fly shops found within 100 miles. We\'re still building our database.');
      }
    } catch (err) {
      console.error('Error searching fly shops:', err);
      setError('Failed to search for fly shops. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, '')}`);
  };

  const handleDirections = (shop: FlyShop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
    Linking.openURL(url);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website.startsWith('http') ? website : `https://${website}`);
  };

  const renderShopItem = ({ item }: { item: FlyShop }) => (
    <View style={styles.shopCard}>
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <Ionicons name="storefront-outline" size={20} color={colors.secondary[500]} />
          <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
        </View>

        <Text style={styles.shopLocation}>
          {item.city}, {item.state}
          {item.distance !== undefined && ` · ${item.distance.toFixed(1)} mi`}
        </Text>

        {item.address && (
          <Text style={styles.shopAddress} numberOfLines={2}>{item.address}</Text>
        )}

        <View style={styles.shopActions}>
          {item.phone && (
            <Pressable style={styles.actionButton} onPress={() => handleCall(item.phone!)}>
              <Ionicons name="call-outline" size={14} color={colors.text.inverse} />
              <Text style={styles.actionButtonText}>Call</Text>
            </Pressable>
          )}
          <Pressable style={styles.actionButton} onPress={() => handleDirections(item)}>
            <Ionicons name="navigate-outline" size={14} color={colors.text.inverse} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </Pressable>
          {item.website && (
            <Pressable
              style={[styles.actionButton, styles.actionButtonOutline]}
              onPress={() => handleWebsite(item.website!)}
            >
              <Ionicons name="globe-outline" size={14} color={colors.primary[500]} />
              <Text style={styles.actionButtonTextOutline}>Website</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Pressable
        style={[styles.nearbyButton, (isLoadingLocation || isLoading) && styles.nearbyButtonDisabled]}
        onPress={handleSearchNearMe}
        disabled={isLoadingLocation || isLoading}
      >
        {isLoadingLocation || isLoading ? (
          <ActivityIndicator size="small" color={colors.text.inverse} />
        ) : (
          <>
            <Ionicons name="location-outline" size={20} color={colors.text.inverse} />
            <Text style={styles.nearbyButtonText}>Find Fly Shops Near Me</Text>
          </>
        )}
      </Pressable>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="information-circle-outline" size={18} color={colors.warning.main} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
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
      ) : !searched ? (
        <View style={styles.placeholder}>
          <Ionicons name="storefront-outline" size={56} color={colors.neutral[300]} />
          <Text style={styles.placeholderTitle}>Fly Shop Finder</Text>
          <Text style={styles.placeholderText}>
            Find fly shops near your location or near a fishing destination.
            Tap the button above to get started.
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  nearbyButton: {
    margin: layout.screenPaddingHorizontal,
    marginBottom: spacing[2],
    backgroundColor: colors.secondary[500],
    borderRadius: borderRadius.lg,
    padding: spacing[3.5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    minHeight: 48,
    ...shadows.md,
  },
  nearbyButtonDisabled: {
    opacity: 0.7,
  },
  nearbyButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.warning.light,
    borderRadius: borderRadius.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  errorText: {
    color: colors.warning.dark,
    fontSize: 13,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: 14,
    color: colors.text.tertiary,
  },
  shopsList: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
  },
  shopCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  shopInfo: {
    padding: spacing[4],
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  shopLocation: {
    fontSize: 13,
    color: colors.primary[500],
    fontWeight: '500',
    marginBottom: spacing[1],
  },
  shopAddress: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
  },
  shopActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  actionButtonTextOutline: {
    color: colors.primary[500],
    fontSize: 13,
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  placeholderText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
