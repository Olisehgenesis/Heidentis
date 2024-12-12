// src/pages/issuer/IssuerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useWalletInterface } from '@/services/wallets/useWalletInterface';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { HederaSecureStorage } from '@/services/HederaSecStorage';
import { Client, TopicCreateTransaction, TopicId } from '@hashgraph/sdk';

const IssuerDashboard = () => {
  const { accountId } = useWalletInterface();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeHedera();
  }, []);

  const initializeHedera = async () => {
    try {
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_OPERATOR_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );

      const storedFormTopicId = localStorage.getItem('formTopicId');
      const storedSubmissionTopicId = localStorage.getItem('submissionTopicId');

      let formTopicId;
      let submissionTopicId;

      if (!storedFormTopicId) {
        const formTopic = await new TopicCreateTransaction()
          .setSubmitKey(client.operatorPublicKey)
          .setTopicMemo("Credential Forms")
          .execute(client);

        const formReceipt = await formTopic.getReceipt(client);
        formTopicId = formReceipt.topicId;
        localStorage.setItem('formTopicId', formTopicId.toString());
      } else {
        formTopicId = TopicId.fromString(storedFormTopicId);
      }

      if (!storedSubmissionTopicId) {
        const submissionTopic = await new TopicCreateTransaction()
          .setSubmitKey(client.operatorPublicKey)
          .setTopicMemo("Form Submissions")
          .execute(client);

        const submissionReceipt = await submissionTopic.getReceipt(client);
        submissionTopicId = submissionReceipt.topicId;
        localStorage.setItem('submissionTopicId', submissionTopicId.toString());
      } else {
        submissionTopicId = TopicId.fromString(storedSubmissionTopicId);
      }

      const storageInstance = new HederaSecureStorage(client, formTopicId, submissionTopicId);
      setStorage(storageInstance);

      if (accountId) {
        await loadForms(storageInstance);
      }
    } catch (error) {
      console.error('Error initializing Hedera:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadForms = async (storageInstance) => {
    try {
      const issuerForms = await storageInstance.getFormsByIssuer(accountId);
      setForms(issuerForms);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
        <div className="space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/issuer/templates')}
          >
            Use Template
          </Button>
          <Button 
            onClick={() => navigate('/issuer/create-form')}
          >
            Create New Form
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{forms.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {forms.reduce((acc, form) => acc + (form.submissions?.length || 0), 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {forms.filter(form => form.status === 'active').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Form Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.name}</TableCell>
                  <TableCell>
                    <Badge className={
                      form.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {form.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(form.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{form.submissions?.length || 0}</TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/issuer/forms/${form.id}/view`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/issuer/forms/${form.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/issuer/forms/${form.id}/submissions`)}
                      >
                        Submissions
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssuerDashboard;