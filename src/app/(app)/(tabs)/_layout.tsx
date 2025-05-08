// This is the bottom pane

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

export default function RootLayoutNav() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#00000020',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          height: 50, // Increased height
          paddingBottom: 0, // Extra padding at the bottom
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="extraLight"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          paddingTop: 15,
          borderRadius: 10,
          marginHorizontal: 5,
          height: 40, // Increased item height
        },
      }}
      initialRouteName="index"
      backBehavior="history"
    >
      <Tabs.Screen
        name="learn/index"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerFocused : null}>
              <Ionicons name="book" size={24} color={color} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8, // Adjusted label position
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerFocused : null}>
              <Ionicons name="home" size={24} color={color} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerFocused : null}>
              <Ionicons name="calendar" size={24} color={color} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainerFocused: {
//     backgroundColor: 'rgba(0, 122, 255, 0.1)',
  padding: 5, // Increased padding
  borderRadius: 15,
  },
});