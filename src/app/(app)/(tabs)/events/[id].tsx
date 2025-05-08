import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Event, Profile } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [organizers, setOrganizers] = useState<Profile[]>([]);
  const [chatRooms, setChatRooms] = useState<{
    organizers?: string;
    participants?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const loadEventAndParticipants = async () => {
    try {
      setLoading(true);
      // Fetch event details with author profile
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(
          `
          *,
          profiles:author_id (
            display_name
          )
        `
        )
        .eq("id", id)
        .single();

      if (eventError) throw eventError;
      if (!eventData) throw new Error("Event not found");

      let chatRoomsData: any[] | null = [];

      // Fetch chat rooms for this event
      // NOTE: Errors indicate unauthorized access, not necessarily a failure
      const {
        data: organizersChatRoomData,
        error: organizersChatError,
      } = await supabase
        .from("chat_rooms")
        .select("id, type")
        .eq("event_id", id)
        .eq("type", "event_organizers")
        .eq("is_enabled", true)
        .single();

      if (!organizersChatError) {
        chatRoomsData.push(organizersChatRoomData);
      }

      const {
        data: participantsChatRoomData,
        error: participantsChatError,
      } = await supabase
        .from("chat_rooms")
        .select("id, type")
        .eq("event_id", id)
        .eq("type", "event_participants")
        .eq("is_enabled", true)
        .single();

      if (!participantsChatError) {
        chatRoomsData.push(participantsChatRoomData);
      }

      // Map chat rooms by type
      const chatRoomsMap = (chatRoomsData || []).reduce(
        (acc, room) => ({
          ...acc,
          [room.type === "event_organizers"
            ? "organizers"
            : "participants"]: room.id,
        }),
        {}
      );
      setChatRooms(chatRoomsMap);

      // Fetch participants with their profiles
      const { data: participantData, error: participantError } = await supabase
        .from("event_participants")
        .select(
          `
          profiles (
            id,
            display_name,
            photo_url
          )
        `
        )
        .eq("event_id", id);

      if (participantError) throw participantError;

      // Fetch organizers with their profiles
      const { data: organizerData, error: organizerError } = await supabase
        .from("event_organizers")
        .select(
          `
          profiles (
            id,
            display_name,
            photo_url
          )
        `
        )
        .eq("event_id", id);

      if (organizerError) throw organizerError;

      // Process and set the data
      setEvent(eventData);
      setParticipants(participantData?.flatMap((p) => p.profiles ?? []) ?? []);
      setOrganizers(organizerData?.flatMap((o) => o.profiles ?? []) ?? []);
    } catch (error) {
      console.error("Error loading event:", error);
      Alert.alert(
        "Error",
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to load event details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventAndParticipants();

    // Set up real-time subscriptions
    const eventSubscription = supabase
      .channel("event-details")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `id=eq.${id}`,
        },
        () => loadEventAndParticipants()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${id}`,
        },
        () => loadEventAndParticipants()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_organizers",
          filter: `event_id=eq.${id}`,
        },
        () => loadEventAndParticipants()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventSubscription);
    };
  }, [id]);

  const handleJoinEvent = async () => {
    if (!user || !event) return;

    setIsJoining(true);
    try {
      const isParticipant = participants.some((p) => p.id === user.id);

      if (isParticipant) {
        // Leave event
        const { error } = await supabase
          .from("event_participants")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", user.id);

        if (error) throw error;
        Alert.alert("Success", "You have left the event");
      } else {
        // Join event
        const { error } = await supabase.from("event_participants").insert({
          event_id: event.id,
          user_id: user.id,
        });

        if (error) throw error;
        Alert.alert("Success", "You have joined the event");
      }

      // Refresh event data (though real-time subscription should handle this)
      await loadEventAndParticipants();
    } catch (error) {
      console.error("Error joining/leaving event:", error);
      Alert.alert("Error", "Failed to update event participation");
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user || !event) return;

    setIsJoining(true);
    try {
      const isOrganizer = organizers.some((o) => o.id === user.id);

      if (isOrganizer) {
        // Check if user is author
        if (event.author_id === user.id) {
          Alert.alert(
            "Error",
            "You cannot leave the organizing team as the event author"
          );
          return;
        }
        // Leave organizing team
        const { error } = await supabase
          .from("event_organizers")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", user.id);

        if (error) throw error;
        Alert.alert("Success", "You have left the organizing team");
      } else {
        // Join organizing team
        const { error } = await supabase.from("event_organizers").insert({
          event_id: event.id,
          user_id: user.id,
        });

        if (error) throw error;
        Alert.alert("Success", "You have joined the organizing team");
      }

      // Refresh event data (though real-time subscription should handle this)
      await loadEventAndParticipants();
    } catch (error) {
      console.error("Error joining/leaving team:", error);
      Alert.alert("Error", "Failed to update team membership");
    } finally {
      setIsJoining(false);
    }
  };

  const navigateToChat = (type: "organizers" | "participants") => {
    const chatId = chatRooms[type];
    if (!chatId) {
      Alert.alert("Error", "Chat room not found");
      return;
    }
    router.push(`/chats/${chatId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Event not found</Text>
      </View>
    );
  }

  const isParticipant = user && participants.some((p) => p.id === user.id);
  const isOrganizer = user && organizers.some((o) => o.id === user.id);

  return (
    <ScrollView className="flex-1 bg-gray-50 pb-[50px]">
      <View className="p-[30px]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="ml-2">Back to Events</Text>
        </TouchableOpacity>

        <View className="bg-white p-6 rounded-[24px] border-2 border-[black]">
          <Text className="text-3xl font-bold mb-4">{event.title}</Text>

          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center mr-4">
              <Ionicons name="calendar" size={20} color="#666" />
              <Text className="text-gray-600 ml-2">
                {format(new Date(event.event_timestamp), "yyyy-MM-dd")}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#666" />
              <Text className="text-gray-600 ml-2">
                {format(new Date(event.event_timestamp), "HH:mm")}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="location" size={20} color="#666" />
            <Text className="text-gray-600 ml-2">{event.venue}</Text>
          </View>

          <View className="mb-6">
            <Text
              className={`text-sm px-3 py-1 rounded-full self-start ${
                event.stage === "upcoming"
                  ? "bg-green-100 text-green-800"
                  : event.stage === "in-development"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {event.stage.charAt(0).toUpperCase() +
                event.stage.replace("-", " ").slice(1)}
            </Text>
          </View>

          <Text className="text-gray-800 mb-6 leading-6">
            {event.description}
          </Text>

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">
              Created by: {event.profiles?.display_name || "Unknown"}
            </Text>
            <Text className="text-gray-600 mb-2">
              Participants: {participants.length}
            </Text>
            <Text className="text-gray-600 mb-4">
              Organizers: {organizers.length}
            </Text>

            {/* Optional: Display lists of participants and organizers */}
            <View className="mb-4">
              <Text className="font-semibold mb-2">Organizers:</Text>
              {organizers.map((org) => (
                <Text key={org.id} className="text-gray-600">
                  {org.display_name}
                </Text>
              ))}
            </View>

            <View className="mb-4">
              <Text className="font-semibold mb-2">Participants:</Text>
              {participants.map((part) => (
                <Text key={part.id} className="text-gray-600">
                  {part.display_name}
                </Text>
              ))}
            </View>
          </View>

          {event.stage === "upcoming" && (
            <TouchableOpacity
              className={`p-4 rounded-lg mb-3 ${
                isParticipant ? "bg-red-500" : "bg-green-500"
              }`}
              onPress={handleJoinEvent}
              disabled={isJoining}
            >
              <Text className="text-white text-center font-semibold">
                {isJoining
                  ? "Processing..."
                  : isParticipant
                  ? "Leave Event"
                  : "Register for Event"}
              </Text>
            </TouchableOpacity>
          )}

          {event.stage === "in-development" && (
            <TouchableOpacity
              className={`p-4 rounded-[16px] mb-3 ${
                isOrganizer ? "bg-red-500" : "bg-blue-500"
              }`}
              onPress={handleJoinTeam}
              disabled={isJoining}
            >
              <Text className="text-white text-center text-[16px] font-semibold">
                {isJoining
                  ? "Processing..."
                  : isOrganizer
                  ? "Leave Organizing Team"
                  : "Join Organizing Team"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Chat buttons */}
          {isOrganizer && chatRooms.organizers && (
            <TouchableOpacity
              className="bg-purple-500 p-4 rounded-[16px] mb-3"
              onPress={() => navigateToChat("organizers")}
            >
              <Text className="text-white text-center text-[16px]  font-semibold">
                Organizers Chat
              </Text>
            </TouchableOpacity>
          )}

          {((event.stage === "upcoming" && isParticipant) || isOrganizer) &&
            chatRooms.participants && (
              <TouchableOpacity
                className="bg-purple-500 p-4 rounded-[16px] mb-0"
                onPress={() => navigateToChat("participants")}
              >
                <Text className="text-white text-center text-[16px] font-semibold">
                  Event Chat
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </ScrollView>
  );
}
