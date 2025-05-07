import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase'; // Import supabase client
import type { Post } from '@/types'; // Use updated Post type
import { formatDistanceToNowStrict } from 'date-fns'; // Use date-fns for relative time

const { width } = Dimensions.get('window');n

// Updated time formatting using date-fns
const formatRelativeTime = (timestamp: string | null | undefined) => {
  if (!timestamp) return '';
  try {
    return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'invalid date';
  }
};

const SocialFeed = forwardRef(({ nested = false }: { nested?: boolean }, ref) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch posts and join with profiles table to get author info
      const { data: fetchedPosts, error: fetchError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          author_id,
          profiles (
            display_name,
            photo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Map the fetched data to match the Post type structure
      const formattedPosts = (fetchedPosts || []).map(post => ({
        ...post,
        profiles: post.profiles?.[0] || post.profiles || null // Take the first profile if multiple exist (which is probably impossible)
      }));
      setPosts(formattedPosts);

    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(error.message || 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchPosts
  }));

  useEffect(() => {
    fetchPosts();
    
    // Optional: Set up real-time subscription for new posts
    const postsSubscription = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('New post received!', payload);
          // Simple refetch for now, could be optimized to insert the new post
          fetchPosts(); 
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(postsSubscription);
    };

  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          {/* Use author's photo_url from joined profiles data */}
          {item.profiles?.photo_url ? (
            <Image source={{ uri: item.profiles.photo_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
          <View>
            {/* Use author's display_name from joined profiles data */}
            <Text style={styles.authorName}>{item.profiles?.display_name || 'User'}</Text>
            <Text style={styles.timestamp}>{formatRelativeTime(item.created_at)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      
      {/* Use image_url from post data */}
      {item.image_url && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}
      {/* Add like/comment buttons or other interactions here */}
    </View>
  );

  return (
    <View style={styles.feed}>
      {isLoading && posts.length === 0 ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
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
          onRefresh={fetchPosts} // Add pull-to-refresh
          refreshing={isLoading} // Show refresh indicator while loading
          ListEmptyComponent={() => (
            !isLoading && <Text style={styles.emptyText}>No posts yet. Be the first!</Text>
          )}
        />
      )}
    </View>
  );
});

export default SocialFeed;

const styles = StyleSheet.create({
  feed: {
    flex: 1, // Ensure feed takes available space
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
    backgroundColor: '#f0f0f0', // Placeholder color
  },
  scrollView: {
    flexGrow: 1,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 16,
  },
});