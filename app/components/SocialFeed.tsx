import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/types';

const { width } = Dimensions.get('window');

const formatRelativeTime = (timestamp: any) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = timestamp.toDate();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

const SocialFeed = forwardRef(({ nested = false }: { nested?: boolean }, ref) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchPosts
  }));

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.authorName}>{item.author.displayName}</Text>
            <Text style={styles.timestamp}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.imageBase64 && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageBase64 }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.feed}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : nested ? (
        <ScrollView style={styles.scrollView}>
          {posts.map(item => (
            <View key={item.id}>{renderPost({ item })}</View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
});

export default SocialFeed;

const styles = StyleSheet.create({
  feed: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontWeight: '600',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: width * 0.6, // Maintain aspect ratio based on screen width
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flexGrow: 1,
  },
});