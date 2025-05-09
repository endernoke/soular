export interface Profile {
  id: string; // UUID
  display_name: string | null;
  photo_url: string | null;
  bio: string | null; // User's self-description
  updated_at?: string; // ISO 8601 timestamp string
  created_at?: string; // ISO 8601 timestamp string
}

// UserShort can be simplified or derived from Profile if needed,
// but keeping it separate might be useful if you fetch minimal author data.
export interface UserShort {
  id: string; // UUID
  display_name: string | null;
}

export interface Post {
  id: string; // UUID
  content: string;
  image_url?: string | null;
  created_at: string; // ISO 8601 timestamp string
  author_id: string; // UUID
  // Optionally include author profile data if fetched via join
  profiles?: { 
    display_name: string | null;
    photo_url?: string | null;
  } | null;
}

export type EventStage = 'upcoming' | 'in-development' | 'completed';

export interface Event {
  id: string; // UUID
  title: string;
  description: string;
  event_timestamp: string; // ISO 8601 timestamp string (combined date and time)
  venue: string;
  stage: EventStage;
  created_at: string; // ISO 8601 timestamp string
  author_id: string; // UUID
  // Optionally include author profile data if fetched via join
  profiles?: { 
    display_name: string | null;
  } | null;
  // Counts or full lists might be fetched separately or via joins
  organizers?: Profile[]; 
  participants?: Profile[];
  organizer_count?: number;
  participant_count?: number;
}

// Types for junction tables if needed directly
export interface EventOrganizer {
  event_id: string; // UUID
  user_id: string; // UUID
  joined_at: string; // ISO 8601 timestamp string
}

export interface EventParticipant {
  event_id: string; // UUID
  user_id: string; // UUID
  joined_at: string; // ISO 8601 timestamp string
}

export type ChatType = 'direct' | 'event_organizers' | 'event_participants';

export interface ChatRoom {
  id: string;
  type: ChatType;
  icon_url: string | null;
  event_id: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Optional joined data
  event?: Event;
  last_message?: ChatMessage;
  other_user?: Profile; // For direct messages
}

export interface ChatMember {
  chat_id: string;
  user_id: string;
  last_read_at: string;
  joined_at: string;
  // Optional joined data
  profile?: Profile;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  // Optional joined data
  sender?: Profile;
}

export interface Story {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_id: string;
  expires_at: string;
  // Include author profile data if fetched via join
  profiles?: {
    display_name: string | null;
    photo_url?: string | null;
  } | null;
}