import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    isLoading: false,
    error: null,
    permissionStatus: 'undetermined',
  });

  const requestPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      setState(prev => ({
        ...prev,
        permissionStatus: status as 'granted' | 'denied',
        isLoading: false,
      }));

      return status === 'granted';
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to request location permission',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check/request permission first
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          error: 'Location permission denied',
          permissionStatus: 'denied',
          isLoading: false,
        }));
        return null;
      }

      setState(prev => ({ ...prev, permissionStatus: 'granted' }));

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      setState(prev => ({
        ...prev,
        latitude,
        longitude,
        isLoading: false,
      }));

      return { latitude, longitude };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to get current location',
        isLoading: false,
      }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    requestPermission,
    getCurrentLocation,
    clearError,
  };
}
