import React, { useState, useEffect } from 'react';
import { Client, PrivateKey } from '@hashgraph/sdk';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { HederaSecureStorage } from '../services/HederaSecStorage';

const InstitutionManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [institutions, setInstitutions] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storage, setStorage] = useState(null);
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    type: '',
    adminEmail: '',
    phone: '',
    website: '',
    description: '',
    issuableCredentials: []
  });
  const [newCredential, setNewCredential] = useState({
    name: '',
    schema: '',
    requiredFields: ''
  });

  useEffect(() => {
    initializeHedera();
  }, []);

  const initializeHedera = async () => {
    try {
      setLoading(true);
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_OPERATOR_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
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

  const fetchInstitutions = async (storageInstance) => {
    try {
      const institutions = await storageInstance.getAllInstitutions();
      setInstitutions(institutions);
    } catch (err) {
      setError('Failed to fetch institutions');
    }
  };

  const handleCreateInstitution = async () => {
    try {
      setLoading(true);
      const privateKey = PrivateKey.generateED25519();
      const did = `did:hedera:testnet:${privateKey.publicKey.toString()}`;
      
      const institution = {
        did,
        publicKey: privateKey.publicKey.toString(),
        name: newInstitution.name,
        type: newInstitution.type,
        status: 'pending',
        issuableCredentials: [],
        dateRegistered: new Date().toISOString(),
        encryptedData: await storage.encryptData({
          adminEmail: newInstitution.adminEmail,
          phone: newInstitution.phone,
          website: newInstitution.website,
          description: newInstitution.description
        }, privateKey.publicKey)
      };

      await storage.storeInstitution(institution);
      await fetchInstitutions(storage);
      setNewInstitution({
        name: '',
        type: '',
        adminEmail: '',
        phone: '',
        website: '',
        description: '',
        issuableCredentials: []
      });
    } catch (err) {
      setError('Failed to create institution');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = async (institutionId) => {
    try {
      setLoading(true);
      const institution = institutions.find(i => i.did === institutionId);
      if (!institution) return;

      const updatedInstitution = {
        ...institution,
        issuableCredentials: [
          ...institution.issuableCredentials,
          {
            id: `cred-${Date.now()}`,
            name: newCredential.name,
            schema: newCredential.schema,
            requiredFields: newCredential.requiredFields.split(',').map(f => f.trim())
          }
        ]
      };

      await storage.storeInstitution(updatedInstitution);
      await fetchInstitutions(storage);
      setNewCredential({
        name: '',
        schema: '',
        requiredFields: ''
      });
    } catch (err) {
      setError('Failed to add credential');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (institutionId, newStatus) => {
    try {
      setLoading(true);
      const institution = institutions.find(i => i.did === institutionId);
      if (!institution) return;

      const updatedInstitution = {
        ...institution,
        status: newStatus
      };

      await storage.storeInstitution(updatedInstitution);
      await fetchInstitutions(storage);
    } catch (err) {
      setError(`Failed to update status to ${newStatus}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <config.icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="create">Create Institution</TabsTrigger>
          <TabsTrigger value="manage">Manage Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((institution) => (
              <Card key={institution.did}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {institution.name}
                    {getStatusBadge(institution.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{institution.type}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Credentials:</h4>
                    <ul className="list-disc list-inside">
                      {institution.issuableCredentials.map(cred => (
                        <li key={cred.id}>{cred.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(institution.did, 'verified')}
                      disabled={institution.status === 'verified'}
                    >
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(institution.did, 'rejected')}
                      disabled={institution.status === 'rejected'}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Institution</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Institution Name</Label>
                  <Input
                    id="name"
                    value={newInstitution.name}
                    onChange={(e) => setNewInstitution({
                      ...newInstitution,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={newInstitution.type}
                    onChange={(e) => setNewInstitution({
                      ...newInstitution,
                      type: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={newInstitution.adminEmail}
                    onChange={(e) => setNewInstitution({
                      ...newInstitution,
                      adminEmail: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newInstitution.phone}
                    onChange={(e) => setNewInstitution({
                      ...newInstitution,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={newInstitution.website}
                    onChange={(e) => setNewInstitution({
                      ...newInstitution,
                      website: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newInstitution.description}
                    onChange={(e) => setNewInstitution({
                      ...newInstitution,
                      description: e.target.value
                    })}
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleCreateInstitution}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Institution'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            {institutions.map((institution) => (
              <Card key={institution.did}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {institution.name}
                    {getStatusBadge(institution.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Credential Type
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Credential Type</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="credName">Credential Name</Label>
                          <Input
                            id="credName"
                            value={newCredential.name}
                            onChange={(e) => setNewCredential({
                              ...newCredential,
                              name: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="schema">Schema</Label>
                          <Input
                            id="schema"
                            value={newCredential.schema}
                            onChange={(e) => setNewCredential({
                              ...newCredential,
                              schema: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="requiredFields">
                            Required Fields (comma-separated)
                          </Label>
                          <Input
                            id="requiredFields"
                            value={newCredential.requiredFields}
                            onChange={(e) => setNewCredential({
                              ...newCredential,
                              requiredFields: e.target.value
                            })}
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => handleAddCredential(institution.did)}
                          disabled={loading}
                        >
                          {loading ? 'Adding...' : 'Add Credential Type'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Current Credential Types:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {institution.issuableCredentials.map(cred => (
                        <div 
                          key={cred.id} 
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <h5 className="font-medium">{cred.name}</h5>
                          <p className="text-sm text-gray-600">
                            Required fields: {cred.requiredFields.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutionManagement;