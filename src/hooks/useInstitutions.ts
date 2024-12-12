// hooks/useInstitutions.ts
import { useState } from 'react';
import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { MirrorNodeClient } from '@/services/wallets/mirrorNodeClient';
import { NetworkConfig } from './useNetworkConfig';



// Helper function to decode base64 messages
const decodeBase64 = (base64String: string): string | null => {
  try {
    // First, decode base64 to binary string
    const binaryString = atob(base64String);
    // Convert binary string to Uint8Array
    const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
    // Decode the Uint8Array to text using TextDecoder
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    console.error('Error decoding base64:', error);
    return null;
  }
};

export interface Institution {
  did: string;
  name: string;
  type: string;
  status: string;
  creatorId: string;
  registeredAt: string;
  description?: string;
  messageId?: number;
  timestamp?: string;
  topicId: string;  // This is important!
}

export const useInstitutions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mirrorNodeClient = new MirrorNodeClient(NetworkConfig);

  const getInstitutions = async (): Promise<Institution[]> => {
    try {
      setLoading(true);
      setError(null);
      const topicId = import.meta.env.VITE_INSTITUTION_TOPIC_ID;
      
      if (!topicId) {
        throw new Error('Institution topic ID not configured');
      }

      const response = await fetch(
        `${mirrorNodeClient.url}/api/v1/topics/${topicId}/messages?limit=100&order=desc`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const institutions: Institution[] = [];

      // Process initial page
      const initialInstitutions = processMessages(data.messages);
      institutions.push(...initialInstitutions);

      // Handle pagination
      let nextLink = data.links?.next;
      while (nextLink) {
        const nextResponse = await fetch(`${mirrorNodeClient.url}${nextLink}`);
        if (!nextResponse.ok) {
          throw new Error(`HTTP error! status: ${nextResponse.status}`);
        }
        const nextData = await nextResponse.json();
        const nextInstitutions = processMessages(nextData.messages);
        institutions.push(...nextInstitutions);
        nextLink = nextData.links?.next;
      }

      return institutions;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching institutions:', err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const processMessages = (messages: any[]): Institution[] => {
    return messages
      .map(msg => {
        try {
          const decoded = decodeBase64(msg.message);
          if (!decoded) return null;
          
          const parsed = JSON.parse(decoded);
          
          if (parsed.type === 'INSTITUTION_REGISTRATION') {
            return {
              ...parsed.data,
              messageId: msg.sequence_number,
              timestamp: new Date(parseInt(msg.consensus_timestamp) * 1000).toISOString()
            };
          }
          return null;
        } catch (err) {
          console.error('Error parsing message:', err, msg);
          return null;
        }
      })
      .filter((inst): inst is Institution => inst !== null);
  };

  const registerInstitution = async (institutionData: Omit<Institution, 'messageId' | 'timestamp'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const client = Client.forTestnet();

      const accountId = import.meta.env.VITE_MY_ACCOUNT_ID;
      const privateKey = import.meta.env.VITE_MY_PRIVATE_KEY;

      if (!accountId || !privateKey) {
        throw new Error('Account credentials not configured');
      }

      client.setOperator(accountId, privateKey);

      const message = {
        type: 'INSTITUTION_REGISTRATION',
        data: {
          ...institutionData,
          registeredAt: new Date().toISOString(),
          status: institutionData.status || 'pending'
        }
      };

      const topicId = import.meta.env.VITE_INSTITUTION_TOPIC_ID;
      if (!topicId) {
        throw new Error('Institution topic ID not configured');
      }

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(JSON.stringify(message))
        .execute(client);

      const receipt = await transaction.getReceipt(client);

      // Wait for mirror node to sync (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return {
        success: true,
        receipt,
        institutionData: message.data
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      console.error('Registration failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionById = async (did: string): Promise<Institution | null> => {
    try {
      setLoading(true);
      setError(null);
      const topicId = import.meta.env.VITE_INSTITUTION_TOPIC_ID;
      
      if (!topicId) {
        throw new Error('Institution topic ID not configured');
      }

      // Get messages and find the institution registration message for this DID
      const response = await fetch(
        `${mirrorNodeClient.url}/api/v1/topics/${topicId}/messages?limit=100&order=desc`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let institution: Institution | null = null;
      let latestTimestamp = 0;

      // Process messages to find the latest message for this DID
      for (const msg of data.messages) {
        try {
          const decoded = decodeBase64(msg.message);
          if (!decoded) continue;
          
          const parsed = JSON.parse(decoded);
          
          if (parsed.type === 'INSTITUTION_REGISTRATION' && 
              parsed.data.did === did &&
              parseInt(msg.consensus_timestamp) > latestTimestamp) {
            institution = {
              ...parsed.data,
              messageId: msg.sequence_number,
              timestamp: new Date(parseInt(msg.consensus_timestamp) * 1000).toISOString()
            };
            latestTimestamp = parseInt(msg.consensus_timestamp);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
          continue;
        }
      }

      // Handle pagination only if institution hasn't been found
      let nextLink = data.links?.next;
      while (!institution && nextLink) {
        const nextResponse = await fetch(`${mirrorNodeClient.url}${nextLink}`);
        if (!nextResponse.ok) {
          throw new Error(`HTTP error! status: ${nextResponse.status}`);
        }
        const nextData = await nextResponse.json();
        
        for (const msg of nextData.messages) {
          try {
            const decoded = decodeBase64(msg.message);
            if (!decoded) continue;
            
            const parsed = JSON.parse(decoded);
            
            if (parsed.type === 'INSTITUTION_REGISTRATION' && 
                parsed.data.did === did &&
                parseInt(msg.consensus_timestamp) > latestTimestamp) {
              institution = {
                ...parsed.data,
                messageId: msg.sequence_number,
                timestamp: new Date(parseInt(msg.consensus_timestamp) * 1000).toISOString()
              };
              latestTimestamp = parseInt(msg.consensus_timestamp);
            }
          } catch (err) {
            console.error('Error parsing message:', err);
            continue;
          }
        }
        nextLink = nextData.links?.next;
      }

      // Check for updates to the institution (status changes, etc.)
      const updatesResponse = await fetch(
        `${mirrorNodeClient.url}/api/v1/topics/${institution?.topicId}/messages?limit=100&order=desc`
      );

      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json();
        for (const msg of updatesData.messages) {
          try {
            const decoded = decodeBase64(msg.message);
            if (!decoded) continue;
            
            const parsed = JSON.parse(decoded);
            if (parsed.type === 'INSTITUTION_UPDATE' && 
                parsed.data.did === did &&
                parseInt(msg.consensus_timestamp) > latestTimestamp) {
              institution = {
                ...institution,
                ...parsed.data.updates,
                timestamp: new Date(parseInt(msg.consensus_timestamp) * 1000).toISOString()
              };
            }
          } catch (err) {
            console.error('Error parsing update message:', err);
            continue;
          }
        }
      }

      return institution;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching institution';
      console.error('Error fetching institution by ID:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    registerInstitution, 
    getInstitutions, 
    getInstitutionById,
    loading, 
    error 
  };
};