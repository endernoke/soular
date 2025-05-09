import { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, setStatusBarBackgroundColor } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import NewPost from "@/components/NewPost";
import SocialFeed from "@/components/SocialFeed";
import HomeWidgets from "@/components/HomeWidgets";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const socialFeedRef = useRef<{ fetchPosts: () => Promise<void> }>();
  const [isNewPostModalVisible, setNewPostModalVisible] = useState(false);

  const handlePostCreated = () => {
    socialFeedRef.current?.fetchPosts();
    setNewPostModalVisible(false);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get("window").height))
    .current;

  useEffect(() => {
    if (isNewPostModalVisible) {
      // Reset values when modal becomes visible
      fadeAnim.setValue(0);
      slideAnim.setValue(Dimensions.get("window").height);

      // Run animations in parallel
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Optional: Add reverse animations when closing
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").height,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNewPostModalVisible]);
  // Set the status bar color to match the background
  useFocusEffect(
    useCallback(() => {
      setStatusBarBackgroundColor("#1aea9f30", true);
      return () => {
        setStatusBarBackgroundColor("#ffffff", true);
      };
    }, [])
  );

  return (
    <ScrollView className="flex-1 bg-[white]">
      <ImageBackground
        source={require("@/../assets/images/Abstract4.png")} // Ensure your abstract.png is in the assets folder
        resizeMode="stretch"
        className="mb-0"
        style={{ width: "100%" }}
      >
        <LinearGradient
          colors={["#ffffff", "#ffffff50", "#ffffff50", "#1aea9f30"]}
          className="justify-center items-center w-full pb-10"
        >
          <View className="flex-row items-center justify-between px-[30px] w-full pt-6 mb-5">
            <View className="flex-1 flex-col">
              <Text
                className="text-[30px] font-bold text-[black]"
                style={{ fontFamily: "Priestacy", marginBottom: -10 }}
              >
                Bonjour,
              </Text>
              <Text className="text-[30px] font-bold text-[black]">
                {profile?.display_name || "Soular"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                className="p-1"
              >
                {profile?.photo_url ? (
                  <Image
                    source={{ uri: profile.photo_url }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                    <Ionicons name="person" size={20} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <HomeWidgets />
        </LinearGradient>
      </ImageBackground>

      <View className="flex-1 bg-[#1aea9f30] justify-left items-center w-full">
        <View className="flex-row w-[101%] items-center justify-between px-[30px] pt-[25px] bg-white rounded-t-[40px] border-t-2 border-x-2 border-black">
          <Text className="text-2xl">Our Soular Stories</Text>
          <TouchableOpacity
            onPress={() => setNewPostModalVisible(true)}
            className="flex-row bg-blue-500 rounded-full px-4 py-2 items-center justify-center"
          >
            <Ionicons name="add" className="mt-0.5" size={15} color="#fff" />
            <Text className="text-white text-md ml-1">New</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-white w-full">
          <SocialFeed ref={socialFeedRef} nested={true} />
        </View>
      </View>

      <Modal
        visible={isNewPostModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setNewPostModalVisible(false)}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "flex-end",
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Background with fade animation */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setNewPostModalVisible(false)}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.5)" },
              ]}
            />
          </TouchableOpacity>

          {/* Content with slide animation */}
          <Animated.View
            style={{
              width: "100%",
              minHeight: Dimensions.get("window").height * 0.5,
              backgroundColor: "white",
              overflow: "scroll",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="flex-row justify-between items-center px-4 pb-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Create New Post</Text>
              <TouchableOpacity onPress={() => setNewPostModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <NewPost onPostCreated={handlePostCreated} />
          </Animated.View>
        </Animated.View>
      </Modal>
    </ScrollView>
  );
}
