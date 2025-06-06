import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { setStatusBarBackgroundColor } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase"; // Import supabase client
import { Event, EventStage } from "@/types"; // Use updated types
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns"; // For formatting date

import { LinearGradient } from "expo-linear-gradient";

// Helper to format timestamp
const formatEventDate = (timestamp: string | null | undefined) => {
  if (!timestamp) return "N/A";
  try {
    return format(new Date(timestamp), "yyyy-MM-dd"); // Format as YYYY-MM-DD
  } catch (e) {
    return "Invalid Date";
  }
};

const EventCard = ({
  event,
  onPress,
}: {
  event: Event;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white p-4 rounded-[16px] mb-[24px] border-[#000000] border-[2px] shadow-md"
    style={{
      shadowColor: "#4b5563",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    }}
  >
    <Text className="text-black text-xl font-bold mb-2">{event.title}</Text>
    <Text className="text-gray-600 mb-4" numberOfLines={2}>
      {event.description}
    </Text>

    {/* Modified this section for better layout */}
    <View className="flex-col mb-2">
      <View className="flex-row items-center mb-2">
        <Ionicons name="location" size={16} color="#4b5563" />
        <Text
          className="text-gray-600 ml-1 flex-shrink flex-wrap"
          numberOfLines={2}
        >
          {event.venue}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="calendar" size={16} color="#4b5563" />
        <Text className="text-gray-600 ml-1">
          {formatEventDate(event.event_timestamp)}
        </Text>
      </View>
    </View>

    <View className="mt-2 flex-row justify-between items-center">
      <Text
        className={`text-sm font-medium ${
          event.stage === "upcoming"
            ? "text-green-700"
            : event.stage === "in-development"
            ? "text-blue-700"
            : "text-gray-700"
        }`}
      >
        {event.stage.charAt(0).toUpperCase() +
          event.stage.replace("-", " ").slice(1)}
      </Text>
      {/* Display counts fetched via RPC or separate queries */}
      <View className="flex-row space-x-4">
        <View className="flex-row items-center pr-4">
          <Ionicons name="people" size={16} color="#4b5563" />
          <Text className="text-gray-600 ml-1">
            {event.participant_count ?? 0}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="briefcase" size={16} color="#4b5563" />
          <Text className="text-gray-600 ml-1">
            {event.organizer_count ?? 0}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<EventStage | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("events")
        .select(
          `
          *,
          participant_count:event_participants(count),
          organizer_count:event_organizers(count)
        `
        )
        .order("event_timestamp", { ascending: false });

      // Apply stage filter
      if (selectedStage !== "all") {
        query = query.eq("stage", selectedStage);
      }

      // Apply search filter (using PostgreSQL's ilike for case-insensitive search)
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process counts which come back as arrays of objects like [{ count: 5 }]
      const processedEvents =
        data?.map((event) => ({
          ...event,
          participant_count: event.participant_count?.[0]?.count ?? 0,
          organizer_count: event.organizer_count?.[0]?.count ?? 0,
        })) || [];

      setEvents(processedEvents as Event[]);
    } catch (error) {
      console.error("Error loading events:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load events"
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedStage, searchQuery]); // Dependencies for useCallback

  useEffect(() => {
    loadEvents();

    // Optional: Real-time subscription for event changes
    const eventsSubscription = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" }, // Listen for INSERT, UPDATE, DELETE
        (payload) => {
          console.log("Event change detected!", payload);
          loadEvents(); // Refetch on any change
        }
      )
      // Also listen to participant/organizer changes to update counts
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_participants" },
        (payload) => {
          console.log("Participant change detected!", payload);
          loadEvents(); // Refetch on any change
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_organizers" },
        (payload) => {
          console.log("Organizer change detected!", payload);
          loadEvents(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
    };
  }, [loadEvents]); // Rerun effect if loadEvents changes (due to filters)

  // Set the status bar color to match the background
  useFocusEffect(
    useCallback(() => {
      setStatusBarBackgroundColor("#f9fafb", true);
      return () => {
        setStatusBarBackgroundColor("#ffffff", true);
      };
    }, [])
  );

  const stages: (EventStage | "all")[] = [
    "all",
    "upcoming",
    "in-development",
    "completed",
  ];

  return (
    <View className="bg-gray-50">
      <View className="pb-6 px-6 pt-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row">
            <Text className="text-3xl font-[Priestacy] text-[#1aea9f] pt-6">
              Soular
            </Text>
            <Text className="text-3xl font-bold pl-1 pt-3">Events</Text>
          </View>
          <TouchableOpacity
            className="bg-black rounded-full px-4 py-2 flex-row items-center justify-center"
            onPress={() => router.push("/events/new")}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white text-md font-bold ml-1 mr-1">
                New
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-left mb-4 border-2 border-[#00000010] rounded-full min-h-[40px]">
          <Ionicons
            name="search"
            size={20}
            color="#4b5563"
            style={{ padding: 10 }}
          />
          <TextInput
            style={{
              paddingTop: 10,
              paddingRight: 10,
              paddingBottom: 10,
              paddingLeft: 0,
              color: "#424242",
            }}
            placeholder="Search for Soular events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stage filter buttons */}
        <View className="mb-4 rounded-full p-[5px]">
          <View className="rounded-full">
            <FlatList
              style={{ paddingRight: -50 }}
              horizontal
              data={stages}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedStage(item)}
                  className={`mr-[5px] px-5 py-2 rounded-full ${
                    selectedStage === item
                      ? item === "upcoming"
                        ? "bg-[#1aea9f]"
                        : item === "in-development"
                        ? "bg-blue-500"
                        : "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={
                      selectedStage === item ? "text-white" : "text-gray-700"
                    }
                  >
                    {item.charAt(0).toUpperCase() +
                      item.slice(1).replace("-", " ")}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </View>

      {isLoading && events.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#1aea9f"
          style={{ marginTop: 20 }}
        />
      ) : error ? (
        <Text className="text-center text-red-500 mt-4">Error: {error}</Text>
      ) : (
        <FlatList
          style={{ marginBottom: 250 }}
          data={events}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => router.push(`/events/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={() =>
            !isLoading && (
              <Text className="text-center text-gray-500 mt-10">
                No events found.
              </Text>
            )
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadEvents} />
          }
        />
      )}
    </View>
  );
}
