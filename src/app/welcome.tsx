import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  FlatList,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../stores/onboardingStore';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  backgroundColor: string;
  accentColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'splash',
    title: 'HatchMatch',
    subtitle: 'Your AI Fly Fishing Companion',
    description: 'Discover waters, match hatches, and build the perfect fly box for every trip.',
    icon: '',
    backgroundColor: colors.primary[800],
    accentColor: colors.primary[400],
  },
  {
    id: 'find-water',
    title: 'Find Your Water',
    subtitle: 'Discover Amazing Fishing Spots',
    description: 'Search rivers, lakes, and streams near you. Get detailed information about species, access points, and local conditions.',
    icon: '',
    backgroundColor: colors.tertiary[700],
    accentColor: colors.tertiary[400],
  },
  {
    id: 'match-hatch',
    title: 'Match the Hatch',
    subtitle: 'AI-Powered Fly Recommendations',
    description: 'Get personalized fly recommendations based on current hatches, water conditions, and seasonal patterns.',
    icon: '',
    backgroundColor: colors.accent[800],
    accentColor: colors.accent[400],
  },
  {
    id: 'fly-box',
    title: 'Build Your Fly Box',
    subtitle: 'Create Shopping Lists',
    description: 'Save recommended flies to your box, track quantities, and find local shops or online retailers to stock up.',
    icon: '',
    backgroundColor: colors.secondary[800],
    accentColor: colors.secondary[400],
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    const isSplash = item.id === 'splash';

    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={[styles.slideContent, { paddingTop: insets.top + 60 }]}>
          {/* Decorative elements */}
          <View style={styles.decorativeContainer}>
            <View
              style={[
                styles.decorativeCircle,
                styles.decorativeCircle1,
                { backgroundColor: item.accentColor },
              ]}
            />
            <View
              style={[
                styles.decorativeCircle,
                styles.decorativeCircle2,
                { backgroundColor: item.accentColor },
              ]}
            />
            <View
              style={[
                styles.decorativeCircle,
                styles.decorativeCircle3,
                { backgroundColor: item.accentColor },
              ]}
            />
          </View>

          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale }, { translateY }],
                opacity,
              },
            ]}
          >
            {isSplash ? (
              <View style={[styles.logoContainer, { borderColor: item.accentColor }]}>
                <Text style={styles.logoText}>HM</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.featureIconContainer,
                  {
                    backgroundColor: `${item.accentColor}30`,
                    borderColor: `${item.accentColor}50`
                  },
                ]}
              >
                <Text style={styles.featureIcon}>{item.icon}</Text>
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text style={[styles.title, isSplash && styles.splashTitle]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: item.accentColor }]}>
              {item.subtitle}
            </Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.backgroundColor }]}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          {!isLastSlide && (
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.primaryButton,
              isLastSlide && styles.getStartedButton,
            ]}
            onPress={isLastSlide ? handleGetStarted : handleNext}
          >
            <Text
              style={[
                styles.primaryButtonText,
                isLastSlide && styles.getStartedButtonText,
              ]}
            >
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },
  iconContainer: {
    marginBottom: spacing[10],
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    ...typography.variants.displayLarge,
    color: colors.neutral[0],
    letterSpacing: -2,
  },
  featureIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  featureIcon: {
    fontSize: 56,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 340,
  },
  title: {
    ...typography.variants.displaySmall,
    color: colors.neutral[0],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  splashTitle: {
    ...typography.variants.displayLarge,
  },
  subtitle: {
    ...typography.variants.h3,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  description: {
    ...typography.variants.bodyLarge,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 24,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.12,
  },
  decorativeCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    width: 250,
    height: 250,
    bottom: 150,
    left: -100,
  },
  decorativeCircle3: {
    width: 180,
    height: 180,
    bottom: 80,
    right: -60,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[6],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  paginationDot: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[0],
    marginHorizontal: spacing[1],
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: spacing[3.5],
    paddingHorizontal: spacing[6],
  },
  skipButtonText: {
    ...typography.variants.buttonLarge,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  primaryButton: {
    flex: 1,
    marginLeft: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  getStartedButton: {
    marginLeft: 0,
    backgroundColor: colors.neutral[0],
    borderColor: colors.neutral[0],
    ...shadows.lg,
  },
  primaryButtonText: {
    ...typography.variants.buttonLarge,
    color: colors.neutral[0],
  },
  getStartedButtonText: {
    color: colors.primary[700],
  },
});
