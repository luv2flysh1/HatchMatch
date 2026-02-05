import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type {
  Trip, TripWater, TripWithWaters, CreateTripInput,
  FlyRecommendation, TripFlyRecommendation,
} from '../types/database';

interface TripState {
  trips: Trip[];
  currentTrip: TripWithWaters | null;
  isLoading: boolean;
  error: string | null;

  // Trip recommendations
  tripRecommendations: TripFlyRecommendation[];
  isLoadingRecs: boolean;
  recsError: string | null;
  recsProgress: { done: number; total: number } | null;

  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  createTrip: (trip: CreateTripInput) => Promise<string | null>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addWaterToTrip: (tripId: string, waterBodyId: string) => Promise<void>;
  removeWaterFromTrip: (tripId: string, waterBodyId: string) => Promise<void>;
  reorderTripWaters: (tripId: string, waterIds: string[]) => Promise<void>;
  fetchTripRecommendations: () => Promise<void>;
  clearTripRecommendations: () => void;
  clearError: () => void;
  clearCurrentTrip: () => void;
}

// Fetch recommendations for a single water body without touching global store state
async function fetchRecsForWater(waterBodyId: string): Promise<FlyRecommendation[]> {
  // Check cache first
  const today = new Date().toISOString().split('T')[0];
  const { data: cached } = await supabase
    .from('recommendation_cache')
    .select('*')
    .eq('water_body_id', waterBodyId)
    .eq('date', today)
    .single();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.recommendations || [];
  }

  // Fetch fresh from edge function
  const { data, error } = await supabase.functions.invoke('get-recommendations', {
    body: { water_body_id: waterBodyId },
  });

  if (error || !data?.recommendations) {
    return [];
  }

  return data.recommendations;
}

