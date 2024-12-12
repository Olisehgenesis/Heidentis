// pages/RegisterInstitution.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInstitutions } from '@/hooks/useInstitutions';
import { PrivateKey } from '@hashgraph/sdk';
import { useWalletInterface } from '@/services/wallets/useWalletInterface';

  const RegisterInstitution = () => {
    const navigate = useNavigate();
    const { accountId } = useWalletInterface();
    const { registerInstitution } = useInstitutions();
    const [formData, setFormData] = useState({
      name: '',
      type: '',
      description: ''
    });
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("Starting registration...");
      try {
        const privateKey = PrivateKey.generateED25519();
        console.log("Generated private key");
        
        const did = `did:hedera:testnet:${privateKey.publicKey.toString()}`;
        console.log("Generated DID:", did);
     
        const institutionData = {
          did,
          publicKey: privateKey.publicKey.toString(),
          creatorId: accountId,
          ...formData
        };
        console.log("Registration data:", institutionData);
     
        const result = await registerInstitution(institutionData);
        console.log("Registration result:", result);
        
        // Navigate after success
        navigate('/institutions');
      } catch (error) {
        console.error("Registration failed:", error);
      }
    };
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Register Institution</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Institution Name</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Input
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <Button type="submit">Register</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterInstitution;
