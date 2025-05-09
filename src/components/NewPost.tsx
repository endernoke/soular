import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import * as utils from "@/lib/utils";

const SPONSORED_PACKAGES = [
  {
    name: "Basic",
    price: 50,
    features: ["7 days visibility", "Standard placement"],
  },
  {
    name: "Premium",
    price: 100,
    features: ["14 days visibility", "Priority placement", "Highlighted post"],
  },
  {
    name: "Enterprise",
    price: 1000,
    features: [
      "30 days visibility",
      "Top placement",
      "Highlighted post",
      "Featured in newsletter",
    ],
  },
];

export default function NewPost({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isSponsoredModalVisible, setIsSponsoredModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [organizationName, setOrganizationName] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async (isSponsored = false) => {
    if (!newPost.trim() || !user) return;
    if (isSponsored && (selectedPackage === null || !organizationName.trim())) {
      Alert.alert("Error", "Please select a package and enter organization name");
      return;
    }

    setIsLoading(true);
    let imageUrl: string | null = null;

    try {
      // Upload image if selected
      if (selectedImageUri) {
        const fileExt = utils.getFileExtension(selectedImageUri);
        const mimeType = utils.guessMimeType(fileExt);
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(selectedImageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, decode(base64), { contentType: mimeType });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        imageUrl = urlData?.publicUrl ?? null;
      }

      // Insert post data
      const postData = {
        content: newPost.trim(),
        image_url: imageUrl,
        author_id: user.id,
        is_sponsored: isSponsored,
        ...(isSponsored && {
          sponsor_name: organizationName,
          sponsor_package: SPONSORED_PACKAGES[selectedPackage!].name,
          sponsor_price: SPONSORED_PACKAGES[selectedPackage!].price,
        }),
      };

      const { error: insertError } = await supabase
        .from("posts")
        .insert(postData);

      if (insertError) throw insertError;

      // Reset state
      setNewPost("");
      setSelectedImageUri(null);
      setOrganizationName("");
      setSelectedPackage(null);
      setIsSponsoredModalVisible(false);
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", String(error) || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const openSponsoredModal = () => {
    if (!user) {
      Alert.alert("Authentication required", "Please sign in to create sponsored posts");
      return;
    }
    setIsSponsoredModalVisible(true);
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

        <View style={styles.postButtonsContainer}>
          <TouchableOpacity
            style={styles.sponsoredButton}
            onPress={openSponsoredModal}
          >
            <Text style={styles.sponsoredButtonText}>Sponsored</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.postButton,
              (!newPost.trim() || isLoading) && styles.postButtonDisabled,
            ]}
            onPress={() => handleCreatePost(false)}
            disabled={!newPost.trim() || isLoading}
          >
            <Text style={styles.postButtonText}>
              {isLoading ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sponsored Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSponsoredModalVisible}
        onRequestClose={() => setIsSponsoredModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Sponsored Post</Text>

            <TextInput
              style={styles.input2}
              placeholder="Organization/NGO/Enterprise Name"
              value={organizationName}
              onChangeText={setOrganizationName}
            />

            <Text style={styles.packageTitle}>Select a Package:</Text>

            {SPONSORED_PACKAGES.map((pkg, index) => (
              <Pressable
                key={pkg.name}
                style={[
                  styles.packageOption,
                  selectedPackage === index && styles.packageOptionSelected,
                ]}
                onPress={() => setSelectedPackage(index)}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>${pkg.price}</Text>
                </View>
                <View style={styles.packageFeatures}>
                  {pkg.features.map((feature, i) => (
                    <Text key={i} style={styles.packageFeature}>
                      • {feature}
                    </Text>
                  ))}
                </View>
              </Pressable>
            ))}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsSponsoredModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (selectedPackage === null || !organizationName.trim() || isLoading) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={() => handleCreatePost(true)}
                disabled={selectedPackage === null || !organizationName.trim() || isLoading}
              >
                <Text style={styles.modalButtonText}>
                  {isLoading ? "Processing..." : "Submit"}
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
  createPost: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },

  input2: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 16,
      padding: 16,
//       minHeight: 80,
height: 60,
      textAlignVertical: "top",
      marginBottom: 12,
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
  postButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  imageButton: {
    padding: 8,
  },
  sponsoredButton: {
    backgroundColor: "#1aea9f",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    paddingLeft: 30,
        paddingRight: 30,

  },
  sponsoredButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  postButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 30,
//     minWidth: 80,
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#4b5563",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.1,
          shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  packageOption: {
    borderWidth: 3,
    borderColor: "#00000005",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  packageOptionSelected: {
      borderWidth: 3,
    borderColor: "#1aea9f",
    backgroundColor: "#1aea9f20",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  packageName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  packagePrice: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1aea9f",
  },
  packageFeatures: {
    marginLeft: 8,
  },
  packageFeature: {
    fontSize: 14,
    color: "#555",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  submitButton: {
    backgroundColor: "#007aff",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});