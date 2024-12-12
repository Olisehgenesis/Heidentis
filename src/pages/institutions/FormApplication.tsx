import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { useCredentialForms } from '@/hooks/useCredentialForms';
import { useInstitutions } from '@/hooks/useInstitutions';
import { useToast } from '@/hooks/use-toast';

const FormApplication = () => {
  const { did, formId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getFormById } = useCredentialForms();
  const { getInstitutionById } = useInstitutions();
  const [form, setForm] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const [formData, institutionData] = await Promise.all([
        getFormById(formId),
        getInstitutionById(did)
      ]);
      setForm(formData);
      setInstitution(institutionData);
      setLoading(false);
    };
    loadData();
  }, [formId, did]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFileChange = (fieldName, file) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Implement file upload and credential creation
      // 1. Upload files to storage
      // 2. Create verifiable credential
      // 3. Submit application

      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });

      navigate(`/applications/status/${formId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!form || !institution) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Form Not Found</h1>
        <Button onClick={() => navigate(`/apply/${did}/forms`)}>
          Back to Forms
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/apply/${did}/forms`)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forms
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          <p className="text-sm text-gray-500">
            Institution: {institution.name}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'file' ? (
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <Input
                      type="file"
                      id={field.name}
                      required={field.required}
                      onChange={(e) => handleFileChange(field.name, e.target.files[0])}
                    />
                  </div>
                ) : (
                  <Input
                    type={field.type}
                    id={field.name}
                    placeholder={field.label}
                    required={field.required}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormApplication;