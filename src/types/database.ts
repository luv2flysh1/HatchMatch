// Database types matching Supabase schema

export type WaterBodyType = 'river' | 'lake' | 'stream' | 'creek' | 'pond';
export type FlyType = 'dry' | 'nymph' | 'streamer' | 'wet' | 'emerger';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserTier = 'free' | 'premium';
export type SubscriptionTier = 'premium' | 'season_pass';
export type InsectType = 'mayfly' | 'caddis' | 'stonefly' | 'midge' | 'terrestrial';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  home_latitude: number | null;
  home_longitude: number | null;
  skill_level: SkillLevel;
  tier: UserTier;
  created_at: string;
  updated_at: string;
}

export interface WaterBody {
  id: string;
  name: string;
  type: WaterBodyType;
  state: string;
  city: string | null;
  latitude: number;
  longitude: number;
  species: string[];
  usgs_site_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Fly {
  id: string;
  name: string;
  type: FlyType;
  sizes: string | null;
  image_url: string | null;
  description: string | null;
  species_targets: string[];
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  auto_refresh: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripWater {
  id: string;
  trip_id: string;
  water_body_id: string;
  order: number;
  water_body?: WaterBody;
}

export interface TripWithWaters extends Trip {
  trip_waters: TripWater[];
}

export interface CreateTripInput {
  name: string;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
}

export interface CatchReport {
  id: string;
  user_id: string;
  water_body_id: string;
  fly_id: string;
  caught_at: string;
  effectiveness: number | null;
  conditions: Record<string, any> | null;
  photo_url: string | null;
  is_public: boolean;
  notes: string | null;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  water_body_id: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  started_at: string;
  expires_at: string;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface FlyShop {
  id: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  hours: Record<string, any> | null;
  google_place_id: string | null;
  created_at: string;
}

export interface HatchChart {
  id: string;
  region: string;
  month: number;
  insect_name: string;
  insect_type: InsectType;
  fly_patterns: string[];
  time_of_day: string | null;
  water_types: string[];
}

export interface RecommendationCache {
  id: string;
  water_body_id: string;
  date: string;
  recommendations: FlyRecommendation[];
  conditions_snapshot: Record<string, any> | null;
  created_at: string;
  expires_at: string;
}

// App-specific types
export interface FlyRecommendation {
  fly_id: string;
  fly_name: string;
  fly_type: FlyType;
  confidence: number;
  reasoning: string;
  size: string;
  technique: string;
  image_url?: string | null;
}

export interface TripFlyRecommendation {
  fly_name: string;
  fly_type: FlyType;
  size: string;
  confidence: number;
  technique: string;
  reasoning: string;
  waters: string[];
  image_url?: string | null;
}
