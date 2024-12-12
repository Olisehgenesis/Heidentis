// hooks/useMyInstitutions.ts
import { useState } from 'react';
import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { MirrorNodeClient } from '@/services/wallets/mirrorNodeClient';
import { NetworkConfig } from './useNetworkConfig';

export interface InstitutionContact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface InstitutionAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Institution {
  id: string;                    // Unique identifier
  name: string;                  // Institution name
  type: 'GOVERNMENT' | 'EDUCATION' | 'FINANCIAL' | 'HEALTHCARE' | 'CORPORATE';
  description: string;           // Detailed description
  category: string;              // Sub-category within type
  website: string;               // Official website
  logo?: string;                 // Base64 encoded logo
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  verificationLevel: 'basic' | 'verified' | 'premium';
  contact: InstitutionContact;   // Primary contact
  address: InstitutionAddress;   // Physical address
  creatorId: string;            // Account ID of creator
  createdAt: string;
  updatedAt: string;
  topicId: string;              // Institution's HCS topic ID
  documents?: {                  // Optional verification documents
    registrationCert?: string;
    taxId?: string;
    license?: string;
  };
}

export const useMyInstitutions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mirrorNodeClient = new MirrorNodeClient(NetworkConfig);
  const connectedAccountId = import.meta.env.VITE_MY_ACCOUNT_ID;

  const getMyInstitutions = async (): Promise<Institution[]> => {
    try {
      setLoading(true);
      const topicId = import.meta.env.VITE_APP_TOPIC_ID;
      
      const response = await fetch(
        `${mirrorNodeClient.url}/api/v1/topics/${topicId}/messages?limit=100`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch institutions');
      }

      const data = await response.json();
      const institutions: Institution[] = [];
      const institutionsMap = new Map<string, Institution>();

      // Process messages to get latest state of each institution
      for (const msg of data.messages) {
        try {
          const decoded = atob(msg.message);
          const parsed = JSON.parse(decoded);

          if (parsed.type === 'INSTITUTION_REGISTRATION' && 
              parsed.data.creatorId === connectedAccountId) {
            institutionsMap.set(parsed.data.id, {
              ...parsed.data,
              timestamp: new Date(parseInt(msg.consensus_timestamp) * 1000).toISOString()
            });
          } else if (parsed.type === 'INSTITUTION_UPDATE') {
            const institution = institutionsMap.get(parsed.data.id);
            if (institution && institution.creatorId === connectedAccountId) {
              institutionsMap.set(parsed.data.id, {
                ...institution,
                ...parsed.data.updates,
                updatedAt: new Date(parseInt(msg.consensus_timestamp) * 1000).toISOString()
              });
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      }

      return Array.from(institutionsMap.values());
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createInstitution = async (institutionData: Omit<Institution, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'status'>) => {
    try {
      setLoading(true);
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );

      // Create a new topic for the institution
      const createTopicTx = await new TopicCreateTransaction()
        .setSubmitKey(client.operatorPublicKey)
        .setMemo(`Institution Topic - ${institutionData.name}`)
        .execute(client);
      const receipt = await createTopicTx.getReceipt(client);
      const institutionTopicId = receipt.topicId;

      const message = {
        type: 'INSTITUTION_REGISTRATION',
        data: {
          ...institutionData,
          id: `inst-${Date.now()}`,
          creatorId: connectedAccountId,
          status: 'pending',
          topicId: institutionTopicId.toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      const submitTx = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(import.meta.env.VITE_APP_TOPIC_ID))
        .setMessage(JSON.stringify(message))
        .execute(client);

      await submitTx.getReceipt(client);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return message.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInstitution = async (institutionId: string, updates: Partial<Institution>) => {
    try {
      setLoading(true);
      const client = Client.forTestnet();
      client.setOperator(
        import.meta.env.VITE_MY_ACCOUNT_ID,
        import.meta.env.VITE_MY_PRIVATE_KEY
      );

      const message = {
        type: 'INSTITUTION_UPDATE',
        data: {
          id: institutionId,
          updates: {
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      };

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(import.meta.env.VITE_APP_TOPIC_ID))
        .setMessage(JSON.stringify(message))
        .execute(client);

      await transaction.getReceipt(client);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateInstitution = async (institutionId: string) => {
    return updateInstitution(institutionId, { status: 'inactive' });
  };

  return {
    getMyInstitutions,
    createInstitution,
    updateInstitution,
    deactivateInstitution,
    loading,
    error
  };
};