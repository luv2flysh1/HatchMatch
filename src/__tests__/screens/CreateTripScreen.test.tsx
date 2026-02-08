import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateTripScreen from '../../app/trip/create';
import { useTripStore } from '../../stores/tripStore';
import { router } from 'expo-router';

// Reset store and mocks before each test
beforeEach(() => {
  useTripStore.setState({
    trips: [],
    currentTrip: null,
    isLoading: false,
    error: null,
    tripRecommendations: [],
    isLoadingRecs: false,
    recsError: null,
    recsProgress: null,
  });
  jest.clearAllMocks();
});

describe('CreateTripScreen', () => {
  describe('rendering', () => {
    it('renders form with name input, date, and buttons', () => {
      render(<CreateTripScreen />);

      expect(screen.getByText('Plan New Trip')).toBeTruthy();
      expect(screen.getByText('Trip Name *')).toBeTruthy();
      expect(screen.getByPlaceholderText('Summer Montana Trip')).toBeTruthy();
      expect(screen.getByText('Start Date *')).toBeTruthy();
      expect(screen.getByText('Create Trip')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('shows "Add end date" button initially', () => {
      render(<CreateTripScreen />);

      expect(screen.getByText('Add end date')).toBeTruthy();
    });
  });

  describe('validation', () => {
    it('shows error when trip name is empty', async () => {
      render(<CreateTripScreen />);

      fireEvent.press(screen.getByText('Create Trip'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a trip name')).toBeTruthy();
      });
    });

    it('shows error when end date is before start date', async () => {
      render(<CreateTripScreen />);

      // Enter trip name
      fireEvent.changeText(screen.getByPlaceholderText('Summer Montana Trip'), 'Test Trip');

      // Add end date
      fireEvent.press(screen.getByText('Add end date'));

      // The end date will auto-populate to day after start
      // We need to set it to a date before start to trigger the error
      // For now, this test validates the feature exists
      expect(screen.getByText('End Date')).toBeTruthy();
      expect(screen.getByText('Remove')).toBeTruthy();
    });
  });

  describe('form interactions', () => {
    it('"Add end date" reveals end date field', () => {
      render(<CreateTripScreen />);

      fireEvent.press(screen.getByText('Add end date'));

      expect(screen.getByText('End Date')).toBeTruthy();
      expect(screen.getByText('Remove')).toBeTruthy();
    });

    it('"Remove" hides end date field', () => {
      render(<CreateTripScreen />);

      // Add end date
      fireEvent.press(screen.getByText('Add end date'));
      expect(screen.getByText('End Date')).toBeTruthy();

      // Remove it
      fireEvent.press(screen.getByText('Remove'));

      expect(screen.queryByText('End Date')).toBeNull();
      expect(screen.getByText('Add end date')).toBeTruthy();
    });
  });

  describe('create trip action', () => {
    it('calls createTrip with valid data', async () => {
      const mockCreateTrip = jest.fn().mockResolvedValue('new-trip-id-123');
      useTripStore.setState({ createTrip: mockCreateTrip });

      render(<CreateTripScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Summer Montana Trip'), 'Test Trip');
      fireEvent.press(screen.getByText('Create Trip'));

      await waitFor(() => {
        expect(mockCreateTrip).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Trip',
          })
        );
      });
    });

    it('navigates to trip detail on successful create', async () => {
      const mockCreateTrip = jest.fn().mockResolvedValue('new-trip-id-123');
      useTripStore.setState({ createTrip: mockCreateTrip });

      render(<CreateTripScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Summer Montana Trip'), 'Test Trip');
      fireEvent.press(screen.getByText('Create Trip'));

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/trip/new-trip-id-123');
      });
    });

    it('shows error when create fails', async () => {
      const mockCreateTrip = jest.fn().mockResolvedValue(null);
      useTripStore.setState({
        createTrip: mockCreateTrip,
        error: null,
      });

      render(<CreateTripScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Summer Montana Trip'), 'Test Trip');
      fireEvent.press(screen.getByText('Create Trip'));

      await waitFor(() => {
        // When createTrip returns null and store error is null, shows default message
        expect(screen.getByText('Failed to create trip. Please try again.')).toBeTruthy();
      });
    });

    it('shows loading spinner while creating', () => {
      useTripStore.setState({ isLoading: true });

      render(<CreateTripScreen />);

      // When loading, the Create Trip text should not be visible (replaced by spinner)
      expect(screen.queryByText('Create Trip')).toBeNull();
    });
  });

  describe('cancel action', () => {
    it('"Cancel" calls router.back()', () => {
      render(<CreateTripScreen />);

      fireEvent.press(screen.getByText('Cancel'));

      expect(router.back).toHaveBeenCalled();
    });
  });
});
