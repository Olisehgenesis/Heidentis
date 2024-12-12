import React, { useState } from 'react';
import { Plus, Key, RefreshCw, Search, Shield, BadgeCheck, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Identity {
  id: string;
  name: string;
  type: string;
  dateCreated: string;
  status: 'active' | 'pending' | 'revoked';
  lastUsed: string;
}

const IdentityDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample data - would come from your backend
  const identities: Identity[] = [
    {
      id: "did:hedera:testnet:z6MkrGMC...",
      name: "Professional Developer",
      type: "Professional Credential",
      dateCreated: "2024-03-01",
      status: "active",
      lastUsed: "2024-03-15"
    },
    {
      id: "did:hedera:testnet:x8NkrABC...",
      name: "University Degree",
      type: "Educational Credential",
      dateCreated: "2024-02-15",
      status: "active",
      lastUsed: "2024-03-10"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'revoked':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Decentralized Identities</h1>
            <p className="text-slate-400">Manage and monitor your verifiable credentials</p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Identity
            </Button>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="w-5 h-5 mr-2 text-blue-400" />
                Issue Credential
              </CardTitle>
              <CardDescription className="text-slate-400">
                Create and issue new verifiable credentials
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-400" />
                Verify Credential
              </CardTitle>
              <CardDescription className="text-slate-400">
                Verify credentials from other entities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-blue-400" />
                Manage Permissions
              </CardTitle>
              <CardDescription className="text-slate-400">
                Control access to your credentials
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search identities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Identities List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 px-6 py-4 text-sm font-medium">Identity</th>
                  <th className="text-left text-slate-400 px-6 py-4 text-sm font-medium">Type</th>
                  <th className="text-left text-slate-400 px-6 py-4 text-sm font-medium">Created</th>
                  <th className="text-left text-slate-400 px-6 py-4 text-sm font-medium">Status</th>
                  <th className="text-left text-slate-400 px-6 py-4 text-sm font-medium">Last Used</th>
                  <th className="text-left text-slate-400 px-6 py-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {identities.map((identity) => (
                  <tr key={identity.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{identity.name}</div>
                        <div className="text-slate-400 text-sm truncate max-w-xs">{identity.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{identity.type}</td>
                    <td className="px-6 py-4 text-slate-300">{identity.dateCreated}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center ${getStatusColor(identity.status)}`}>
                        <BadgeCheck className="w-4 h-4 mr-1" />
                        {identity.status.charAt(0).toUpperCase() + identity.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{identity.lastUsed}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityDashboard;