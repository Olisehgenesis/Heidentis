import { 
    Client, 
    PrivateKey, 
    PublicKey,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    TopicId,
    TopicMessageQuery
  } from '@hashgraph/sdk';
  import { SecureStorage, Institution, CredentialRequest } from '../types/storage';
  import * as crypto from 'crypto';
  
  export class HederaSecureStorage implements SecureStorage {
    private client: Client;
    private institutionTopicId: TopicId;
    private requestTopicId: TopicId;
  
    constructor(client: Client, institutionTopicId: TopicId, requestTopicId: TopicId) {
      this.client = client;
      this.institutionTopicId = institutionTopicId;
      this.requestTopicId = requestTopicId;
    }
  
    static async initialize(client: Client): Promise<HederaSecureStorage> {
      const institutionTopic = await new TopicCreateTransaction()
        .setAdminKey(client.operatorPublicKey)
        .setTopicMemo("Institutions")
        .execute(client);
      
      const requestTopic = await new TopicCreateTransaction()
        .setAdminKey(client.operatorPublicKey)
        .setTopicMemo("Credential Requests")
        .execute(client);
  
      const institutionReceipt = await institutionTopic.getReceipt(client);
      const requestReceipt = await requestTopic.getReceipt(client);
  
      return new HederaSecureStorage(
        client,
        institutionReceipt.topicId,
        requestReceipt.topicId
      );
    }
  
    async encryptData(data: any, publicKey: PublicKey): Promise<string> {
      const symmetricKey = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
      
      let encryptedData = cipher.update(JSON.stringify(data), 'utf8', 'base64');
      encryptedData += cipher.final('base64');
      const authTag = cipher.getAuthTag();
  
      const encryptedSymmetricKey = crypto.publicEncrypt(
        {
          key: publicKey.toStringDer(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        symmetricKey
      );
  
      return JSON.stringify({
        encryptedData,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        encryptedKey: encryptedSymmetricKey.toString('base64')
      });
    }
  
    async decryptData(encryptedData: string, privateKey: PrivateKey): Promise<any> {
      const {
        encryptedData: data,
        iv,
        authTag,
        encryptedKey
      } = JSON.parse(encryptedData);
  
      const symmetricKey = crypto.privateDecrypt(
        {
          key: privateKey.toStringDer(),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        Buffer.from(encryptedKey, 'base64')
      );
  
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        symmetricKey,
        Buffer.from(iv, 'base64')
      );
      
      decipher.setAuthTag(Buffer.from(authTag, 'base64'));
      
      let decrypted = decipher.update(data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
  
      return JSON.parse(decrypted);
    }
  
    async storeInstitution(institution: Institution): Promise<void> {
      const message = await new TopicMessageSubmitTransaction()
        .setTopicId(this.institutionTopicId)
        .setMessage(JSON.stringify(institution))
        .execute(this.client);
  
      await message.getReceipt(this.client);
    }
  
    async getInstitution(did: string): Promise<Institution | null> {
      const query = new TopicMessageQuery()
        .setTopicId(this.institutionTopicId);
  
      try {
        const messages = await query.execute(this.client);
        for await (const message of messages) {
          const institution: Institution = JSON.parse(Buffer.from(message.contents).toString());
          if (institution.did === did) {
            return institution;
          }
        }
      } catch (error) {
        console.error('Error fetching institution:', error);
      }
  
      return null;
    }
  
    
  
    async storeCredentialRequest(request: CredentialRequest): Promise<void> {
      const message = await new TopicMessageSubmitTransaction()
        .setTopicId(this.requestTopicId)
        .setMessage(JSON.stringify(request))
        .execute(this.client);
  
      await message.getReceipt(this.client);
    }
  
    async getCredentialRequest(id: string): Promise<CredentialRequest | null> {
      const query = new TopicMessageQuery()
        .setTopicId(this.requestTopicId);
  
      try {
        const messages = await query.execute(this.client);
        for await (const message of messages) {
          const request: CredentialRequest = JSON.parse(Buffer.from(message.contents).toString());
          if (request.id === id) {
            return request;
          }
        }
      } catch (error) {
        console.error('Error fetching credential request:', error);
      }
  
      return null;
    }
    async getAllInstitutions(): Promise<Institution[]> {
      const query = new TopicMessageQuery()
        .setTopicId(this.institutionTopicId);
    
      const institutions: Institution[] = [];
      const seenDIDs = new Set();
      
      try {
        const messages = await query.execute(this.client);
        for await (const message of messages) {
          const institution: Institution = JSON.parse(Buffer.from(message.contents).toString());
          
          // Keep only the latest version of each institution
          if (seenDIDs.has(institution.did)) {
            const index = institutions.findIndex(i => i.did === institution.did);
            if (index !== -1) {
              institutions[index] = institution;
            }
          } else {
            seenDIDs.add(institution.did);
            institutions.push(institution);
          }
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
        throw error;
      }
  
      return institutions;
    }
  
    async updateInstitutionStatus(did: string, status: 'pending' | 'verified' | 'rejected'): Promise<void> {
      const institution = await this.getInstitution(did);
      if (!institution) {
        throw new Error('Institution not found');
      }
  
      const updatedInstitution = {
        ...institution,
        status
      };
  
      await this.storeInstitution(updatedInstitution);
    }
  
    async addCredentialType(
      did: string, 
      credentialType: CredentialType
    ): Promise<void> {
      const institution = await this.getInstitution(did);
      if (!institution) {
        throw new Error('Institution not found');
      }
  
      const updatedInstitution = {
        ...institution,
        issuableCredentials: [...institution.issuableCredentials, credentialType]
      };
  
      await this.storeInstitution(updatedInstitution);
    }
   
    
  
    
     // New methods for form management
  async storeForm(form) {
    const message = await new TopicMessageSubmitTransaction()
      .setTopicId(this.institutionTopicId)
      .setMessage(JSON.stringify({
        type: 'FORM',
        data: form
      }))
      .execute(this.client);

    await message.getReceipt(this.client);
    return message.transactionId.toString();
  }

  async getFormsByIssuer(issuerId) {
    const forms = [];
    const query = new TopicMessageQuery()
      .setTopicId(this.institutionTopicId);

    try {
      const messages = await query.execute(this.client);
      for await (const message of messages) {
        const content = JSON.parse(Buffer.from(message.contents).toString());
        if (content.type === 'FORM' && content.data.issuerId === issuerId) {
          forms.push({
            ...content.data,
            transactionId: message.transactionId.toString(),
            timestamp: message.consensusTimestamp.toString()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }

    return forms;
  }

  async getFormSubmissions(formId) {
    const submissions = [];
    const query = new TopicMessageQuery()
      .setTopicId(this.requestTopicId);

    try {
      const messages = await query.execute(this.client);
      for await (const message of messages) {
        const content = JSON.parse(Buffer.from(message.contents).toString());
        if (content.type === 'SUBMISSION' && content.data.formId === formId) {
          submissions.push({
            ...content.data,
            transactionId: message.transactionId.toString(),
            timestamp: message.consensusTimestamp.toString()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }

    return submissions;
  }

  async submitFormResponse(submission) {
    const message = await new TopicMessageSubmitTransaction()
      .setTopicId(this.requestTopicId)
      .setMessage(JSON.stringify({
        type: 'SUBMISSION',
        data: submission
      }))
      .execute(this.client);

    await message.getReceipt(this.client);
    return message.transactionId.toString();
  }

  async updateForm(form) {
    return this.storeForm({
      ...form,
      updatedAt: new Date().toISOString()
    });
  }
  }

    