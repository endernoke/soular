import React from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GreenEvent } from "@/types/learn";

interface GreenEventsProps {
  events: GreenEvent[];
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onCreateEvent: (event: GreenEvent) => void;
}

export const GreenEvents: React.FC<GreenEventsProps> = ({
  events,
  fadeAnim,
  slideAnim,
  onCreateEvent,
}) => {
  if (events.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          marginBottom: 50,
          justifyContent: "center",
          alignItems: "center",
          padding: 30,
        }}
      >
        <Image
          source={require("@/../assets/images/splash-icon.png")}
          style={{
            width: 200,
            height: 200,
            borderRadius: 50,
            marginBottom: 0,
          }}
        />
        <Text style={{ fontSize: 14, color: "#6C757D", textAlign: "left" }}>
          Ask me to suggest green events in the chat. For example, try asking:
          "Generate green events for this weekend in Hong Kong" or "What
          environmental activities can I join this month?"
        </Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={{
        flex: 1,
        opacity: fadeAnim,
        marginBottom: 50,
        transform: [{ translateY: slideAnim }],
      }}
      contentContainerStyle={{ padding: 30 }}
    >
      {events.map((event, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.7}
          style={{
            backgroundColor: "white",
            borderWidth: 2,
            borderColor: "black",
            borderRadius: 24,
            marginBottom: 30,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 2,
            overflow: "hidden",
          }}
        >
          <View style={{ height: 120, backgroundColor: "white" }}>
            <LinearGradient
              colors={["#1aea9f", "rgba(16, 217, 199, 0.8)"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 120,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="leaf" size={48} color="white" />
            </LinearGradient>
          </View>

          <View style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
                color: "#212529",
                marginBottom: 20,
              }}
            >
              {event.title}
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#007AFF"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, color: "#6C757D", marginRight: 12 }}>
                {event.date}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color="#007AFF"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, color: "#6C757D" }}>
                {event.location}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 16,
                color: "#495057",
                marginBottom: 8,
                lineHeight: 22,
              }}
            >
              {event.description}
            </Text>

            <View
              style={{
                backgroundColor: "#E8F5E9",
                borderRadius: 8,
                padding: 8,
                flexDirection: "column",
                alignItems: "flex-start",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#2E7D32",
                  flex: 1,
                  fontWeight: 700,
                }}
              >
                {event.impact}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onCreateEvent(event)}
              style={{
                backgroundColor: "#1aea9f",
                padding: 12,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                margin: 20,
                marginTop: 20,
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Create Event
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </Animated.ScrollView>
  );
};