import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';

interface FundingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FundingModal({ visible, onClose }: FundingModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-[65%] bg-white rounded-t-[24px] p-6">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
          
          <View className="flex-row items-center justify-center p-4">
            <Image
              source={require('@/../assets/images/funding.png')}
              className="w-full h-[200px]"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold mb-4 text-center">
            Support This Event
          </Text>
          
          <Text className="text-gray-700 text-center mb-6 leading-6">
            Help make this event a reality by contributing to its funding goal. Your support will directly impact the success of this initiative and help create positive change in our community.
          </Text>

          <View className="justify-end">
            <TouchableOpacity
              className="bg-gray-400 p-4 rounded-[20px] mb-4"
              disabled={true}
            >
              <Text className="text-white text-center text-[18px] font-semibold">
                Coming Soon ✨
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-200 p-4 rounded-[20px]"
              onPress={onClose}
            >
              <Text className="text-gray-700 text-center text-[16px] font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
