import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { FlyBoxHeaderButton } from '../components/FlyBoxHeaderButton';
import { colors } from '../theme';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const { hasSeenOnboarding, isLoading, checkOnboardingStatus } = useOnboardingStore();

  useEffect(() => {
    initialize();
    checkOnboardingStatus();
  }, []);

  // Show loading screen while checking onboarding status
  if (isLoading || hasSeenOnboarding === null) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={hasSeenOnboarding ? 'auto' : 'light'} />
      <Stack
        screenOptions={{
          headerRight: () => <FlyBoxHeaderButton />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="water/[id]"
          options={{
            title: 'Water Details',
            headerStyle: { backgroundColor: colors.primary[500] },
            headerTintColor: colors.neutral[0],
          }}
        />
        <Stack.Screen
          name="trip/[id]"
          options={{
            title: 'Trip Details',
            headerStyle: { backgroundColor: colors.primary[500] },
            headerTintColor: colors.neutral[0],
          }}
        />
        <Stack.Screen
          name="trip/create"
          options={{
            title: 'New Trip',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.primary[500] },
            headerTintColor: colors.neutral[0],
          }}
        />
        <Stack.Screen
          name="trip/edit"
          options={{
            title: 'Edit Trip',
            headerStyle: { backgroundColor: colors.primary[500] },
            headerTintColor: colors.neutral[0],
          }}
        />
        <Stack.Screen
          name="trip/add-water"
          options={{
            title: 'Add Water',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.primary[500] },
            headerTintColor: colors.neutral[0],
          }}
        />
        <Stack.Screen
          name="flybox"
          options={{
            title: 'Fly Box',
            headerStyle: { backgroundColor: colors.primary[500] },
            headerTintColor: colors.neutral[0],
            headerRight: () => null,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
});
