import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ChatRoom, Profile } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

const ChatListItem = ({ chat }: { chat: ChatRoom }) => {
  // Get chat name and icon based on type
  const getChatInfo = () => {
    if (chat.type === "direct" && chat.other_user) {
      return {
        name: chat.other_user.display_name || "User",
        icon: chat.other_user.photo_url,
        isProfile: true,
      };
    } else if (chat.event) {
      const prefix =
        chat.type === "event_organizers" ? "ORG /" : "PAR /";
      return {
        name: `${prefix} ${chat.event.title}`,
        icon: chat.icon_url,
        isProfile: false,
      };
    }
    return { name: "Chat", icon: null, isProfile: false };
  };

  const { name, icon, isProfile } = getChatInfo();
  const lastMessage = chat.last_message;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chats/${chat.id}`)}
      className="flex-row items-center p-4 px-[20px] bg-white border-b border-gray-100"
    >
      {/* Chat Icon/Avatar */}
      {icon ? (
        <Image source={{ uri: icon }} className="w-12 h-12 rounded-full" />
      ) : (
        <View
          className={`w-12 h-12 rounded-full ${
            isProfile ? "bg-blue-500" : "bg-[#1aea9f]"
          } items-center justify-center`}
        >
          <Ionicons
            name={isProfile ? "person" : "chatbubbles"}
            size={24}
            color="#fff"
          />
        </View>
      )}

      {/* Chat Info */}
      <View className="flex-1 ml-4">
        <Text className="font-semibold text-lg" numberOfLines={1}>{name}</Text>
        {lastMessage ? (
          <Text className="text-gray-600 text-sm" numberOfLines={1}>
            {lastMessage.sender?.display_name}: {lastMessage.content}
          </Text>
        ) : (
          <Text className="text-[#1aea9f] text-sm font-semibold">
            Start the conversation!
          </Text>
        )}
      </View>

      {/* Timestamp */}
      {lastMessage && (
        <Text className="text-xs text-gray-500 ml-2">
          {format(new Date(lastMessage.created_at), "HH:mm")}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const SearchResultItem = ({
  profile,
  onPress,
}: {
  profile: Profile;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center p-4 px-[20px] bg-white border-b border-gray-100"
  >
    {profile.photo_url ? (
      <Image
        source={{ uri: profile.photo_url }}
        className="w-12 h-12 rounded-full"
      />
    ) : (
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
        <Ionicons name="person" size={24} color="#fff" />
      </View>
    )}
    <View className="flex-1 ml-4">
      <Text className="font-semibold text-lg">
        {profile.display_name || "User"}
      </Text>
      <Text className="text-gray-600 text-sm">Tap to start chatting</Text>
    </View>
  </TouchableOpacity>
);

export default function ChatInboxScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const getFilteredChats = () => {
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      if (chat.type === "direct" && chat.other_user) {
        return chat.other_user.display_name?.toLowerCase().includes(query);
      } else if (chat.event) {
        return chat.event.title.toLowerCase().includes(query);
      }
      return false;
    });
  };

  useFocusEffect(
    useCallback(() => {
      console.log("ChatInboxScreen mounted");
      if (!user) return;

      const loadChats = async () => {
        try {
          setLoading(true);
          // Fetch all chats the user is a member of
          const { data: chatRooms, error: chatError } = await supabase
            .from("chat_rooms")
            .select(
              `
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
          `
            )
            .eq("is_enabled", true)
            .order("updated_at", { ascending: false });

          if (chatError) throw chatError;

          // For direct messages, fetch the other user's profile
          const processedChats = await Promise.all(
            (chatRooms || []).map(async (chat) => {
              if (chat.type === "direct") {
                const { data: members } = await supabase
                  .from("chat_members")
                  .select("profile:profiles(*)")
                  .eq("chat_id", chat.id)
                  .neq("user_id", user.id)
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
            })
          );

          setChats(processedChats);
        } catch (error) {
          console.error("Error loading chats:", error);
        } finally {
          setLoading(false);
        }
      };

      loadChats();

      // Set up real-time subscriptions
      const chatSubscription = supabase
        .channel("chat-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_messages",
            filter: `chat_id=in.(${chats.map((c) => c.id).join(",")})`,
          },
          () => loadChats()
        )
        .subscribe();

      return () => {
        console.log("Cleaning up chat subscription");
        supabase.removeChannel(chatSubscription);
      };
    }, [])
  );

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user?.id) // Exclude current user
        .ilike("display_name", `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(profiles || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (otherUser: Profile) => {
    try {
      setLoading(true);

      // Check if a direct chat already exists
      const { data: existingChat, error: chatError } = await supabase.rpc(
        "create_direct_chat",
        {
          user1_id: user?.id,
          user2_id: otherUser.id,
        }
      );

      if (chatError) throw chatError;

      // Clear search and navigate to chat
      setSearchQuery("");
      setSearchResults([]);
      router.push(`/chats/${existingChat}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white p-[20px] flex-row items-left items-center mb-0">
        <Text className="text-3xl ml-1 font-bold">Messages</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-4 mx-[20px] border-2 border-gray-100">
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users or chats..."
          className="flex-1 ml-3"
        />
        {searching && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      {/* Show filtered chats if the query matches any existing chats */}
      {searchQuery && getFilteredChats().length > 0 ? (
        <FlatList
        className="pb-[60px]"
          data={getFilteredChats()}
          renderItem={({ item }) => <ChatListItem chat={item} />}
          keyExtractor={(item) => item.id

              }
        />
      ) : searchQuery ? (
        // Show user search results if no matching chats
        <FlatList
        className="pb-[60px]"
          data={searchResults}
          renderItem={({ item }) => (
            <SearchResultItem
              profile={item}
              onPress={() => handleStartChat(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center p-[20px]">
              <Text className="text-gray-500 text-center">
                {searching ? "Searching..." : "No users or chats found"}
              </Text>
            </View>
          )}
        />
      ) : (
        // Show all chats when no search
        <FlatList
        className="pb-[60px]"
          data={chats}
          renderItem={({ item }) => <ChatListItem chat={item} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center p-[20px]">
              <Text className="text-gray-500 text-center">
                {loading ? "Loading chats..." : "No messages yet"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
