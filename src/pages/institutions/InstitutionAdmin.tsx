import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useInstitutions } from '@/hooks/useInstitutions';
import { 
  FileText, 
  ClipboardCheck, 
  Settings, 
  Plus,
  Users,
  Loader2,
  Building
} from 'lucide-react';

const InstitutionAdmin = () => {
  const navigate = useNavigate();
  const { did } = useParams();
  const { loading, error, getInstitutionById } = useInstitutions();
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    const loadInstitution = async () => {
      if (did) {
        const institutionData = await getInstitutionById(did);
        setInstitution(institutionData);
      }
    };
    loadInstitution();
  }, [did]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Institution Not Found</h1>
        <p className="text-gray-600">The institution with DID {did} was not found.</p>
        <Button className="mt-4" onClick={() => navigate('/app/institutions')}>
          Back to Institutions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Institution Dashboard</h1>
          <Button onClick={() => navigate(`/${did}/institution/forms/create`)}>
            <Plus className="mr-2 h-4 w-4" /> Create New Form
          </Button>
        </div>
        <div className="flex items-center text-gray-600">
          <Building className="mr-2 h-4 w-4" />
          {institution.name}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          DID: {did}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Forms Management */}
        <Card 
          className="hover:shadow-lg cursor-pointer transition-shadow" 
          onClick={() => navigate(`/${did}/institution/forms`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2" />
              Credential Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage your credential forms and templates</p>
          </CardContent>
        </Card>

        {/* Applications Review */}
        <Card 
          className="hover:shadow-lg cursor-pointer transition-shadow" 
          onClick={() => navigate(`/${did}/institution/applications`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2" />
              Review Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Review pending credential applications</p>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card 
          className="hover:shadow-lg cursor-pointer transition-shadow" 
          onClick={() => navigate(`/${did}/institution/settings`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" />
              Institution Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage institution settings and profile</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md shadow">
            <div className="text-sm text-gray-500">Active Forms</div>
            <div className="text-2xl font-bold">{institution.formCount || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow">
            <div className="text-sm text-gray-500">Pending Applications</div>
            <div className="text-2xl font-bold">{institution.pendingApplications || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow">
            <div className="text-sm text-gray-500">Total Applications</div>
            <div className="text-2xl font-bold">{institution.totalApplications || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionAdmin;