import { useEffect } from 'react';
import { Stack, Tabs } from 'expo-router';
import { useRouter, Slot, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { hiddenTabs } from './hiddenTabs';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    <Stack 
      screenOptions={{
        headerShown: false,
      }} />
  );
}