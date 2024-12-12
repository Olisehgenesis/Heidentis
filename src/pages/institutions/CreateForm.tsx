import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { useCredentialForms } from '@/hooks/useCredentialForms';

const CreateForm = () => {
  const navigate = useNavigate();
  const { createForm, loading } = useCredentialForms();
  const [formFields, setFormFields] = useState([]);
  const { did } = useParams();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: [],
    required: []
  });

  const addField = () => {
    setFormFields([...formFields, {
      name: '',
      label: '',
      type: 'text',
      required: true
    }]);
  };

  const removeField = (index) => {
    const newFields = [...formFields];
    newFields.splice(index, 1);
    setFormFields(newFields);
  };

  const updateField = (index, field) => {
    const newFields = [...formFields];
    newFields[index] = field;
    setFormFields(newFields);
  };

    
  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        if (!did) {
          throw new Error('Institution DID is required');
        }
        
        if (formFields.length === 0) {
          throw new Error('At least one form field is required');
        }
        console.log("Did", did)
        await createForm(did, {
          ...formData,
          fields: formFields
        });
        navigate(`/institution/${did}/forms`);
      } catch (error) {
        console.error('Error creating form:', error);
        setError(error.message);
      }
    };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Credential Form</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            placeholder="Form Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <Textarea
            placeholder="Form Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Form Fields</h2>
            <Button type="button" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </div>

          {formFields.map((field, index) => (
            <Card key={index}>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                <Input
                  placeholder="Field Name"
                  value={field.name}
                  onChange={(e) => updateField(index, {...field, name: e.target.value})}
                />
                <Input
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => updateField(index, {...field, label: e.target.value})}
                />
                <Select
                  value={field.type}
                  onValueChange={(value) => updateField(index, {...field, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Field Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  type="button"
                  variant="destructive"
                  onClick={() => removeField(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/institution/forms')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateForm;