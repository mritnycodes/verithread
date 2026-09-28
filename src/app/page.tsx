'use client';

import { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';

export default function Home() {
  const [userAccount, setUserAccount] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-3xl mx-auto space-y-6">
      <WalletConnect onAccountChange={(account) => setUserAccount(account)} />
      <CreatePost userAccount={userAccount} />
      <Feed />
    </main>
  );
}