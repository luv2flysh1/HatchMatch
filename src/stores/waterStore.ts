import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { WaterBody, WaterBodyType } from '../types/database';

// External water body result from USGS/GNIS lookup
export interface ExternalWaterBody {
  id: string;
  name: string;
  type: WaterBodyType;
  state: string;
  county?: string;
  latitude: number;
  longitude: number;
  source: 'usgs' | 'gnis';
  usgs_site_id?: string;
  huc?: string;
}

// US State name to abbreviation mapping
const STATE_NAME_TO_ABBR: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
};

// US State abbreviations
const US_STATES = Object.values(STATE_NAME_TO_ABBR);

// Get state abbreviation from name or abbreviation
function getStateAbbr(query: string): string | null {
  const upper = query.toUpperCase();
  const lower = query.toLowerCase();

  // Check if it's already an abbreviation
  if (US_STATES.includes(upper)) {
    return upper;
  }

  // Check if it's a full state name
  if (STATE_NAME_TO_ABBR[lower]) {
    return STATE_NAME_TO_ABBR[lower];
  }

  return null;
}

interface WaterState {
  // Data
  searchResults: WaterBody[];
  externalResults: ExternalWaterBody[];
  favorites: WaterBody[];
  selectedWater: WaterBody | null;
  recentSearches: string[];

  // UI State
  isLoading: boolean;
  isSearching: boolean;
  isSearchingExternal: boolean;
  error: string | null;
  lastSearchQuery: string;

  // Actions
  searchByName: (query: string, state?: string) => Promise<void>;
  searchNearby: (latitude: number, longitude: number, radiusMiles?: number) => Promise<void>;
  searchExternal: (query: string, state?: string) => Promise<void>;
  refreshExternalSearch: () => Promise<void>;
  getWaterBody: (id: string) => Promise<WaterBody | null>;
  getFavorites: () => Promise<void>;
  toggleFavorite: (waterBodyId: string) => Promise<{ error: Error | null }>;
  isFavorite: (waterBodyId: string) => boolean;
  addExternalWaterToDatabase: (water: ExternalWaterBody) => Promise<WaterBody | null>;
  clearSearch: () => void;
  clearError: () => void;
}

export const useWaterStore = create<WaterState>((set, get) => ({
  // Initial state
  searchResults: [],
  externalResults: [],
  favorites: [],
  selectedWater: null,
  recentSearches: [],
  isLoading: false,
  isSearching: false,
  isSearchingExternal: false,
  error: null,
  lastSearchQuery: '',

  searchByName: async (query: string, state?: string) => {
    if (!query.trim()) {
      set({ searchResults: [], externalResults: [], isSearching: false, lastSearchQuery: '' });
      return;
    }

    set({ isSearching: true, error: null, externalResults: [], lastSearchQuery: query.trim() });

    try {
      const trimmedQuery = query.trim();

      // Check if query is a US state name or abbreviation
      const stateAbbr = getStateAbbr(trimmedQuery);

      let queryBuilder;

      if (stateAbbr) {
        // Search for all waters in this state
        queryBuilder = supabase
          .from('water_bodies')
          .select('*')
          .eq('state', stateAbbr)
          .order('name')
          .limit(200);
      } else {
        // Search by name
        queryBuilder = supabase
          .from('water_bodies')
          .select('*')
          .ilike('name', `%${trimmedQuery}%`)
          .order('name')
          .limit(100);

        if (state) {
          queryBuilder = queryBuilder.eq('state', state.toUpperCase());
        }
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

  searchExternal: async (query: string, state?: string) => {
    if (!query.trim()) {
      set({ externalResults: [], isSearchingExternal: false });
      return;
    }

    set({ isSearchingExternal: true });

    try {
      const { data, error } = await supabase.functions.invoke('lookup-water', {
        body: {
          query: query.trim(),
          state: state?.toUpperCase(),
          limit: 15,
        },
      });

      if (error) {
        console.error('External lookup error:', error);
        set({ externalResults: [], isSearchingExternal: false });
        return;
      }

      set({
        externalResults: data?.results || [],
        isSearchingExternal: false,
      });
    } catch (error) {
      console.error('External search failed:', error);
      set({
        externalResults: [],
        isSearchingExternal: false,
      });
    }
  },

  refreshExternalSearch: async () => {
    const { lastSearchQuery, isSearchingExternal } = get();

    if (!lastSearchQuery.trim() || isSearchingExternal) {
      return;
    }

    set({ isSearchingExternal: true });

    try {
      const { data, error } = await supabase.functions.invoke('lookup-water', {
        body: {
          query: lastSearchQuery.trim(),
          limit: 15,
        },
      });

      if (error) {
        console.error('External lookup error:', error);
        set({ externalResults: [], isSearchingExternal: false });
        return;
      }

      set({
        externalResults: data?.results || [],
        isSearchingExternal: false,
      });
    } catch (error) {
      console.error('External search failed:', error);
      set({
        externalResults: [],
        isSearchingExternal: false,
      });
    }
  },

  addExternalWaterToDatabase: async (water: ExternalWaterBody) => {
    set({ isLoading: true, error: null });

    try {
      // Insert the external water body into our database
      const { data, error } = await supabase
        .from('water_bodies')
        .insert({
          name: water.name,
          type: water.type,
          state: water.state,
          city: water.county || null, // Use county as city if available
          latitude: water.latitude,
          longitude: water.longitude,
          species: [], // Will be populated later
          usgs_site_id: water.usgs_site_id || null,
          description: water.source === 'usgs'
            ? `Imported from USGS Water Services${water.huc ? ` (HUC: ${water.huc})` : ''}`
            : `Imported from USGS GNIS`,
        })
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate (water body already exists)
        if (error.code === '23505') {
          set({ error: 'This water body already exists in the database', isLoading: false });
        } else {
          set({ error: error.message, isLoading: false });
        }
        return null;
      }

      // Remove from external results and add to search results
      const { externalResults, searchResults } = get();
      set({
        externalResults: externalResults.filter(w => w.id !== water.id),
        searchResults: [data, ...searchResults],
        selectedWater: data,
        isLoading: false,
      });

      return data;
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
      return null;
    }
  },

  clearSearch: () => {
    set({ searchResults: [], externalResults: [], error: null, lastSearchQuery: '' });
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
