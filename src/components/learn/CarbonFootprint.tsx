import React from "react";
import { View, Text, Image, Animated, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CarbonFootprintResult } from "@/types/learn";

interface CarbonFootprintProps {
  data: CarbonFootprintResult | null;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

export const CarbonFootprint: React.FC<CarbonFootprintProps> = ({
  data,
  fadeAnim,
  slideAnim,
}) => {
  if (!data) {
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
          Ask me to calculate your carbon footprint in the chat. For example, try
          asking: "What's my carbon footprint if I drive 20km daily, use air
          conditioning for 5 hours, and eat meat twice a week?"
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
              backgroundImage: "linear-gradient(45deg, #00f260, #1aea9f)",
            }}
          >
            {data.footprint}
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
              {data.unit}
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

        {Array.isArray(data.breakdown) &&
          data.breakdown.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 12,
                borderBottomWidth: index < data.breakdown.length - 1 ? 3 : 3,
                borderBottomColor: "#1aea9f",
              }}
            >
              <Text style={{ fontSize: 16, color: "#495057" }}>
                {item.category}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#212529" }}>
                {item.amount} {data.unit}
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

        {Array.isArray(data.tips) &&
          data.tips.map((tip, index) => (
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
                  backgroundColor: "#1aea9f",
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