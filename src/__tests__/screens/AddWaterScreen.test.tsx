import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AddWaterToTripScreen from '../../app/trip/add-water';
import { useWaterStore } from '../../stores/waterStore';
import { useTripStore } from '../../stores/tripStore';
import { useLocalSearchParams, router } from 'expo-router';

// Mock data
const mockWaters = [
  {
    id: 'water-1',
    name: 'South Platte River',
    type: 'river' as const,
    state: 'CO',
    city: 'Denver',
    latitude: 39.7392,
    longitude: -104.9903,
    species: ['rainbow trout'],
    usgs_site_id: null,
    description: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'water-2',
    name: 'Blue River',
    type: 'river' as const,
    state: 'CO',
    city: 'Silverthorne',
    latitude: 39.63,
    longitude: -106.07,
    species: ['brown trout'],
    usgs_site_id: null,
    description: null,
    created_at: '2026-01-01T00:00:00Z',
  },
];

const mockTrip = {
  id: 'trip-123',
  user_id: 'user-123',
  name: 'Test Trip',
  start_date: '2026-03-15',
  end_date: null,
  notes: null,
  auto_refresh: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  trip_waters: [
    {
      id: 'tw-1',
      trip_id: 'trip-123',
      water_body_id: 'water-1',
      order: 0,
    },
  ],
};

// Mock useLocalSearchParams
beforeAll(() => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ tripId: 'trip-123' });
});

// Reset stores and mocks before each test
beforeEach(() => {
  useWaterStore.setState({
    searchResults: [],
    isSearching: false,
    searchByName: jest.fn(),
  });
  useTripStore.setState({
    currentTrip: mockTrip,
    error: null,
    addWaterToTrip: jest.fn().mockResolvedValue(undefined),
  });
  jest.clearAllMocks();
});

describe('AddWaterToTripScreen', () => {
  describe('rendering', () => {
    it('renders header and search input', () => {
      render(<AddWaterToTripScreen />);

      expect(screen.getByText('Add Water to Trip')).toBeTruthy();
      expect(screen.getByPlaceholderText('Search waters by name or state...')).toBeTruthy();
    });

    it('renders "Done" button', () => {
      render(<AddWaterToTripScreen />);

      expect(screen.getByText('Done')).toBeTruthy();
    });

    it('shows prompt when query is too short', () => {
      render(<AddWaterToTripScreen />);

      expect(screen.getByText(/Search for a river, lake, or stream/)).toBeTruthy();
    });
  });

  describe('search', () => {
    it('calls searchByName when typing', async () => {
      const mockSearch = jest.fn();
      useWaterStore.setState({ searchByName: mockSearch });

      render(<AddWaterToTripScreen />);

      fireEvent.changeText(
        screen.getByPlaceholderText('Search waters by name or state...'),
        'South Platte'
      );

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('South Platte');
      });
    });

    it('shows search results', () => {
      useWaterStore.setState({ searchResults: mockWaters });

      render(<AddWaterToTripScreen />);

      // Trigger search first
      fireEvent.changeText(
        screen.getByPlaceholderText('Search waters by name or state...'),
        'South'
      );

      expect(screen.getByText('South Platte River')).toBeTruthy();
      expect(screen.getByText('Blue River')).toBeTruthy();
    });

    it('shows "No results" for empty search', () => {
      useWaterStore.setState({ searchResults: [] });

      render(<AddWaterToTripScreen />);

      fireEvent.changeText(
        screen.getByPlaceholderText('Search waters by name or state...'),
        'XYZ123'
      );

      expect(screen.getByText(/No results found/)).toBeTruthy();
    });
  });

  describe('add water', () => {
    it('"Add" button calls addWaterToTrip', async () => {
      const mockAdd = jest.fn().mockResolvedValue(undefined);
      useWaterStore.setState({ searchResults: mockWaters });
      useTripStore.setState({
        currentTrip: { ...mockTrip, trip_waters: [] },
        addWaterToTrip: mockAdd,
      });

      render(<AddWaterToTripScreen />);

      fireEvent.changeText(
        screen.getByPlaceholderText('Search waters by name or state...'),
        'South'
      );

      // Find the Add button for the first water
      const addButtons = screen.getAllByText('Add');
      fireEvent.press(addButtons[0]);

      await waitFor(() => {
        expect(mockAdd).toHaveBeenCalledWith('trip-123', 'water-1');
      });
    });

    it('shows "Added" badge for already-added waters', () => {
      useWaterStore.setState({ searchResults: mockWaters });
      useTripStore.setState({ currentTrip: mockTrip }); // water-1 is already added

      render(<AddWaterToTripScreen />);

      fireEvent.changeText(
        screen.getByPlaceholderText('Search waters by name or state...'),
        'South'
      );

      expect(screen.getByText('Added')).toBeTruthy();
    });
  });

  describe('done action', () => {
    it('"Done" button navigates back', () => {
      render(<AddWaterToTripScreen />);

      fireEvent.press(screen.getByText('Done'));

      expect(router.back).toHaveBeenCalled();
    });
  });
});
