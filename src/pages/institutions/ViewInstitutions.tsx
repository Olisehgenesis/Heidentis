import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInstitutions } from '@/hooks/useInstitutions';
import { Loader2, RefreshCcw, ExternalLink, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ViewInstitutions = () => {
  const navigate = useNavigate();
  const { getInstitutions, loading, error } = useInstitutions();
  const [institutions, setInstitutions] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const connectedAccountId = import.meta.env.VITE_MY_ACCOUNT_ID;

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    const data = await getInstitutions();
    setInstitutions(data);
    setLastRefresh(new Date());
  };

  const handleRefresh = () => {
    loadInstitutions();
  };

  const getBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        <p>Error loading institutions: {error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registered Institutions</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {institutions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No institutions registered yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map((institution) => (
            <Card key={institution.did} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <Building className="h-5 w-5 mt-1 text-gray-500" />
                    <div>
                      <CardTitle className="line-clamp-1">{institution.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(institution.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getBadgeVariant(institution.status)}>
                    {institution.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-sm">{institution.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">DID</p>
                    <p className="text-sm font-mono break-all truncate" title={institution.did}>
                      {institution.did}
                    </p>
                  </div>
                  {institution.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm line-clamp-2">{institution.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/apply/${institution.did}/forms`)}
                  className="flex-1"
                >
                  Apply
                </Button>
                {connectedAccountId === institution.creatorId && (
                  <Button 
                    onClick={() => navigate(`/${institution.did}/institution/dashboard`)}
                    className="flex-1"
                  >
                    Dashboard
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewInstitutions;