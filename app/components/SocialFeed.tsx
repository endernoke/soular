import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/types';

const SocialFeed = forwardRef((props, ref) => {
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
          {item.author.photoUrl ? (
            <Image source={{ uri: item.author.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
          <Text style={styles.authorName}>{item.author.displayName}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
    </View>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.feed}
      refreshing={isLoading}
      onRefresh={fetchPosts}
    />
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
  postContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});