import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar,
  Pencil,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useCredentialForms } from '@/hooks/useCredentialForms';
import { Loader2 } from 'lucide-react';

const InstitutionForms = () => {
  const navigate = useNavigate();
  const { forms, loading, error, loadForms, deleteForm } = useCredentialForms();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const handleDelete = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      setDeleteLoading(formId);
      try {
        await deleteForm(formId);
        await loadForms(); // Reload the forms after deletion
      } finally {
        setDeleteLoading(null);
      }
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
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Credential Forms</h1>
        <Button onClick={() => navigate('/institution/forms/create')}>
          <Plus className="mr-2 h-4 w-4" /> Create New Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Forms Created Yet</h3>
            <p className="text-gray-500 mb-4">Create your first credential form to start accepting applications</p>
            <Button onClick={() => navigate('/institution/forms/create')}>
              <Plus className="mr-2 h-4 w-4" /> Create Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    {form.name}
                  </CardTitle>
                  <Badge variant={form.active ? "default" : "secondary"}>
                    {form.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{form.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="mr-2 h-4 w-4" />
                    {form.applicationCount || 0} Applications
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Created {new Date(form.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/institution/forms/${form.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDelete(form.id)}
                  disabled={deleteLoading === form.id}
                >
                  {deleteLoading === form.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionForms;