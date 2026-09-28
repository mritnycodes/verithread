'use client';

import { useState } from 'react';

interface CreatePostProps {
  userAccount: string | null;
}

export default function CreatePost({ userAccount }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAccount) {
      alert('Please connect your Pera Wallet first!');
      return;
    }

    if (!content.trim() && !file) {
      alert('Please enter text or upload a media file.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Uploading to IPFS & Backend...');

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('author', userAccount);
      if (file) {
        formData.append('media', file);
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Backend failed to process post');
      }

      const data = await response.json();
      setStatusMessage(`Post pinned to IPFS! CID: ${data.cid || 'Pending...'}`);

      setContent('');
      setFile(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed.';
      console.error(err);
      setStatusMessage(`Error: ${errorMessage} (Backend offline?)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Create Verifiable Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            userAccount
              ? "What's on your mind? Content will be permanently anchored to Algorand."
              : 'Connect wallet above to create a post...'
          }
          disabled={!userAccount || isSubmitting}
          rows={4}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition resize-none"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <input
            type="file"
            disabled={!userAccount || isSubmitting}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 disabled:opacity-50 cursor-pointer"
          />

          <button
            type="submit"
            disabled={!userAccount || isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 text-slate-950 disabled:text-slate-500 font-bold px-6 py-2.5 rounded-lg transition"
          >
            {isSubmitting ? 'Posting...' : 'Publish Post'}
          </button>
        </div>
      </form>

      {statusMessage && (
        <p className="text-xs font-mono text-yellow-400/90 bg-slate-950 p-2.5 rounded border border-slate-800 break-all">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
