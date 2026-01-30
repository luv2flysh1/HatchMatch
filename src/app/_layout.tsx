import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { FlyBoxHeaderButton } from '../components/FlyBoxHeaderButton';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerRight: () => <FlyBoxHeaderButton />,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="water/[id]"
          options={{
            title: 'Water Details',
            headerStyle: { backgroundColor: '#2563eb' },
            headerTintColor: '#ffffff',
          }}
        />
        <Stack.Screen
          name="trip/[id]"
          options={{
            title: 'Trip Details',
            headerStyle: { backgroundColor: '#2563eb' },
            headerTintColor: '#ffffff',
          }}
        />
        <Stack.Screen
          name="flybox"
          options={{
            title: 'Fly Box',
            headerStyle: { backgroundColor: '#2563eb' },
            headerTintColor: '#ffffff',
            headerRight: () => null,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
