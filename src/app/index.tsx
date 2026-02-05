import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useOnboardingStore } from '../stores/onboardingStore';
import { colors } from '../theme';

export default function Index() {
  const { hasSeenOnboarding, isLoading } = useOnboardingStore();

  // Show loading while checking onboarding status
  if (isLoading || hasSeenOnboarding === null) {
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
