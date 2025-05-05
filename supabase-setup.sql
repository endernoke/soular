-- Create tables and set up RLS policies for Supabase

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables with proper constraints and defaults

-- Profiles table (linked to auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  photo_url text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Posts table
create table if not exists posts (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  image_url text,
  author_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Events table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  event_timestamp timestamptz not null,
  venue text not null,
  stage text not null check (stage in ('upcoming', 'in-development', 'completed')),
  author_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Event organizers junction table
create table if not exists event_organizers (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- Event participants junction table
create table if not exists event_participants (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- Indexes for performance
create index if not exists posts_created_at_idx on posts (created_at desc);
create index if not exists posts_author_id_idx on posts (author_id);
create index if not exists events_event_timestamp_idx on events (event_timestamp desc);
create index if not exists events_stage_idx on events (stage);
create index if not exists events_author_id_idx on events (author_id);
create index if not exists event_organizers_user_id_idx on event_organizers (user_id);
create index if not exists event_participants_user_id_idx on event_participants (user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'User')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table events enable row level security;
alter table event_organizers enable row level security;
alter table event_participants enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

create policy "Users can create posts as themselves"
  on posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on posts for update
  using (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on posts for delete
  using (auth.uid() = author_id);

-- Events policies
create policy "Events are viewable by everyone"
  on events for select
  using (true);

create policy "Authenticated users can create events"
  on events for insert
  with check (auth.uid() = author_id);

create policy "Event authors and organizers can update events"
  on events for update
  using (
    auth.uid() = author_id or
    exists (
      select 1 from event_organizers
      where event_id = events.id and user_id = auth.uid()
    )
  );

create policy "Event authors can delete events"
  on events for delete
  using (auth.uid() = author_id);

-- Event organizers policies
create policy "Event organizer lists are viewable by everyone"
  on event_organizers for select
  using (true);

create policy "Event authors can manage organizers"
  on event_organizers for insert
  with check (
    exists (
      select 1 from events
      where id = event_id and (
        author_id = auth.uid()
      )
    )
  );

create policy "Users can join/leave events as organizers"
  on event_organizers for insert
  with check (
    auth.uid() = user_id and -- Can only join as yourself
    exists (
      select 1 from events
      where id = event_id and stage = 'in-development'
    )
  );

create policy "Event authors and self can remove organizers"
  on event_organizers for delete
  using (
    exists (
      select 1 from events
      where id = event_id and author_id = auth.uid()
    ) or
    user_id = auth.uid()
  );

-- Event participants policies
create policy "Event participant lists are viewable by everyone"
  on event_participants for select
  using (true);

create policy "Users can join/leave upcoming events"
  on event_participants for insert
  with check (
    auth.uid() = user_id and -- Can only join as yourself
    exists (
      select 1 from events
      where id = event_id and stage = 'upcoming'
    )
  );

create policy "Users can remove themselves from events"
  on event_participants for delete
  using (user_id = auth.uid());

create policy "Event authors and organizers can manage participants"
  on event_participants for delete
  using (
    exists (
      select 1 from events e
      left join event_organizers eo on e.id = eo.event_id
      where e.id = event_id and (
        e.author_id = auth.uid() or
        eo.user_id = auth.uid()
      )
    )
  );

-- Create functions for participant/organizer counts
create or replace function get_event_participant_count(event_id uuid)
returns integer as $$
  select count(*)::integer
  from event_participants
  where event_id = $1;
$$ language sql security definer;

create or replace function get_event_organizer_count(event_id uuid)
returns integer as $$
  select count(*)::integer
  from event_organizers
  where event_id = $1;
$$ language sql security definer;

-- Create storage bucket for images
insert into storage.buckets (id, name)
values ('images', 'images')
on conflict do nothing;

-- Set up storage policies
create policy "Images are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'images' and
    auth.role() = 'authenticated'
  );

create policy "Users can update their own images"
  on storage.objects for update
  using (
    bucket_id = 'images' and
    owner = auth.uid()
  );

create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'images' and
    owner = auth.uid()
  );

-- Create a storage bucket for profile pictures
insert into storage.buckets (id, name)
values ('profile-pictures', 'profile-pictures')
on conflict do nothing;

-- Allow authenticated users to upload profile pictures
create policy "Authenticated users can upload profile pictures"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-pictures' and
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own profile pictures
create policy "Users can update their own profile pictures"
  on storage.objects for update
  using (
    bucket_id = 'profile-pictures' and
    owner = auth.uid()
  );

-- Allow authenticated users to delete their own profile pictures
create policy "Users can delete their own profile pictures"
  on storage.objects for delete
  using (
    bucket_id = 'profile-pictures' and
    owner = auth.uid()
  );

-- Allow everyone to view profile pictures
create policy "Profile pictures are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');
