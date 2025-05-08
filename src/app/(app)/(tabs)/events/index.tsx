import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Import supabase client
import { Event, EventStage } from '@/types'; // Use updated types
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns'; // For formatting date

import { LinearGradient } from 'expo-linear-gradient';

// Helper to format timestamp
const formatEventDate = (timestamp: string | null | undefined) => {
  if (!timestamp) return 'N/A';
  try {
    return format(new Date(timestamp), 'yyyy-MM-dd'); // Format as YYYY-MM-DD
  } catch (e) {
    return 'Invalid Date';
  }
};

const EventCard = ({ event, onPress }: { event: Event; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-white p-4 rounded-[16px] mb-[24px] border-[#00000015] border-[2px]"
  >
    <Text className="text-xl font-bold mb-2">{event.title}</Text>
    <Text className="text-gray-600 mb-4" numberOfLines={2}>{event.description}</Text>
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center">
        <Ionicons name="location" size={16} color="#666" />
        <Text className="text-gray-600 ml-1">{event.venue}</Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="calendar" size={16} color="#666" />
        {/* Format event_timestamp */}
        <Text className="text-gray-600 ml-1">{formatEventDate(event.event_timestamp)}</Text>
      </View>
    </View>
    <View className="mt-2 flex-row justify-between items-center">
      <Text className={`text-sm font-medium ${
        event.stage === 'upcoming' ? 'text-green-600' :
        event.stage === 'in-development' ? 'text-blue-600' :
        'text-gray-600'
      }`}>
        {event.stage.charAt(0).toUpperCase() + event.stage.replace('-', ' ').slice(1)}
      </Text>
      {/* Display counts fetched via RPC or separate queries */}
      <View className="flex-row space-x-4">
        <View className="flex-row items-center">
          <Ionicons name="people" size={16} color="#666" />
          <Text className="text-gray-600 ml-1">{event.participant_count ?? 0}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="briefcase" size={16} color="#666" />
          <Text className="text-gray-600 ml-1">{event.organizer_count ?? 0}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<EventStage | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          participant_count:event_participants(count),
          organizer_count:event_organizers(count)
        `)
        .order('event_timestamp', { ascending: false });

      // Apply stage filter
      if (selectedStage !== 'all') {
        query = query.eq('stage', selectedStage);
      }

      // Apply search filter (using PostgreSQL's ilike for case-insensitive search)
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process counts which come back as arrays of objects like [{ count: 5 }]
      const processedEvents = data?.map(event => ({
        ...event,
        participant_count: event.participant_count?.[0]?.count ?? 0,
        organizer_count: event.organizer_count?.[0]?.count ?? 0,
      })) || [];

      setEvents(processedEvents as Event[]);

    } catch (error: any) {
      console.error('Error loading events:', error);
      setError(error.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStage, searchQuery]); // Dependencies for useCallback

  useEffect(() => {
    loadEvents();

    // Optional: Real-time subscription for event changes
    const eventsSubscription = supabase
      .channel('public:events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' }, // Listen for INSERT, UPDATE, DELETE
        (payload) => {
          console.log('Event change detected!', payload);
          loadEvents(); // Refetch on any change
        }
      )
      // Also listen to participant/organizer changes to update counts
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_participants' },
        (payload) => {
          console.log('Participant change detected!', payload);
          loadEvents(); // Refetch on any change
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_organizers' },
        (payload) => {
          console.log('Organizer change detected!', payload);
          loadEvents(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
    };

  }, [loadEvents]); // Rerun effect if loadEvents changes (due to filters)

  const stages: (EventStage | 'all')[] = ['all', 'upcoming', 'in-development', 'completed'];

  return (
    <View className="flex-1 bg-gray-50">

    <LinearGradient
            colors={['#ffffff00', '#ffffff00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              padding: '30px'
            }}
          >

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Events</Text>
        <TouchableOpacity 
          onPress={() => router.push('/events/new')}
          className="bg-[black] px-4 py-2 rounded-full"
        >
          <Text className="text-white">Create Event</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search for soular events..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="bg-white p-4 rounded-[16px] h-[50px] mb-4 border border-gray-200"
      />

      <View className="mb-4 border-2 border-[#00000010] rounded-full p-[5px]">
      <View className="rounded-full " style={{overflow: 'hidden'}}>
        <FlatList style={{paddingRight: '-50px'}}
          horizontal
          data={stages}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedStage(item)}
              className={`mr-[5px] px-4 py-2 rounded-full ${
                selectedStage === item ? 'bg-[#1aea9f]' : 'bg-gray-200'
              }`}
            >
              <Text className={selectedStage === item ? '   text-white' : 'text-gray-700'}>
                {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
        />
        </View>
      </View>

      {isLoading && events.length === 0 ? (
        <ActivityIndicator size="large" color="#1aea9f" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text className="text-center text-red-500 mt-4">Error: {error}</Text>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => router.push(`/events/${item.id}`)}
            />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            !isLoading && <Text className="text-center text-gray-500 mt-10">No events found.</Text>
          )}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadEvents} />
          }
        />
      )}
  </LinearGradient>
    </View>
  );
}