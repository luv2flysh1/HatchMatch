import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TripDetailScreen from '../../app/trip/[id]';
import { useTripStore } from '../../stores/tripStore';
import { useFlyBoxStore } from '../../stores/flyBoxStore';
import { useLocalSearchParams, router } from 'expo-router';

// Mock data
const mockTrip = {
  id: 'trip-123',
  user_id: 'user-123',
  name: 'Test Trip',
  start_date: '2026-03-15',
  end_date: '2026-03-17',
  notes: 'Some trip notes',
  auto_refresh: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  trip_waters: [
    {
      id: 'tw-1',
      trip_id: 'trip-123',
      water_body_id: 'water-1',
      order: 0,
      water_body: {
        id: 'water-1',
        name: 'South Platte River',
        type: 'river' as const,
        state: 'CO',
        city: 'Denver',
        latitude: 39.7392,
        longitude: -104.9903,
        species: ['rainbow trout', 'brown trout'],
        usgs_site_id: null,
        description: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    },
  ],
};

const mockRecommendations = [
  {
    fly_name: 'Parachute Adams',
    fly_type: 'dry' as const,
    size: '14',
    confidence: 85,
    technique: 'Dead drift',
    reasoning: 'Great for current conditions',
    waters: ['South Platte River'],
    image_url: null,
  },
  {
    fly_name: 'Zebra Midge',
    fly_type: 'nymph' as const,
    size: '18',
    confidence: 90,
    technique: 'Euro nymph',
    reasoning: 'Midges are hatching',
    waters: ['South Platte River'],
    image_url: null,
  },
];

// Mock useLocalSearchParams
beforeAll(() => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'trip-123' });
});

// Reset stores and mocks before each test
beforeEach(() => {
  useTripStore.setState({
    trips: [mockTrip],
    currentTrip: mockTrip,
    isLoading: false,
    error: null,
    tripRecommendations: [],
    isLoadingRecs: false,
    recsError: null,
    recsProgress: null,
    fetchTrip: jest.fn(),
    updateTrip: jest.fn(),
    deleteTrip: jest.fn(),
    removeWaterFromTrip: jest.fn(),
    fetchTripRecommendations: jest.fn(),
    clearTripRecommendations: jest.fn(),
    clearCurrentTrip: jest.fn(),
  });
  useFlyBoxStore.setState({
    items: [],
    addFly: jest.fn(),
    isInBox: jest.fn(() => false),
  });
  jest.clearAllMocks();
});

