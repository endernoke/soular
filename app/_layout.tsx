import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter, Slot, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import { hiddenTabs } from './hiddenTabs';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Hide splash screen once we've checked auth state
      SplashScreen.hideAsync();
      
      // Redirect based on auth state
      if (!user) {
        router.replace('/welcome');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <Slot />;
  }

  if (!user) {
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarStyle: { display: 'flex' },
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarStyle: { display: 'flex' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarStyle: { display: 'flex' },
        }}
      />
      {/* Hidden screens for navigation purposes */}
      {hiddenTabs.map((tab) => (
        <Tabs.Screen
          key={tab}
          name={tab}
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      ))}
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar translucent={true} backgroundColor='transparent' />
      <SafeAreaView className='flex-1' edges={['top', 'left', 'right', 'bottom']}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaView>
    </>
  );
}
