import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import TripsScreen from '../../app/(tabs)/trips';
import { useAuthStore } from '../../stores/authStore';
import { useTripStore } from '../../stores/tripStore';
import { router } from 'expo-router';

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
};

const mockTrips = [
  {
    id: 'trip-1',
    user_id: 'user-123',
    name: 'Spring Trip',
    start_date: '2026-04-01',
    end_date: '2026-04-03',
    notes: null,
    auto_refresh: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'trip-2',
    user_id: 'user-123',
    name: 'Past Trip',
    start_date: '2025-01-01',
    end_date: '2025-01-03',
    notes: null,
    auto_refresh: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Reset stores before each test
beforeEach(() => {
  useAuthStore.setState({
    user: mockUser,
    profile: null,
    isInitialized: true,
  });
  useTripStore.setState({
    trips: mockTrips,
    isLoading: false,
    error: null,
    fetchTrips: jest.fn(),
  });
  jest.clearAllMocks();
});

describe('TripsScreen', () => {
  describe('when user is not signed in', () => {
    beforeEach(() => {
      useAuthStore.setState({ user: null });
    });

    it('shows auth gate', () => {
      render(<TripsScreen />);

      expect(screen.getByText('Sign in to plan your trips')).toBeTruthy();
    });

    it('"Go to Profile" button is shown', () => {
      render(<TripsScreen />);

      expect(screen.getByText('Go to Profile')).toBeTruthy();
    });

    it('"Go to Profile" navigates to profile tab', () => {
      render(<TripsScreen />);

      fireEvent.press(screen.getByText('Go to Profile'));

      expect(router.push).toHaveBeenCalledWith('/(tabs)/profile');
    });
  });

  describe('when user is signed in', () => {
    it('"Plan New Trip" button is shown', () => {
      render(<TripsScreen />);

      expect(screen.getByText('Plan New Trip')).toBeTruthy();
    });

    it('"Plan New Trip" navigates to create trip', () => {
      render(<TripsScreen />);

      fireEvent.press(screen.getByText('Plan New Trip'));

      expect(router.push).toHaveBeenCalledWith('/trip/create');
    });

    it('renders trip cards', () => {
      render(<TripsScreen />);

      expect(screen.getByText('Spring Trip')).toBeTruthy();
      expect(screen.getByText('Past Trip')).toBeTruthy();
    });

    it('trip card tap navigates to trip detail', () => {
      render(<TripsScreen />);

      fireEvent.press(screen.getByText('Spring Trip'));

      expect(router.push).toHaveBeenCalledWith('/trip/trip-1');
    });

    it('separates upcoming and past trips', () => {
      render(<TripsScreen />);

      expect(screen.getByText('Upcoming')).toBeTruthy();
      expect(screen.getByText('Past Trips')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      useTripStore.setState({ trips: [] });
    });

    it('shows empty state when no trips', () => {
      render(<TripsScreen />);

      expect(screen.getByText('No trips planned')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when loading and no trips', () => {
      useTripStore.setState({
        trips: [],
        isLoading: true,
      });

      render(<TripsScreen />);

      // Loading state is shown - no trips message should not appear
      expect(screen.queryByText('No trips planned')).toBeNull();
    });
  });
});
