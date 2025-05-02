import { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import NewPost from './components/NewPost';
import SocialFeed from './components/SocialFeed';

export default function HomeScreen() {
  const { user } = useAuth();
  const socialFeedRef = useRef<{ fetchPosts: () => Promise<void> }>();

  const handlePostCreated = () => {
    socialFeedRef.current?.fetchPosts();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="mail" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back, {user?.displayName}!</Text>
        <Text style={styles.subtitle}>Share your thoughts with the community</Text>
      </View>

      <NewPost onPostCreated={handlePostCreated} />
      <View style={styles.feedContainer}>
        <SocialFeed ref={socialFeedRef} />
      </View>
    </View>
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
