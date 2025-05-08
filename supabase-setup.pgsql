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

-- Chat rooms (both direct messages and groups)
create table chat_rooms (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('direct', 'event_organizers', 'event_participants')),
  icon_url text, -- Optional, for group chats
  event_id uuid references events(id) on delete cascade, -- NULL for direct messages
  is_enabled boolean default true, -- For event groups, can be disabled by event author
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat room members
create table chat_members (
  chat_id uuid references chat_rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  last_read_at timestamptz default now(),
  joined_at timestamptz default now(),
  primary key (chat_id, user_id)
);

-- Messages within chat rooms
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references chat_rooms(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists posts_created_at_idx on posts (created_at desc);
create index if not exists posts_author_id_idx on posts (author_id);
create index if not exists events_event_timestamp_idx on events (event_timestamp desc);
create index if not exists events_stage_idx on events (stage);
create index if not exists events_author_id_idx on events (author_id);
create index if not exists event_organizers_user_id_idx on event_organizers (user_id);
create index if not exists event_participants_user_id_idx on event_participants (user_id);
create index chat_rooms_event_id_idx on chat_rooms(event_id);
create index chat_rooms_updated_at_idx on chat_rooms(updated_at desc);
create index chat_messages_chat_id_created_idx on chat_messages(chat_id, created_at desc);
create index chat_messages_sender_id_idx on chat_messages(sender_id);

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
alter table chat_rooms enable row level security;
alter table chat_members enable row level security;
alter table chat_messages enable row level security;

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
    (
      exists (
        select 1 from events
        where id = event_id and author_id = auth.uid()
      ) or
      user_id = auth.uid()
    ) and
    -- Prevent removing author from organizers
    user_id != (
      select author_id from events where id = event_id
    )
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

-- Chat rooms policies
create policy "Users can view chat rooms they are members of"
  on chat_rooms for select
  using (
    exists (
      select 1 from chat_members
      where chat_id = chat_rooms.id
      and user_id = auth.uid()
    )
  );

-- Automatic chat room creation handled by backend/functions

-- Function to check if user is member of a chat
create or replace function is_chat_member(chat_id uuid, user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from chat_members
    where chat_members.chat_id = $1
    and chat_members.user_id = $2
  );
end;
$$ language plpgsql security definer;

-- Chat members policies
create policy "Users can view chat members of their chats"
  on chat_members for select
  using (
    is_chat_member(chat_id, auth.uid())
  );

-- Chat messages policies
create policy "Users can view messages in their chats"
  on chat_messages for select
  using (
    exists (
      select 1 from chat_members
      where chat_id = chat_messages.chat_id
      and user_id = auth.uid()
    )
  );

create policy "Users can send messages to enabled chats they are members of"
  on chat_messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from chat_rooms r
      join chat_members m on m.chat_id = r.id
      where r.id = chat_messages.chat_id
      and m.user_id = auth.uid()
      and r.is_enabled = true
    )
  );

-- Function to create a direct message chat room between two users
create or replace function create_direct_chat(user1_id uuid, user2_id uuid)
returns uuid as $$
declare
  chat_id uuid;
begin
  -- Check if DM chat already exists
  select cr.id into chat_id
  from chat_rooms cr
  join chat_members cm1 on cr.id = cm1.chat_id
  join chat_members cm2 on cr.id = cm2.chat_id
  where cr.type = 'direct'
  and cm1.user_id = user1_id
  and cm2.user_id = user2_id;

  -- If not exists, create new chat room
  if chat_id is null then
    insert into chat_rooms (type) values ('direct')
    returning id into chat_id;

    -- Add both users as members
    insert into chat_members (chat_id, user_id)
    values
      (chat_id, user1_id),
      (chat_id, user2_id);
  end if;

  return chat_id;
end;
$$ language plpgsql security definer;

-- Function to create event group chats
create or replace function create_event_group_chats(event_id uuid)
returns void as $$
declare
  organizer_chat_id uuid;
  participant_chat_id uuid;
  event_author_id uuid;
begin
  -- Create organizers chat
  insert into chat_rooms (type, event_id)
  values ('event_organizers', event_id)
  returning id into organizer_chat_id;

  -- Create participants chat
  insert into chat_rooms (type, event_id)
  values ('event_participants', event_id)
  returning id into participant_chat_id;

  select author_id into event_author_id
  from events where id = event_id;

  -- Add event author to both chats
  if not is_chat_member(organizer_chat_id, event_author_id) then
    insert into chat_members (chat_id, user_id)
    values (organizer_chat_id, event_author_id);
  end if;

  if not is_chat_member(participant_chat_id, event_author_id) then
    insert into chat_members (chat_id, user_id)
    values (participant_chat_id, event_author_id);
  end if;
