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
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOnboardingStore } from '../stores/onboardingStore';
import { HatchMatchLogo } from '../components/HatchMatchLogo';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

// Welcome screen background images
// Set USE_BACKGROUND_IMAGES to true after adding your photos to assets/images/:
// - welcome-splash.jpg (main intro screen)
// - welcome-water.jpg (find your water screen)
// - welcome-hatch.jpg (match the hatch screen)
// - welcome-flybox.jpg (build your fly box screen)
const USE_BACKGROUND_IMAGES = true;

const WELCOME_IMAGES: Record<string, ImageSourcePropType | null> = USE_BACKGROUND_IMAGES
  ? {
      splash: require('../../assets/images/welcome-splash.jpg'),
      'find-water': require('../../assets/images/welcome-water.jpg'),
      'match-hatch': require('../../assets/images/welcome-hatch.jpg'),
      'fly-box': require('../../assets/images/welcome-flybox.jpg'),
    }
  : {
      splash: null,
      'find-water': null,
      'match-hatch': null,
      'fly-box': null,
    };

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  gradientColors: readonly [string, string, string];
  accentColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'splash',
    title: 'HatchMatch',
    subtitle: 'Your AI Fly Fishing Companion',
    description: 'Discover waters, match hatches, and build the perfect fly box for every trip.',
    iconName: 'fish',
    gradientColors: ['#1a365d', '#2c5282', '#1e4e8c'] as const,
    accentColor: '#63b3ed',
  },
  {
    id: 'find-water',
    title: 'Find Your Water',
    subtitle: 'Discover Amazing Fishing Spots',
    description: 'Search rivers, lakes, and streams near you. Get detailed information about species, access points, and local conditions.',
    iconName: 'map-search',
    gradientColors: ['#1a4731', '#276749', '#22543d'] as const,
    accentColor: '#68d391',
  },
  {
    id: 'match-hatch',
    title: 'Match the Hatch',
    subtitle: 'AI-Powered Fly Recommendations',
    description: 'Get personalized fly recommendations based on current hatches, water conditions, and seasonal patterns.',
    iconName: 'bug',
    gradientColors: ['#744210', '#975a16', '#7b341e'] as const,
    accentColor: '#f6ad55',
  },
  {
    id: 'fly-box',
    title: 'Build Your Fly Box',
    subtitle: 'Create Shopping Lists',
    description: 'Save recommended flies to your box, track quantities, and find local shops or online retailers to stock up.',
    iconName: 'briefcase-outline',
    gradientColors: ['#553c9a', '#6b46c1', '#44337a'] as const,
    accentColor: '#b794f4',
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
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
    if (dontShowAgain) {
      await completeOnboarding();
    }
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    // Skip just goes to the app without saving preference
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
    const backgroundImage = WELCOME_IMAGES[item.id];

    const slideContent = (
      <View style={[styles.slideContent, { paddingTop: insets.top + 60 }]}>
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
            <HatchMatchLogo size={140} color={colors.neutral[0]} showBackground={true} />
          ) : (
            <View
              style={[
                styles.featureIconContainer,
                {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderColor: 'rgba(255,255,255,0.3)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={item.iconName}
                size={56}
                color={colors.neutral[0]}
              />
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
    );

    // Always show gradient as base, with image layered on top (seamless loading)
    return (
      <View style={styles.slide}>
        {/* Base gradient - shows while image loads */}
        <LinearGradient
          colors={item.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Image layer on top of gradient */}
        {backgroundImage && (
          <ImageBackground
            source={backgroundImage}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          >
            {/* Dark overlay for text readability */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>
        )}
        {slideContent}
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
    <View style={[styles.container, { backgroundColor: currentSlide.gradientColors[0] }]}>
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
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {renderPagination()}

        {isLastSlide && (
          <Pressable
            style={styles.dontShowAgainContainer}
            onPress={() => setDontShowAgain(!dontShowAgain)}
          >
            <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
              {dontShowAgain && (
                <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
              )}
            </View>
            <Text style={styles.dontShowAgainText}>Don't show this again</Text>
          </Pressable>
        )}

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
  dontShowAgainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[500],
  },
  dontShowAgainText: {
    ...typography.variants.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