// Aggregate recommendations across multiple waters into a ranked trip fly selection
function aggregateRecommendations(
  perWater: { waterName: string; recs: FlyRecommendation[] }[]
): TripFlyRecommendation[] {
  const flyMap = new Map<string, {
    fly_name: string;
    fly_type: FlyRecommendation['fly_type'];
    size: string;
    confidences: number[];
    techniques: string[];
    reasonings: string[];
    waters: string[];
    image_url?: string | null;
  }>();

  for (const { waterName, recs } of perWater) {
    for (const rec of recs) {
      const key = rec.fly_name.toLowerCase();

      if (flyMap.has(key)) {
        const existing = flyMap.get(key)!;
        existing.confidences.push(rec.confidence);
        if (!existing.waters.includes(waterName)) {
          existing.waters.push(waterName);
        }
        if (!existing.techniques.includes(rec.technique)) {
          existing.techniques.push(rec.technique);
        }
        existing.reasonings.push(rec.reasoning);
        if (!existing.image_url && rec.image_url) {
          existing.image_url = rec.image_url;
        }
      } else {
        flyMap.set(key, {
          fly_name: rec.fly_name,
          fly_type: rec.fly_type,
          size: rec.size,
          confidences: [rec.confidence],
          techniques: [rec.technique],
          reasonings: [rec.reasoning],
          waters: [waterName],
          image_url: rec.image_url,
        });
      }
    }
  }

  // Convert to array and rank
  const aggregated: TripFlyRecommendation[] = [];

  for (const entry of flyMap.values()) {
    const avgConfidence = Math.round(
      entry.confidences.reduce((a, b) => a + b, 0) / entry.confidences.length
    );

    // Build a combined reasoning: if multiple waters, summarize
    let reasoning: string;
    if (entry.waters.length > 1) {
      reasoning = `Recommended for ${entry.waters.join(' and ')}. ${entry.reasonings[0]}`;
    } else {
      reasoning = entry.reasonings[0];
    }

    aggregated.push({
      fly_name: entry.fly_name,
      fly_type: entry.fly_type,
      size: entry.size,
      confidence: avgConfidence,
      technique: entry.techniques[0],
      reasoning,
      waters: entry.waters,
      image_url: entry.image_url,
    });
  }

  // Sort: flies appearing on more waters first, then by confidence
  aggregated.sort((a, b) => {
    if (b.waters.length !== a.waters.length) {
      return b.waters.length - a.waters.length;
    }
    return b.confidence - a.confidence;
  });

  return aggregated;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,
  tripRecommendations: [],
  isLoadingRecs: false,
  recsError: null,
  recsProgress: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      set({ trips: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchTrip: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trip_waters (
            id,
            trip_id,
            water_body_id,
            order,
            water_body:water_bodies (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      // Sort trip_waters by order
      if (data?.trip_waters) {
        data.trip_waters.sort((a: TripWater, b: TripWater) => a.order - b.order);
      }

      set({ currentTrip: data as TripWithWaters, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTrip: async (trip: CreateTripInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ error: 'Not authenticated', isLoading: false });
        return null;
      }

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: trip.name,
          start_date: trip.start_date,
          end_date: trip.end_date || null,
          notes: trip.notes || null,
        })
        .select()
        .single();

      if (error) {
        set({ error: error.message, isLoading: false });
        return null;
      }

      // Add to local trips list
      const { trips } = get();
      set({
        trips: [data, ...trips],
        isLoading: false,
      });

      return data.id;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },

  updateTrip: async (id: string, updates: Partial<Trip>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id);

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      // Update local state
      const { trips, currentTrip } = get();
      set({
        trips: trips.map(t => t.id === id ? { ...t, ...updates } : t),
        currentTrip: currentTrip?.id === id
          ? { ...currentTrip, ...updates }
          : currentTrip,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteTrip: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const { trips, currentTrip } = get();
      set({
        trips: trips.filter(t => t.id !== id),
        currentTrip: currentTrip?.id === id ? null : currentTrip,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addWaterToTrip: async (tripId: string, waterBodyId: string) => {
    set({ error: null });
    try {
      // Get current max order
      const { currentTrip } = get();
      const maxOrder = currentTrip?.trip_waters?.length
        ? Math.max(...currentTrip.trip_waters.map(tw => tw.order))
        : -1;

      const { error } = await supabase
        .from('trip_waters')
        .insert({
          trip_id: tripId,
          water_body_id: waterBodyId,
          order: maxOrder + 1,
        });

      if (error) {
        if (error.code === '23505') {
          set({ error: 'This water is already in the trip' });
        } else {
          set({ error: error.message });
        }
        return;
      }

      // Refresh trip to get updated waters with joined data
      await get().fetchTrip(tripId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeWaterFromTrip: async (tripId: string, waterBodyId: string) => {
    set({ error: null });
    try {
      const { error } = await supabase
        .from('trip_waters')
        .delete()
        .eq('trip_id', tripId)
        .eq('water_body_id', waterBodyId);

      if (error) {
        set({ error: error.message });
        return;
      }

      // Update local state
      const { currentTrip } = get();
      if (currentTrip && currentTrip.id === tripId) {
        set({
          currentTrip: {
            ...currentTrip,
            trip_waters: currentTrip.trip_waters.filter(
              tw => tw.water_body_id !== waterBodyId
            ),
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  reorderTripWaters: async (tripId: string, waterIds: string[]) => {
    set({ error: null });
    try {
      // Update each water's order
      const updates = waterIds.map((waterBodyId, index) =>
        supabase
          .from('trip_waters')
          .update({ order: index })
          .eq('trip_id', tripId)
          .eq('water_body_id', waterBodyId)
      );

      await Promise.all(updates);

      // Update local state
      const { currentTrip } = get();
      if (currentTrip && currentTrip.id === tripId) {
        const reordered = [...currentTrip.trip_waters].sort((a, b) => {
          const aIdx = waterIds.indexOf(a.water_body_id);
          const bIdx = waterIds.indexOf(b.water_body_id);
          return aIdx - bIdx;
        });
        set({
          currentTrip: {
            ...currentTrip,
            trip_waters: reordered.map((tw, i) => ({ ...tw, order: i })),
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchTripRecommendations: async () => {
    const { currentTrip } = get();
    if (!currentTrip?.trip_waters?.length) {
      set({ recsError: 'Add waters to your trip first' });
      return;
    }

    const waters = currentTrip.trip_waters.filter(tw => tw.water_body);
    if (waters.length === 0) {
      set({ recsError: 'No valid waters in this trip' });
      return;
    }

    set({
      isLoadingRecs: true,
      recsError: null,
      tripRecommendations: [],
      recsProgress: { done: 0, total: waters.length },
    });

    try {
      const perWater: { waterName: string; recs: FlyRecommendation[] }[] = [];

      // Fetch recommendations for each water sequentially to show progress
      for (let i = 0; i < waters.length; i++) {
        const tw = waters[i];
        const waterName = tw.water_body!.name;

        try {
          const recs = await fetchRecsForWater(tw.water_body_id);
          if (recs.length > 0) {
            perWater.push({ waterName, recs });
          }
        } catch (err) {
          // Skip this water but continue with others
          console.error(`Failed to get recs for ${waterName}:`, err);
        }

        set({ recsProgress: { done: i + 1, total: waters.length } });
      }

      if (perWater.length === 0) {
        set({
          isLoadingRecs: false,
          recsProgress: null,
          recsError: 'Could not get recommendations for any waters',
        });
        return;
      }

      const aggregated = aggregateRecommendations(perWater);

      set({
        tripRecommendations: aggregated,
        isLoadingRecs: false,
        recsProgress: null,
      });
    } catch (error) {
      set({
        recsError: (error as Error).message,
        isLoadingRecs: false,
        recsProgress: null,
      });
    }
  },

  clearTripRecommendations: () => set({
    tripRecommendations: [],
    recsError: null,
    recsProgress: null,
  }),

  clearError: () => set({ error: null }),
  clearCurrentTrip: () => set({
    currentTrip: null,
    tripRecommendations: [],
    recsError: null,
    recsProgress: null,
  }),
}));
