import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Organization {
  id: string;
  name: string;
  logo: any;
  description: string;
  website: string;
}

// List of green organizations
const organizations: Organization[] = [
  {
    id: "1",
    name: "WWF",
    logo: require("../../../assets/images/wwf.webp"),
    description:
      "World Wildlife Fund - Leading organization in wildlife conservation and reducing human impact on the environment",
    website: "https://www.worldwildlife.org/",
  },
  {
    id: "2",
    name: "Greenpeace",
    logo: require("../../../assets/images/greenpeace.webp"),
    description:
      "Independent organization that uses peaceful protest and creative communication to expose global environmental problems",
    website: "https://www.greenpeace.org/",
  },
  {
    id: "3",
    name: "The Nature Conservancy",
    logo: require("../../../assets/images/the-nature-conservancy.webp"),
    description:
      "Global environmental nonprofit working to create a world where people and nature can thrive",
    website: "https://www.nature.org/",
  },
  {
    id: "4",
    name: "Environmental Defense Fund",
    logo: require("../../../assets/images/environmental-defense-fund.webp"),
    description:
      "Takes on climate change and other environmental problems with solutions based on science and economics",
    website: "https://www.edf.org/",
  },
  {
    id: "5",
    name: "Ocean Conservancy",
    logo: require("../../../assets/images/ocean-conservancy.webp"),
    description:
      "Working to protect the ocean from todays greatest global challenges",
    website: "https://oceanconservancy.org/",
  },
];

const OrganizationCard = ({ org }: { org: Organization }) => (
  <TouchableOpacity
    onPress={() => Linking.openURL(org.website)}
    className="bg-white p-4 rounded-[16px] mb-[24px] border-2 border-black shadow-md"
    style={{
      shadowColor: "#4b5563",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.2,
      shadowRadius: 20,
    }}
  >
    <View className="flex-row items-center mb-2">
      <Image
        source={org.logo}
        style={{
          width: 69,
          height: 40,
          borderRadius: 4,
          marginRight: 12,
        }}
      />
      <Text className="text-2xl font-bold">{org.name}</Text>
    </View>
    <Text className="text-gray-600 mb-2">{org.description}</Text>
    <View className="flex-row items-center">
      <Ionicons name="globe-outline" size={16} color="#666" />
      <Text className="text-blue-500 ml-2">Visit Website</Text>
    </View>
  </TouchableOpacity>
);

export default function GreenOrganizationsScreen() {
  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#1aea9f", "#10d9c7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          padding: 30,
          borderBottomWidth: 1,
          borderColor: "#00000020",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="ml-2 text-white">Back to Home</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-white">
          Green Organizations
        </Text>
        <Text className="font-bold mt-2 text-white">
          Join these organizations to make a positive impact on our environment!
        </Text>
      </LinearGradient>

      <FlatList
        data={organizations}
        renderItem={({ item }) => <OrganizationCard org={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 30 }}
      />
    </View>
  );
}
