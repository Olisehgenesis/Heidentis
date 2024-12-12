import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCredentialForms } from '@/hooks/useCredentialForms';
import { useInstitutions } from '@/hooks/useInstitutions';
import { Loader2, FileText, ArrowRight, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PublicInstitutionForms = () => {
  const { did } = useParams();
  const navigate = useNavigate();
  const { getInstitutionById } = useInstitutions();
  const { getFormsByInstitution, loading, error } = useCredentialForms();
  const [institution, setInstitution] = useState(null);
  const [forms, setForms] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const institutionData = await getInstitutionById(did);
     
      setInstitution(institutionData);
      if (institutionData) {
        const formsData = await getFormsByInstitution(did);
        console.log(institutionData);
        setForms(formsData.filter(form => form.active));
      }
    };
    loadData();
  }, [did]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Institution Not Found</h1>
        <p className="text-gray-600">The institution you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => navigate('/app/institutions')}>
          Back to Institutions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Institution Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{institution.name}</h1>
            <p className="text-gray-600 max-w-2xl">{institution.description}</p>
          </div>
          <Badge variant="outline" className="text-base">
            {institution.type}
          </Badge>
        </div>
      </div>

      {/* Available Forms */}
      <h2 className="text-xl font-semibold mb-6">Available Credential Forms</h2>
      
      {forms.length === 0 ? (
        <Card className="p-6 text-center">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No credential forms are currently available</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card 
              key={form.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/apply/${did}/forms/${form.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    {form.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {form.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Required Fields: {form.fields.length}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Required Documents: {form.required?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full group">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicInstitutionForms;