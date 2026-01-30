/**
 * HatchMatch Theme Configuration
 *
 * A modern, cohesive design system for the fly fishing app.
 *
 * Brand Concept:
 * - "Hatch" represents insect hatches that fish feed on
 * - "Match" represents matching the hatch with the right fly pattern
 * - The brand evokes the precision, patience, and natural beauty of fly fishing
 *
 * Color Philosophy:
 * - River blues for primary actions and water-related elements
 * - Forest greens for success states and natural accents
 * - Earth tones for warmth and approachability
 * - Clean neutrals for modern, uncluttered interfaces
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary - River Blue
  // A deep, clear blue reminiscent of pristine mountain streams
  primary: {
    50: '#E6F4F9',
    100: '#CCE9F3',
    200: '#99D3E7',
    300: '#66BDDB',
    400: '#33A7CF',
    500: '#1B7FA8', // Main primary
    600: '#166589',
    700: '#114C6A',
    800: '#0B324A',
    900: '#06192B',
  },

  // Secondary - Forest Green
  // Evokes riverside vegetation and the lush environment of prime fishing spots
  secondary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#2E7D32', // Main secondary
    600: '#27692A',
    700: '#1F5522',
    800: '#18411A',
    900: '#102D12',
  },

  // Accent - Golden Amber
  // Inspired by sunset on the water, fly tying materials, and premium craftsmanship
  accent: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#D4930D', // Main accent - warm golden
    600: '#B8800B',
    700: '#9C6C09',
    800: '#805807',
    900: '#644405',
  },

  // Tertiary - Slate Teal
  // A sophisticated blue-green for variety and depth
  tertiary: {
    50: '#E8F5F5',
    100: '#D1EBEB',
    200: '#A3D7D7',
    300: '#75C3C3',
    400: '#47AFAF',
    500: '#3D8B8B', // Main tertiary
    600: '#317070',
    700: '#255555',
    800: '#193A3A',
    900: '#0D1F1F',
  },

  // Semantic Colors
  success: {
    light: '#E8F5E9',
    main: '#2E7D32',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },

  warning: {
    light: '#FFF3E0',
    main: '#EF6C00',
    dark: '#E65100',
    contrastText: '#FFFFFF',
  },

  error: {
    light: '#FFEBEE',
    main: '#C62828',
    dark: '#B71C1C',
    contrastText: '#FFFFFF',
  },

  info: {
    light: '#E3F2FD',
    main: '#1565C0',
    dark: '#0D47A1',
    contrastText: '#FFFFFF',
  },

  // Neutral Palette
  // Clean, modern grays with a slight warm undertone
  neutral: {
    0: '#FFFFFF',
    50: '#FAFBFC',
    100: '#F5F6F8',
    200: '#EBEDF0',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    1000: '#030712',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFBFC',
    tertiary: '#F5F6F8',
    inverse: '#111827',
    overlay: 'rgba(17, 24, 39, 0.5)',
    // Special backgrounds
    water: '#E6F4F9', // Light blue tint for water-related sections
    nature: '#E8F5E9', // Light green tint for nature/success sections
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#1B7FA8',
    linkHover: '#166589',
  },

  // Border Colors
  border: {
    light: '#EBEDF0',
    default: '#D1D5DB',
    dark: '#9CA3AF',
    focus: '#1B7FA8',
  },

  // Special Purpose Colors
  special: {
    // Hatch-specific colors for different insect types
    mayfly: '#A5D6A7',
    caddis: '#FFE082',
    stonefly: '#BCAAA4',
    midge: '#B0BEC5',
    // Water condition indicators
    waterClear: '#4FC3F7',
    waterStained: '#90A4AE',
    waterMuddy: '#8D6E63',
    // Flow indicators
    flowLow: '#EF6C00',
    flowOptimal: '#2E7D32',
    flowHigh: '#C62828',
  },
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // River gradient - for headers and hero sections
  river: ['#0B324A', '#1B7FA8', '#33A7CF'],
  riverHorizontal: ['#114C6A', '#1B7FA8'],

  // Sunrise over water - premium/highlight sections
  sunrise: ['#0B324A', '#1B7FA8', '#D4930D'],

  // Forest canopy - nature/success themes
  forest: ['#102D12', '#2E7D32', '#66BB6A'],

  // Subtle card gradient
  card: ['#FFFFFF', '#FAFBFC'],

  // Premium button gradients
  primaryButton: ['#1B7FA8', '#166589'],
  secondaryButton: ['#2E7D32', '#27692A'],
  accentButton: ['#D4930D', '#B8800B'],
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    // System fonts for optimal performance
    primary: 'System',
    mono: 'Menlo, Monaco, "Courier New", monospace',
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Font Sizes (in pixels, for React Native)
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line Heights (as multipliers)
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },

  // Pre-defined Text Styles
  variants: {
    // Display styles for hero sections and splash screens
    displayLarge: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.8,
    },
    displayMedium: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.4,
    },
    displaySmall: {
      fontSize: 30,
      fontWeight: '600' as const,
      lineHeight: 1.2,
      letterSpacing: -0.4,
    },

    // Heading styles
    h1: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },

    // Body styles
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },

    // Label styles for UI elements
    labelLarge: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 1.4,
      letterSpacing: 0.2,
    },
    labelMedium: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.4,
      letterSpacing: 0.2,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 1.4,
      letterSpacing: 0.4,
    },

    // Caption and overline
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.4,
      letterSpacing: 0.2,
    },
    overline: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 1.2,
      textTransform: 'uppercase' as const,
    },

    // Button text styles
    buttonLarge: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0.2,
    },
    buttonMedium: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0.2,
    },
    buttonSmall: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0.4,
    },
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  // Base unit: 4px
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

// Semantic spacing for common use cases
export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing[4], // 16
  screenPaddingVertical: spacing[4], // 16

  // Section spacing
  sectionGap: spacing[8], // 32

  // Card internal padding
  cardPadding: spacing[4], // 16
  cardPaddingSmall: spacing[3], // 12
  cardPaddingLarge: spacing[6], // 24

  // List item spacing
  listItemGap: spacing[3], // 12
  listItemPadding: spacing[4], // 16

  // Form spacing
  formFieldGap: spacing[4], // 16
  formGroupGap: spacing[6], // 24
  inputPadding: spacing[3.5], // 14
  inputPaddingHorizontal: spacing[4], // 16

  // Button internal padding
  buttonPaddingVertical: spacing[3], // 12
  buttonPaddingHorizontal: spacing[4], // 16
  buttonPaddingVerticalSmall: spacing[2], // 8
  buttonPaddingHorizontalSmall: spacing[3], // 12
  buttonPaddingVerticalLarge: spacing[4], // 16
  buttonPaddingHorizontalLarge: spacing[6], // 24

  // Icon spacing
  iconMargin: spacing[2], // 8

  // Header heights
  headerHeight: 56,
  tabBarHeight: 64,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  base: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,

  // Component-specific
  button: 8,
  buttonSmall: 6,
  buttonPill: 9999,
  card: 12,
  input: 8,
  chip: 16,
  avatar: 9999,
  modal: 16,
  tooltip: 6,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },

  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },

  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 16,
  },

  // Inner shadow effect (for pressed states)
  inner: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 0,
  },

  // Colored shadows for brand elements
  primaryGlow: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  accentGlow: {
    shadowColor: colors.accent[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ============================================================================
// ANIMATION / TRANSITIONS
// ============================================================================

export const animation = {
  // Durations (in milliseconds)
  duration: {
    instant: 0,
    fastest: 50,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
  },

  // Easing curves (for React Native Animated)
  easing: {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    // Custom curves
    spring: [0.175, 0.885, 0.32, 1.275],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  backdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// ============================================================================
// BREAKPOINTS (for responsive design)
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 360,
  md: 428,
  lg: 768,
  xl: 1024,
  '2xl': 1280,
} as const;

// ============================================================================
// COMPONENT STYLES (Common patterns)
// ============================================================================

export const componentStyles = {
  // Card variants
  card: {
    default: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.card,
      padding: layout.cardPadding,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    elevated: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.card,
      padding: layout.cardPadding,
      ...shadows.lg,
    },
    outlined: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.card,
      padding: layout.cardPadding,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    filled: {
      backgroundColor: colors.background.tertiary,
      borderRadius: borderRadius.card,
      padding: layout.cardPadding,
    },
  },

  // Button variants
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.button,
      paddingVertical: layout.buttonPaddingVertical,
      paddingHorizontal: layout.buttonPaddingHorizontal,
    },
    secondary: {
      backgroundColor: colors.secondary[500],
      borderRadius: borderRadius.button,
      paddingVertical: layout.buttonPaddingVertical,
      paddingHorizontal: layout.buttonPaddingHorizontal,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary[500],
      borderRadius: borderRadius.button,
      paddingVertical: layout.buttonPaddingVertical,
      paddingHorizontal: layout.buttonPaddingHorizontal,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.button,
      paddingVertical: layout.buttonPaddingVertical,
      paddingHorizontal: layout.buttonPaddingHorizontal,
    },
    text: {
      backgroundColor: 'transparent',
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
    },
  },

  // Input styles
  input: {
    default: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: borderRadius.input,
      paddingVertical: layout.inputPadding,
      paddingHorizontal: layout.inputPaddingHorizontal,
      ...typography.variants.bodyMedium,
      color: colors.text.primary,
    },
    focused: {
      borderColor: colors.primary[500],
      borderWidth: 2,
    },
    error: {
      borderColor: colors.error.main,
      borderWidth: 1,
    },
  },

  // Badge/Chip styles
  badge: {
    default: {
      backgroundColor: colors.neutral[200],
      borderRadius: borderRadius.chip,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2.5],
    },
    primary: {
      backgroundColor: colors.primary[100],
      borderRadius: borderRadius.chip,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2.5],
    },
    success: {
      backgroundColor: colors.success.light,
      borderRadius: borderRadius.chip,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2.5],
    },
    warning: {
      backgroundColor: colors.warning.light,
      borderRadius: borderRadius.chip,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2.5],
    },
    error: {
      backgroundColor: colors.error.light,
      borderRadius: borderRadius.chip,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2.5],
    },
  },
} as const;

// ============================================================================
// THEME OBJECT
// ============================================================================

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  layout,
  borderRadius,
  shadows,
  animation,
  zIndex,
  breakpoints,
  componentStyles,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

export default theme;
