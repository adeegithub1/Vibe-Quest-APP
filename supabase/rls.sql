-- Row Level Security policies for VibeQuest.
-- Core rule: XP, level, streak and missions_completed are NEVER writable by
-- the client. Only the service-role key (used server-side in
-- app/api/complete-mission) can update those columns, via the
-- SECURITY DEFINER function below, so RLS on profiles blocks direct writes
-- to those fields even if a user forges a request.

alter table profiles enable row level security;
alter table missions enable row level security;
alter table mission_completions enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table friendships enable row level security;
alter table reports enable row level security;
alter table group_missions enable row level security;
alter table group_mission_participants enable row level security;

-- ---------------- profiles ----------------
create policy "Public profiles are readable by everyone"
  on profiles for select using (true);

-- Users may update their own profile, but a trigger (below) rejects any
-- attempt to touch the gamification columns from this path.
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function reject_gamification_field_edits()
returns trigger as $$
begin
  -- The service-role key (used only by app/api/complete-mission) carries the
  -- 'service_role' JWT claim and is allowed to update these fields. Any
  -- request authenticated as a normal user is blocked from touching them.
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.xp <> old.xp
     or new.level <> old.level
     or new.streak <> old.streak
     or new.longest_streak <> old.longest_streak
     or new.missions_completed <> old.missions_completed then
    raise exception 'Gamification fields can only be modified by the server';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists guard_gamification_fields on profiles;
create trigger guard_gamification_fields
  before update on profiles
  for each row execute procedure reject_gamification_field_edits();

-- ---------------- missions ----------------
create policy "Missions are readable by everyone"
  on missions for select using (true);

create policy "Users can create their own missions"
  on missions for insert with check (auth.uid() = created_by);

-- ---------------- mission_completions ----------------
-- Inserts only happen through the service-role client in the API route,
-- so there is intentionally no client-facing insert policy here.
create policy "Users can view their own completions"
  on mission_completions for select using (auth.uid() = user_id);

-- ---------------- badges / user_badges ----------------
create policy "Badges are readable by everyone"
  on badges for select using (true);

create policy "Users can view their own and others' unlocked badges"
  on user_badges for select using (true);
-- No insert policy: badges are only unlocked by the server.

-- ---------------- posts ----------------
create policy "Posts are readable by everyone"
  on posts for select using (true);

create policy "Users can create their own posts"
  on posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on posts for update using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on posts for delete using (auth.uid() = user_id);

-- ---------------- likes ----------------
create policy "Likes are readable by everyone"
  on likes for select using (true);

create policy "Users can like posts as themselves"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can remove their own like"
  on likes for delete using (auth.uid() = user_id);

-- ---------------- comments ----------------
create policy "Comments are readable by everyone"
  on comments for select using (true);

create policy "Users can comment as themselves"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on comments for delete using (auth.uid() = user_id);

-- ---------------- friendships ----------------
create policy "Users can view friendships they're part of"
  on friendships for select
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "Users can send friend requests"
  on friendships for insert with check (auth.uid() = requester_id);

create policy "Participants can update friendship status"
  on friendships for update
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

-- ---------------- reports ----------------
create policy "Users can create reports"
  on reports for insert with check (auth.uid() = reporter_id);

create policy "Users can view their own submitted reports"
  on reports for select using (auth.uid() = reporter_id);

-- ---------------- group_missions ----------------
create policy "Group missions are readable by everyone"
  on group_missions for select using (true);

create policy "Users can create group missions"
  on group_missions for insert with check (auth.uid() = creator_id);

-- ---------------- group_mission_participants ----------------
create policy "Participants list is readable by everyone"
  on group_mission_participants for select using (true);

create policy "Users can join a group mission as themselves"
  on group_mission_participants for insert with check (auth.uid() = user_id);

create policy "Users can leave a group mission"
  on group_mission_participants for delete using (auth.uid() = user_id);
