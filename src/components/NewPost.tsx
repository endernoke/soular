import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase"; // Import supabase client
import { useAuth } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer"; // For converting base64 to ArrayBuffer
import * as utils from "@/lib/utils";

export default function NewPost({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const { user } = useAuth(); // Get Supabase user
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Adjust quality as needed
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    setIsLoading(true);
    let imageUrl: string | null = null;

    try {
      // 1. Upload image if selected
      if (selectedImageUri) {
        const fileExt = utils.getFileExtension(selectedImageUri);
        const mimeType = utils.guessMimeType(fileExt);
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        // Read the file into base64 first (required by expo-file-system)
        const base64 = await FileSystem.readAsStringAsync(selectedImageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images") // Assuming a bucket named 'images'
          .upload(filePath, decode(base64), { contentType: mimeType });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        imageUrl = urlData?.publicUrl ?? null;
      }

      // 2. Insert post data into the database
      const postData = {
        content: newPost.trim(),
        image_url: imageUrl,
        author_id: user.id, // Use Supabase user ID
      };

      const { error: insertError } = await supabase
        .from("posts")
        .insert(postData);

      if (insertError) throw insertError;

      // Reset state and notify parent
      setNewPost("");
      setSelectedImageUri(null);
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", String(error) || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.createPost}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={newPost}
        onChangeText={setNewPost}
        multiline
      />

      {selectedImageUri && (
        <View style={styles.imagePreviewContainer}>
          {/* Display selected image using its URI */}
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.imagePreview}
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setSelectedImageUri(null)}
          >
            <Ionicons name="close-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Ionicons name="image" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postButton,
            (!newPost.trim() || isLoading) && styles.postButtonDisabled,
          ]}
          onPress={handleCreatePost}
          disabled={!newPost.trim() || isLoading}
        >
          <Text style={styles.postButtonText}>
            {isLoading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  createPost: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    flex: 1, // Ensure the container takes up available space
    justifyContent: "flex-start", // Ensure content aligns properly
    alignItems: "stretch", // Stretch items to fit the container
    width: "100%", // Ensure the container spans the full width
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 0,
    marginTop: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 16,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  imageButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
