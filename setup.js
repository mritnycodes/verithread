const fs = require('fs');
const path = require('path');

const files = {
  'src/components/WalletConnect.tsx': `'use client';

import { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

let peraWallet: PeraWalletConnect | null = null;
if (typeof window !== 'undefined') {
  peraWallet = new PeraWalletConnect();
}

interface WalletConnectProps {
  onAccountChange?: (account: string | null) => void;
}

export default function WalletConnect({ onAccountChange }: WalletConnectProps) {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!peraWallet) return;

    peraWallet.reconnectSession().then((accounts) => {
      peraWallet?.connector?.on('disconnect', handleDisconnect);
      if (accounts.length) {
        setAccountAddress(accounts[0]);
        if (onAccountChange) onAccountChange(accounts[0]);
      }
    });
  }, []);

  const handleConnect = async () => {
    if (!peraWallet) return;
    try {
      const newAccounts = await peraWallet.connect();
      peraWallet.connector?.on('disconnect', handleDisconnect);
      setAccountAddress(newAccounts[0]);
      if (onAccountChange) onAccountChange(newAccounts[0]);
    } catch (error) {
      if (error?.toString() !== 'Error: Window closed') {
        console.error('Wallet connection error:', error);
      }
    }
  };

  const handleDisconnect = async () => {
    if (!peraWallet) return;
    try {
      await peraWallet.disconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    setAccountAddress(null);
    if (onAccountChange) onAccountChange(null);
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔗</span>
        <h1 className="text-xl font-bold tracking-wide text-yellow-400">VeriThread</h1>
      </div>

      {accountAddress ? (
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-full font-mono text-slate-300 border border-slate-700">
            {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
          </span>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-lg transition"
        >
          Connect Pera Wallet
        </button>
      )}
    </nav>
  );
}
`,

  'src/components/CreatePost.tsx': `'use client';

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
      setStatusMessage(\`Post pinned to IPFS! CID: \${data.cid || 'Pending...'}\`);

      setContent('');
      setFile(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed.';
      console.error(err);
      setStatusMessage(\`Error: \${errorMessage} (Backend offline?)\`);
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
`,

  'src/app/page.tsx': `'use client';

import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import CreatePost from '@/components/CreatePost';

export default function Home() {
  const [userAccount, setUserAccount] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-3xl mx-auto space-y-6">
      <WalletConnect onAccountChange={(account) => setUserAccount(account)} />
      <CreatePost userAccount={userAccount} />

      <section className="border border-slate-800 rounded-xl p-6 bg-slate-900/40 space-y-3">
        <h3 className="text-md font-semibold text-slate-300">Verified Feed</h3>
        <p className="text-xs text-slate-500 italic">
          Posts anchored to the Algorand blockchain via Jerusha's IPFS and Micheal's API will render here.
        </p>
      </section>
    </main>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Created: ${filePath}`);
}

console.log('\n✅ All VeriThread frontend components and pages generated successfully!');