end;
$$ language plpgsql security definer;

-- Function to add event author as organizer
create or replace function add_event_author_as_organizer(event_id uuid)
returns void as $$
begin
  insert into event_organizers (event_id, user_id)
  select event_id, author_id
  from events where id = event_id
  on conflict do nothing;
end;
$$ language plpgsql security definer;

-- Trigger to auto-add organizer and create event group chats
create or replace function handle_new_event()
returns trigger as $$
begin
  -- NOTE: Order of operations matters here
  perform create_event_group_chats(new.id);
  perform add_event_author_as_organizer(new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_event_created
  after insert on events
  for each row execute procedure handle_new_event();

-- Trigger to auto-add organizers to both organizer and participant chats
create or replace function handle_new_organizer()
returns trigger as $$
declare
  organizer_chat_id uuid;
  participant_chat_id uuid;
begin
  -- Get organizer chat id for this event
  select id into organizer_chat_id
  from chat_rooms
  where event_id = new.event_id
  and type = 'event_organizers';

  -- Add to organizer chat if not already a member
  if not is_chat_member(organizer_chat_id, new.user_id) then
    insert into chat_members (chat_id, user_id)
    values (organizer_chat_id, new.user_id);
  end if;

  -- Get participant chat id for this event
  select id into participant_chat_id
  from chat_rooms
  where event_id = new.event_id
  and type = 'event_participants';

  -- Add to participant chat if not already a member
  if not is_chat_member(participant_chat_id, new.user_id) then
    insert into chat_members (chat_id, user_id)
    values (participant_chat_id, new.user_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_organizer_added
  after insert on event_organizers
  for each row execute procedure handle_new_organizer();

-- Trigger to auto-add participants to participant chat
create or replace function handle_new_participant()
returns trigger as $$
declare
  participant_chat_id uuid;
begin
  -- Get participant chat id for this event
  select id into participant_chat_id
  from chat_rooms
  where event_id = new.event_id
  and type = 'event_participants';

  -- Add to participant chat if not already a member
  if not is_chat_member(participant_chat_id, new.user_id) then
    insert into chat_members (chat_id, user_id)
    values (participant_chat_id, new.user_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_participant_added
  after insert on event_participants
  for each row execute procedure handle_new_participant();

-- Trigger to auto-remove organizers from chats when they leave
create or replace function handle_organizer_removed()
returns trigger as $$
declare
  organizer_chat_id uuid;
  participant_chat_id uuid;
begin
  -- Get organizer chat id for this event
  select id into organizer_chat_id
  from chat_rooms
  where event_id = old.event_id
  and type = 'event_organizers';

  -- Remove from organizer chat if they are a member
  if is_chat_member(organizer_chat_id, old.user_id) then
    delete from chat_members
    where chat_id = organizer_chat_id and user_id = old.user_id;
  end if;

  -- Get participant chat id for this event
  select id into participant_chat_id
  from chat_rooms
  where event_id = old.event_id
  and type = 'event_participants';

  -- Remove from participant chat if they are a member
  if is_chat_member(participant_chat_id, old.user_id) then
    delete from chat_members
    where chat_id = participant_chat_id and user_id = old.user_id;
  end if;

  return old;
end;
$$ language plpgsql security definer;

create trigger on_organizer_removed
  after delete on event_organizers
  for each row execute procedure handle_organizer_removed();

-- Trigger to auto-remove participants from chat when they leave
create or replace function handle_participant_removed()
returns trigger as $$
declare
  participant_chat_id uuid;
begin
  -- Get participant chat id for this event
  select id into participant_chat_id
  from chat_rooms
  where event_id = old.event_id
  and type = 'event_participants';

  -- Remove from participant chat if they are a member
  if is_chat_member(participant_chat_id, old.user_id) then
    delete from chat_members
    where chat_id = participant_chat_id and user_id = old.user_id;
  end if;

  return old;
end;
$$ language plpgsql security definer;

create trigger on_participant_removed
  after delete on event_participants
  for each row execute procedure handle_participant_removed();

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
