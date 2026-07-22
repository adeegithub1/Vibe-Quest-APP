export type MoodId =
  | 'bored' | 'improve' | 'meet' | 'fun' | 'earn'
  | 'learn' | 'lonely' | 'adventure' | 'productive' | 'creative';

export type Category =
  | 'explore' | 'self' | 'social' | 'fun' | 'earn'
  | 'learn' | 'connect' | 'create' | 'adventure';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  preferences: {
    time_available?: string;
    budget?: string;
    interests?: string[];
    social?: 'solo' | 'friends';
    place?: 'indoor' | 'outdoor';
    difficulty?: 'easy' | 'medium' | 'hard';
  };
  level: number;
  level_name: string;
  xp: number;
  xp_next: number;
  streak: number;
  longest_streak: number;
  missions_completed: number;
  last_completed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionStep {
  title: string;
  description: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  estimated_time: string;
  estimated_cost: string;
  distance: string | null;
  xp_reward: number;
  steps: MissionStep[];
  requirements: string[];
  is_ai_generated: boolean;
  created_by: string | null;
  created_at: string;
}

export interface MissionCompletion {
  id: string;
  user_id: string;
  mission_id: string;
  proof_text: string | null;
  proof_image_url: string | null;
  completed_steps: number[];
  completed_at: string;
  xp_earned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  mission_id: string | null;
  caption: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
}

export interface GroupMission {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  max_participants: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

// Minimal Supabase Database generic — replace with the CLI-generated types
// (`supabase gen types typescript`) once the project schema is live.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      missions: { Row: Mission; Insert: Partial<Mission>; Update: Partial<Mission> };
      mission_completions: {
        Row: MissionCompletion;
        Insert: Partial<MissionCompletion>;
        Update: Partial<MissionCompletion>;
      };
      badges: { Row: Badge; Insert: Partial<Badge>; Update: Partial<Badge> };
      user_badges: { Row: UserBadge; Insert: Partial<UserBadge>; Update: Partial<UserBadge> };
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post> };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> };
      group_missions: {
        Row: GroupMission;
        Insert: Partial<GroupMission>;
        Update: Partial<GroupMission>;
      };
    };
  };
}
