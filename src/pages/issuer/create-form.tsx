// src/pages/issuer/CreateForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Hand } from 'lucide-react';
import { useWalletInterface } from '@/services/wallets/useWalletInterface';
import { useFormBuilder } from '@/hooks/useFormBuilder';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'file', label: 'File Upload' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'url', label: 'URL' }
];

const CreateForm = () => {
  const navigate = useNavigate();
  const { accountId } = useWalletInterface();
  const { createForm, loading } = useFormBuilder(storage);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    fields: []
  });

  const [currentField, setCurrentField] = useState({
    name: '',
    type: 'text',
    required: true,
    options: '', // For select type fields
    validation: '', // For custom validation
    placeholder: ''
  });

  const handleAddField = () => {
    if (!currentField.name) return;

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, {
        ...currentField,
        id: Date.now(),
        options: currentField.options ? currentField.options.split(',').map(opt => opt.trim()) : []
      }]
    }));

    setCurrentField({
      name: '',
      type: 'text',
      required: true,
      options: '',
      validation: '',
      placeholder: ''
    });
  };

  const handleRemoveField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await createForm({
        ...formData,
        creatorId: accountId,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      navigate('/issuer');
    } catch (error) {
      console.error('Error creating form:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Form</h1>
        <Button variant="outline" onClick={() => navigate('/issuer')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Form Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Enter form name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Enter form description"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isPublic: checked
                }))}
              />
              <Label htmlFor="public">Make form public</Label>
            </div>
          </CardContent>
        </Card>

        {/* Add Field Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add Field</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                value={currentField.name}
                onChange={(e) => setCurrentField(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Enter field name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select
                value={currentField.type}
                onValueChange={(value) => setCurrentField(prev => ({
                  ...prev,
                  type: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentField.type === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="options">Options (comma-separated)</Label>
                <Input
                  id="options"
                  value={currentField.options}
                  onChange={(e) => setCurrentField(prev => ({
                    ...prev,
                    options: e.target.value
                  }))}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={currentField.placeholder}
                onChange={(e) => setCurrentField(prev => ({
                  ...prev,
                  placeholder: e.target.value
                }))}
                placeholder="Enter placeholder text"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={currentField.required}
                onCheckedChange={(checked) => setCurrentField(prev => ({
                  ...prev,
                  required: checked
                }))}
              />
              <Label htmlFor="required">Required field</Label>
            </div>

            <Button 
              onClick={handleAddField}
              className="w-full"
              disabled={!currentField.name}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Field Preview Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.fields.length === 0 ? (
            <p className="text-center text-gray-500">No fields added yet</p>
          ) : (
            <div className="space-y-4">
              {formData.fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Hand className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-medium">{field.name}</p>
                      <div className="flex space-x-2 mt-1">
                        <Badge>{field.type}</Badge>
                        {field.required && (
                          <Badge variant="secondary">Required</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveField(field.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={loading || formData.fields.length === 0 || !formData.name}
              className="w-full"
            >
              {loading ? 'Creating Form...' : 'Create Form'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateForm;