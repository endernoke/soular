import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ChatRoom, Profile } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const ChatListItem = ({ chat }: { chat: ChatRoom }) => {
  // Get chat name and icon based on type
  const getChatInfo = () => {
    if (chat.type === 'direct' && chat.other_user) {
      return {
        name: chat.other_user.display_name || 'User',
        icon: chat.other_user.photo_url,
        isProfile: true
      };
    } else if (chat.event) {
      const prefix = chat.type === 'event_organizers' ? 'Organizers:' : 'Participants:';
      return {
        name: `${prefix} ${chat.event.title}`,
        icon: chat.icon_url,
        isProfile: false
      };
    }
    return { name: 'Chat', icon: null, isProfile: false };
  };

  const { name, icon, isProfile } = getChatInfo();
  const lastMessage = chat.last_message;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chats/${chat.id}`)}
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
    >
      {/* Chat Icon/Avatar */}
      {icon ? (
        <Image
          source={{ uri: icon }}
          className="w-12 h-12 rounded-full"
        />
      ) : (
        <View className={`w-12 h-12 rounded-full ${isProfile ? 'bg-blue-500' : 'bg-gray-500'} items-center justify-center`}>
          <Ionicons 
            name={isProfile ? "person" : "chatbubbles"} 
            size={24} 
            color="#fff" 
          />
        </View>
      )}

      {/* Chat Info */}
      <View className="flex-1 ml-4">
        <Text className="font-semibold text-lg">{name}</Text>
        {lastMessage && (
          <Text className="text-gray-600 text-sm" numberOfLines={1}>
            {lastMessage.sender?.display_name}: {lastMessage.content}
          </Text>
        )}
      </View>

      {/* Timestamp */}
      {lastMessage && (
        <Text className="text-xs text-gray-500">
          {format(new Date(lastMessage.created_at), 'HH:mm')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default function ChatInboxScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      console.log('ChatInboxScreen mounted');
      if (!user) return;

      const loadChats = async () => {
        try {
          setLoading(true);
          // Fetch all chats the user is a member of
          const { data: chatRooms, error: chatError } = await supabase
          .from('chat_rooms')
          .select(`
            *,
            event:event_id (*),
            last_message:chat_messages (
              id,
              content,
              created_at,
              sender:sender_id (
                display_name
              )
            )
          `)
          .eq('is_enabled', true)
          .order('updated_at', { ascending: false });

          if (chatError) throw chatError;

          // For direct messages, fetch the other user's profile
          const processedChats = await Promise.all((chatRooms || []).map(async (chat) => {
          if (chat.type === 'direct') {
            const { data: members } = await supabase
              .from('chat_members')
              .select('profile:profiles(*)')
              .eq('chat_id', chat.id)
              .neq('user_id', user.id)
              .single();
                
              return {
                ...chat,
                other_user: members?.profile as Profile | undefined,
                last_message: chat.last_message?.[0],
              };
            }
            return {
              ...chat,
              last_message: chat.last_message?.[0],
            };
          }));

          setChats(processedChats);
        } catch (error) {
          console.error('Error loading chats:', error);
        } finally {
          setLoading(false);
        }
      };

      loadChats();

      // Set up real-time subscriptions
      const chatSubscription = supabase
        .channel('chat-updates')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `chat_id=in.(${chats.map(c => c.id).join(',')})` 
          },
          () => loadChats()
        )
        .subscribe();

      return () => {
        console.log('Cleaning up chat subscription');
        supabase.removeChannel(chatSubscription);
      };
    }, [])
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Messages</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={({ item }) => <ChatListItem chat={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500 text-center">
              {loading ? 'Loading chats...' : 'No messages yet'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}