describe('TripDetailScreen', () => {
  describe('rendering', () => {
    it('renders trip name and water', () => {
      render(<TripDetailScreen />);

      expect(screen.getByText('Test Trip')).toBeTruthy();
      expect(screen.getByText('South Platte River')).toBeTruthy();
    });

    it('renders Add Water button', () => {
      render(<TripDetailScreen />);

      expect(screen.getByText('Add Water')).toBeTruthy();
    });

    it('renders Edit Trip and Delete Trip buttons', () => {
      render(<TripDetailScreen />);

      expect(screen.getByText('Edit Trip')).toBeTruthy();
      expect(screen.getByText('Delete Trip')).toBeTruthy();
    });

    it('shows loading state while trip loads', () => {
      useTripStore.setState({
        currentTrip: null,
        isLoading: true,
      });

      render(<TripDetailScreen />);

      expect(screen.getByText('Loading trip...')).toBeTruthy();
    });

    it('shows error state when trip not found', () => {
      useTripStore.setState({
        currentTrip: null,
        isLoading: false,
        error: 'Trip not found',
      });

      render(<TripDetailScreen />);

      expect(screen.getByText('Trip not found')).toBeTruthy();
    });
  });

  describe('recommendations', () => {
    it('"Get Fly Recommendations" button calls fetchTripRecommendations', () => {
      const mockFetch = jest.fn();
      useTripStore.setState({ fetchTripRecommendations: mockFetch });

      render(<TripDetailScreen />);

      // The button text contains the water count
      const button = screen.getByText(/Get Fly Recommendations/);
      fireEvent.press(button);

      expect(mockFetch).toHaveBeenCalled();
    });

    it('shows disabled state when no waters added', () => {
      useTripStore.setState({
        currentTrip: { ...mockTrip, trip_waters: [] },
      });

      render(<TripDetailScreen />);

      expect(screen.getByText('Add waters first')).toBeTruthy();
    });

    it('shows loading state with progress', () => {
      useTripStore.setState({
        isLoadingRecs: true,
        recsProgress: { done: 1, total: 2 },
      });

      render(<TripDetailScreen />);

      expect(screen.getByText('Analyzing 1 of 2 waters...')).toBeTruthy();
    });

    it('shows error state with Try Again button', () => {
      useTripStore.setState({
        recsError: 'Failed to get recommendations',
      });

      render(<TripDetailScreen />);

      expect(screen.getByText('Failed to get recommendations')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
    });

    it('"Try Again" calls fetchTripRecommendations', () => {
      const mockFetch = jest.fn();
      useTripStore.setState({
        fetchTripRecommendations: mockFetch,
        recsError: 'Failed to get recommendations',
      });

      render(<TripDetailScreen />);

      fireEvent.press(screen.getByText('Try Again'));

      expect(mockFetch).toHaveBeenCalled();
    });

    it('renders fly recommendations when available', () => {
      useTripStore.setState({ tripRecommendations: mockRecommendations });

      render(<TripDetailScreen />);

      expect(screen.getByText('Parachute Adams')).toBeTruthy();
      expect(screen.getByText('Zebra Midge')).toBeTruthy();
      expect(screen.getByText('Add All to Fly Box')).toBeTruthy();
    });
  });

  describe('fly box actions', () => {
    it('"Add All to Fly Box" adds flies', () => {
      const mockAddFly = jest.fn();
      useTripStore.setState({ tripRecommendations: mockRecommendations });
      useFlyBoxStore.setState({ addFly: mockAddFly, isInBox: jest.fn(() => false) });

      render(<TripDetailScreen />);

      fireEvent.press(screen.getByText('Add All to Fly Box'));

      expect(mockAddFly).toHaveBeenCalled();
    });
  });

  describe('remove water', () => {
    it('shows confirmation Alert when removing water', () => {
      render(<TripDetailScreen />);

      // Find and press the X button on the water card
      const closeIcon = screen.getByText('close');
      fireEvent.press(closeIcon);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Remove Water',
        expect.stringContaining('South Platte River'),
        expect.any(Array)
      );
    });

    it('calls removeWaterFromTrip on confirm', async () => {
      const mockRemove = jest.fn();
      useTripStore.setState({
        removeWaterFromTrip: mockRemove,
        clearTripRecommendations: jest.fn(),
      });

      render(<TripDetailScreen />);

      const closeIcon = screen.getByText('close');
      fireEvent.press(closeIcon);

      // Simulate pressing "Remove" in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const removeButton = alertCall[2].find((btn: any) => btn.text === 'Remove');
      await removeButton.onPress();

      expect(mockRemove).toHaveBeenCalledWith('trip-123', 'water-1');
    });

    it('does not remove water when Cancel pressed', () => {
      const mockRemove = jest.fn();
      useTripStore.setState({ removeWaterFromTrip: mockRemove });

      render(<TripDetailScreen />);

      const closeIcon = screen.getByText('close');
      fireEvent.press(closeIcon);

      // Simulate pressing "Cancel" in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const cancelButton = alertCall[2].find((btn: any) => btn.text === 'Cancel');
      if (cancelButton.onPress) {
        cancelButton.onPress();
      }

      expect(mockRemove).not.toHaveBeenCalled();
    });
  });

  describe('delete trip', () => {
    it('"Delete Trip" shows confirmation Alert', () => {
      render(<TripDetailScreen />);

      fireEvent.press(screen.getByText('Delete Trip'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Trip',
        expect.stringContaining('cannot be undone'),
        expect.any(Array)
      );
    });

    it('calls deleteTrip on confirm', async () => {
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      useTripStore.setState({ deleteTrip: mockDelete });

      render(<TripDetailScreen />);

      fireEvent.press(screen.getByText('Delete Trip'));

      // Simulate pressing "Delete" in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2].find((btn: any) => btn.text === 'Delete');
      await deleteButton.onPress();

      expect(mockDelete).toHaveBeenCalledWith('trip-123');
      // Note: router.back() would be called but we can't assert due to mock complexity
    });

    it('does not delete trip when Cancel pressed', () => {
      const mockDelete = jest.fn();
      useTripStore.setState({ deleteTrip: mockDelete });

      render(<TripDetailScreen />);

      fireEvent.press(screen.getByText('Delete Trip'));

      // Simulate pressing "Cancel" in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const cancelButton = alertCall[2].find((btn: any) => btn.text === 'Cancel');
      if (cancelButton.onPress) {
        cancelButton.onPress();
      }

      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('notes', () => {
    it('renders trip notes', () => {
      render(<TripDetailScreen />);

      expect(screen.getByText('Some trip notes')).toBeTruthy();
    });

    it('shows placeholder when no notes', () => {
      useTripStore.setState({
        currentTrip: { ...mockTrip, notes: null },
      });

      render(<TripDetailScreen />);

      expect(screen.getByText('Tap to add notes...')).toBeTruthy();
    });
  });
});
