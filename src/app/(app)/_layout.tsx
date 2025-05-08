import { useEffect } from 'react';
import { Stack, Tabs } from 'expo-router';
import { useRouter, Slot, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [fontsLoaded, fontsError] = useFonts({
    'BlackMountain-vmlBZ': require('@/../assets/fonts/BlackMountain-vmlBZ.ttf'),
    'SpaceMono-Regular': require('@/../assets/fonts/SpaceMono-Regular.ttf'),
    'Yozai-Medium': require('@/../assets/fonts/Yozai-Medium.ttf'),
  });

  useEffect(() => {
    if (!isLoading && (fontsLoaded || fontsError)) {
      // Hide splash screen once we've checked auth state
      SplashScreen.hideAsync();
      
      // Redirect based on auth state
      if (!user) {
        router.replace('/welcome');
      }
    }
  }, [user, isLoading, fontsLoaded, fontsError]);

  if (isLoading || !fontsLoaded) {
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