import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  Linking,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer"; // For converting base64 to ArrayBuffer
import * as utils from "@/lib/utils";

export default function ProfileScreen() {
  const { profile, user, updateUserProfile } = useAuth();
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(profile?.display_name || "");
  const [editedBio, setEditedBio] = useState(profile?.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"events" | "posts">("events");
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setEditedName(profile.display_name || "");
      setEditedBio(profile.bio || "");
    }
  }, [profile]);

  // Fetch user's events and posts
  useEffect(() => {
    if (user?.id) {
      fetchUserEvents();
      fetchUserPosts();
    }
  }, [user?.id]);

  const fetchUserEvents = async () => {
    try {
      // Fetch events where user is organizer or participant
      const { data: organizedEvents, error: organizerError } = await supabase
        .from("events")
        .select(`
          *,
          profiles:author_id (
            display_name,
            photo_url
          )
        `)
        .eq("author_id", user?.id);

      const { data: participatedEvents, error: participantError } = await supabase
        .from("event_participants")
        .select(`
          events (
            *,
            profiles:author_id (
              display_name,
              photo_url
            )
          )
        `)
        .eq("user_id", user?.id);

      if (organizerError) throw organizerError;
      if (participantError) throw participantError;

      const events = [
        ...(organizedEvents || []).map((event) => ({ ...event, role: "organizer" })),
        ...(participatedEvents || []).map(({ events }) => ({ ...events, role: "participant" })),
      ];

      setUserEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:author_id (
            display_name,
            photo_url
          )
        `)
        .eq("author_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserPosts(posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign out";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleHelpAndSupport = () => {
    const email = "support@soularapp.com"; // Placeholder email
    const subject = "Help & Support Request";
    const body = "Please describe your issue or question here.";
    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailto).catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to open email app";
      Alert.alert("Error", errorMessage);
      console.error("Error opening email app:", error);
    });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // square aspect for profile images
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri; // URI of selected image
    }
    return null;
  };

  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    return await response.blob();
  };

  const handleUploadProfileImage = async (
    uri: string,
    userId: string | number
  ) => {
    try {
      const fileExt = utils.getFileExtension(uri);
      const mimeType = utils.guessMimeType(fileExt);
      const fileName = `${userId}.${fileExt}`;
      // Read the file into base64 first (required by expo-file-system)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, decode(base64), {
          upsert: true,
          contentType: mimeType,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const updateUserProfilePhoto = async (photoUrl: string) => {
    try {
      await updateUserProfile({ photo_url: photoUrl });
      Alert.alert("Success", "Profile image updated");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile image");
    }
  };

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile({
        display_name: editedName.trim(),
        bio: editedBio.trim() || null,
      });
      setIsEditingProfile(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      console.error("Error updating profile:", error);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="ml-2">Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={async () => {
            const uri = await handlePickImage();
            if (uri) {
              setIsLoading(true);
              if (user?.id) {
                let photoUrl = await handleUploadProfileImage(uri, user.id);
                if (photoUrl) {
                  photoUrl += `?t=${new Date().getTime()}`; // Cache-busting
                  await updateUserProfilePhoto(photoUrl);
                }
              } else {
                Alert.alert("Error", "User ID is not available");
              }
              setIsLoading(false);
            }
          }}
        >
          {!isLoading ? (
            profile?.photo_url ? (
              <Image
                source={{ uri: profile.photo_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{profile?.display_name || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditingProfile(true)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "events" && styles.activeTab]}
          onPress={() => setActiveTab("events")}
        >
          <Text style={styles.tabButtonText}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "posts" && styles.activeTab]}
          onPress={() => setActiveTab("posts")}
        >
          <Text style={styles.tabButtonText}>Posts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "events" ? (
          userEvents.length > 0 ? (
            userEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => router.push(`/events/${event.id}`)}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {/* event.start_date is in YYYY-MM-DD format */}
                  {new Date(event.event_timestamp).toLocaleString()}
                </Text>
                <Text style={styles.eventRole}>
                  {event.role === "organizer"
                    ? "You are the organizer"
                    : "You are a participant"}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No events found</Text>
          )
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => (
            <View key={post.id} style={styles.postItem}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDate}>
                {new Date(post.created_at).toLocaleString()}
              </Text>
              <Text style={styles.postContent}>{post.content}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No posts found</Text>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleHelpAndSupport}
        >
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal
        visible={isEditingProfile}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Display Name"
              value={editedName}
              onChangeText={setEditedName}
            />

            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              placeholder="Bio - Tell us about yourself..."
              value={editedBio}
              onChangeText={setEditedBio}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setEditedName(profile?.display_name || "");
                  setEditedBio(profile?.bio || "");
                  setIsEditingProfile(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleUpdateProfile}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>
                  {isLoading ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    flexDirection: "row",
    padding: 8,
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  bio: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingRight: 30,
    paddingBottom: 12,
    paddingLeft: 30,
  },
  eventItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  eventRole: {
    fontSize: 14,
    color: "#007AFF",
  },
  postItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  postDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    color: "#333",
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  signOutButton: {
    margin: 30,
    padding: 16,

    backgroundColor: "#ff3b30",
    borderRadius: 16,
    alignItems: "center",
  },
  signOutText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,

    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#ddd",
    marginRight: 8,
  },
  modalSaveButton: {
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
