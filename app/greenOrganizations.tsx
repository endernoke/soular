import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Organization {
  id: string;
  name: string;
  description: string;
  website: string;
}

// List of green organizations
const organizations: Organization[] = [
  {
    id: '1',
    name: 'WWF',
    description: 'World Wildlife Fund - Leading organization in wildlife conservation and reducing human impact on the environment',
    website: 'https://www.worldwildlife.org/'
  },
  {
    id: '2',
    name: 'Greenpeace',
    description: 'Independent organization that uses peaceful protest and creative communication to expose global environmental problems',
    website: 'https://www.greenpeace.org/'
  },
  {
    id: '3',
    name: 'The Nature Conservancy',
    description: 'Global environmental nonprofit working to create a world where people and nature can thrive',
    website: 'https://www.nature.org/'
  },
  {
    id: '4',
    name: 'Environmental Defense Fund',
    description: 'Takes on climate change and other environmental problems with solutions based on science and economics',
    website: 'https://www.edf.org/'
  },
  {
    id: '5',
    name: 'Ocean Conservancy',
    description: 'Working to protect the ocean from todays greatest global challenges',
    website: 'https://oceanconservancy.org/'
  }
];

const OrganizationCard = ({ org }: { org: Organization }) => (
  <TouchableOpacity 
    onPress={() => Linking.openURL(org.website)}
    className="bg-white p-4 rounded-lg shadow-sm mb-4"
  >
    <Text className="text-xl font-bold mb-2">{org.name}</Text>
    <Text className="text-gray-600 mb-2">{org.description}</Text>
    <View className="flex-row items-center">
      <Ionicons name="globe-outline" size={16} color="#666" />
      <Text className="text-blue-500 ml-2">Visit Website</Text>
    </View>
  </TouchableOpacity>
);

export default function GreenOrganizationsScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="ml-2">Back to Home</Text>
        </TouchableOpacity>
        
        <Text className="text-2xl font-bold">Green Organizations</Text>
        <Text className="text-gray-600 mt-2">
          Join these organizations to make a positive impact on our environment
        </Text>
      </View>

      <FlatList
        data={organizations}
        renderItem={({ item }) => <OrganizationCard org={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}