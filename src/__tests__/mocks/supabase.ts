// Mock Supabase responses for testing

import type { Profile, WaterBody, Fly } from '../../types/database';

export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  created_at: '2026-01-01T00:00:00Z',
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
    default:
      return [];
  }
}
