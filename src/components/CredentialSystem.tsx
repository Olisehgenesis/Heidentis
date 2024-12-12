// File: src/components/CredentialSystem.tsx
import React, { useState, useEffect } from 'react';
import { Client } from '@hashgraph/sdk';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HederaSecureStorage } from '@/services/HederaSecStorage';
import type { Institution, CredentialRequest } from '../types/storage';

const CredentialSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('institutions');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [applicationData, setApplicationData] = useState<Record<string, string>>({});
  const [userCredentials, setUserCredentials] = useState<CredentialRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storage, setStorage] = useState<HederaSecureStorage | null>(null);

  useEffect(() => {
    initializeHedera();
  }, []);

  const initializeHedera = async () => {
    try {
      setLoading(true);
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID!,
        import.meta.env.VITE_MY_PRIVATE_KEY!
      );
      const storageInstance = await HederaSecureStorage.initialize(client);
      setStorage(storageInstance);
      await fetchInstitutions(storageInstance);
    } catch (err) {
      setError('Failed to initialize Hedera connection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async (storageInstance: HederaSecureStorage) => {
    try {
      setLoading(true);
      const institutions = await storageInstance.getAllInstitutions();
      setInstitutions(institutions);
    } catch (err) {
      setError('Failed to fetch institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionSelect = (institution: Institution) => {
    setSelectedInstitution(institution);
    setActiveTab('apply');
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storage || !selectedInstitution) return;

    try {
      setLoading(true);
      const request: CredentialRequest = {
        id: `req-${Date.now()}`,
        userDid: 'your-did-here', // In production, this would come from user's wallet
        institutionDid: selectedInstitution.did,
        credentialTypeId: selectedInstitution.issuableCredentials[0].id,
        status: 'pending',
        dateRequested: new Date().toISOString(),
        encryptedData: await storage.encryptData(
          applicationData,
          selectedInstitution.publicKey as any // Type assertion needed due to string conversion
        )
      };

      await storage.storeCredentialRequest(request);
      setActiveTab('credentials');
    } catch (err) {
      setError('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription> {error} </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="apply">Apply</TabsTrigger>
          <TabsTrigger value="credentials">My Credentials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="institutions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((institution) => (
              <Card 
                key={institution.did} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleInstitutionSelect(institution)}
              >
                <CardHeader>
                  <CardTitle>{institution.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{institution.type}</p>
                  <div className="mt-4">
                    <h4 className="font-semibold">Available Credentials:</h4>
                    <ul className="list-disc list-inside">
                      {institution.issuableCredentials.map(cred => (
                        <li key={cred.id}>{cred.name}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="apply">
          {selectedInstitution ? (
            <form onSubmit={handleApplicationSubmit} className="space-y-4">
              {selectedInstitution.issuableCredentials[0].requiredFields.map(field => (
                <div key={field}>
                  <Label htmlFor={field}>{field}</Label>
                  <Input
                    id={field}
                    value={applicationData[field] || ''}
                    onChange={(e) => setApplicationData({
                      ...applicationData,
                      [field]: e.target.value
                    })}
                    required
                  />
                </div>
              ))}
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          ) : (
            <p>Please select an institution first</p>
          )}
        </TabsContent>
        
        <TabsContent value="credentials">
          <div className="space-y-4">
            {userCredentials.map(credential => (
              <Card key={credential.id}>
                <CardHeader>
                  <CardTitle>{credential.credentialTypeId}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Status: {credential.status}</p>
                  <p>Issued by: {credential.institutionDid}</p>
                  <p>Date: {new Date(credential.dateRequested).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CredentialSystem;