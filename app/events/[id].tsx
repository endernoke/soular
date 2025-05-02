import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Event, UserShort } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', id as string));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!user || !event) return;
    
    setIsJoining(true);
    try {
      const eventRef = doc(db, 'events', event.id);
      const userShort: UserShort = {
        uid: user.uid,
        displayName: user.displayName,
        photoUrl: user.photoUrl
      };
      
      const isParticipant = event.participants.some(p => p.uid === user.uid);
      const updatedParticipants = isParticipant
        ? event.participants.filter(p => p.uid !== user.uid)
        : [...event.participants, userShort];
      
      await updateDoc(eventRef, {
        participants: updatedParticipants
      });

      // Refresh event data
      await loadEvent();
      Alert.alert(
        'Success', 
        isParticipant ? 'You have left the event' : 'You have joined the event'
      );
    } catch (error) {
      console.error('Error joining/leaving event:', error);
      Alert.alert('Error', 'Failed to update event participation');
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user || !event) return;
    
    setIsJoining(true);
    try {
      const eventRef = doc(db, 'events', event.id);
      const userShort: UserShort = {
        uid: user.uid,
        displayName: user.displayName,
        photoUrl: user.photoUrl
      };
      
      const isOrganizer = event.organizers.some(o => o.uid === user.uid);
      const updatedOrganizers = isOrganizer
        ? event.organizers.filter(o => o.uid !== user.uid)
        : [...event.organizers, userShort];
      
      await updateDoc(eventRef, {
        organizers: updatedOrganizers
      });

      // Refresh event data
      await loadEvent();
      Alert.alert(
        'Success', 
        isOrganizer ? 'You have left the organizing team' : 'You have joined the organizing team'
      );
    } catch (error) {
      console.error('Error joining/leaving team:', error);
      Alert.alert('Error', 'Failed to update team membership');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Event not found</Text>
      </View>
    );
  }

  const isParticipant = user && event.participants.some(p => p.uid === user.uid);
  const isOrganizer = user && event.organizers.some(o => o.uid === user.uid);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <TouchableOpacity 
          onPress={() => router.back()}  // Might have to change this to router.push('/events') if you want to go back to the events list
          className="mb-4 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="ml-2">Back to Events</Text>
        </TouchableOpacity>

        <View className="bg-white p-6 rounded-lg shadow-sm">
          <Text className="text-3xl font-bold mb-4">{event.title}</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center mr-4">
              <Ionicons name="calendar" size={20} color="#666" />
              <Text className="text-gray-600 ml-2">{event.date}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#666" />
              <Text className="text-gray-600 ml-2">{event.time}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="location" size={20} color="#666" />
            <Text className="text-gray-600 ml-2">{event.venue}</Text>
          </View>

          <View className="mb-6">
            <Text className={`text-sm px-3 py-1 rounded-full inline-flex ${
              event.stage === 'upcoming' ? 'bg-green-100 text-green-800' :
              event.stage === 'in-development' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.stage.charAt(0).toUpperCase() + event.stage.slice(1)}
            </Text>
          </View>

          <Text className="text-gray-800 mb-6 leading-6">{event.description}</Text>

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Participants: {event.participants.length}</Text>
            <Text className="text-gray-600 mb-4">Organizers: {event.organizers.length}</Text>
          </View>

          {event.stage === 'upcoming' && (
            <TouchableOpacity 
              className={`p-4 rounded-lg mb-3 ${isParticipant ? 'bg-red-500' : 'bg-green-500'}`}
              onPress={handleJoinEvent}
              disabled={isJoining}
            >
              <Text className="text-white text-center font-semibold">
                {isJoining ? 'Processing...' : 
                 isParticipant ? 'Leave Event' : 'Register for Event'}
              </Text>
            </TouchableOpacity>
          )}

          {event.stage === 'in-development' && (
            <TouchableOpacity 
              className={`p-4 rounded-lg mb-3 ${isOrganizer ? 'bg-red-500' : 'bg-blue-500'}`}
              onPress={handleJoinTeam}
              disabled={isJoining}
            >
              <Text className="text-white text-center font-semibold">
                {isJoining ? 'Processing...' : 
                 isOrganizer ? 'Leave Organizing Team' : 'Join Organizing Team'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            className="bg-purple-500 p-4 rounded-lg"
            onPress={() => Alert.alert('Coming Soon', 'Discussion groups will be available soon!')}
          >
            <Text className="text-white text-center font-semibold">Join Discussion Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}