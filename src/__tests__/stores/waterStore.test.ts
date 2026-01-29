// Water Store Tests

import { useWaterStore } from '../../stores/waterStore';
import type { WaterBody } from '../../types/database';

// Mock Supabase
jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import { supabase } from '../../services/supabase';

// Test data
const mockWaterBodies: WaterBody[] = [
  {
    id: 'water-1',
    name: 'South Platte River',
    type: 'river',
    state: 'CO',
    city: 'Denver',
    latitude: 39.7392,
    longitude: -104.9903,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: null,
    description: 'Popular urban tailwater',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'water-2',
    name: 'Arkansas River',
    type: 'river',
    state: 'CO',
    city: 'Buena Vista',
    latitude: 38.8422,
    longitude: -106.1311,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: null,
    description: 'Gold Medal water',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'water-3',
    name: 'Blue River',
    type: 'river',
    state: 'CO',
    city: 'Silverthorne',
    latitude: 39.6344,
    longitude: -106.0706,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: null,
    description: 'Mountain tailwater',
    created_at: '2026-01-01T00:00:00Z',
  },
];

describe('waterStore', () => {
  beforeEach(() => {
    // Reset store state
    useWaterStore.setState({
      searchResults: [],
      favorites: [],
      selectedWater: null,
      recentSearches: [],
      isLoading: false,
      isSearching: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useWaterStore.getState();

      expect(state.searchResults).toEqual([]);
      expect(state.favorites).toEqual([]);
      expect(state.selectedWater).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSearching).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('searchByName', () => {
    it('should search water bodies by name', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockIlike = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: [mockWaterBodies[0]],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        order: mockOrder,
        limit: mockLimit,
      });

      const { searchByName } = useWaterStore.getState();
      await searchByName('South Platte');

      expect(supabase.from).toHaveBeenCalledWith('water_bodies');
      expect(mockIlike).toHaveBeenCalledWith('name', '%South Platte%');

      const state = useWaterStore.getState();
      expect(state.searchResults).toEqual([mockWaterBodies[0]]);
      expect(state.isSearching).toBe(false);
    });

    it('should clear results for empty query', async () => {
      useWaterStore.setState({ searchResults: mockWaterBodies });

      const { searchByName } = useWaterStore.getState();
      await searchByName('');

      const state = useWaterStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should filter by state when provided', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockIlike = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: mockWaterBodies.filter(w => w.state === 'CO'),
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        ilike: mockIlike,
        order: mockOrder,
        limit: mockLimit,
        eq: mockEq,
      });

      const { searchByName } = useWaterStore.getState();
      await searchByName('River', 'CO');

      expect(mockEq).toHaveBeenCalledWith('state', 'CO');
    });

    it('should add to recent searches', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { searchByName } = useWaterStore.getState();
      await searchByName('Platte');

      const state = useWaterStore.getState();
      expect(state.recentSearches).toContain('Platte');
    });

    it('should handle search error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      const { searchByName } = useWaterStore.getState();
      await searchByName('Test');

      const state = useWaterStore.getState();
      expect(state.error).toBe('Database error');
      expect(state.isSearching).toBe(false);
    });
  });

  describe('searchNearby', () => {
    it('should find waters within radius', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockWaterBodies,
          error: null,
        }),
      });

      const { searchNearby } = useWaterStore.getState();
      // Search from Denver coordinates with 100 mile radius
      await searchNearby(39.7392, -104.9903, 100);

      const state = useWaterStore.getState();
      expect(state.searchResults.length).toBeGreaterThan(0);
      expect(state.isSearching).toBe(false);

      // Results should be sorted by distance
      const distances = state.searchResults.map((w: any) => w.distance);
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    });

    it('should filter out waters beyond radius', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockWaterBodies,
          error: null,
        }),
      });

      const { searchNearby } = useWaterStore.getState();
      // Very small radius - should filter most out
      await searchNearby(39.7392, -104.9903, 1);

      const state = useWaterStore.getState();
      // Only waters within 1 mile of Denver
      state.searchResults.forEach((water: any) => {
        expect(water.distance).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getWaterBody', () => {
    it('should fetch a single water body', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockWaterBodies[0],
          error: null,
        }),
      });

      const { getWaterBody } = useWaterStore.getState();
      const result = await getWaterBody('water-1');

      expect(result).toEqual(mockWaterBodies[0]);
      expect(useWaterStore.getState().selectedWater).toEqual(mockWaterBodies[0]);
    });

    it('should handle not found error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const { getWaterBody } = useWaterStore.getState();
      const result = await getWaterBody('invalid-id');

      expect(result).toBeNull();
      expect(useWaterStore.getState().error).toBe('Not found');
    });
  });

  describe('toggleFavorite', () => {
    it('should add to favorites', async () => {
      useWaterStore.setState({
        favorites: [],
        searchResults: mockWaterBodies,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      const { toggleFavorite } = useWaterStore.getState();
      const result = await toggleFavorite('water-1');

      expect(result.error).toBeNull();
      expect(useWaterStore.getState().favorites).toContainEqual(mockWaterBodies[0]);
    });

    it('should remove from favorites', async () => {
      useWaterStore.setState({
        favorites: [mockWaterBodies[0]],
      });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const { toggleFavorite } = useWaterStore.getState();
      const result = await toggleFavorite('water-1');

      expect(result.error).toBeNull();
      expect(useWaterStore.getState().favorites).not.toContainEqual(mockWaterBodies[0]);
    });
  });

  describe('isFavorite', () => {
    it('should return true if water is in favorites', () => {
      useWaterStore.setState({
        favorites: [mockWaterBodies[0]],
      });

      const { isFavorite } = useWaterStore.getState();
      expect(isFavorite('water-1')).toBe(true);
    });

    it('should return false if water is not in favorites', () => {
      useWaterStore.setState({
        favorites: [],
      });

      const { isFavorite } = useWaterStore.getState();
      expect(isFavorite('water-1')).toBe(false);
    });
  });

  describe('clearSearch', () => {
    it('should clear search results and error', () => {
      useWaterStore.setState({
        searchResults: mockWaterBodies,
        error: 'Some error',
      });

      const { clearSearch } = useWaterStore.getState();
      clearSearch();

      const state = useWaterStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(state.error).toBeNull();
    });
  });

  describe('isSearching state', () => {
    it('should be true during search', async () => {
      let searchingDuringCall = false;

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockImplementation(async () => {
          searchingDuringCall = useWaterStore.getState().isSearching;
          return { data: [], error: null };
        }),
      });

      const { searchByName } = useWaterStore.getState();
      await searchByName('Test');

      expect(searchingDuringCall).toBe(true);
      expect(useWaterStore.getState().isSearching).toBe(false);
    });
  });
});
