# Soular App Database Schema

This document outlines the database schema used in the Soular app. The app uses Firebase Firestore as its database.

## Special Formats

The database uses a `userShort` object format to reference users in other tables:
- `userShort` (object)
  - `uid` (string) - Reference to the user's id from firebase auth
  - `displayName` (string | null) - Author's display name
  - `photoUrl` (string | null) - Author's profile picture URL

## Collections

### Users
Collection name: `users`

Fields:
- `uid` (string) - Reference to the firebase auth identifier for the user
- `email` (string | null) - User's email address
- `displayName` (string | null) - User's display name
- `photoUrl` (string | null) - URL to user's profile picture

### Posts
Collection name: `posts`

Fields:
- `id` (string) - Unique identifier for the post
- `content` (string) - The main text content of the post
- `imageUrl` (string, optional) - URL to an attached image
- `createdAt` (timestamp) - When the post was created
- `author` (userShort) - Reference to the user who created the post

### Events
Collection name: `events`

Fields:
- `id` (string) - Unique identifier for the event
- `title` (string) - Event title
- `description` (string) - Detailed description of the event
- `date` (string) - Event date in YYYY-MM-DD format
- `time` (string) - Event time in HH:MM format
- `venue` (string) - Location where the event will take place
- `stage` (enum) - Current stage of the event
  - Possible values: 'upcoming' | 'in-development' | 'completed'
- `createdAt` (timestamp) - When the event was created
- `author` (userShort) - The user who created the event
- `organizers` (array<userShort>) - Array of users who are organizing the event
- `participants` (array<userShort>) - Array of users who are participating in the event

## Relationships

1. Posts → Users:
   - Relationship through `author` field
   - Each post has one author (user)
   - Each user can have multiple posts

2. Events → Users:
   - Rrelationships through `author` field, `organizers` and `participants` arrays
   - Each event can have only one author
   - Each event can have multiple organizers and participants
   - Each user can organize or participate in multiple events

## Security Rules Considerations

- Users should only be able to create posts with their own userId
- Events can be read by all authenticated users
- Event participation/organization changes should only be allowed by:
  - The event creator
  - Current organizers
  - The user joining/leaving (for participants)

## Data Validation Rules

1. userShort:
   - uid: Required, non-empty string
   - displayName: Optional, can be null
   - photoUrl: Optional, can be null

2. Users:
   - uid: Required, non-empty string
   - email: Optional, can be null
   - displayName: Optional, can be null
   - photoUrl: Optional, can be null

3. Posts:
   - content: Required, non-empty string
   - createdAt: Required timestamp
   - author: Required userShort object

4. Events:
   - title: Required, non-empty string
   - description: Required, non-empty string
   - date: Required, valid date string
   - time: Required, valid time string
   - venue: Required, non-empty string
   - stage: Required, must be one of: 'upcoming', 'in-development', 'completed'
   - organizers: Required array, non-empty (at least one organizer)
   - participants: Required array (can be empty)

## Indexing Recommendations (deal with these later)

Consider creating the following indexes for optimal query performance:

1. Posts collection:
   - createdAt (descending) - For the social feed

2. Events collection:
   - date (descending) - For listing events
   - stage + date (compound index) - For filtering events by stage