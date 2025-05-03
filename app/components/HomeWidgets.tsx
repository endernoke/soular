import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeWidgets() {
  const handleTimeAuctionPress = () => {
    Linking.openURL('https://www.timeauction.org/');
  };

  const handleCalenderPress = () => {
    Linking.openURL('http://calendar.google.com/');
  };


  const handleGreenOrgPress = () => {
    router.push('/greenOrganizations');
  };

  return (
    <View className="flex-row p-4 gap-4">
      {/* Left side - Large Green Organization button */}
      <TouchableOpacity 
        onPress={handleGreenOrgPress}
        className="flex-1 rounded-xl justify-between w-[50%] h-full"
      >
        <LinearGradient
          colors={['#1E90FF', '#15f4ee']}
          style={{ flex: 1, borderRadius: 12, padding: 16, paddingTop: 24 }}
        >
          <Text className="text-white text-2xl font-bold">Join a Green Organization</Text>
          <Text className="text-white text-xs font-bold">Discover organizations that are making a difference.</Text>
        </LinearGradient>
        </TouchableOpacity>

      {/* Right side - Two stacked buttons */}
      <View className="w-[50%] gap-4">
        <TouchableOpacity 
          onPress={handleCalenderPress}
          className="flex-1 bg-green-300 rounded-xl p-2 justify-center items-center border-2 border-white"
        >
          <Text className="text-black text-lg font-semibold">View Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleTimeAuctionPress}
          className="flex-1 bg-green-300 rounded-xl p-2 justify-center items-center border-2 border-white align-middle"
        >
          <Text className="text-black text-lg font-semibold">Volunteer your skills</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}