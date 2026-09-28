'use client';

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
