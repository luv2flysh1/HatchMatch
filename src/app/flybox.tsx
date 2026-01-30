import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFlyBoxStore, ONLINE_SHOPS, FlyBoxItem } from '../stores/flyBoxStore';
import { supabase } from '../services/supabase';

export default function FlyBoxScreen() {
  const { items, updateQuantity, removeFly, clearBox, getItemCount } = useFlyBoxStore();
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  const totalItems = getItemCount();

  // Get the most common water body name from items
  const primaryWaterBody = useMemo(() => {
    const waterCounts: Record<string, number> = {};
    items.forEach((item) => {
      if (item.addedFrom) {
        waterCounts[item.addedFrom] = (waterCounts[item.addedFrom] || 0) + 1;
      }
    });
    const sorted = Object.entries(waterCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }, [items]);

  const handleOpenShop = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open shop website');
    });
  };

  const handleClearBox = () => {
    Alert.alert(
      'Clear Fly Box',
      'Remove all flies from your shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearBox },
      ]
    );
  };

  const handleFindLocalShops = async () => {
    if (!primaryWaterBody) {
      // No water body associated, just go to shops
      router.push('/(tabs)/shops');
      return;
    }

    setIsLoadingShops(true);
    try {
      // Look up the water body coordinates
      const { data, error } = await supabase
        .from('water_bodies')
        .select('latitude, longitude, name')
        .ilike('name', `%${primaryWaterBody}%`)
        .limit(1)
        .single();

      if (error || !data) {
        // Couldn't find water body, just go to shops
        router.push('/(tabs)/shops');
        return;
      }

      // Navigate to shops with coordinates
      router.push({
        pathname: '/(tabs)/shops',
        params: {
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString(),
          waterName: data.name,
        },
      });
    } catch (err) {
      console.error('Error looking up water body:', err);
      router.push('/(tabs)/shops');
    } finally {
      setIsLoadingShops(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Your Fly Box is Empty</Text>
          <Text style={styles.emptyText}>
            Add flies from water body recommendations, or use "Create Box for Me"
            to auto-generate a box based on AI recommendations.
          </Text>
          <Pressable style={styles.browseButton} onPress={() => router.push('/')}>
            <Text style={styles.browseButtonText}>Browse Waters</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Group items by fly type
  const groupedItems = items.reduce((acc, item) => {
    const type = item.flyType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, FlyBoxItem[]>);

  const typeOrder = ['dry', 'nymph', 'streamer', 'emerger', 'wet', 'terrestrial', 'other'];
  const sortedTypes = Object.keys(groupedItems).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Fly Box</Text>
          <Text style={styles.headerSubtitle}>
            {totalItems} {totalItems === 1 ? 'fly' : 'flies'} in your shopping list
          </Text>
        </View>

        {sortedTypes.map((type) => (
          <View key={type} style={styles.typeSection}>
            <Text style={styles.typeSectionTitle}>
              {formatFlyType(type)}s ({groupedItems[type].length})
            </Text>
            {groupedItems[type].map((item) => (
              <FlyBoxItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeFly(item.id)}
              />
            ))}
          </View>
        ))}

        <View style={styles.shopSection}>
          <Text style={styles.shopSectionTitle}>Where to Buy</Text>

          <Pressable
            style={[styles.localShopsButton, isLoadingShops && styles.localShopsButtonDisabled]}
            onPress={handleFindLocalShops}
            disabled={isLoadingShops}
          >
            {isLoadingShops ? (
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 12 }} />
            ) : (
              <Text style={styles.localShopsIcon}>📍</Text>
            )}
            <View style={styles.localShopsInfo}>
              <Text style={styles.localShopsTitle}>Find Local Fly Shops</Text>
              <Text style={styles.localShopsSubtitle}>
                {primaryWaterBody
                  ? `Near ${primaryWaterBody}`
                  : 'Support local shops near you'}
              </Text>
            </View>
          </Pressable>

          <Text style={styles.onlineShopsLabel}>Online Retailers</Text>
          {ONLINE_SHOPS.map((shop) => (
            <Pressable
              key={shop.id}
              style={styles.shopCard}
              onPress={() => handleOpenShop(shop.website)}
            >
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopDescription}>{shop.description}</Text>
              </View>
              <Text style={styles.shopArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.clearButton} onPress={handleClearBox}>
          <Text style={styles.clearButtonText}>Clear Fly Box</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function FlyBoxItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: FlyBoxItem;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.flyName}</Text>
        <Text style={styles.itemMeta}>
          Size {item.size}
          {item.addedFrom && ` • From ${item.addedFrom}`}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <Pressable
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </Pressable>
        <Text style={styles.quantityValue}>{item.quantity}</Text>
        <Pressable
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </Pressable>
      </View>
      <Pressable style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeButtonText}>✕</Text>
      </Pressable>
    </View>
  );
}

function formatFlyType(type: string): string {
  if (type === 'dry') return 'Dry Fly';
  if (type === 'nymph') return 'Nymph';
  if (type === 'streamer') return 'Streamer';
  if (type === 'emerger') return 'Emerger';
  if (type === 'wet') return 'Wet Fly';
  if (type === 'terrestrial') return 'Terrestrial';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  typeSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  typeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  shopSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  shopSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  localShopsButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  localShopsButtonDisabled: {
    opacity: 0.7,
  },
  localShopsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  localShopsInfo: {
    flex: 1,
  },
  localShopsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  localShopsSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  onlineShopsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  shopCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  shopDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  shopArrow: {
    fontSize: 18,
    color: '#9ca3af',
    marginLeft: 8,
  },
  clearButton: {
    margin: 16,
    marginTop: 24,
    marginBottom: 32,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '500',
  },
});
