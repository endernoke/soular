import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  isLoading,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 12,
        borderTopWidth: 2,
        borderTopColor: "#1aea9f",
        backgroundColor: "white",
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask a question..."
        multiline={false}
        style={{
          flex: 1,
          height: 40,
          minHeight: 40,
          maxHeight: 120,
          backgroundColor: "#F1F3F5",
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 10,
          marginRight: 8,
          fontSize: 16,
          textAlignVertical: "center",
        }}
        placeholderTextColor="#ADB5BD"
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim() || isLoading}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: value.trim() ? "#1aea9f" : "#E9ECEF",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 0,
        }}
      >
        <Ionicons
          name="send"
          size={20}
          color={value.trim() ? "white" : "#ADB5BD"}
        />
      </TouchableOpacity>
    </View>
  );
};