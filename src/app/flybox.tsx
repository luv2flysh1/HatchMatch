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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFlyBoxStore, ONLINE_SHOPS, FlyBoxItem } from '../stores/flyBoxStore';
import { supabase } from '../services/supabase';
import { colors, gradients, shadows, spacing, borderRadius, layout } from '../theme';

export default function FlyBoxScreen() {
  const { items, updateQuantity, removeFly, clearBox, getItemCount } = useFlyBoxStore();
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  const totalItems = getItemCount();

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
      router.push('/(tabs)/shops');
      return;
    }

    setIsLoadingShops(true);
    try {
      const { data, error } = await supabase
        .from('water_bodies')
        .select('latitude, longitude, name')
        .ilike('name', `%${primaryWaterBody}%`)
        .limit(1)
        .single();

      if (error || !data) {
        router.push('/(tabs)/shops');
        return;
      }

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
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={[colors.primary[100], colors.accent[100]]}
              style={styles.emptyIconGradient}
            >
              <MaterialCommunityIcons name="box-variant" size={56} color={colors.primary[500]} />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Your Fly Box is Empty</Text>
          <Text style={styles.emptyText}>
            Add flies from water body recommendations, or use "Create Box for Me"
            to auto-generate a box based on AI recommendations.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.browseButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/')}
          >
            <LinearGradient
              colors={gradients.primaryButton as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.browseButtonGradient}
            >
              <Ionicons name="compass-outline" size={20} color={colors.text.inverse} />
              <Text style={styles.browseButtonText}>Browse Waters</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={gradients.river as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="box-variant" size={32} color={colors.text.inverse} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>My Fly Box</Text>
                <Text style={styles.headerSubtitle}>
                  {totalItems} {totalItems === 1 ? 'fly' : 'flies'} ready to shop
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Fly Type Sections */}
        {sortedTypes.map((type) => (
          <View key={type} style={styles.typeSection}>
            <View style={styles.typeSectionHeader}>
              <MaterialCommunityIcons
                name={getFlyTypeIcon(type)}
                size={18}
                color={colors.primary[500]}
              />
              <Text style={styles.typeSectionTitle}>
                {formatFlyType(type)}s ({groupedItems[type].length})
              </Text>
            </View>
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

        {/* Shop Section */}
        <View style={styles.shopSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="storefront" size={20} color={colors.text.primary} />
            <Text style={styles.shopSectionTitle}>Where to Buy</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.localShopsButton,
              pressed && styles.buttonPressed,
              isLoadingShops && styles.localShopsButtonDisabled,
            ]}
            onPress={handleFindLocalShops}
            disabled={isLoadingShops}
          >
            <LinearGradient
              colors={gradients.secondaryButton as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.localShopsButtonGradient}
            >
              {isLoadingShops ? (
                <ActivityIndicator size="small" color={colors.text.inverse} style={{ marginRight: spacing[3] }} />
              ) : (
                <Ionicons name="location" size={24} color={colors.text.inverse} style={{ marginRight: spacing[3] }} />
              )}
              <View style={styles.localShopsInfo}>
                <Text style={styles.localShopsTitle}>Find Local Fly Shops</Text>
                <Text style={styles.localShopsSubtitle}>
                  {primaryWaterBody
                    ? `Near ${primaryWaterBody}`
                    : 'Support local shops near you'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.inverse} />
            </LinearGradient>
          </Pressable>

          <Text style={styles.onlineShopsLabel}>Online Retailers</Text>
          {ONLINE_SHOPS.map((shop) => (
            <Pressable
              key={shop.id}
              style={({ pressed }) => [
                styles.shopCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleOpenShop(shop.website)}
            >
              <View style={styles.shopIconContainer}>
                <Ionicons name="globe-outline" size={20} color={colors.primary[500]} />
              </View>
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopDescription}>{shop.description}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.neutral[400]} />
            </Pressable>
          ))}
        </View>

        {/* Clear Button */}
        <Pressable
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.cardPressed,
          ]}
          onPress={handleClearBox}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error.main} />
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
      <View style={styles.itemIconContainer}>
        <MaterialCommunityIcons
          name={getFlyTypeIcon(item.flyType || 'other')}
          size={24}
          color={colors.primary[500]}
        />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.flyName}</Text>
        <Text style={styles.itemMeta}>
          Size {item.size}
          {item.addedFrom && ` | ${item.addedFrom}`}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onUpdateQuantity(item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={colors.text.secondary} />
        </Pressable>
        <Text style={styles.quantityValue}>{item.quantity}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            styles.quantityButtonAdd,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onUpdateQuantity(item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color={colors.primary[600]} />
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.removeButton,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onRemove}
      >
        <Ionicons name="close" size={14} color={colors.error.main} />
      </Pressable>
    </View>
  );
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
    backgroundColor: colors.background.secondary,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyIconContainer: {
    marginBottom: spacing[6],
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  browseButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.primaryGlow,
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3.5],
    paddingHorizontal: spacing[6],
    gap: spacing[2],
  },
  browseButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  // Header
  header: {
    marginBottom: spacing[4],
  },
  headerGradient: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing[6],
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing[0.5],
  },
  // Type Sections
  typeSection: {
    marginBottom: spacing[4],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  typeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  typeSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Item Card
  itemCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[3],
    marginBottom: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background.water,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonAdd: {
    backgroundColor: colors.primary[50],
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Shop Section
  shopSection: {
    marginTop: spacing[4],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  shopSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  localShopsButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  localShopsButtonDisabled: {
    opacity: 0.7,
  },
  localShopsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  localShopsInfo: {
    flex: 1,
  },
  localShopsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  localShopsSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  onlineShopsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  shopCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[4],
    marginBottom: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  shopIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  shopDescription: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // Clear Button
  clearButton: {
    margin: layout.screenPaddingHorizontal,
    marginTop: spacing[6],
    marginBottom: spacing[8],
    padding: spacing[4],
    borderRadius: borderRadius.base,
    backgroundColor: colors.error.light,
    borderWidth: 1,
    borderColor: colors.error.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  clearButtonText: {
    color: colors.error.main,
    fontSize: 15,
    fontWeight: '600',
  },
});
