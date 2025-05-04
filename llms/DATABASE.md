# Soular App Database Schema (Supabase / PostgreSQL)

This document outlines the PostgreSQL database schema used in the Soular app, designed for Supabase.

## Authentication & User Profiles

User authentication is handled by Supabase Auth. Public user profile information is stored in a separate `profiles` table, linked to the `auth.users` table via the user's ID.

## Storage

Images (profile photos, post images) should be stored using Supabase Storage. The database tables will store URLs pointing to these stored files, rather than base64 encoded strings.

## Tables

### `profiles`
Stores public user profile information.

Columns:
- `id` (UUID, Primary Key) - Foreign key referencing `auth.users.id`. Set up via trigger or manually after signup.
- `display_name` (TEXT) - User's display name. Can be updated by the user.
- `photo_url` (TEXT, nullable) - URL to the user's profile photo in Supabase Storage.
- `created_at` (TIMESTAMPTZ, default `now()`) - Timestamp of profile creation.
- `updated_at` (TIMESTAMPTZ, default `now()`) - Timestamp of last profile update.

### `posts`
Stores user-generated posts for the social feed.

Columns:
- `id` (UUID, Primary Key, default `gen_random_uuid()`) - Unique identifier for the post.
- `content` (TEXT, not null) - The main text content of the post.
- `image_url` (TEXT, nullable) - URL to the post's image in Supabase Storage (if any).
- `created_at` (TIMESTAMPTZ, default `now()`) - When the post was created. Indexed for feed ordering.
- `author_id` (UUID, not null) - Foreign key referencing `profiles.id`.

### `events`
Stores information about events created by users.

Columns:
- `id` (UUID, Primary Key, default `gen_random_uuid()`) - Unique identifier for the event.
- `title` (TEXT, not null) - Event title.
- `description` (TEXT, not null) - Detailed description of the event.
- `event_timestamp` (TIMESTAMPTZ, not null) - Combined date and time of the event.
- `venue` (TEXT, not null) - Location where the event will take place.
- `stage` (TEXT, not null) - Current stage of the event. Add `CHECK (stage IN ('upcoming', 'in-development', 'completed'))`.
- `created_at` (TIMESTAMPTZ, default `now()`) - When the event record was created.
- `author_id` (UUID, not null) - Foreign key referencing `profiles.id`. The user who created the event.

### `event_organizers`
Junction table linking events to their organizers (Many-to-Many).

Columns:
- `event_id` (UUID) - Foreign key referencing `events.id`. Part of the composite primary key.
- `user_id` (UUID) - Foreign key referencing `profiles.id`. Part of the composite primary key.
- `joined_at` (TIMESTAMPTZ, default `now()`) - When the user joined as an organizer.
- Primary Key: (`event_id`, `user_id`)

### `event_participants`
Junction table linking events to their participants (Many-to-Many).

Columns:
- `event_id` (UUID) - Foreign key referencing `events.id`. Part of the composite primary key.
- `user_id` (UUID) - Foreign key referencing `profiles.id`. Part of the composite primary key.
- `joined_at` (TIMESTAMPTZ, default `now()`) - When the user joined as a participant.
- Primary Key: (`event_id`, `user_id`)

## Relationships

1.  **Profiles <-> Auth Users:** One-to-one relationship via the `id` field. A `profile` entry should exist for every relevant `auth.users` entry.
2.  **Posts <-> Profiles:** One-to-Many. A profile (`author_id`) can have many posts. Each post belongs to one profile.
3.  **Events <-> Profiles (Author):** One-to-Many. A profile (`author_id`) can create many events. Each event has one author.
4.  **Events <-> Profiles (Organizers):** Many-to-Many via `event_organizers`. An event can have multiple organizers, and a profile can organize multiple events.
5.  **Events <-> Profiles (Participants):** Many-to-Many via `event_participants`. An event can have multiple participants, and a profile can participate in multiple events.

## Security Rules Considerations (Row Level Security - RLS)

Supabase uses PostgreSQL's Row Level Security (RLS). Policies need to be defined for each table:

- **`profiles`:**
    - Users should be able to read all profiles (or profiles of users they interact with).
    - Users should only be able to update their own profile (`id = auth.uid()`).
    - Users should be able to create their own profile upon signup (usually handled via a trigger).
- **`posts`:**
    - Users should be able to read all posts (or posts relevant to their feed).
    - Users should only be able to create posts for themselves (`author_id = auth.uid()`).
    - Users should only be able to update/delete their own posts.
- **`events`:**
    - Users should be able to read all events.
    - Users should only be able to create events for themselves (`author_id = auth.uid()`).
    - Updating/deleting events might be restricted to the author or organizers.
- **`event_organizers` / `event_participants`:**
    - Users should be able to read organizer/participant lists for events they can see.
    - Users should be able to insert/delete entries corresponding to themselves (`user_id = auth.uid()`) based on event stage and rules (e.g., can only join 'upcoming' events as participant).
    - Event authors/organizers might have broader permissions to manage these lists.

## Data Validation Rules

- Use `NOT NULL` constraints where appropriate (e.g., `posts.content`, `events.title`).
- Use `CHECK` constraints for fields like `events.stage`.
- Foreign key constraints ensure relational integrity.
- Consider adding database-level validation for formats like email (though Supabase Auth handles this) or URL formats if needed.

## Indexing Recommendations

- Create indexes on foreign key columns (`posts.author_id`, `events.author_id`, `event_organizers.event_id`, `event_organizers.user_id`, etc.). Supabase might do this automatically for foreign keys.
- Index `posts.created_at` (descending) for the social feed.
- Index `events.event_timestamp` (descending or ascending depending on query needs).
- Index `events.stage` if frequently filtering by stage. Consider a compound index on (`stage`, `event_timestamp`).