import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function RootLayoutNav() {
  const router = useRouter();

  return (
    <Tabs
      initialRouteName="index"
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#00000020",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 0,
          height: 60,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="systemThickMaterialLight"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
        ),
        tabBarItemStyle: {
          paddingTop: 20,
          borderRadius: 10,
          marginHorizontal: 5,
          height: 40,
        },
      }}
    >
      <Tabs.Screen
        name="learn/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
        }}
        listeners={{
          tabPress: () => {
            if (router.canDismiss()) {
              router.dismissTo("/learn");
            } else {
              router.replace("/learn");
            }
          },
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={24} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
          tabBarStyle: {
            display:
              usePathname().split("/").pop() == "chats" ? "flex" : "none",
            position: "absolute",
            borderTopWidth: 0,
            backgroundColor: "transparent",
            elevation: 0,
            height: 60,
            paddingBottom: 0,
          },
        }}
        listeners={{
          tabPress: () => {
            if (router.canDismiss()) {
              router.dismissTo("/chats");
            } else {
              router.replace("/chats");
            }
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
        }}
        listeners={{
          tabPress: () => {
            if (router.canDismiss()) {
              router.dismissTo("/");
            } else {
              router.replace("/");
            }
          },
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
        }}
        listeners={{
          tabPress: () => {
            if (router.canDismiss()) {
              router.dismissTo("/events");
            } else {
              router.replace("/events");
            }
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
        }}
        listeners={{
          tabPress: () => {
            if (router.canDismiss()) {
              router.dismissTo("/profile");
            } else {
              router.replace("/profile");
            }
          },
        }}
      />
    </Tabs>
  );
}
