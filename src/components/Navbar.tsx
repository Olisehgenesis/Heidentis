import React, { useEffect, useState } from 'react';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { WalletSelectionDialog } from './WalletSelectionDialog';
import { Shield, Key, ChevronDown, User, Building2, FileText, Settings, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  href?: string;
  items?: NavItem[];
  icon?: React.ReactNode;
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { accountId, walletInterface } = useWalletInterface();
  const location = useLocation();

  const navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/',
      icon: <Home className="w-4 h-4" />
    },
    {
      label: 'Identity',
      icon: <User className="w-4 h-4" />,
      items: [
        { label: 'Wallet', href: '/app/wallet' },
        { label: 'Credentials', href: '/app/credentials' }
      ]
    },
    {
      label: 'Institutions',
      icon: <Building2 className="w-4 h-4" />,
      items: [
        { label: 'View All', href: '/app/institutions' },
        { label: 'Register New', href: '/app/institutions/register' },
        { label: 'My Institutions', href: '/app/admin/myinstitutions' }
      ]
    },
    {
      label: 'Administration',
      icon: <Settings className="w-4 h-4" />,
      items: [
        { label: 'Admin Dashboard', href: '/app/admin' },
        { label: 'Topic Setup', href: '/admin/topics-setup' },
        { label: 'Issuer Dashboard', href: '/app/issuer' }
      ]
    }
  ];

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

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-blue-700/50 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-400" />
                <Key className="h-8 w-8 text-indigo-400 -ml-4" />
              </div>
              <div className="flex flex-col ml-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 inline-block text-transparent bg-clip-text">
                  He-identis
                </h1>
                <p className="text-xs text-blue-300/80">
                  Redefining Digital Trust
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.href ? (
                  <Link
                    to={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-100 hover:text-white rounded-md transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    className="flex items-center space-x-2 px-3 py-2 text-blue-100 hover:text-white rounded-md transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {item.items && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 w-48 py-2 mt-1 bg-white rounded-md shadow-lg">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.href || '#'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
        onClose={() => setOpen(false)} 
      />
    </nav>
  );
}