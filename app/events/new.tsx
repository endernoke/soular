import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { EventStage } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function NewEventScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    stage: 'in-development' as EventStage,
  });

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        createdAt: new Date(),
        createdBy: user.uid,
        organizers: [user.uid],
        participants: [],
      });
      
      Alert.alert('Success', 'Event created successfully', [{
        text: 'OK',
        onPress: () => router.back()
      }]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="ml-2">Back to Events</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-6">Create New Event</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 mb-1">Title</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter event title"
              className="bg-white p-3 rounded-lg"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Description</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Enter event description"
              multiline
              numberOfLines={4}
              className="bg-white p-3 rounded-lg"
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Date</Text>
            <TextInput
              value={formData.date}
              onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
              className="bg-white p-3 rounded-lg"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Time</Text>
            <TextInput
              value={formData.time}
              onChangeText={(text) => setFormData(prev => ({ ...prev, time: text }))}
              placeholder="HH:MM"
              className="bg-white p-3 rounded-lg"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Venue</Text>
            <TextInput
              value={formData.venue}
              onChangeText={(text) => setFormData(prev => ({ ...prev, venue: text }))}
              placeholder="Enter venue"
              className="bg-white p-3 rounded-lg"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Stage</Text>
            <View className="flex-row space-x-2">
              {(['in-development', 'upcoming'] as EventStage[]).map((stage) => (
                <TouchableOpacity
                  key={stage}
                  onPress={() => setFormData(prev => ({ ...prev, stage }))}
                  className={`px-4 py-2 rounded-full ${
                    formData.stage === stage ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <Text className={formData.stage === stage ? 'text-white' : 'text-gray-700'}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`mt-6 p-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <Text className="text-white text-center font-semibold">
              {loading ? 'Creating...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}