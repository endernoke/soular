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
    <View className="flex-row px-[20px] gap-4 w-full">
      {/* Left side - Large Green Organization button */}
      <TouchableOpacity 
        onPress={handleGreenOrgPress}
        className="flex-1 rounded-[25px] justify-between w-[60%] h-full"
      >
        <LinearGradient
          colors={['#0077fa', '#0077fa']}
          style={{ flex: 1, borderRadius: 15, padding: 16, paddingTop: 24}}
        >
          <Text className="text-white text-2xl font-bold">Act Now</Text>
          <Text className="text-white text-s font-normal">Join HK Green Organizations</Text>
        </LinearGradient>
        </TouchableOpacity>

      {/* Right side - Two stacked buttons */}
      <View className="w-[40%] gap-4">
        <TouchableOpacity 
          onPress={handleCalenderPress}
              >
          <LinearGradient
                  colors={['#1aea9f20', '#10d9c720']}
                  style={{ flex: 1, borderRadius: 15, padding: '10px',justifyContent: 'center', alignItems: 'center'}}
                >
          <Text className="text-[#1aea9f] text-[20px] font-semibold">Calendar</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleTimeAuctionPress}
            >
        <LinearGradient
                          colors={['#1aea9f20', '#10d9c720']}
                          style={{ flex: 1, borderRadius: 15, padding: '10px',justifyContent: 'center', alignItems: 'center'}}
                        >
          <Text className="text-[#1aea9f] text-[20px] font-semibold">Volunteer</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}