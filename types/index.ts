export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoBase64: string | null;  // Changed from photoUrl to photoBase64
}

export interface UserShort {
  uid: string;
  displayName: string | null;
}

export interface Post {
  id: string;
  content: string;
  imageBase64?: string;  // Changed from imageUrl to imageBase64
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