import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter, Slot, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';

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
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
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
      <Tabs.Screen
        name="welcome"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="auth/login"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="auth/signup"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
