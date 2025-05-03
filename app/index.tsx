import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import NewPost from './components/NewPost';
import SocialFeed from './components/SocialFeed';
import HomeWidgets from './components/HomeWidgets';

export default function HomeScreen() {
  const { user } = useAuth();
  const socialFeedRef = useRef<{ fetchPosts: () => Promise<void> }>();
  const [isNewPostModalVisible, setNewPostModalVisible] = useState(false);

  const handlePostCreated = () => {
    socialFeedRef.current?.fetchPosts();
    setNewPostModalVisible(false);
  };

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='flex-1 flex-row items-center justify-between p-4 bg-white border-b border-gray-200'>
        <Text className="text-4xl font-bold ml-4">
          Soular
        </Text>
        <TouchableOpacity className="p-4">
          <Ionicons name="mail" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <HomeWidgets />
      
      <View className="flex-row items-center justify-between mt-4 px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold">Our Soular Stories</Text>
        <TouchableOpacity 
          onPress={() => setNewPostModalVisible(true)}
          className="flex-row bg-blue-500 rounded-full w-20 h-8 items-center justify-center"
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text className="text-white text-md">New</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-white">
        <SocialFeed ref={socialFeedRef} />
      </View>

      <Modal
        visible={isNewPostModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewPostModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-[90%] rounded-lg overflow-hidden">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Create New Post</Text>
              <TouchableOpacity onPress={() => setNewPostModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <NewPost onPostCreated={handlePostCreated} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
