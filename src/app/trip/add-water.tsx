import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWaterStore } from '../../stores/waterStore';
import { useTripStore } from '../../stores/tripStore';
import { colors, spacing, borderRadius, shadows, layout } from '../../theme';
import type { WaterBody } from '../../types/database';

export default function AddWaterToTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { searchResults, isSearching, searchByName } = useWaterStore();
  const { currentTrip, addWaterToTrip, error: tripError } = useTripStore();

  const [query, setQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const existingWaterIds = new Set(
    currentTrip?.trip_waters?.map(tw => tw.water_body_id) || []
  );

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.trim().length >= 2) {
      searchByName(text);
    }
  }, [searchByName]);

  const handleAddWater = async (waterBodyId: string) => {
    setAddingId(waterBodyId);
    await addWaterToTrip(tripId, waterBodyId);
    setAddingId(null);
  };

  const renderWaterItem = ({ item }: { item: WaterBody }) => {
    const isAdded = existingWaterIds.has(item.id);
    const isAdding = addingId === item.id;

    return (
      <View style={styles.waterItem}>
        <View style={styles.waterItemLeft}>
          <View style={styles.waterIconContainer}>
            <MaterialCommunityIcons
              name={getWaterTypeIcon(item.type)}
              size={18}
              color={colors.primary[500]}
            />
          </View>
          <View style={styles.waterItemInfo}>
            <Text style={styles.waterName}>{item.name}</Text>
            <Text style={styles.waterMeta}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} | {item.state}
              {item.city ? ` | ${item.city}` : ''}
            </Text>
          </View>
        </View>

        {isAdded ? (
          <View style={styles.addedBadge}>
            <Ionicons name="checkmark" size={16} color={colors.success.main} />
            <Text style={styles.addedText}>Added</Text>
          </View>
        ) : (
          <Pressable
            style={styles.addButton}
            onPress={() => handleAddWater(item.id)}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <>
                <Ionicons name="add" size={16} color={colors.primary[500]} />
                <Text style={styles.addButtonText}>Add</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Add Water to Trip</Text>
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search waters by name or state..."
            placeholderTextColor={colors.neutral[400]}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); }}>
              <Ionicons name="close-circle" size={18} color={colors.neutral[400]} />
            </Pressable>
          )}
        </View>

        {tripError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{tripError}</Text>
          </View>
        )}

        {/* Results */}
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : query.trim().length < 2 ? (
          <View style={styles.promptContainer}>
            <Ionicons name="water-outline" size={40} color={colors.neutral[300]} />
            <Text style={styles.promptText}>
              Search for a river, lake, or stream to add to your trip
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.promptContainer}>
            <Ionicons name="search-outline" size={40} color={colors.neutral[300]} />
            <Text style={styles.promptText}>
              No results found for "{query}"
            </Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderWaterItem}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getWaterTypeIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type?.toLowerCase()) {
    case 'river':
    case 'stream':
      return 'waves';
    case 'lake':
      return 'waves';
    case 'creek':
      return 'water';
    default:
      return 'water-outline';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing[3],
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  doneButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    marginHorizontal: layout.screenPaddingHorizontal,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.text.primary,
  },
  errorBanner: {
    backgroundColor: colors.error.light,
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[2],
    padding: spacing[3],
    borderRadius: borderRadius.base,
  },
  errorText: {
    color: colors.error.main,
    fontSize: 13,
    textAlign: 'center',
  },
  // Loading/Prompt
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  promptText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[3],
    lineHeight: 20,
  },
  // List
  listContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: spacing[3],
    paddingBottom: spacing[8],
  },
  waterItem: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.card,
    padding: spacing[3],
    marginBottom: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.xs,
  },
  waterItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing[2.5],
  },
  waterIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.water,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterItemInfo: {
    flex: 1,
  },
  waterName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  waterMeta: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing[0.5],
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1.5],
    backgroundColor: colors.success.light,
    borderRadius: borderRadius.chip,
  },
  addedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success.main,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.chip,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary[500],
  },
});
