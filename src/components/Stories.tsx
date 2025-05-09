import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Story } from '@/types';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/auth';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as utils from "@/lib/utils";
import { useFocusEffect } from 'expo-router';

export default function Stories() {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [uploadingStory, setUploadingStory] = useState(false);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            display_name,
            photo_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log("Loading stories...");
      loadStories();

      // Set up real-time subscription
      const subscription = supabase
        .channel('stories')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stories'
          },
          () => loadStories()
        )
        .subscribe();

      return () => {
        console.log('Unsubscribing from stories channel');
        supabase.removeChannel(subscription);
      };
    }, [])
  );

  const handleAddStory = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadingStory(true);
      try {
        const uri = result.assets[0].uri;
        const fileExt = utils.getFileExtension(uri);
        const fileName = `${new Date().getTime()}.${fileExt}`;
        const mimeType = utils.guessMimeType(fileExt);
        const filePath = `${user?.id}/${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Upload image to stories bucket
        const { data: fileData, error: uploadError } = await supabase.storage
          .from('stories')
          .upload(filePath, decode(base64), {
            contentType: `image/${mimeType}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("stories")
          .getPublicUrl(filePath);
        
        const imageUrl = data.publicUrl;
        // Create story record
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours

        const { error: storyError } = await supabase.from('stories').insert({
          content: '',
          image_url: imageUrl,
          author_id: user?.id,
          expires_at: expiresAt.toISOString(),
        });

        if (storyError) throw storyError;

        // Refresh stories after upload
        await loadStories();
      } catch (error) {
        console.error('Error uploading story:', error);
      } finally {
        setUploadingStory(false);
      }
    }
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      onPress={() => setViewingStory(item)}
      className="items-center justify-start overflow-hidden px-1"
    >
      <View className="rounded-[50%] w-[60px] h-[60px] overflow-hidden">
        <LinearGradient
          colors={['#1aea9fb0', '#ffbf00']}
          className="flex-1 rounded-[50px] items-center justify-center w-full h-full"
        >
          {item.profiles?.photo_url ? (
            <Image
              source={{ uri: item.profiles.photo_url }}
              style={styles.storyAvatar}
            />
          ) : (
            <View style={[styles.storyAvatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const renderAddStoryButton = () => (
    <TouchableOpacity
      onPress={handleAddStory}
      disabled={uploadingStory}
      style={styles.addStoryButton}
    >
      <View style={styles.addStoryPlus}>
        <Ionicons name="add" size={24} color="#1aea9f" />
      </View>
      <Text style={styles.addStoryText}>Add Story</Text>
    </TouchableOpacity>
  );

  return (
    <View className='flex-row w-full items-center justify-start px-2 gap-4'>
      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={renderAddStoryButton}
      />

      <Modal
        visible={!!viewingStory}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewingStory(null)}
      >
        {viewingStory && (
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                console.log('Close button pressed');
                setViewingStory(null);
              }
            }
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.storyHeader}>
              <View style={styles.storyUserInfo}>
                {viewingStory.profiles?.photo_url ? (
                  <Image
                    source={{ uri: viewingStory.profiles.photo_url }}
                    style={styles.modalAvatar}
                  />
                ) : (
                  <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                )}
                <Text style={styles.modalUsername}>
                  {viewingStory.profiles?.display_name || 'User'}
                </Text>
                <Text style={styles.storyTime}>
                  {format(new Date(viewingStory.created_at), 'HH:mm')}
                </Text>
              </View>
            </View>

            {viewingStory.image_url && (
              <Image
                source={{ uri: viewingStory.image_url }}
                style={styles.storyImage}
                resizeMode="contain"
              />
            )}
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#1aea9f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyUsername: {
    marginTop: 4,
    fontSize: 12,
    color: '#000',
    maxWidth: 64,
    textAlign: 'center',
  },
  addStoryButton: {
    alignItems: 'center',
    marginRight: 15,
  },
  addStoryPlus: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1aea9f',
    borderStyle: 'dashed',
  },
  addStoryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    minWidth: 40,
    minHeight: 40,
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 5,
  },
  storyHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  modalUsername: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  storyTime: {
    color: '#ffffff80',
    fontSize: 14,
  },
  storyImage: {
    flex: 1,
    width: "100%",
    height: undefined,
  },
});