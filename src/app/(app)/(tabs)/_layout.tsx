// This is the bottom pane

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';

export default function RootLayoutNav() {
  return (
    <Tabs
      initialRouteName="index"
      backBehavior='history'
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: '#00000020',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 2, // Added top border width
          borderTopColor: '#00000010', // Added black border color
          backgroundColor: 'transparent',
          elevation: 0,
          height: 50, // Increased height
          paddingBottom: 0, // Extra padding at the bottom
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="systemThickMaterialLight"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod='dimezisBlurView'
          />
        ),
        tabBarItemStyle: {
          paddingTop: 7.5,
          borderRadius: 10,
          marginHorizontal: 5,
          height: 40, // Increased item height
        },
      }}>
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
        name="chats"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerFocused : null}>
              <Ionicons name="chatbubble" size={24} color={color} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 8,
          },
          tabBarStyle: {
            display: usePathname().split('/').pop() == 'chats' ? 'flex' : 'none',
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
    padding: 5, // Increased padding
    borderRadius: 15,
  },
});