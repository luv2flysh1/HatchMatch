import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ShopsScreen from '../../app/(tabs)/shops';

// Mock Linking
jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

// Mock useLocation hook
const mockGetCurrentLocation = jest.fn();
jest.mock('../../hooks/useLocation', () => ({
  useLocation: () => ({
    latitude: null,
    longitude: null,
    isLoading: false,
    error: null,
    permissionStatus: 'undetermined',
    requestPermission: jest.fn(),
    getCurrentLocation: mockGetCurrentLocation,
    clearError: jest.fn(),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentLocation.mockResolvedValue({ latitude: 39.7392, longitude: -104.9903 });
});

describe('ShopsScreen', () => {
  describe('initial state', () => {
    it('renders search button', () => {
      render(<ShopsScreen />);

      expect(screen.getByText('Find Fly Shops Near Me')).toBeTruthy();
    });

    it('renders placeholder text', () => {
      render(<ShopsScreen />);

      expect(screen.getByText('Fly Shop Finder')).toBeTruthy();
      expect(screen.getByText(/Find fly shops near your location/)).toBeTruthy();
    });
  });

  describe('search flow', () => {
    it('search button triggers location request', async () => {
      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(mockGetCurrentLocation).toHaveBeenCalled();
      });
    });
  });
});
