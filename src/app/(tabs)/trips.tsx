import { View, Text, StyleSheet, Pressable, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { useTripStore } from '../../stores/tripStore';
import { colors, spacing, borderRadius, shadows, gradients, layout } from '../../theme';
import type { Trip } from '../../types/database';

function getTripStatus(trip: Trip): 'upcoming' | 'active' | 'past' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(trip.start_date + 'T00:00:00');
  const end = trip.end_date ? new Date(trip.end_date + 'T23:59:59') : new Date(trip.start_date + 'T23:59:59');

  if (today >= start && today <= end) return 'active';
  if (today < start) return 'upcoming';
  return 'past';
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const yearOptions: Intl.DateTimeFormatOptions = { ...options, year: 'numeric' };

  if (!endDate) {
    return start.toLocaleDateString('en-US', yearOptions);
  }

  const end = new Date(endDate + 'T00:00:00');
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', options)} - ${end.getDate()}, ${end.getFullYear()}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', yearOptions)}`;
  }

  return `${start.toLocaleDateString('en-US', yearOptions)} - ${end.toLocaleDateString('en-US', yearOptions)}`;
}

export default function TripsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { trips, isLoading, fetchTrips } = useTripStore();

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    fetchTrips();
  }, [fetchTrips]);

  const { upcoming, past } = useMemo(() => {
    const upcoming: Trip[] = [];
    const past: Trip[] = [];

    trips.forEach(trip => {
      const status = getTripStatus(trip);
      if (status === 'past') {
        past.push(trip);
      } else {
        upcoming.push(trip);
      }
    });

    // Upcoming sorted by start_date ascending (nearest first)
    upcoming.sort((a, b) => a.start_date.localeCompare(b.start_date));
    // Past sorted by start_date descending (most recent first)
    past.sort((a, b) => b.start_date.localeCompare(a.start_date));

    return { upcoming, past };
  }, [trips]);

  // Auth gate
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.authGate}>
          <Ionicons name="calendar-outline" size={64} color={colors.neutral[300]} />
          <Text style={styles.authGateTitle}>Sign in to plan your trips</Text>
          <Text style={styles.authGateSubtitle}>
            Create trips, add waters, and get tailored fly recommendations for your fishing adventures.
          </Text>
          <Pressable
            style={styles.goToProfileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.goToProfileButtonText}>Go to Profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderTripCard = ({ item: trip }: { item: Trip }) => {
    const status = getTripStatus(trip);

    return (
      <Pressable
        style={styles.tripCard}
        onPress={() => router.push(`/trip/${trip.id}`)}
      >
        <View style={styles.tripCardContent}>
          <View style={styles.tripCardLeft}>
            <View style={[
              styles.statusDot,
              status === 'active' && styles.statusActive,
              status === 'upcoming' && styles.statusUpcoming,
              status === 'past' && styles.statusPast,
            ]} />
            <View style={styles.tripCardInfo}>
              <Text style={styles.tripName}>{trip.name}</Text>
              <Text style={styles.tripDates}>
                {formatDateRange(trip.start_date, trip.end_date)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
        </View>
      </Pressable>
    );
  };

  const hasTrips = upcoming.length > 0 || past.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Create Trip Button */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push('/trip/create')}
      >
        <LinearGradient
          colors={gradients.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButtonGradient}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.text.inverse} />
          <Text style={styles.createButtonText}>Plan New Trip</Text>
        </LinearGradient>
      </Pressable>

      {isLoading && trips.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : !hasTrips ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={56} color={colors.neutral[300]} />
          <Text style={styles.emptyStateTitle}>No trips planned</Text>
          <Text style={styles.emptyStateText}>
            Create your first trip to get fly recommendations for your upcoming fishing adventures.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {upcoming.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Upcoming</Text>
                  {upcoming.map(trip => (
                    <View key={trip.id}>
                      {renderTripCard({ item: trip })}
                    </View>
                  ))}
                </View>
              )}

              {past.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Past Trips</Text>
                  {past.map(trip => (
                    <View key={trip.id}>
                      {renderTripCard({ item: trip })}
                    </View>
                  ))}
                </View>
              )}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  // Auth gate
  authGate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  authGateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  authGateSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[6],
  },
  goToProfileButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  goToProfileButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  // Create button
  createButton: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3.5],
    gap: spacing[2],
  },
  createButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Sections
  listContent: {
    paddingBottom: spacing[8],
  },
  section: {
    marginTop: spacing[3],
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing[2],
  },
  // Trip card
  tripCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing[2],
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
  tripCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  tripCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing[3],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neutral[300],
  },
  statusActive: {
    backgroundColor: colors.success.main,
  },
  statusUpcoming: {
    backgroundColor: colors.primary[500],
  },
  statusPast: {
    backgroundColor: colors.neutral[300],
  },
  tripCardInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing[0.5],
  },
  tripDates: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
});
