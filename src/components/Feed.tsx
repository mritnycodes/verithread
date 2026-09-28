'use client';

import { useEffect, useState } from 'react';

interface Post {
  _id?: string;
  author: string;
  content: string;
  mediaUrl?: string;
  cid?: string;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border border-slate-800 rounded-xl p-6 bg-slate-900/40 space-y-4">
      <h3 className="text-md font-semibold text-slate-300">Verified Feed</h3>

      {loading ? (
        <p className="text-xs text-slate-500 animate-pulse">Loading verified posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-xs text-slate-500 italic">
          No posts anchored yet. Publish your first post above!
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div key={post._id || idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-yellow-400">
                  {post.author ? `${post.author.slice(0, 6)}...${post.author.slice(-4)}` : 'Anonymous'}
                </span>
                {post.cid && (
                  <span className="font-mono text-slate-500 text-[10px]">
                    IPFS: {post.cid.slice(0, 8)}...
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-200">{post.content}</p>
              {post.mediaUrl && (
                <img src={post.mediaUrl} alt="Media" className="rounded-md max-h-60 object-cover mt-2 border border-slate-800" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}