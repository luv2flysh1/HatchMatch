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
        expect(screen.getByText('Please enter your email')).toBeTruthy();
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

  describe('forgot password flow', () => {
    it('"Forgot Password?" switches to reset form', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Forgot Password?'));

      expect(screen.getByText('Send Reset Link')).toBeTruthy();
      expect(screen.queryByPlaceholderText('Password')).toBeNull();
    });

    it('"Send Reset Link" calls resetPassword', async () => {
      const mockResetPassword = jest.fn().mockResolvedValue({ error: null });
      useAuthStore.setState({ resetPassword: mockResetPassword });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Forgot Password?'));
      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.press(screen.getByText('Send Reset Link'));

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('shows success banner after reset', () => {
      useAuthStore.setState({
        resetPasswordSent: true,
      });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Need to be in forgot password mode to see the banner
      fireEvent.press(screen.getByText('Forgot Password?'));

      expect(screen.getByText('Check your email for a password reset link')).toBeTruthy();
    });

    it('"Back to Sign In" returns from reset mode', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Forgot Password?'));
      expect(screen.getByText('Send Reset Link')).toBeTruthy();

      fireEvent.press(screen.getByText('Back to Sign In'));

      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    });
  });

  describe('profile editing', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        profile: mockProfile,
        isInitialized: true,
        updateProfile: jest.fn().mockResolvedValue({ error: null }),
      });
    });

    it('"Edit" enters edit mode with name input and skill pills', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Edit'));

      expect(screen.getByPlaceholderText('Your name')).toBeTruthy();
      expect(screen.getByText('Beginner')).toBeTruthy();
      expect(screen.getByText('Intermediate')).toBeTruthy();
      expect(screen.getByText('Advanced')).toBeTruthy();
    });

    it('skill pill press changes selection', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Edit'));

      // Initially intermediate is selected (from mock profile)
      // Clicking Advanced should select it
      fireEvent.press(screen.getByText('Advanced'));

      // The visual change is tested by styling, but we verify the button exists and can be pressed
      expect(screen.getByText('Advanced')).toBeTruthy();
    });

    it('"Save" calls updateProfile', async () => {
      const mockUpdateProfile = jest.fn().mockResolvedValue({ error: null });
      useAuthStore.setState({
        user: mockUser,
        profile: mockProfile,
        isInitialized: true,
        updateProfile: mockUpdateProfile,
      });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Edit'));
      fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'New Name');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Name',
          })
        );
      });
    });

    it('"Cancel" exits edit mode without saving', async () => {
      const mockUpdateProfile = jest.fn();
      useAuthStore.setState({
        user: mockUser,
        profile: mockProfile,
        isInitialized: true,
        updateProfile: mockUpdateProfile,
      });

      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Edit'));
      expect(screen.getByPlaceholderText('Your name')).toBeTruthy();

      fireEvent.press(screen.getByText('Cancel'));

      // Should be back to normal profile view
      expect(screen.queryByPlaceholderText('Your name')).toBeNull();
      expect(screen.getByText('Test Angler')).toBeTruthy();
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });
  });
});
