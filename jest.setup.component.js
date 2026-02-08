// Component-specific mocks layered on top of jest.setup.js

const { Alert } = require('react-native');

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  dismissAll: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
  navigate: jest.fn(),
};

jest.mock('expo-router', () => {
  const mockRouterLocal = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismissAll: jest.fn(),
    canGoBack: jest.fn(() => true),
    setParams: jest.fn(),
    navigate: jest.fn(),
  };
  return {
    __esModule: true,
    useRouter: () => mockRouterLocal,
    useLocalSearchParams: jest.fn(() => ({})),
    router: mockRouterLocal,
    Link: ({ children }) => children,
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }) => <View {...props}>{children}</View>,
    SafeAreaProvider: ({ children }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const MockIcon = ({ name, ...props }) => <Text {...props}>{name}</Text>;
  return {
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <View {...props} />,
    Marker: (props) => <View {...props} />,
  };
});

// Mock HatchMatchLogo component
jest.mock('./src/components/HatchMatchLogo', () => {
  const { View } = require('react-native');
  return {
    HatchMatchLogo: (props) => <View testID="hatch-match-logo" {...props} />,
  };
});

// Mock fishingRegulations utility
jest.mock('./src/utils/fishingRegulations', () => ({
  getRegulationsUrl: jest.fn(() => 'https://example.com/regulations'),
  hasRegulationsInfo: jest.fn(() => true),
}));

// Mock useLocation hook
jest.mock('./src/hooks/useLocation', () => ({
  useLocation: () => ({
    latitude: null,
    longitude: null,
    isLoading: false,
    error: null,
    permissionStatus: 'undetermined',
    requestPermission: jest.fn(),
    getCurrentLocation: jest.fn().mockResolvedValue({ latitude: 39.7392, longitude: -104.9903 }),
    clearError: jest.fn(),
  }),
}));

// Spy on Alert.alert
jest.spyOn(Alert, 'alert');

// Export mocks for test assertions
global.__mocks__ = {
  router: mockRouter,
};
