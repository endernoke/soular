import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import type { FeedItem, Post, PromotedPost } from "@/types";
import { formatDistanceToNowStrict } from "date-fns";

const { width } = Dimensions.get("window");

// Updated time formatting using date-fns
const formatRelativeTime = (timestamp: string | null | undefined) => {
  if (!timestamp) return "";
  try {
    return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "invalid date";
  }
};

const SocialFeed = forwardRef(
  ({ nested = false }: { nested?: boolean }, ref) => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeedItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch regular posts
        const { data: fetchedPosts, error: postsError } = await supabase
          .from("posts")
          .select(
            `
          id,
          content,
          image_url,
          created_at,
          author_id,
          profiles (
            display_name,
            photo_url
          )
        `
          )
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        // Fetch promoted posts that haven't expired
        const { data: fetchedPromotedPosts, error: promotedError } = await supabase
          .from("promoted_posts")
          .select(
            `
          id,
          content,
          image_url,
          created_at,
          author_id,
          affiliated_link,
          expires_at,
          profiles (
            display_name,
            photo_url
          )
        `
          )
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });

        if (promotedError) throw promotedError;

        // Format posts and add isPromoted flag
        const formattedPosts = (fetchedPosts || []).map((post) => ({
          ...post,
          profiles: post.profiles?.[0] || post.profiles || null,
          isPromoted: false,
        }));

        const formattedPromotedPosts = (fetchedPromotedPosts || []).map(
          (post) => ({
            ...post,
            profiles: post.profiles?.[0] || post.profiles || null,
            isPromoted: true,
          })
        );

        // Sort regular posts and insert promoted posts randomly
        let allPosts = formattedPosts.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        // Randomly insert promoted posts
        formattedPromotedPosts.forEach((promotedPost) => {
          const randomIndex = Math.floor(Math.random() * (allPosts.length + 1));
          allPosts.splice(randomIndex, 0, promotedPost);
        });

        setFeedItems(allPosts);
      } catch (error) {
        console.error("Error fetching feed items:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch feed");
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      fetchPosts: fetchFeedItems,
    }));

    useEffect(() => {
      fetchFeedItems();

      const postsSubscription = supabase
        .channel("public:posts")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "posts" },
          () => fetchFeedItems()
        )
        .subscribe();

      const promotedPostsSubscription = supabase
        .channel("public:promoted_posts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "promoted_posts" },
          () => fetchFeedItems()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(postsSubscription);
        supabase.removeChannel(promotedPostsSubscription);
      };
    }, []);

    const handlePromotedPostClick = async (url: string) => {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error("Error opening URL:", error);
      }
    };

    const renderFeedItem = ({ item }: { item: FeedItem }) => (
      <View
        style={[
          styles.postCard,
          item.isPromoted && styles.promotedPostCard,
        ]}
      >
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            {/* Use author's photo_url from joined profiles data */}
            {item.profiles?.photo_url ? (
              <Image
                source={{ uri: item.profiles.photo_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
            )}
            <View>
              {/* Use author's display_name from joined profiles data */}
              <Text style={styles.authorName}>
                {item.profiles?.display_name || "User"}
              </Text>
              <Text style={styles.timestamp}>
                {formatRelativeTime(item.created_at)}
              </Text>
            </View>
          </View>
          {item.isPromoted && (
            <View style={styles.promotedBadge}>
              <Text style={styles.promotedText}>Promoted</Text>
            </View>
          )}
        </View>

        {item.image_url && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        )}
        <Text style={styles.postContent}>{item.content}</Text>

        {item.isPromoted && "affiliated_link" in item && (
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => handlePromotedPostClick(item.affiliated_link)}
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        )}
      </View>
    );

    return (
      <View style={styles.feed}>
        {isLoading && feedItems.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 20 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : nested ? (
          <ScrollView style={styles.scrollView}>
            {feedItems.map((item) => (
              <View key={item.id}>{renderFeedItem({ item })}</View>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            data={feedItems}
            renderItem={renderFeedItem}
            keyExtractor={(item) => item.id}
            onRefresh={fetchFeedItems} // Add pull-to-refresh
            refreshing={isLoading} // Show refresh indicator while loading
            ListEmptyComponent={() =>
              !isLoading && (
                <Text style={styles.emptyText}>
                  No posts yet. Be the first!
                </Text>
              )
            }
          />
        )}
      </View>
    );
  }
);

export default SocialFeed;

const styles = StyleSheet.create({
  feed: {
    flex: 1, // Ensure feed takes available space
    padding: 16,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 0,
    marginBottom: 24,
    borderColor: "#00000015",
    borderWidth: 2,
  },
  promotedPostCard: {
    borderColor: "#1aea9f",
    borderWidth: 2,
    shadowColor: "#1aea9f",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontWeight: "600",
    fontSize: 16,
  },
  timestamp: {
    fontWeight: "600",
    fontSize: 12,
    color: "#00000050",
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 0,
    padding: 16,
    paddingTop: 0,
    //     paddingTop: 0
  },
  imageContainer: {
    width: "100%",
    marginBottom: 16,
    //     borderRadius: 8,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: width * 0.6, // Maintain aspect ratio based on screen width
    backgroundColor: "#f0f0f0", // Placeholder color
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },
  promotedBadge: {
    backgroundColor: "#1aea9f20",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1aea9f",
  },
  promotedText: {
    color: "#1aea9f",
    fontSize: 12,
    fontWeight: "600",
  },
  learnMoreButton: {
    backgroundColor: "#1aea9f",
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  learnMoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
