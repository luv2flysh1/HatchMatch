import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ShopsScreen from '../../app/(tabs)/shops';
import { supabase } from '../../services/supabase';

// Mock Linking
jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

// Mock supabase
jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));

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

const mockShops = [
  {
    id: 'shop-1',
    name: 'Rocky Mountain Fly Shop',
    address: '123 Main St',
    city: 'Denver',
    state: 'CO',
    latitude: 39.7392,
    longitude: -104.9903,
    phone: '303-555-1234',
    website: 'https://rmflyshop.com',
  },
  {
    id: 'shop-2',
    name: 'Blue River Outfitters',
    address: '456 River Rd',
    city: 'Silverthorne',
    state: 'CO',
    latitude: 39.63,
    longitude: -106.07,
    phone: null,
    website: 'https://blueriveroutfitters.com',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentLocation.mockResolvedValue({ latitude: 39.7392, longitude: -104.9903 });

  // Reset supabase mock
  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
  });
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

    it('queries supabase after getting location', async () => {
      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('fly_shops');
      });
    });

    it('shows error when no shops found', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(screen.getByText(/No fly shops in our database/)).toBeTruthy();
      });
    });

    it('shows shops when found within range', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockShops, error: null }),
      });

      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(screen.getByText('Rocky Mountain Fly Shop')).toBeTruthy();
        expect(screen.getByText('Blue River Outfitters')).toBeTruthy();
      });
    });

    it('shows distance for each shop', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockShops, error: null }),
      });

      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        // Should show city, state and distance
        expect(screen.getByText(/Denver, CO/)).toBeTruthy();
        expect(screen.getByText(/Silverthorne, CO/)).toBeTruthy();
      });
    });
  });

  describe('shop actions', () => {
    beforeEach(async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockShops, error: null }),
      });
    });

    it('Call button opens phone link', async () => {
      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(screen.getByText('Rocky Mountain Fly Shop')).toBeTruthy();
      });

      // Find and press Call button
      const callButtons = screen.getAllByText('Call');
      fireEvent.press(callButtons[0]);

      expect(Linking.openURL).toHaveBeenCalledWith('tel:3035551234');
    });

    it('Directions button opens Google Maps', async () => {
      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(screen.getByText('Rocky Mountain Fly Shop')).toBeTruthy();
      });

      // Find and press Directions button
      const directionsButtons = screen.getAllByText('Directions');
      fireEvent.press(directionsButtons[0]);

      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('google.com/maps/dir')
      );
    });

    it('Website button opens shop website', async () => {
      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(screen.getByText('Rocky Mountain Fly Shop')).toBeTruthy();
      });

      // Find and press Website button
      const websiteButtons = screen.getAllByText('Website');
      fireEvent.press(websiteButtons[0]);

      expect(Linking.openURL).toHaveBeenCalledWith('https://rmflyshop.com');
    });
  });

  describe('error handling', () => {
    it('shows error when database query fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        }),
      });

      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(screen.getByText(/Failed to search for fly shops/)).toBeTruthy();
      });
    });

    it('shows error when no shops within 100 miles', async () => {
      // Mock shop that's far away (will be filtered out)
      const farAwayShop = {
        ...mockShops[0],
        latitude: 47.6062, // Seattle - far from Denver
        longitude: -122.3321,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [farAwayShop], error: null }),
      });

      render(<ShopsScreen />);

      fireEvent.press(screen.getByText('Find Fly Shops Near Me'));

      await waitFor(() => {
        expect(screen.getByText(/No fly shops found within 100 miles/)).toBeTruthy();
      });
    });
  });
});
