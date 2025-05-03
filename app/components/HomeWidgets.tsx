import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';

export default function HomeWidgets() {
  const handleTimeAuctionPress = () => {
    Linking.openURL('https://www.timeauction.org/');
  };

  const handleCalenderPress = () => {
    Alert.alert('Coming Soon', 'Calendar functionality will be available soon!');
  };

  const handleGreenOrgPress = () => {
    router.push('/greenOrganizations');
  };

  return (
    <View className="flex-row p-4 gap-4 bg-white border-b border-gray-100 shadow-sm">
      {/* Left side - Large Green Organization button */}
      <TouchableOpacity 
        onPress={handleGreenOrgPress}
        className="flex-1 bg-green-400 rounded-xl p-4 justify-between width-[50%]"
      >
        <Text className="text-white text-2xl font-bold">Join a Green Organization</Text>
        <Text className="text-white text-xs opacity-80">Discover and connect with organizations that are making a difference.</Text>
      </TouchableOpacity>

      {/* Right side - Two stacked buttons */}
      <View className="w-1/2 gap-4">
        <TouchableOpacity 
          onPress={handleCalenderPress}
          className="flex-1 bg-blue-500 rounded-xl p-4 justify-between"
        >
          <Text className="text-white text-base font-semibold">Calendar</Text>
          <Text className="text-white text-xs opacity-80">Coming soon</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleTimeAuctionPress}
          className="flex-1 bg-purple-500 rounded-xl p-4 justify-between"
        >
          <Text className="text-white text-base font-semibold">Volunteer your skills</Text>
          <Text className="text-white text-xs opacity-80">Time Auction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}