import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditTripScreen from '../../app/trip/edit';
import { useTripStore } from '../../stores/tripStore';
import { useLocalSearchParams, router } from 'expo-router';

// Mock data
const mockTrip = {
  id: 'trip-123',
  user_id: 'user-123',
  name: 'Test Trip',
  start_date: '2026-03-15',
  end_date: '2026-03-17',
  notes: 'Some notes',
  auto_refresh: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  trip_waters: [],
};

// Mock useLocalSearchParams
beforeAll(() => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'trip-123' });
});

// Reset stores and mocks before each test
beforeEach(() => {
  useTripStore.setState({
    currentTrip: mockTrip,
    isLoading: false,
    error: null,
    fetchTrip: jest.fn(),
    updateTrip: jest.fn().mockResolvedValue(undefined),
    deleteTrip: jest.fn().mockResolvedValue(undefined),
  });
  jest.clearAllMocks();
});

describe('EditTripScreen', () => {
  describe('rendering', () => {
    it('renders edit form with trip data', () => {
      render(<EditTripScreen />);

      expect(screen.getByText('Edit Trip')).toBeTruthy();
      expect(screen.getByDisplayValue('Test Trip')).toBeTruthy();
    });

    it('renders Save, Cancel, and Delete buttons', () => {
      render(<EditTripScreen />);

      expect(screen.getByText('Save Changes')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
      expect(screen.getByText('Delete Trip')).toBeTruthy();
    });

    it('shows loading state when trip not loaded', () => {
      useTripStore.setState({ currentTrip: null });

      render(<EditTripScreen />);

      expect(screen.getByText('Loading trip...')).toBeTruthy();
    });
  });

  describe('validation', () => {
    it('shows error when name is empty', async () => {
      render(<EditTripScreen />);

      fireEvent.changeText(screen.getByDisplayValue('Test Trip'), '');
      fireEvent.press(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a trip name')).toBeTruthy();
      });
    });
  });

  describe('save action', () => {
    it('"Save Changes" calls updateTrip', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      useTripStore.setState({ updateTrip: mockUpdate });

      render(<EditTripScreen />);

      fireEvent.changeText(screen.getByDisplayValue('Test Trip'), 'Updated Trip');
      fireEvent.press(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          'trip-123',
          expect.objectContaining({
            name: 'Updated Trip',
          })
        );
      });
    });

    it('navigates back after successful save', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      useTripStore.setState({ updateTrip: mockUpdate });

      render(<EditTripScreen />);

      fireEvent.press(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(router.back).toHaveBeenCalled();
      });
    });
  });

  describe('cancel action', () => {
    it('"Cancel" navigates back', () => {
      render(<EditTripScreen />);

      fireEvent.press(screen.getByText('Cancel'));

      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('delete action', () => {
    it('"Delete Trip" shows confirmation Alert', () => {
      render(<EditTripScreen />);

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

      render(<EditTripScreen />);

      fireEvent.press(screen.getByText('Delete Trip'));

      // Simulate pressing "Delete" in the alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2].find((btn: any) => btn.text === 'Delete');
      await deleteButton.onPress();

      expect(mockDelete).toHaveBeenCalledWith('trip-123');
    });

    it('does not delete on cancel', () => {
      const mockDelete = jest.fn();
      useTripStore.setState({ deleteTrip: mockDelete });

      render(<EditTripScreen />);

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
});
