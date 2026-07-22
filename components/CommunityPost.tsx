'use client';

import { useState } from 'react';

export interface FeedPost {
  id: string;
  user: { username: string; avatar_url: string | null };
  missionTitle: string | null;
  categoryEmoji: string;
  caption: string | null;
  imageUrl: string | null;
  xpEarned: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export default function CommunityPost({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  async function toggleLike() {
    // Optimistic update, then sync with the server.
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await fetch(`/api/posts/${post.id}/like`, { method: liked ? 'DELETE' : 'POST' });
    } catch {
      // revert on failure
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  }

  return (
    <div className="mb-3.5 rounded-[20px] border border-card-border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-quest-gradient font-display text-sm font-extrabold">
          {post.user.username[0]?.toUpperCase()}
        </div>
        <div>
          <div className="text-[13.5px] font-bold">{post.user.username}</div>
          <div className="font-mono text-[10.5px] text-ink-mute">
            completed {post.categoryEmoji} {post.missionTitle ?? 'a mission'}
          </div>
        </div>
      </div>

      {post.caption && <p className="mt-2.5 text-[13px] text-ink">&ldquo;{post.caption}&rdquo;</p>}

      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="mt-3 h-[150px] w-full rounded-[14px] object-cover"
        />
      ) : (
        <div className="mt-3 flex h-[150px] items-center justify-center rounded-[14px] bg-gradient-to-br from-violet/35 to-coral/25 text-4xl">
          {post.categoryEmoji}
        </div>
      )}

      <div className="mt-3 flex gap-4.5 text-[12.5px] font-bold text-ink-dim">
        <button onClick={toggleLike} className="flex items-center gap-1">
          {liked ? '❤️' : '🤍'} {likeCount} Likes
        </button>
        <span className="flex items-center gap-1">💬 {post.commentCount} Comments</span>
        <span className="ml-auto text-lime">🏆 +{post.xpEarned} XP</span>
      </div>
    </div>
  );
}
