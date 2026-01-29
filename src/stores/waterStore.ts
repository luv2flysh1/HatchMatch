import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { WaterBody } from '../types/database';

interface WaterState {
  // Data
  searchResults: WaterBody[];
  favorites: WaterBody[];
  selectedWater: WaterBody | null;
  recentSearches: string[];

  // UI State
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  // Actions
  searchByName: (query: string, state?: string) => Promise<void>;
  searchNearby: (latitude: number, longitude: number, radiusMiles?: number) => Promise<void>;
  getWaterBody: (id: string) => Promise<WaterBody | null>;
  getFavorites: () => Promise<void>;
  toggleFavorite: (waterBodyId: string) => Promise<{ error: Error | null }>;
  isFavorite: (waterBodyId: string) => boolean;
  clearSearch: () => void;
  clearError: () => void;
}

export const useWaterStore = create<WaterState>((set, get) => ({
  // Initial state
  searchResults: [],
  favorites: [],
  selectedWater: null,
  recentSearches: [],
  isLoading: false,
  isSearching: false,
  error: null,

  searchByName: async (query: string, state?: string) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true, error: null });

    try {
      let queryBuilder = supabase
        .from('water_bodies')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(20);

      if (state) {
        queryBuilder = queryBuilder.eq('state', state.toUpperCase());
      }

      const { data, error } = await queryBuilder;

      if (error) {
        set({ error: error.message, isSearching: false });
        return;
      }

      // Add to recent searches
      const { recentSearches } = get();
      const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);

      set({
        searchResults: data || [],
        recentSearches: updatedRecent,
        isSearching: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isSearching: false,
      });
    }
  },

  searchNearby: async (latitude: number, longitude: number, radiusMiles = 50) => {
    set({ isSearching: true, error: null });

    try {
      // For now, we'll fetch all waters and filter/sort client-side
      // In production, you'd use PostGIS for efficient geo queries
      const { data, error } = await supabase
        .from('water_bodies')
        .select('*');

      if (error) {
        set({ error: error.message, isSearching: false });
        return;
      }

      if (!data) {
        set({ searchResults: [], isSearching: false });
        return;
      }

      // Calculate distances and filter
      const watersWithDistance = data
        .map(water => ({
          ...water,
          distance: calculateDistance(latitude, longitude, water.latitude, water.longitude),
        }))
        .filter(water => water.distance <= radiusMiles)
        .sort((a, b) => a.distance - b.distance);

      set({
        searchResults: watersWithDistance,
        isSearching: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isSearching: false,
      });
    }
  },

  getWaterBody: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('water_bodies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message, isLoading: false });
        return null;
      }

      set({ selectedWater: data, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
      return null;
    }
  },

  getFavorites: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          water_body_id,
          water_bodies (*)
        `);

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const favorites = data
        ?.map((f: any) => f.water_bodies)
        .filter(Boolean) || [];

      set({ favorites, isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  toggleFavorite: async (waterBodyId: string) => {
    const { favorites } = get();
    const isFav = favorites.some(f => f.id === waterBodyId);

    try {
      if (isFav) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('water_body_id', waterBodyId);

        if (error) return { error };

        set({
          favorites: favorites.filter(f => f.id !== waterBodyId),
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ water_body_id: waterBodyId });

        if (error) return { error };

        // Fetch the water body to add to favorites list
        const water = get().searchResults.find(w => w.id === waterBodyId)
          || get().selectedWater;

        if (water) {
          set({ favorites: [...favorites, water] });
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  isFavorite: (waterBodyId: string) => {
    return get().favorites.some(f => f.id === waterBodyId);
  },

  clearSearch: () => {
    set({ searchResults: [], error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Helper function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
