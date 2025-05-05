import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';  // gradient in nativewind doesn't seem to work

export default function Welcome() {
  return (
    <View className='flex-1 justify-center items-center w-full h-full'>
    <LinearGradient
      colors={['#ffffff', '#8df5cf', '#1aea9f', '#10e1c9']}
      className='flex-1 justify-center items-center w-full h-full'
    >
      <View className='flex-1 justify-center items-center min-h-[40%] w-full'>
        <Image
          source={require("@/../assets/images/splash-icon.png")}
          className='absolute w-[100%] h-[100%] top-20 left-6 object-contain'
        />
      </View>
      {/* Title */}
      <View className='mb-4 px-3 text-left'>
        <Text className='text-5xl font-bold mb-1 text-left'>
          Connect {'\u2022'}
        </Text>
        <Text className='text-4xl font-bold mb-3 text-left'>
          For a Positive Impact
        </Text>
        <Text className='text-lg text-gray-600 text-left'>
          Connect with friends and fight climate change together.
        </Text>
      </View>

      <View className='flex-1 gap-3 w-full px-4 items-center justify-center text-center'>
        <Link href="/auth/signup" asChild>
          <TouchableOpacity className='flex-1 bg-blue-500 rounded-lg px-4 py-3 mb-4 w-[80%] max-h-[50px] items-center justify-center'>
            <Text className='text-white text-lg font-semibold'>
              Sign Up
            </Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/auth/login" asChild>
          <TouchableOpacity className='flex-1 bg-transparent border border-blue-500 rounded-lg px-4 py-3 mb-4 w-[80%] max-h-[50px] items-center justify-center'>
            <Text className='text-blue-500 text-lg font-semibold'>
              Log In
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    textAlign: 'left'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});