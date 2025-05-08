import { Ionicons } from '@expo/vector-icons';
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
    <View className="flex-row px-[30px] gap-4 w-full" style={{fontFamily: 'Arial'}}>
      {/* Left side - Large Green Organization button */}
      <TouchableOpacity
        onPress={handleGreenOrgPress}
        className="flex-1 rounded-[25px] justify-between w-[50%] h-full"
      >
        <LinearGradient
          colors={['#1aea9f', '#10d9c7']}
          style={{ flex: 1, borderRadius: 15, padding: 10}}
        >
        <Ionicons name="add-circle-outline" size={50} color="#ffffff" />
          <Text className="text-white text-2xl font-bold ml-1">Act Now</Text>
         </LinearGradient>
        </TouchableOpacity>

      {/* Right side - Two stacked buttons */}
      <View className="w-[50%] flex-1 gap-4">
        <TouchableOpacity
          onPress={handleCalenderPress}
              >
          <LinearGradient
                  colors={['#00000010', '#00000010']}
                  style={{ flex: 1, borderRadius: 15, padding: '10px',justifyContent: 'center', alignItems: 'center',height:'10px'}}
                >
          <Text className="text-black text-[20px] font-400">Calendar</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTimeAuctionPress}
            >
        <LinearGradient
                          colors={['#00000010', '#00000010']}
                          style={{ flex: 1, borderRadius: 15, padding: '10px',justifyContent: 'center', alignItems: 'center'}}
                        >
          <Text className="text-black text-[20px] font-100">Volunteer</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}