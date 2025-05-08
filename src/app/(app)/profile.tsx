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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditedName(profile.display_name || "");
    }
  }, [profile]);

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

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditingProfile(true)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setEditedName(profile?.display_name || "");
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
    marginBottom: 16,
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
  content: {
    flex: 1,
    paddingTop: 12,
    paddingRight: 30,
    paddingBottom: 12,
    paddingLeft: 30,
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
    borderRadius: 8,
    alignItems: "center",
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
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
