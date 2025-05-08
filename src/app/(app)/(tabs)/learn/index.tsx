import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Screen dimensions
const { width } = Dimensions.get("window");

// Chat message interface
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// JSON response interfaces
interface CarbonFootprintResult {
  footprint: number;
  unit: string;
  breakdown: Array<{ category: string; amount: number }>;
  tips: string[];
}

interface GreenEvent {
  title: string;
  description: string;
  date: string;
  location: string;
  impact: string;
  imageUrl?: string;
}

export default function LearnScreen() {
  // State variables
  const [activeTab, setActiveTab] = useState<"chat" | "carbon" | "events">(
    "chat"
  );
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
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

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

      setMessages((prevMessages) => [...prevMessages, userMessage]);
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

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
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

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
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

          setMessages((prevMessages) => [...prevMessages, aiMessage]);
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

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
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

          setMessages((prevMessages) => [...prevMessages, aiMessage]);
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

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      }
    } else {
      throw new Error(data.error || "Failed to get response");
    }
  };

  // Handle tab switching
  const handleTabChange = (tab: "chat" | "carbon" | "events") => {
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

    // Animate tab indicator
    const position =
      tab === "chat" ? 0 : tab === "carbon" ? width / 3 : (width / 3) * 2;
    Animated.spring(tabIndicatorPosition, {
      toValue: position,
      tension: 300,
      friction: 30,
      useNativeDriver: false,
    }).start();
  };

  // Render message item
  // Render message item
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === "user";

    return (
      <Animated.View
        key={message.id}
        style={{
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          marginVertical: 8,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View
          style={{
            maxWidth: "80%",
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          {/* Profile Image */}

          <Image
            source={
              isUser
                ? require("@/../assets/images/icon.png") // Replace with your user image path
                : require("@/../assets/images/bot-icon.png") // Bot image
            }
            style={{
              width: isUser ? 0 : 30,
              height: 30,
              borderRadius: 10,
              marginRight: isUser ? 0 : 12,
              marginLeft: isUser ? 12 : 0,
            }}
          />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#6C757D",
              marginBottom: 4,
              textAlign: isUser ? "right" : "left",
            }}
          >
            {isUser ? "You" : "Soular Assistant"}
          </Text>
        </View>
        {/* Message Content */}
        <View style={{ maxWidth: isUser ? "80%" : "100%" }}>
          {/* Username */}

          {/* Message Bubble */}
          <LinearGradient
            colors={isUser ? ["#1aea9fb0", "#10d9c7b0"] : ["white", "white"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderWidth: isUser ? 0 : 2,
              borderColor: "#00000020",

              //               shadowColor: isUser ? undefined : '#000',
              //               shadowOffset: isUser ? undefined : { width: 0, height: 2 },
              //               shadowOpacity: isUser ? undefined : 0.1,
              //               shadowRadius: isUser ? undefined : 10,
              elevation: isUser ? undefined : 2,
            }}
          >
            {isUser ? (
              <Text
                style={{ color: "#212529", fontSize: 16, fontWeight: "500" }}
              >
                {message.text}
              </Text>
            ) : (
              <Markdown
                style={{
                  body: { color: "#212529", fontSize: 16 },
                  heading1: {
                    color: "#212529",
                    fontSize: 22,
                    fontWeight: "bold",
                    marginBottom: 8,
                  },
                  heading2: {
                    color: "#212529",
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 8,
                  },
                  heading3: {
                    color: "#212529",
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 6,
                  },
                  heading4: {
                    color: "#212529",
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 4,
                  },
                  paragraph: { marginBottom: 8, fontWeight: "500" },
                  link: { color: "#1aea9f" },
                  blockquote: {
                    borderLeftColor: "#1aea9f",
                    backgroundColor: "#F1F3F5",
                    paddingLeft: 8,
                  },
                  list_item: { marginBottom: 4 },
                }}
              >
                {message.text}
              </Markdown>
            )}
          </LinearGradient>

          {/* Timestamp */}
        </View>
      </Animated.View>
    );
  };

  // Render carbon footprint section
  const renderCarbonFootprint = () => {
    if (!carbonData) {
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
            source={
              require("@/../assets/images/splash-icon.png") // Replace with your user image path
            }
            style={{
              width: 200,
              height: 200,
              borderRadius: 50,
              marginBottom: 0,
            }}
          />

          <Text style={{ fontSize: 14, color: "#6C757D", textAlign: "left" }}>
            Ask me to calculate your carbon footprint in the chat. For example,
            try asking: "What's my carbon footprint if I drive 20km daily, use
            air conditioning for 5 hours, and eat meat twice a week?"
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
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: 20,
            borderColor: "black",
            borderWidth: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 2,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              textAlign: "center",
              color: "#212529",
              marginBottom: 0,
            }}
          >
            Carbon Footprint
          </Text>
          <Text
            style={{
              fontSize: 50,
              fontWeight: "500",
              textAlign: "center",
              color: "#212529",
              marginBottom: -10,
            }}
          >
            Result
          </Text>

          <View
            style={{
              backgroundColor: "white",
              paddingTop: 0,
              borderRadius: 12,
              marginBottom: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 100,
                fontWeight: "bold",
                color: "transparent",
                backgroundClip: "text",
                backgroundImage: "linear-gradient(45deg, #00f260, #0575e6)",
              }}
            >
              {carbonData.footprint}
            </Text>
            <View
              style={{
                padding: 10,
                borderRadius: 50,
                marginBottom: 20,
                borderWidth: 2,
                borderColor: "#00000020",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "#212529",
                  marginRight: 10,
                  marginLeft: 10,
                }}
              >
                {carbonData.unit}
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#212529",
              marginBottom: 8,
            }}
          >
            Breakdown
          </Text>

          {Array.isArray(carbonData.breakdown) &&
            carbonData.breakdown.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth:
                    index < carbonData.breakdown.length - 1 ? 3 : 3,
                  borderBottomColor: "#1aea9f",
                }}
              >
                <Text style={{ fontSize: 16, color: "#495057" }}>
                  {item.category}
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "#212529" }}
                >
                  {item.amount} {carbonData.unit}
                </Text>
              </View>
            ))}
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: 20,
            borderWidth: 2,
            borderColor: "black",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#212529",
              marginBottom: 12,
            }}
          >
            Tips to Reduce Your Footprint
          </Text>

          {Array.isArray(carbonData.tips) &&
            carbonData.tips.map((tip, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  marginBottom: 12,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#2e8b57",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#495057",
                    lineHeight: 24,
                  }}
                >
                  {tip}
                </Text>
              </View>
            ))}
        </View>
      </Animated.ScrollView>
    );
  };

  // Render green events section
  const renderGreenEvents = () => {
    if (greenEvents.length === 0) {
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
            source={
              require("@/../assets/images/splash-icon.png") // Replace with your user image path
            }
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
        {greenEvents.map((event, index) => (
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
                colors={["rgba(26, 234, 159, 0.8)", "rgba(16, 217, 199, 0.8)"]}
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
                <Text
                  style={{ fontSize: 14, color: "#6C757D", marginRight: 12 }}
                >
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
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    );
  };

  // Main render
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <LinearGradient
        colors={["#1aea9f50", "white"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          paddingHorizontal: 20,
          paddingBottom: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Priestacy",
              fontSize: 40,
              fontWeight: "700",
              color: "#388e3c",
              marginLeft: -10,
              marginTop: 0,
              marginBottom: -40,
              zIndex: 1,
            }}
          >
            Soular
          </Text>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "800",
              opacity: 0.85,
              color: "black",
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            Learning
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Tab Navigation */}
      {/* Tab Navigation */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          borderRadius: 50,
          width: "80%",
          overflow: "hidden",
          borderWidth: 2,
          borderColor: "#00000010",
          padding: 5,
        }}
      >
        {["chat", "carbon", "events"].map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabChange(tab as "chat" | "carbon" | "events")}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 5,
            }}
          >
            {/* Gradient Background for Active Tab */}
            {activeTab === tab ? (
              <LinearGradient
                colors={["#fdf80070", "#fdf80070"]}
                //  colors={['black', 'black']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: "absolute",
                  top: 0,
                  borderRadius: 100,
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}
              />
            ) : null}

            {/* Tab Text */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: activeTab === tab ? "600" : "normal",
                color: activeTab === tab ? "black" : "#ADB5BD",
                zIndex: 1,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Tab Content */}
        {activeTab === "chat" && (
          <View style={{ flex: 1, marginBottom: 50 }}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
              style={{ flex: 1 }}
            >
              {messages.map(renderMessage)}

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

            {/* Input Area */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end", // Changed from "center" to "flex-end" to align with the bottom
                padding: 12,
                borderTopWidth: 2,
                borderTopColor: "#1aea9f",
                backgroundColor: "white",
              }}
            >
              <TextInput
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Ask a question..."
                multiline={true} // Enable multiline input
                style={{
                  flex: 1,
                  minHeight: 40, // Changed from fixed height to minHeight
                  maxHeight: 120, // Add a maximum height to prevent too much expansion
                  backgroundColor: "#F1F3F5",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingTop: 10, // Add padding to the top
                  paddingBottom: 10, // Add padding to the bottom
                  marginRight: 8,
                  fontSize: 16,
                  textAlignVertical: "center", // Center text vertically
                }}
                placeholderTextColor="#ADB5BD"
              />
              <TouchableOpacity
                onPress={() =>
                  inputMessage.trim() && sendMessage(inputMessage.trim())
                }
                disabled={!inputMessage.trim() || isLoading}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: inputMessage.trim() ? "#1aea9f" : "#E9ECEF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 5, // Add a small margin at the bottom to align with text
                }}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={inputMessage.trim() ? "white" : "#ADB5BD"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "carbon" && renderCarbonFootprint()}
        {activeTab === "events" && renderGreenEvents()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
