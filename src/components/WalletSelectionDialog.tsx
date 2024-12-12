import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { connectToMetamask } from "../services/wallets/metamask/metamaskClient";
import { openWalletConnectModal } from "../services/wallets/walletconnect/walletConnectClient";
import MetamaskLogo from "../assets/metamask-logo.svg";
import WalletConnectLogo from "../assets/walletconnect-logo.svg";
import { Loader2 } from 'lucide-react';

interface WalletSelectionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: (value: string) => void;
}

export const WalletSelectionDialog = ({ onClose, open, setOpen }: WalletSelectionDialogProps) => {
  const [isWalletConnectLoading, setIsWalletConnectLoading] = useState(false);
  const [isMetamaskLoading, setIsMetamaskLoading] = useState(false);

  const handleWalletConnect = async () => {
    setIsWalletConnectLoading(true);
    try {
      await openWalletConnectModal();
      setOpen(false);
    } catch (error) {
      console.error('WalletConnect error:', error);
    } finally {
      setIsWalletConnectLoading(false);
    }
  };

  const handleMetamask = async () => {
    setIsMetamaskLoading(true);
    try {
      await connectToMetamask();
      setOpen(false);
    } catch (error) {
      console.error('Metamask error:', error);
    } finally {
      setIsMetamaskLoading(false);
    }
  };
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log('Dialog onOpenChange:', isOpen); // Debug log
      if (!isOpen) {
        onClose('');
        setOpen(false);
      }
    }}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Connect Your Wallet
          </h2>
          
          <div className="flex flex-col gap-4">
            {/* WalletConnect Button */}
            <button
              onClick={handleWalletConnect}
              disabled={isWalletConnectLoading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 
                text-white py-3 px-4 rounded-lg transition-all duration-200 
                transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-blue-500/20 translate-y-full 
                transition-transform group-hover:translate-y-0"></div>
              {isWalletConnectLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <img
                  src={WalletConnectLogo}
                  alt="WalletConnect"
                  className="w-6 h-6 object-contain"
                />
              )}
              <span className="font-medium relative z-10">
                {isWalletConnectLoading ? 'Connecting...' : 'WalletConnect'}
              </span>
            </button>

            {/* Metamask Button */}
            <button
              onClick={handleMetamask}
              disabled={isMetamaskLoading}
              className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 
                text-white py-3 px-4 rounded-lg transition-all duration-200 
                transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-orange-400/20 translate-y-full 
                transition-transform group-hover:translate-y-0"></div>
              {isMetamaskLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <img
                  src={MetamaskLogo}
                  alt="Metamask"
                  className="w-6 h-6 object-contain"
                />
              )}
              <span className="font-medium relative z-10">
                {isMetamaskLoading ? 'Connecting...' : 'Metamask'}
              </span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => onClose('')}
            className="mt-6 w-full text-gray-500 hover:text-gray-700 text-sm font-medium 
              transition-colors duration-200 relative group"
          >
            <span className="relative z-10">Cancel</span>
            <div className="absolute inset-0 bg-gray-100 opacity-0 
              group-hover:opacity-100 transition-opacity rounded-lg"></div>
          </button>
        </div>
      </div>
    </Dialog>
  );
};