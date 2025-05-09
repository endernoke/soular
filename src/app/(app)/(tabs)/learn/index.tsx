import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Message, CarbonFootprintResult, GreenEvent } from "@/types/learn";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { TabNavigation, TabType } from "@/components/learn/TabNavigation";
import { ChatMessage } from "@/components/learn/ChatMessage";
import { ChatInput } from "@/components/learn/ChatInput";
import { CarbonFootprint } from "@/components/learn/CarbonFootprint";
import { GreenEvents } from "@/components/learn/GreenEvents";

// Screen dimensions
const { width } = Dimensions.get("window");

export default function LearnScreen() {
  // State variables
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [carbonData, setCarbonData] = useState<CarbonFootprintResult | null>(
    null
  );
  const [greenEvents, setGreenEvents] = useState<GreenEvent[]>([]);

  // Animation values
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const router = useRouter();

  // Start a new chat session when the component mounts
  useEffect(() => {
    startNewChat();

    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Start a new chat session
  const startNewChat = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://server-ef04.onrender.com/api/chat/new",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCurrentChatId(data.chatId);

        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text:
            "Welcome to Soular's Learning Assistant! I can help you calculate your carbon footprint, suggest green events, or answer questions about climate change. What would you like to learn today?",
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages([welcomeMessage]);
      } else {
        throw new Error(data.error || "Failed to start chat session");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message to the AI
  const sendMessage = async (message: string) => {
    if (!currentChatId || isLoading) return;

    try {
      // Haptic feedback for message sent
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsLoading(true);

      // Scroll to bottom of chat
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Process specific commands
      if (message.toLowerCase().includes("carbon footprint")) {
        await handleCarbonFootprintRequest(message);
      } else if (
        message.toLowerCase().includes("event") ||
        message.toLowerCase().includes("events")
      ) {
        await handleGreenEventRequest(message);
      } else {
        // Regular chat message
        await sendChatMessage(message);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I couldn't process your request. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);

      // Scroll to bottom after response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Handle regular chat message
  const sendChatMessage = async (message: string) => {
    const response = await fetch(
      "https://server-ef04.onrender.com/api/chat/message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: currentChatId,
          message: message,
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } else {
      throw new Error(data.error || "Failed to get response");
    }
  };

  // Handle carbon footprint calculation request
  const handleCarbonFootprintRequest = async (message: string) => {
    // Here we tell the AI to respond in JSON format for carbon footprint
    const formattedMsg =
      message +
      " (Please respond in a JSON format with footprint as number, unit as string, breakdown as array of objects with category and amount, and tips as string array). Just a json, no other things like code symbols.";

    const response = await fetch(
      "https://server-ef04.onrender.com/api/chat/message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: currentChatId,
          message: formattedMsg,
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      try {
        // Try to parse the response as JSON
        const jsonStartIndex = data.response.indexOf("{");
        const jsonEndIndex = data.response.lastIndexOf("}") + 1;

        if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
          const jsonStr = data.response.substring(jsonStartIndex, jsonEndIndex);
          const parsedData = JSON.parse(jsonStr);

          // Ensure the data has the expected structure
          const footprintData: CarbonFootprintResult = {
            footprint: parsedData.footprint || 0,
            unit: parsedData.unit || "kg CO2e",
            breakdown: Array.isArray(parsedData.breakdown)
              ? parsedData.breakdown
              : [{ category: "Total", amount: parsedData.footprint || 0 }],
            tips: Array.isArray(parsedData.tips)
              ? parsedData.tips
              : [
                  "Reduce energy consumption",
                  "Use public transportation",
                  "Eat less meat",
                ],
          };

          setCarbonData(footprintData);
          setActiveTab("carbon");

          handleTabChange("carbon"); // Ensures the gradient and animations are updated

          // Add formatted response to chat
          let breakdownText = "";
          if (Array.isArray(footprintData.breakdown)) {
            breakdownText = footprintData.breakdown
              .map(
                (item) =>
                  `- ${item.category}: ${item.amount} ${footprintData.unit}`
              )
              .join("\n");
          }

          let tipsText = "";
          if (Array.isArray(footprintData.tips)) {
            tipsText = footprintData.tips.map((tip) => `- ${tip}`).join("\n");
          }

          const aiMessage: Message = {
            id: Date.now().toString(),
            text: `### Carbon Footprint Results\n\n**Total:** ${footprintData.footprint} ${footprintData.unit}\n\n**Breakdown:**\n${breakdownText}\n\n**Tips:**\n${tipsText}`,
            sender: "ai",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          throw new Error("Couldn't parse JSON response");
        }
      } catch (error) {
        console.error("Error parsing carbon footprint data:", error);

        // Add fallback message with the original response
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: data.response,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } else {
      throw new Error(data.error || "Failed to get response");
    }
  };

  // Handle green event generation request
  const handleGreenEventRequest = async (message: string) => {
    // Here we tell the AI to respond in JSON format for green events
    const formattedMsg =
      message +
      " (.. For the above idea, please respond with a JSON array of 3 highly related and targeted events, each with title, description, date, location, and impact fields. For date, use a date relative to today. Today is May 10, 2025.)";

    const response = await fetch(
      "https://server-ef04.onrender.com/api/chat/message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: currentChatId,
          message: formattedMsg,
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      try {
        // Try to parse the response as JSON
        const jsonStartIndex = data.response.indexOf("[");
        const jsonEndIndex = data.response.lastIndexOf("]") + 1;

        if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
          const jsonStr = data.response.substring(jsonStartIndex, jsonEndIndex);
          const eventsData = JSON.parse(jsonStr);

          // Ensure we have an array of events
          const validEventsData = Array.isArray(eventsData) ? eventsData : [];

          setGreenEvents(validEventsData);
          setActiveTab("events");
          handleTabChange("events"); // Ensures the gradient and animations are updated

          // Add formatted response to chat
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: `### Green Events Generated\n\n${validEventsData
              .map(
                (event) =>
                  `#### ${event.title}\n*${event.date} at ${event.location}*\n\n${event.description}\n\n**Impact:** ${event.impact}`
              )
              .join("\n\n---\n\n")}`,
            sender: "ai",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          throw new Error("Couldn't parse JSON response");
        }
      } catch (error) {
        console.error("Error parsing green events data:", error);

        // Add fallback message with the original response
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: data.response,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } else {
      throw new Error(data.error || "Failed to get response");
    }
  };

  // Handle tab switching
  const handleTabChange = (tab: TabType) => {
    // Haptic feedback for tab change
    if (Platform.OS === "ios") {
      Haptics.selectionAsync();
    }

    // If switching to chat tab, scroll to bottom after a brief delay
    if (tab === "chat" && activeTab !== "chat") {
      // Set a timeout to ensure the scroll happens after the tab has fully switched
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }

    setActiveTab(tab);
  };

  // Handle create event navigation
  const handleCreateEvent = (event: GreenEvent) => {
    // Encode the event data in the URL parameters
    const params = new URLSearchParams({
      title: event.title,
      description: `${event.description}\n\nEnvironmental Impact: ${event.impact}`,
      venue: event.location,
      date: event.date,
    });

    router.push(`/events/new?${params.toString()}`);
  };

  // Main render
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <LearnHeader fadeAnim={fadeAnim} slideAnim={slideAnim} />

      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {activeTab === "chat" && (
          <View style={{ flex: 1, marginBottom: 50 }}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
              style={{ flex: 1 }}
            >
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  fadeAnim={fadeAnim}
                  slideAnim={slideAnim}
                />
              ))}

              {isLoading && (
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "#F8F9FA",
                    padding: 12,
                    borderRadius: 18,
                    marginTop: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color="#1aea9f"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "#6C757D" }}>Thinking...</Text>
                </View>
              )}
            </ScrollView>

            <ChatInput
              value={inputMessage}
              onChangeText={setInputMessage}
              onSend={() => inputMessage.trim() && sendMessage(inputMessage.trim())}
              isLoading={isLoading}
            />
          </View>
        )}

        {activeTab === "carbon" && (
          <CarbonFootprint
            data={carbonData}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
          />
        )}

        {activeTab === "events" && (
          <GreenEvents
            events={greenEvents}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            onCreateEvent={handleCreateEvent}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
