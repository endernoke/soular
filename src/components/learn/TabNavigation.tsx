import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export type TabType = "chat" | "carbon" | "events";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
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
      {["chat", "carbon", "events"].map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabChange(tab as TabType)}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 5,
          }}
        >
          {activeTab === tab ? (
            <LinearGradient
              colors={["#fdf80070", "#fdf80070"]}
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
  );
};