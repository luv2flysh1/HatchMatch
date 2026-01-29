// Auth Store Tests
// Note: These tests mock the Supabase client to test store logic in isolation

import { useAuthStore } from '../../stores/authStore';
import type { Profile } from '../../types/database';
import type { User, Session } from '@supabase/supabase-js';

// Mock the supabase module before importing
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock expo-secure-store and Platform
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import { supabase } from '../../services/supabase';

// Test data - using type assertions for partial mocks
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  created_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
} as User;

const mockSession = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  user: mockUser,
  expires_in: 3600,
  token_type: 'bearer',
} as Session;

const mockProfile: Profile = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test Angler',
  home_latitude: 39.7392,
  home_longitude: -104.9903,
  skill_level: 'intermediate',
  tier: 'free',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isInitialized: false,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      // Mock successful signup
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile fetch
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
      });

      const { signUp } = useAuthStore.getState();
      const result = await signUp('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
    });

    it('should return error when signup fails', async () => {
      const mockError = new Error('Email already registered');
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      });

      const { signUp } = useAuthStore.getState();
      const result = await signUp('test@example.com', 'password123');

      expect(result.error).toEqual(mockError);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in an existing user successfully', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
      });

      const { signIn } = useAuthStore.getState();
      const result = await signIn('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should return error for invalid credentials', async () => {
      const mockError = new Error('Invalid login credentials');
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      });

      const { signIn } = useAuthStore.getState();
      const result = await signIn('test@example.com', 'wrongpassword');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('should sign out user and clear state', async () => {
      // Set up logged-in state
      useAuthStore.setState({
        user: mockUser,
        profile: mockProfile,
        session: mockSession,
      });

      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

      const { signOut } = useAuthStore.getState();
      await signOut();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.session).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('fetchProfile', () => {
    it('should fetch user profile when logged in', async () => {
      useAuthStore.setState({ user: mockUser });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
      });

      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();

      const state = useAuthStore.getState();
      expect(state.profile).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should not fetch profile when not logged in', async () => {
      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      useAuthStore.setState({ user: mockUser, profile: mockProfile });

      const updatedProfile = { ...mockProfile, name: 'Updated Name' };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValueOnce({ error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: updatedProfile, error: null }),
        });

      const { updateProfile } = useAuthStore.getState();
      const result = await updateProfile({ name: 'Updated Name' });

      expect(result.error).toBeNull();
    });

    it('should return error when not authenticated', async () => {
      const { updateProfile } = useAuthStore.getState();
      const result = await updateProfile({ name: 'Test' });

      expect(result.error?.message).toBe('Not authenticated');
    });
  });

  describe('isLoading state', () => {
    it('should set isLoading during signIn', async () => {
      let loadingDuringCall = false;

      (supabase.auth.signInWithPassword as jest.Mock).mockImplementation(async () => {
        loadingDuringCall = useAuthStore.getState().isLoading;
        return { data: { user: mockUser, session: mockSession }, error: null };
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      });

      const { signIn } = useAuthStore.getState();
      await signIn('test@example.com', 'password123');

      expect(loadingDuringCall).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
