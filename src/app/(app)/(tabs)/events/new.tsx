import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase"; // Import supabase client
import { useAuth } from "@/lib/auth";
import { EventStage } from "@/types"; // Use updated types
import { Ionicons } from "@expo/vector-icons";

export default function NewEventScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();

  // Initialize form data with URL parameters if they exist
  const [formData, setFormData] = useState({
    title: (params.title as string) || "",
    description: (params.description as string) || "",
    date: (params.date as string) || "",
    time: "14:00", // Default to 2 PM if not specified
    venue: (params.venue as string) || "",
    stage: "in-development" as EventStage,
  });

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create an event");
      return;
    }

    let eventTimestamp;
    try {
      if (!formData.date || !formData.time)
        throw new Error("Date and Time are required");
      eventTimestamp = new Date(
        `${formData.date}T${formData.time}:00`
      ).toISOString();
    } catch (e) {
      Alert.alert(
        "Error",
        "Invalid date or time format. Use YYYY-MM-DD and HH:MM."
      );
      return;
    }

    if (!formData.title || !formData.description || !formData.venue) {
      Alert.alert("Error", "Title, Description, and Venue are required");
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_timestamp: eventTimestamp,
        venue: formData.venue.trim(),
        stage: formData.stage,
        author_id: user.id,
      };

      const { data: newEvent, error: insertError } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newEvent) throw new Error("Failed to create event or retrieve ID");

      // Author will automatically be added as an organizer from event creation trigger

      Alert.alert("Success", "Event created successfully");

      router.back();
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : String(error) || "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 pb-8" showsVerticalScrollIndicator={false}>
      <View className="p-[30px]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="ml-2">Back to Events</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold mb-4 text-black">
          Create New Event
        </Text>
        <Text className="rounded-full bg-[#ffcc0020] text-[#ffcc00] w-[150px] text-center px-4 py-2 mb-5   text-[16px]">
          Earn 100 Points
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 mb-2">Title</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
              placeholder="Enter event title"
              className="bg-white p-4 rounded-[16px] h-[50px] border border-gray-200"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Description</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Enter event description"
              multiline
              numberOfLines={4}
              className="bg-white p-4 rounded-[16px] border border-gray-200"
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Date</Text>
            <TextInput
              value={formData.date}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, date: text }))
              }
              placeholder="YYYY-MM-DD"
              className="bg-white p-4 rounded-[16px] h-[50px] border border-gray-200"
              keyboardType="numeric"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Time</Text>
            <TextInput
              value={formData.time}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, time: text }))
              }
              placeholder="HH:MM (24-hour format)"
              className="bg-white p-4 rounded-[16px] h-[50px] border border-gray-200"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Venue</Text>
            <TextInput
              value={formData.venue}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, venue: text }))
              }
              placeholder="Enter venue"
              className="bg-white p-4 rounded-[16px] h-[50px] border border-gray-200"
            />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text className="text-gray-600 mb-3">Stage</Text>
            <View className="flex-row gap-2">
              {(["in-development", "upcoming"] as EventStage[]).map((stage) => (
                <TouchableOpacity
                  key={stage}
                  onPress={() => setFormData((prev) => ({ ...prev, stage }))}
                  className={`px-4 py-2 rounded-full ${
                    formData.stage === stage
                      ? stage === "upcoming"
                        ? "bg-green-700"
                        : "bg-blue-500"
                      : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={
                      formData.stage === stage ? "text-white" : "text-gray-700"
                    }
                  >
                    {stage.charAt(0).toUpperCase() +
                      stage.slice(1).replace("-", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`mt-6 p-4 rounded-[16px] flex-row justify-center items-center ${
              loading ? "bg-gray-400" : "bg-blue-500"
            }`}
          >
            {loading && (
              <ActivityIndicator size="small" color="#fff" className="mr-2" />
            )}
            <Text className="text-white  text-[20px] font-semibold text-center">
              {loading ? "Creating..." : "Create Event"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
