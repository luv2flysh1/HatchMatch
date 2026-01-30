import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { FlyBoxHeaderButton } from '../../components/FlyBoxHeaderButton';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#ffffff',
        headerRight: () => <FlyBoxHeaderButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          title: 'Shops',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏪</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
