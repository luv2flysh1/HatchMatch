import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlyBoxHeaderButton } from '../../components/FlyBoxHeaderButton';
import { colors, shadows, spacing, borderRadius } from '../../theme';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.primary[500] : color}
      />
      {focused && <View style={styles.tabIndicator} />}
    </View>
  );
}

function HeaderBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.headerBackground]} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        headerBackground: () => <HeaderBackground />,
        headerTintColor: colors.text.inverse,
        headerTitleStyle: styles.headerTitle,
        headerRight: () => <FlyBoxHeaderButton />,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          headerTitle: 'HatchMatch',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="compass-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          title: 'Shops',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="storefront-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: spacing[2],
    paddingBottom: Platform.OS === 'ios' ? spacing[7] : spacing[2],
    ...shadows.lg,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: spacing[1],
  },
  tabBarItem: {
    paddingTop: spacing[1],
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
    borderRadius: borderRadius.chip,
  },
  tabIconContainerActive: {
    backgroundColor: colors.primary[50],
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  headerBackground: {
    backgroundColor: colors.primary[600],
  },
});
