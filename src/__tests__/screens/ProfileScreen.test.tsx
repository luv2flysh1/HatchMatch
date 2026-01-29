import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProfileScreen from '../../app/(tabs)/profile';
import { useAuthStore } from '../../stores/authStore';
import { mockUser, mockProfile } from '../mocks/supabase';

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    }}
  >
    {children}
  </SafeAreaProvider>
);

// Reset store before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    profile: null,
    session: null,
    isLoading: false,
    isInitialized: true,
  });
});

describe('ProfileScreen', () => {
  describe('when user is not logged in', () => {
    it('should render sign in form', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome to HatchMatch')).toBeTruthy();
      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
      expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('should toggle between sign in and sign up', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Initially shows Sign In
      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getByText("Don't have an account? Sign Up")).toBeTruthy();

      // Click to switch to Sign Up
      fireEvent.press(screen.getByText("Don't have an account? Sign Up"));

      expect(screen.getByText('Create Account')).toBeTruthy();
      expect(screen.getByText('Already have an account? Sign In')).toBeTruthy();
    });

    it('should show error for empty fields', async () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Please enter email and password')).toBeTruthy();
      });
    });

    it('should show error for short password', async () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), '123');
      fireEvent.press(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy();
      });
    });

    it('should call signIn with correct credentials', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({ error: null });
      useAuthStore.setState({ signIn: mockSignIn });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
      fireEvent.press(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should call signUp when in sign up mode', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({ error: null });
      useAuthStore.setState({ signUp: mockSignUp });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Switch to sign up mode
      fireEvent.press(screen.getByText("Don't have an account? Sign Up"));

      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'new@example.com');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), 'newpassword123');
      fireEvent.press(screen.getByText('Create Account'));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'newpassword123');
      });
    });
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        profile: mockProfile,
        isInitialized: true,
      });
    });

    it('should render user profile', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Test Angler')).toBeTruthy();
      expect(screen.getByText('test@example.com')).toBeTruthy();
      expect(screen.getByText('Free Account')).toBeTruthy();
    });

    it('should render menu items', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(screen.getByText('My Favorites')).toBeTruthy();
      expect(screen.getByText('Catch Reports')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('should show upgrade option for free users', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Upgrade to Premium')).toBeTruthy();
    });

    it('should not show upgrade option for premium users', () => {
      useAuthStore.setState({
        user: mockUser,
        profile: { ...mockProfile, tier: 'premium' },
        isInitialized: true,
      });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(screen.queryByText('Upgrade to Premium')).toBeNull();
    });

    it('should call signOut when Sign Out is pressed', async () => {
      const mockSignOut = jest.fn().mockResolvedValue(undefined);
      useAuthStore.setState({
        user: mockUser,
        profile: mockProfile,
        signOut: mockSignOut,
        isInitialized: true,
      });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Sign Out'));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe('when loading', () => {
    it('should render loading indicator', () => {
      useAuthStore.setState({
        isLoading: true,
        isInitialized: true,
      });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // ActivityIndicator doesn't have accessible text, so we check it doesn't render the form
      expect(screen.queryByText('Welcome to HatchMatch')).toBeNull();
      expect(screen.queryByText('Sign In')).toBeNull();
    });
  });
});
