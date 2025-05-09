import React from "react";
import { View, Text, Platform, StatusBar, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LearnHeaderProps {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

export const LearnHeader: React.FC<LearnHeaderProps> = ({ fadeAnim, slideAnim }) => {
  return (
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
            color: "#1aea9f",
            marginLeft: -100,
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
            fontWeight: "700",
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
  );
};