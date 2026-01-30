import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = 'hatchmatch_onboarding_complete';

interface OnboardingState {
  hasSeenOnboarding: boolean | null; // null = loading
  isLoading: boolean;

  // Actions
  checkOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>; // For testing/dev
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenOnboarding: null,
  isLoading: true,

  checkOnboardingStatus: async () => {
    try {
      set({ isLoading: true });
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      set({ hasSeenOnboarding: value === 'true', isLoading: false });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing the main app if there's an error
      set({ hasSeenOnboarding: true, isLoading: false });
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      set({ hasSeenOnboarding: true });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Still mark as complete in state to let user proceed
      set({ hasSeenOnboarding: true });
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      set({ hasSeenOnboarding: false });
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  },
}));
