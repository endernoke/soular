export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;  // Changed from photoURL to match schema
}

export interface UserShort {
  uid: string;
  displayName: string | null;
  photoUrl: string | null;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: any; // Firebase Timestamp
  author: UserShort;
}

export type EventStage = 'upcoming' | 'in-development' | 'completed';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  stage: EventStage;
  createdAt: any; // Firebase Timestamp
  author: UserShort;
  organizers: UserShort[];
  participants: UserShort[];
}