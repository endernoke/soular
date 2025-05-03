import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
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

  // Change status bar color based on the screen
  useFocusEffect(
    useCallback(() => {
      setStatusBarBackgroundColor('rgb(26, 234, 159)');
      return () => {
        setStatusBarBackgroundColor('rgb(255, 255, 255)');
      };
    }, [])
  );

  return (
    <ScrollView className='flex-1 bg-white'>
      <LinearGradient
        colors={['rgb(26, 234, 159)', 'rgb(255, 255, 255)']}
        className='flex-1 justify-center items-center w-full h-full'
      >
        <View className='flex-1 flex-row items-center justify-between px-4 pt-4 w-full'>
          <Text className="text-4xl font-bold ml-4">
            Soular
          </Text>
          <TouchableOpacity className="p-4">
            <Ionicons name="mail" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <HomeWidgets />
      </LinearGradient>
      
      <View className="flex-1 bg-white border-t-2 border-gray-200">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white">
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
          <SocialFeed ref={socialFeedRef} nested={true} />
        </View>
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
