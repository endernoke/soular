import React from "react";
import { View, Text, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from "react-native-markdown-display";
import { Message } from "@/types/learn";

interface ChatMessageProps {
  message: Message;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  fadeAnim,
  slideAnim,
}) => {
  const isUser = message.sender === "user";

  return (
    <Animated.View
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
        <Image
          source={
            isUser
              ? require("@/../assets/images/icon.png")
              : require("@/../assets/images/bot-icon.png")
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
            color: "black",
            marginBottom: 4,
            textAlign: isUser ? "right" : "left",
          }}
        >
          {isUser ? "You" : "SoularAI"}
        </Text>
      </View>
      
      <View style={{ maxWidth: isUser ? "80%" : "100%" }}>
        <LinearGradient
          colors={isUser ? ["#1aea9fb0", "#10d9c7b0"] : ["white", "white"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: isUser ? 0 : 2,
            borderColor: "#00000020",
            elevation: isUser ? undefined : 2,
          }}
        >
          {isUser ? (
            <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
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
      </View>
    </Animated.View>
  );
};