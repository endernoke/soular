import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ChatMessage, ChatRoom } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

const MessageItem = ({
  message,
  isOwnMessage,
}: {
  message: ChatMessage;
  isOwnMessage: boolean;
}) => (
  <View
    className={`flex-row ${
      isOwnMessage ? "justify-end" : "justify-start"
    } mb-4 mx-4`}
  >
    {/* Avatar for other users' messages */}
    {!isOwnMessage && (
      <View className="mr-2">
        {message.sender?.photo_url ? (
          <Image
            source={{ uri: message.sender.photo_url }}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        )}
      </View>
    )}

    <View className="max-w-[80%]">
      {/* Sender name for others' messages */}
      {!isOwnMessage && (
        <Text className="text-xs text-gray-600 mb-1">
          {message.sender?.display_name || "User"}
        </Text>
      )}

      {/* Message bubble */}
      <View
        className={`rounded-[18px] p-2 px-4`}
        style={isOwnMessage ? undefined : { backgroundColor: "#f0f0f0" }}
      >
        {isOwnMessage && (
          <LinearGradient
            colors={["#1aea9f", "#10d7c9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ ...StyleSheet.absoluteFillObject,

              borderRadius: 18,
                          paddingHorizontal: 16,
                          paddingVertical: 8,

                          }}
          />
        )}
        <Text style={{ color: isOwnMessage ? "white": "black", fontSize: 16, fontWeight: "500" }}>
          {message.content}
        </Text>
      </View>

      {/* Timestamp */}
      <Text className="text-xs text-gray-500 mt-1">
        {format(new Date(message.created_at), "HH:mm")}
      </Text>
    </View>
  </View>
);

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [chat, setChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadChat = async () => {
    try {
      // Fetch chat details
      const { data: chatData, error: chatError } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          event:event_id (*),
          chat_members!inner (
            profile:profiles (*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (chatError) throw chatError;
      setChat(chatData);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("chat_messages")
        .select(
          `
          *,
          sender:sender_id (
            id,
            display_name,
            photo_url
          )
        `
        )
        .eq("chat_id", id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("UseEffect triggered for chat ID:", id);
    loadChat();

    // Set up real-time subscription for new messages
    const messageSubscription = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${id}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          // NOTE: Consider using a more efficient way to make use of the payload data and fetch only the necessary fields
          const { data } = await supabase
            .from("chat_messages")
            .select(
              `
              *,
              sender:sender_id (
                id,
                display_name,
                photo_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
            // Scroll to bottom on new message
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [id]);

  const handleSend = async () => {
    if (!user || !chat || !newMessage.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase.from("chat_messages").insert({
        chat_id: chat.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");

      // Update chat's updated_at timestamp
      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chat.id);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1">
        <View className="bg-white p-4 border-b border-gray-200 flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/chats')} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1aea9f" />
          <Text className="text-gray-500 mt-2">Loading chat...</Text>
        </View>
      </View>
    );
  }

  if (!chat) {
    return (
      <View className="flex-1">
        <View className="bg-white p-4 border-b border-gray-200 flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/chats')} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Chat not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.replace('/chats')} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {chat.type === "direct" ? (
          chat.other_user?.photo_url ? (
            <Image
              source={{ uri: chat.other_user.photo_url }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )
        ) : chat.icon_url ? (
          <Image
            source={{ uri: chat.icon_url }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-[#1aea9f] items-center justify-center mr-3">
            <Ionicons name="chatbubbles" size={20} color="#fff" />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-lg font-semibold">
            {chat.type === "direct" && chat.other_user
              ? chat.other_user.display_name
              : chat.event
              ? `${
                  chat.type === "event_organizers"
                    ? "Organizers"
                    : "Participants"
                }: ${chat.event.title}`
              : "Chat"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
      showsVerticalScrollIndicator={false}
        ref={flatListRef}
        data={messages}
        style={{ flex: 1, paddingTop: 16 }}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            isOwnMessage={item.sender_id === user?.id}
          />
        )}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        className="flex-1 bg-white"
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500">No messages yet</Text>
          </View>
        )}
      />

      {/* Message Input */}
      <View className="p-4 border-t border-gray-200 bg-white flex-row items-center">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2 h-[40px]"

          style={{ maxHeight: 100 }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !newMessage.trim()}
          style={{
            backgroundColor:
              sending || !newMessage.trim() ? "#e3e3e3" : "#1aea9f",
            borderRadius: 9999,
            padding: 8,
          }}
        >
          <Ionicons
            name="send"
            size={24}
            color={sending || !newMessage.trim() ? "#fff" : "white"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
