import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useOnboardingStore } from '../stores/onboardingStore';
import { colors } from '../theme';

// One-time reset to clear old test data - can remove after testing
const RESET_ONBOARDING_ONCE = true;

export default function Index() {
  const { hasSeenOnboarding, isLoading, resetOnboarding } = useOnboardingStore();
  const [resetDone, setResetDone] = useState(!RESET_ONBOARDING_ONCE);

  useEffect(() => {
    if (RESET_ONBOARDING_ONCE && !resetDone) {
      resetOnboarding().then(() => setResetDone(true));
    }
  }, []);

  // Show loading while checking onboarding status
  if (isLoading || hasSeenOnboarding === null || !resetDone) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  // Show welcome unless user checked "Don't show again"
  if (!hasSeenOnboarding) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
});
