import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { FlyRecommendation } from '../types/database';

export interface FishingReport {
  source_name: string;
  report_date: string;
  effectiveness_notes: string;
  extracted_flies: string[];
  conditions: Record<string, any>;
}

interface RecommendationState {
  // Data
  recommendations: FlyRecommendation[];
  conditionsSummary: string | null;
  fishingReport: FishingReport | null;
  lastUpdated: Date | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  getRecommendations: (waterBodyId: string, forceRefresh?: boolean) => Promise<void>;
  clearRecommendations: () => void;
  clearError: () => void;
}

// Cache duration in milliseconds (12 hours)
const CACHE_DURATION = 12 * 60 * 60 * 1000;

export const useRecommendationStore = create<RecommendationState>((set, get) => ({
  recommendations: [],
  conditionsSummary: null,
  fishingReport: null,
  lastUpdated: null,
  isLoading: false,
  error: null,

  getRecommendations: async (waterBodyId: string, forceRefresh = false) => {
    set({ isLoading: true, error: null });

    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = await getCachedRecommendations(waterBodyId);
        if (cached) {
          set({
            recommendations: cached.recommendations,
            conditionsSummary: cached.conditions_snapshot?.conditions_summary || null,
            fishingReport: cached.conditions_snapshot?.fishing_report || null,
            lastUpdated: new Date(cached.created_at),
            isLoading: false,
          });
          return;
        }
      }

      // Call the Edge Function to get fresh recommendations
      const { data, error } = await supabase.functions.invoke('get-recommendations', {
        body: { water_body_id: waterBodyId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get recommendations');
      }

      if (!data || !data.recommendations) {
        throw new Error('Invalid response from recommendations service');
      }

      set({
        recommendations: data.recommendations,
        conditionsSummary: data.conditions_summary || null,
        fishingReport: data.fishing_report || null,
        lastUpdated: new Date(),
        isLoading: false,
      });

      // Cache the recommendations
      await cacheRecommendations(waterBodyId, data);

    } catch (error) {
      console.error('Error getting recommendations:', error);
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  clearRecommendations: () => {
    set({
      recommendations: [],
      conditionsSummary: null,
      fishingReport: null,
      lastUpdated: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Helper: Get cached recommendations from Supabase
async function getCachedRecommendations(waterBodyId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('recommendation_cache')
    .select('*')
    .eq('water_body_id', waterBodyId)
    .eq('date', today)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if cache is still valid
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    return null;
  }

  return data;
}

// Helper: Cache recommendations in Supabase
async function cacheRecommendations(
  waterBodyId: string,
  data: { recommendations: FlyRecommendation[]; conditions_summary?: string; fishing_report?: FishingReport | null }
) {
  const today = new Date().toISOString().split('T')[0];
  const expiresAt = new Date(Date.now() + CACHE_DURATION).toISOString();

  await supabase
    .from('recommendation_cache')
    .upsert({
      water_body_id: waterBodyId,
      date: today,
      recommendations: data.recommendations,
      conditions_snapshot: {
        conditions_summary: data.conditions_summary,
        fishing_report: data.fishing_report,
      },
      expires_at: expiresAt,
    }, {
      onConflict: 'water_body_id,date',
    });
}
