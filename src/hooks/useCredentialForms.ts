// hooks/useCredentialForms.ts
import { useState } from 'react';
import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { MirrorNodeClient } from '@/services/wallets/mirrorNodeClient';
import { NetworkConfig } from './useNetworkConfig';
import { useInstitutions } from './useInstitutions';


export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'date' | 'file' | 'select' | 'number';
  required: boolean;
  options?: string[];
}

export interface CredentialForm {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  fields: FormField[];
  active: boolean;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
}
// TODO: Add error handling.



export const useCredentialForms = () => {
  const [forms, setForms] = useState<CredentialForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mirrorNodeClient = new MirrorNodeClient(NetworkConfig);
  const { getInstitutionById } = useInstitutions();

  const getFormsByInstitution = async (did: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const institution = await getInstitutionById(did);
      
      if (!institution) {
        throw new Error('Institution not found');
      }
  
      // Using app topic ID for all messages
      const appTopicId = import.meta.env.VITE_APP_TOPIC_ID;
  
      const response = await fetch(
        `${mirrorNodeClient.url}/api/v1/topics/${appTopicId}/messages?limit=100&order=desc`
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch forms data');
      }
  
      const data = await response.json();

      // Track form states
      const formStates = new Map();
  
      // Process messages in reverse to get the latest state
      data.messages.reverse().forEach(msg => {
        try {
          const decoded = atob(msg.message);
          const parsed = JSON.parse(decoded);
          
          if (parsed.data.institutionDid === did) {
            switch (parsed.type) {
              case 'FORM_CREATION':
                formStates.set(parsed.data.id, {
                  ...parsed.data,
                  createdAt: new Date(parseInt(msg.consensus_timestamp) * 1000).toISOString()
                });
                break;
              case 'FORM_UPDATE':
                if (formStates.has(parsed.data.formId)) {
                  formStates.set(parsed.data.formId, {
                    ...formStates.get(parsed.data.formId),
                    ...parsed.data.updates
                  });
                }
                break;
              case 'FORM_DELETION':
                formStates.delete(parsed.data.formId);
                break;
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });
  
      const activeForms = Array.from(formStates.values());
      setForms(activeForms);
      return activeForms;
    } catch (err) {
      setError(err.message);
      console.error('Error loading forms:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const createForm = async (did: string, formData: Omit<CredentialForm, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the institution details
      const institution = await getInstitutionById(did);
      
      if (!institution) {
        throw new Error('Institution not found');
      }

      if (!institution.topicId) {
        throw new Error('Institution topic ID not found');
      }

      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );

      const message = {
        type: 'FORM_CREATION',
        data: {
          ...formData,
          id: `form-${Date.now()}`,
          institutionDid: did,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(institution.topicId))
        .setMessage(JSON.stringify(message))
        .execute(client);

      await transaction.getReceipt(client);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for mirror node sync
      
      await getFormsByInstitution(did); // Reload forms after creation
      return message.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (did: string, formId: string) => {
    try {
      setError(null);
      
      const institution = await getInstitutionById(did);
      
      if (!institution?.topicId) {
        throw new Error('Institution topic ID not found');
      }

      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );

      const message = {
        type: 'FORM_DELETION',
        data: {
          formId,
          deletedAt: new Date().toISOString()
        }
      };

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(institution.topicId))
        .setMessage(JSON.stringify(message))
        .execute(client);

      await transaction.getReceipt(client);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for mirror node sync
      
      await getFormsByInstitution(did); // Reload forms after deletion
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateForm = async (did: string, formId: string, updates: Partial<CredentialForm>) => {
    try {
      setLoading(true);
      setError(null);
      
      const institution = await getInstitutionById(did);
      
      if (!institution?.topicId) {
        throw new Error('Institution topic ID not found');
      }

      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );

      const message = {
        type: 'FORM_UPDATE',
        data: {
          formId,
          updates: {
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      };

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(institution.topicId))
        .setMessage(JSON.stringify(message))
        .execute(client);

      await transaction.getReceipt(client);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for mirror node sync
      
      await getFormsByInstitution(did); // Reload forms after update
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    forms,
    loading,
    error,
    getFormsByInstitution,
    createForm,
    updateForm,
    deleteForm
  };
};
