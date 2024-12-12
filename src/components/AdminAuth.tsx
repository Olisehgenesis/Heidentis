// src/components/AdminAuth.tsx
import React, { useState, createContext, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminContextType {
  isAdmin: boolean;
  login: (key: string) => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: async () => {},
  logout: () => {}
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async (key: string) => {
    // In production, verify against Hedera account key
    if (key === import.meta.env.VITE_MY_ADMIN_KEY) {
      setIsAdmin(true);
    } else {
      throw new Error('Invalid admin key');
    }
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const AdminLogin: React.FC = () => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdmin();

  const handleLogin = async () => {
    try {
      await login(key);
    } catch (err) {
      setError('Invalid admin key');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          <div>
            <Label htmlFor="adminKey">Admin Key</Label>
            <Input
              id="adminKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleLogin}>Login</Button>
        </form>
      </CardContent>
    </Card>
  );
};