import { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import NewPost from './components/NewPost';
import SocialFeed from './components/SocialFeed';
import HomeWidgets from './components/HomeWidgets';

export default function HomeScreen() {
  const { user } = useAuth();
  const socialFeedRef = useRef<{ fetchPosts: () => Promise<void> }>();

  const handlePostCreated = () => {
    socialFeedRef.current?.fetchPosts();
  };

  return (
    <ScrollView className='flex-1'>
      <View className='flex-1 flex-row items-center justify-between p-4 bg-white border-b border-gray-200'>
        <Text className="text-2xl font-bold">
          Soular
        </Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="mail" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <HomeWidgets />
      <NewPost onPostCreated={handlePostCreated} />
      <View style={styles.feedContainer}>
        <SocialFeed ref={socialFeedRef} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  feedContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
