export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  author: {
    displayName: string;
    photoURL: string | null;
  };
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
  createdAt: Date;
  createdBy: string;
  organizers: string[];
  participants: string[];
}