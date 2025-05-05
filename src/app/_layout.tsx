import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '@/lib/auth';
import '../global.css';

export default function Root() {
  return (
    <>
      <StatusBar translucent={true} backgroundColor='transparent' />
      <SafeAreaView className='flex-1' edges={['top', 'left', 'right', 'bottom']}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </SafeAreaView>
    </>
  );
}
