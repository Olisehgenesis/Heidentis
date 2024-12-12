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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyInstitutions, Institution } from '@/hooks/useMyInstitutions';
import { 
  Building2,
  PlusCircle, 
  Edit, 
  Power,
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    Client, 
    TopicCreateTransaction, 
    TopicMessageSubmitTransaction, 
    TopicId 
  } from "@hashgraph/sdk";
const INSTITUTION_TYPES = [
  'GOVERNMENT',
  'EDUCATION',
  'FINANCIAL',
  'HEALTHCARE',
  'CORPORATE'
];

const defaultInstitution = {
  contact: { email: '', phone: '', name: '', role: '' },
  address: { city: '', country: '', state: '', street: '', postalCode: '' },
  status: 'pending'
};

const CreateInstitutionDialog = ({ isOpen, onOpenChange, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    website: '',
    contact: {
      name: '',
      email: '',
      phone: '',
      role: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    }
  });
  const [logo, setLogo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [section, key] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );
  
      const appTopicId = import.meta.env.VITE_APP_TOPIC_ID;
  
      // Submit to app topic
      const message = {
        type: 'INSTITUTION_REGISTRATION',
        data: {
          ...formData,
          id: `inst-${Date.now()}`,
          logo,
          status: 'pending',
          createdAt: new Date().toISOString(),
          creatorId: import.meta.env.VITE_MY_ACCOUNT_ID
        }
      };
  
      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(appTopicId))
        .setMessage(JSON.stringify(message))
        .execute(client);
  
      await transaction.getReceipt(client);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for mirror node sync
  
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Institution created successfully"
      });
    } catch (error) {
      console.error('Error creating institution:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create institution",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
      
        <DialogHeader>
          <DialogTitle>Create New Institution</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new institution
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label>Basic Information</Label>
              <Input
                placeholder="Institution Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              <Input
                placeholder="Website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label>Contact Information</Label>
              <Input
                placeholder="Contact Name"
                value={formData.contact.name}
                onChange={(e) => handleInputChange('contact.name', e.target.value)}
                required
              />
              <Input
                placeholder="Contact Email"
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                required
              />
              <Input
                placeholder="Contact Phone"
                value={formData.contact.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                required
              />
              <Input
                placeholder="Contact Role"
                value={formData.contact.role}
                onChange={(e) => handleInputChange('contact.role', e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Street Address"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                />
                <Input
                  placeholder="State/Province"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                />
                <Input
                  placeholder="Postal Code"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Institution Logo</Label>
              <div className="flex items-center gap-4">
                {logo ? (
                  <img src={logo} alt="Preview" className="w-16 h-16 rounded object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Institution'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MyInstitutions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getMyInstitutions, createInstitution, deactivateInstitution, loading, error } = useMyInstitutions();
  const [institutions, setInstitutions] = useState([]);
  const [deactivating, setDeactivating] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    const data = await getMyInstitutions();
    const processedData = data.map(inst => ({
      ...defaultInstitution,
      ...inst
    }));
    setInstitutions(processedData);
  };

  const handleCreate = async (data) => {
    try {
      await createInstitution(data);
      await loadInstitutions();
      toast({
        title: "Success",
        description: "Institution created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create institution",
        variant: "destructive"
      });
    }
  };

  const handleDeactivate = async (institutionId) => {
    if (confirm('Are you sure you want to deactivate this institution?')) {
      try {
        setDeactivating(institutionId);
        await deactivateInstitution(institutionId);
        toast({
          title: 'Success',
          description: 'Institution deactivated successfully'
        });
        await loadInstitutions();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to deactivate institution',
          variant: 'destructive'
        });
      } finally {
        setDeactivating(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Institutions</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Institution
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {institutions.map((institution) => (
          <Card key={institution.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-start space-x-4">
                {institution.logo ? (
                  <img 
                    src={institution.logo} 
                    alt={institution.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-400" />
                )}
                <div>
                  <CardTitle>{institution.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(institution.status)}>
                      {institution.status}
                    </Badge>
                    <Badge variant="outline">{institution.type}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{institution.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {institution.website && (
                    <div className="flex items-center text-gray-500">
                      <Globe className="mr-2 h-4 w-4" />
                      <a href={institution.website} target="_blank" rel="noopener noreferrer"
                         className="hover:text-blue-500">
                        Website
                      </a>
                    </div>
                  )}
                  {institution.contact?.email && (
                    <div className="flex items-center text-gray-500">
                      <Mail className="mr-2 h-4 w-4" />
                      {institution.contact.email}
                    </div>
                  )}
                  {institution.contact?.phone && (
                    <div className="flex items-center text-gray-500">
                      <Phone className="mr-2 h-4 w-4" />
                      {institution.contact.phone}
                    </div>
                  )}
                  {(institution.address?.city || institution.address?.country) && (
                    <div className="flex items-center text-gray-500">
                      <MapPin className="mr-2 h-4 w-4" />
                      {[institution.address.city, institution.address.country]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/admin/institutions/${institution.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeactivate(institution.id)}
                disabled={deactivating === institution.id || institution.status === 'inactive'}
              >
                {deactivating === institution.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="mr-2 h-4 w-4" />
                )}
                Deactivate
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {institutions.length === 0 && !loading && (
        <Card className="text-center p-6">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">You haven't created any institutions yet</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            Create Your First Institution
          </Button>
        </Card>
      )}

<CreateInstitutionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default MyInstitutions;