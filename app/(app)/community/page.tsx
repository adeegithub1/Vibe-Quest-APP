import { createClient } from '@/lib/supabase/server';
import CommunityPost, { type FeedPost } from '@/components/CommunityPost';

const CATEGORY_EMOJI: Record<string, string> = {
  explore: '🗺️', self: '💪', social: '👥', fun: '🎮', earn: '💰',
  learn: '📚', connect: '❤️', create: '🎨', adventure: '🌍',
};

export default async function CommunityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from('posts')
    .select(
      `id, caption, image_url,
       profiles!posts_user_id_fkey ( username ),
       missions ( title, category, xp_reward ),
       likes ( user_id ),
       comments ( id )`
    )
    .order('created_at', { ascending: false })
    .limit(20);

  const feedPosts: FeedPost[] = (posts ?? []).map((p: any) => ({
    id: p.id,
    user: { username: p.profiles?.username ?? 'Explorer', avatar_url: null },
    missionTitle: p.missions?.title ?? null,
    categoryEmoji: CATEGORY_EMOJI[p.missions?.category] ?? '🎯',
    caption: p.caption,
    imageUrl: p.image_url,
    xpEarned: p.missions?.xp_reward ?? 0,
    likeCount: p.likes?.length ?? 0,
    commentCount: p.comments?.length ?? 0,
    likedByMe: user ? (p.likes ?? []).some((l: any) => l.user_id === user.id) : false,
  }));

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">Community</div>
      <h1 className="font-display text-2xl">Fresh discoveries</h1>

      <div className="mt-4">
        {feedPosts.length === 0 && (
          <p className="mt-10 text-center text-sm text-ink-mute">
            No posts yet — complete a mission and be the first to share!
          </p>
        )}
        {feedPosts.map((post) => (
          <CommunityPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
