// Recommendation Store Tests

import { useRecommendationStore } from '../../stores/recommendationStore';
import type { FlyRecommendation } from '../../types/database';

// Mock Supabase
jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
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
const mockRecommendations: FlyRecommendation[] = [
  {
    fly_id: 'fly-1',
    fly_name: 'Parachute Adams',
    fly_type: 'dry',
    confidence: 85,
    reasoning: 'PMD hatch expected in afternoon.',
    size: '14-18',
    technique: 'dead drift',
  },
  {
    fly_id: 'fly-2',
    fly_name: 'Pheasant Tail Nymph',
    fly_type: 'nymph',
    confidence: 80,
    reasoning: 'Effective year-round pattern.',
    size: '16-20',
    technique: 'dead drift under indicator',
  },
  {
    fly_id: 'fly-3',
    fly_name: 'Elk Hair Caddis',
    fly_type: 'dry',
    confidence: 75,
    reasoning: 'Caddis activity increasing.',
    size: '14-16',
    technique: 'dead drift or skate',
  },
];

const mockCachedData = {
  water_body_id: 'water-1',
  date: new Date().toISOString().split('T')[0],
  recommendations: mockRecommendations,
  conditions_summary: 'Clear skies, 65°F',
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
};

describe('recommendationStore', () => {
  beforeEach(() => {
    // Reset store state
    useRecommendationStore.setState({
      recommendations: [],
      conditionsSummary: null,
      lastUpdated: null,
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useRecommendationStore.getState();

      expect(state.recommendations).toEqual([]);
      expect(state.conditionsSummary).toBeNull();
      expect(state.lastUpdated).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('getRecommendations', () => {
    it('should fetch recommendations from Edge Function when no cache', async () => {
      // Mock cache miss
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      // Mock Edge Function response
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          recommendations: mockRecommendations,
          conditions_summary: 'Clear skies, 65°F',
        },
        error: null,
      });

      const { getRecommendations } = useRecommendationStore.getState();
      await getRecommendations('water-1');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('get-recommendations', {
        body: { water_body_id: 'water-1' },
      });

      const state = useRecommendationStore.getState();
      expect(state.recommendations).toEqual(mockRecommendations);
      expect(state.conditionsSummary).toBe('Clear skies, 65°F');
      expect(state.isLoading).toBe(false);
    });

    it('should use cached recommendations when available', async () => {
      // Mock cache hit
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCachedData, error: null }),
      });

      const { getRecommendations } = useRecommendationStore.getState();
      await getRecommendations('water-1');

      // Should NOT call Edge Function when cache is valid
      expect(supabase.functions.invoke).not.toHaveBeenCalled();

      const state = useRecommendationStore.getState();
      expect(state.recommendations).toEqual(mockRecommendations);
    });

    it('should force refresh when requested', async () => {
      // Mock cache hit (but we're forcing refresh)
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockCachedData, error: null }),
        })
        .mockReturnValue({
          upsert: jest.fn().mockResolvedValue({ error: null }),
        });

      // Mock Edge Function response
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          recommendations: mockRecommendations,
          conditions_summary: 'Updated conditions',
        },
        error: null,
      });

      const { getRecommendations } = useRecommendationStore.getState();
      await getRecommendations('water-1', true); // Force refresh

      // Should call Edge Function even with cache
      expect(supabase.functions.invoke).toHaveBeenCalled();
    });

    it('should handle Edge Function error', async () => {
      // Mock cache miss
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      // Mock Edge Function error
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Service unavailable' },
      });

      const { getRecommendations } = useRecommendationStore.getState();
      await getRecommendations('water-1');

      const state = useRecommendationStore.getState();
      expect(state.error).toBe('Service unavailable');
      expect(state.isLoading).toBe(false);
      expect(state.recommendations).toEqual([]);
    });

    it('should handle invalid response', async () => {
      // Mock cache miss
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      // Mock invalid Edge Function response
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { invalid: 'response' },
        error: null,
      });

      const { getRecommendations } = useRecommendationStore.getState();
      await getRecommendations('water-1');

      const state = useRecommendationStore.getState();
      expect(state.error).toBe('Invalid response from recommendations service');
    });
  });

  describe('clearRecommendations', () => {
    it('should clear all recommendation data', () => {
      // Set some data first
      useRecommendationStore.setState({
        recommendations: mockRecommendations,
        conditionsSummary: 'Some conditions',
        lastUpdated: new Date(),
        error: 'Some error',
      });

      const { clearRecommendations } = useRecommendationStore.getState();
      clearRecommendations();

      const state = useRecommendationStore.getState();
      expect(state.recommendations).toEqual([]);
      expect(state.conditionsSummary).toBeNull();
      expect(state.lastUpdated).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error only', () => {
      useRecommendationStore.setState({
        recommendations: mockRecommendations,
        error: 'Some error',
      });

      const { clearError } = useRecommendationStore.getState();
      clearError();

      const state = useRecommendationStore.getState();
      expect(state.error).toBeNull();
      expect(state.recommendations).toEqual(mockRecommendations); // Should keep recommendations
    });
  });

  describe('isLoading state', () => {
    it('should be true during fetch', async () => {
      let loadingDuringFetch = false;

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      (supabase.functions.invoke as jest.Mock).mockImplementation(async () => {
        loadingDuringFetch = useRecommendationStore.getState().isLoading;
        return {
          data: { recommendations: mockRecommendations },
          error: null,
        };
      });

      const { getRecommendations } = useRecommendationStore.getState();
      await getRecommendations('water-1');

      expect(loadingDuringFetch).toBe(true);
      expect(useRecommendationStore.getState().isLoading).toBe(false);
    });
  });

  describe('recommendation data structure', () => {
    it('should have all required fields in recommendations', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { recommendations: mockRecommendations },
        error: null,
      });

      const { getRecommendations } = useRecommendationStore.getState();
      await getRecommendations('water-1');

      const state = useRecommendationStore.getState();
      state.recommendations.forEach((rec) => {
        expect(rec).toHaveProperty('fly_id');
        expect(rec).toHaveProperty('fly_name');
        expect(rec).toHaveProperty('fly_type');
        expect(rec).toHaveProperty('confidence');
        expect(rec).toHaveProperty('reasoning');
        expect(rec).toHaveProperty('size');
        expect(rec).toHaveProperty('technique');

        expect(typeof rec.confidence).toBe('number');
        expect(rec.confidence).toBeGreaterThanOrEqual(1);
        expect(rec.confidence).toBeLessThanOrEqual(100);
      });
    });
  });
});
