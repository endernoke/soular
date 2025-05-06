// This is the main page

import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import NewPost from '@/components/NewPost';
import SocialFeed from '@/components/SocialFeed';
import HomeWidgets from '@/components/HomeWidgets';

export default function HomeScreen() {
  const { user, profile } = useAuth();
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
//         colors={['#1aea79','#e1dd0170','#fff']}
colors={['white','white','white']}
        className='justify-center items-center w-full pb-10'
      >
        <View className='flex-1 flex-row items-center justify-between px-[30px] pt-6 w-full mb-5'>
          <View className='flex-1 flex-col'>
          <Text className="text-[25px] font-bold text-[#1aea9f] mb-[-10px]">
                      Welcome,
                    </Text>
          <Text className="text-[50px] font-bold">
            Soular
          </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="p-4">
              <Ionicons name="mail" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              className="p-1"
            >
              {profile?.photo_url ? (
                <Image 
                  source={{ uri: profile.photo_url }} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                  <Ionicons name="person" size={20} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <HomeWidgets />
      </LinearGradient>
      
      <View className="flex-1 bg-white border-t-2 border-gray-200">
        <View className="flex-row items-center justify-between px-[30px] pt-[20px] bg-white">
          <Text className="text-2xl">Our Soular Stories</Text>
          <TouchableOpacity
            onPress={() => setNewPostModalVisible(true)}
            className="flex-row bg-[black] rounded-full w-20 h-8 items-center justify-center"
          >
            <Ionicons name="add" size={15} color="#fff" />
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
