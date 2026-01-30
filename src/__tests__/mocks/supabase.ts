// Mock Supabase responses for testing

import type { User } from '@supabase/supabase-js';
import type { Profile, WaterBody, Fly } from '../../types/database';

export const mockUser: User = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  created_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  user: mockUser,
};

export const mockProfile: Profile = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  name: 'Test Angler',
  home_latitude: 39.7392,
  home_longitude: -104.9903,
  skill_level: 'intermediate',
  tier: 'free',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockWaterBodies: WaterBody[] = [
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
    description: 'Popular urban tailwater fishery',
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
];

export const mockFlies: Fly[] = [
  {
    id: 'fly-1',
    name: 'Parachute Adams',
    type: 'dry',
    sizes: '12-20',
    image_url: null,
    description: 'Versatile mayfly imitation',
    species_targets: ['rainbow trout', 'brown trout'],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'fly-2',
    name: 'Pheasant Tail Nymph',
    type: 'nymph',
    sizes: '14-20',
    image_url: null,
    description: 'Year-round producer',
    species_targets: ['rainbow trout', 'brown trout'],
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Mock fishing report data
export const mockFishingReport = {
  id: 'report-1',
  water_body_id: 'water-1',
  water_body_name: 'South Platte River',
  source_name: '2 fly shops',
  source_url: 'https://example-flyshop.com/reports',
  report_date: '2026-01-28',
  report_text: '[{"name":"Trouts Fly Fishing","url":"https://trouts.com/reports"}]',
  extracted_flies: ['Zebra Midge', 'RS2', 'Pheasant Tail', 'BWO'],
  extracted_conditions: {
    water_temp: '42°F',
    water_clarity: 'clear',
    water_level: 'normal',
  },
  effectiveness_notes: 'Midges are producing well in the morning. BWO activity in the afternoon.',
  scraped_at: '2026-01-30T10:00:00Z',
  expires_at: '2026-02-02T10:00:00Z',
  created_at: '2026-01-30T10:00:00Z',
};

// Mock fly shop sources
export const mockFlyShopSources = [
  {
    id: 'shop-1',
    name: 'Trouts Fly Fishing',
    website: 'https://trouts.com',
    reports_url: 'https://trouts.com/fishing-reports',
    state: 'CO',
    waters_covered: ['South Platte River', 'Cheesman Canyon'],
    is_active: true,
    last_successful_scrape: '2026-01-30T10:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'shop-2',
    name: 'Reds Fly Shop',
    website: 'https://redsflyfishing.com',
    reports_url: 'https://redsflyfishing.com/fishing-reports',
    state: 'WA',
    waters_covered: ['Yakima River', 'Rocky Ford Creek'],
    is_active: true,
    last_successful_scrape: '2026-01-29T15:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Helper to create mock Supabase client
export function createMockSupabaseClient(overrides = {}) {
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      ...overrides,
    },
    from: jest.fn((table: string) => createMockQueryBuilder(table)),
  };
}

function createMockQueryBuilder(table: string) {
  const mockData = getMockDataForTable(table);

  return {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockData[0] || null, error: null }),
    then: jest.fn().mockResolvedValue({ data: mockData, error: null }),
  };
}

function getMockDataForTable(table: string) {
  switch (table) {
    case 'profiles':
      return [mockProfile];
    case 'water_bodies':
      return mockWaterBodies;
    case 'flies':
      return mockFlies;
    case 'fishing_reports':
      return [mockFishingReport];
    case 'fly_shop_sources':
      return mockFlyShopSources;
    default:
      return [];
  }
}
