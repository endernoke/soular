import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, EventStage } from '@/types';
import { Ionicons } from '@expo/vector-icons';

const EventCard = ({ event, onPress }: { event: Event; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-white p-4 rounded-lg shadow-sm mb-4"
  >
    <Text className="text-xl font-bold mb-2">{event.title}</Text>
    <Text className="text-gray-600 mb-2" numberOfLines={2}>{event.description}</Text>
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center">
        <Ionicons name="location" size={16} color="#666" />
        <Text className="text-gray-600 ml-1">{event.venue}</Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="calendar" size={16} color="#666" />
        <Text className="text-gray-600 ml-1">{event.date}</Text>
      </View>
    </View>
    <View className="mt-2 flex-row justify-between items-center">
      <Text className={`text-sm ${
        event.stage === 'upcoming' ? 'text-green-600' :
        event.stage === 'in-development' ? 'text-blue-600' :
        'text-gray-600'
      }`}>
        {event.stage.charAt(0).toUpperCase() + event.stage.slice(1)}
      </Text>
      <View className="flex-row space-x-4">
        <View className="flex-row items-center">
          <Ionicons name="people" size={16} color="#666" />
          <Text className="text-gray-600 ml-1">{event.participants.length}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="briefcase" size={16} color="#666" />
          <Text className="text-gray-600 ml-1">{event.organizers.length}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<EventStage | 'all'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'all' || event.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const stages: (EventStage | 'all')[] = ['all', 'upcoming', 'in-development', 'completed'];

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Events</Text>
        <TouchableOpacity 
          onPress={() => router.push('/events/new')}
          className="bg-blue-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white">Create Event</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search events..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="bg-white p-2 rounded-lg mb-4"
      />

      <View className="flex-row mb-4">
        <FlatList
          horizontal
          data={stages}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedStage(item)}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedStage === item ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <Text className={selectedStage === item ? 'text-white' : 'text-gray-700'}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => router.push(`/events/${item.id}`)}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}