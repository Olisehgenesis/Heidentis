import React, { useEffect, useState } from 'react';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { WalletSelectionDialog } from './WalletSelectionDialog';
import { Shield, Key } from 'lucide-react';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();

  const handleConnect = async () => {
    if (accountId) {
      walletInterface.disconnect();
    } else {
      setOpen(true);
    }
  };


  useEffect(() => {
    if (accountId) {
      setOpen(false);
    }
  }, [accountId]);
  useEffect(() => {
    // Only close the dialog when we have a successful connection
    if (accountId && walletInterface) {
      setOpen(false);
    }
  }, [accountId, walletInterface]);
  
  // Add a debug effect
  useEffect(() => {
    console.log('Dialog state:', open);
    console.log('Account ID:', accountId);
    console.log('Wallet Interface:', walletInterface ? 'Present' : 'Null');
  }, [open, accountId, walletInterface]);

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-blue-700/50 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-400" />
              <Key className="h-8 w-8 text-indigo-400 -ml-4" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 inline-block text-transparent bg-clip-text">
                He-identis
              </h1>
              <p className="text-xs text-blue-300/80">
                Redefining Digital Trust
              </p>
            </div>
          </div>

          {/* Center Tagline */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <p className="text-blue-200 font-light italic">
              Seamless Credentials, Limitless Possibilities
            </p>
          </div>

          {/* Connect Button */}
          <div className="flex items-center">
            <button
              onClick={handleConnect}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300
                ${accountId 
                  ? 'bg-blue-700 hover:bg-blue-600 text-blue-100 shadow-lg shadow-blue-900/50' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg shadow-indigo-900/50'
                }
                transform hover:scale-105 active:scale-95
              `}
            >
              {accountId ? (
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="truncate max-w-[120px]">{accountId}</span>
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </div>
      </div>

      <WalletSelectionDialog 
  open={open} 
  setOpen={setOpen} 
  onClose={() => {
    setOpen(false);
  }} 
/>
    </nav>
  );
}