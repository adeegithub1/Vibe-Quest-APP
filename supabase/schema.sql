-- VibeQuest database schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  city text,
  latitude double precision,
  longitude double precision,
  location_sharing boolean not null default false,
  bio text,
  preferences jsonb not null default '{}'::jsonb,
  level int not null default 1,
  level_name text not null default 'Beginner',
  xp int not null default 0,
  xp_next int not null default 1000,
  streak int not null default 0,
  longest_streak int not null default 0,
  missions_completed int not null default 0,
  last_completed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || substr(new.id::text, 1, 4)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- MISSIONS
-- ============================================================
create table if not exists missions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  category text not null,
  difficulty text not null default 'Easy',
  estimated_time text not null,
  estimated_cost text not null,
  distance text,
  latitude double precision,
  longitude double precision,
  xp_reward int not null default 50,
  steps jsonb not null default '[]',
  requirements jsonb not null default '[]',
  is_ai_generated boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists mission_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  mission_id uuid not null references missions(id) on delete cascade,
  proof_text text,
  proof_image_url text,
  completed_steps int[] not null default '{}',
  completed_at timestamptz not null default now(),
  xp_earned int not null default 0
);

-- ============================================================
-- BADGES
-- ============================================================
create table if not exists badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  icon text not null,
  requirement text not null -- e.g. 'missions_completed>=1', 'streak>=7'
);

create table if not exists user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- ============================================================
-- COMMUNITY
-- ============================================================
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  mission_id uuid references missions(id) on delete set null,
  caption text,
  image_url text,
  video_url text,
  created_at timestamptz not null default now()
);

create table if not exists likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists friendships (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending', -- pending | accepted | blocked
  created_at timestamptz not null default now(),
  unique (requester_id, receiver_id)
);

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_user_id uuid references profiles(id) on delete cascade,
  target_post_id uuid references posts(id) on delete cascade,
  target_mission_id uuid references missions(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- GROUP MISSIONS
-- ============================================================
create table if not exists group_missions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  creator_id uuid not null references profiles(id) on delete cascade,
  max_participants int not null default 10,
  start_time timestamptz not null default now(),
  end_time timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists group_mission_participants (
  id uuid primary key default uuid_generate_v4(),
  group_mission_id uuid not null references group_missions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_mission_id, user_id)
);

-- Useful indexes
create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_mission_completions_user on mission_completions(user_id);
create index if not exists idx_profiles_xp on profiles(xp desc);
create index if not exists idx_profiles_city on profiles(city);

-- ============================================================
-- NEARBY MISSIONS (MVP geolocation filtering via haversine distance)
-- ============================================================
create or replace function nearby_missions(lat double precision, lng double precision, radius_km double precision default 10)
returns table (
  id uuid,
  title text,
  category text,
  difficulty text,
  estimated_time text,
  estimated_cost text,
  xp_reward int,
  distance_km double precision
) as $$
  select * from (
    select
      m.id, m.title, m.category, m.difficulty, m.estimated_time, m.estimated_cost, m.xp_reward,
      (
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(lat)) * cos(radians(m.latitude)) *
            cos(radians(m.longitude) - radians(lng)) +
            sin(radians(lat)) * sin(radians(m.latitude))
          ))
        )
      ) as distance_km
    from missions m
    where m.latitude is not null and m.longitude is not null
  ) sub
  where sub.distance_km <= radius_km
  order by sub.distance_km asc;
$$ language sql stable;
