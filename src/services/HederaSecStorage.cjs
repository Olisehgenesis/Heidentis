// HederaSecureStorage.js
const { 
  Client, 
  PrivateKey, 
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery
} = require("@hashgraph/sdk");
const crypto = require('crypto');

class HederaSecureStorage {
  constructor(client, appTopicId) {
    this.client = client;
    this.appTopicId = appTopicId;
  }

  static async initialize(client) {
    // Create single topic for the entire app
    const createAppTopic = await new TopicCreateTransaction()
        .setSubmitKey(client.operatorPublicKey)
        .setMemo("Hedera Credential System App Topic")
        .execute(client);
    const receipt = await createAppTopic.getReceipt(client);
    
    return new HederaSecureStorage(client, receipt.topicId);
  }

  // Encryption methods remain the same
  async encryptData(data, publicKey) {
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

  async decryptData(encryptedData, privateKey) {
    const {
      encryptedData: data,
      iv,
      authTag,
      encryptedKey
    } = JSON.parse(encryptedData);

    const symmetricKey = crypto.privateDecrypt(
/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Decrypts the given encrypted data using the given private key.
   *
   * @param {string} encryptedData - The encrypted data to decrypt.
   * @param {PrivateKey} privateKey - The private key to use for decryption.
   *
   * @return {Promise<any>} - A promise that resolves to the decrypted data.
   */
/******  cd466865-a726-48e5-9f91-0a7b97d8c0a1  *******/      {
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

  // Message submission with type
  async submitMessage(type, data) {
    const message = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    const transaction = await new TopicMessageSubmitTransaction()
      .setTopicId(this.appTopicId)
      .setMessage(JSON.stringify(message))
      .execute(this.client);

    return await transaction.getReceipt(this.client);
  }

  // Institution methods
  async storeInstitution(institution) {
    return this.submitMessage('INSTITUTION_REGISTRATION', {
      ...institution,
      createdAt: new Date().toISOString()
    });
  }

  async updateInstitution(did, updates) {
    return this.submitMessage('INSTITUTION_UPDATE', {
      did,
      updates,
      updatedAt: new Date().toISOString()
    });
  }

  // Form methods
  async createForm(institutionDid, formData) {
    return this.submitMessage('FORM_CREATION', {
      institutionDid,
      ...formData,
      id: `form-${Date.now()}`,
      createdAt: new Date().toISOString()
    });
  }

  async updateForm(formId, updates) {
    return this.submitMessage('FORM_UPDATE', {
      formId,
      updates,
      updatedAt: new Date().toISOString()
    });
  }

  // Application methods
  async submitApplication(formId, applicationData) {
    return this.submitMessage('APPLICATION_SUBMISSION', {
      formId,
      ...applicationData,
      id: `app-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    });
  }

  async updateApplicationStatus(applicationId, status, reviewerDid) {
    return this.submitMessage('APPLICATION_STATUS_UPDATE', {
      applicationId,
      status,
      reviewerDid,
      updatedAt: new Date().toISOString()
    });
  }

  // Credential methods
  async issueCredential(applicationId, credentialData) {
    return this.submitMessage('CREDENTIAL_ISSUANCE', {
      applicationId,
      ...credentialData,
      id: `cred-${Date.now()}`,
      issuedAt: new Date().toISOString()
    });
  }

  // Query methods
  async getMessagesByType(type) {
    const query = new TopicMessageQuery()
      .setTopicId(this.appTopicId);

    const messages = [];
    try {
      const responses = await query.execute(this.client);
      for await (const response of responses) {
        try {
          const message = JSON.parse(Buffer.from(response.contents).toString());
          if (message.type === type) {
            messages.push({
              ...message.data,
              consensusTimestamp: response.consensusTimestamp,
              sequenceNumber: response.sequenceNumber
            });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return messages;
  }

  async getLatestMessage(type, filterFn) {
    const query = new TopicMessageQuery()
      .setTopicId(this.appTopicId);

    let latest = null;
    let latestTimestamp = 0;

    try {
      const responses = await query.execute(this.client);
      for await (const response of responses) {
        try {
          const message = JSON.parse(Buffer.from(response.contents).toString());
          if (message.type === type && 
              (!filterFn || filterFn(message.data)) && 
              response.consensusTimestamp > latestTimestamp) {
            latest = {
              ...message.data,
              consensusTimestamp: response.consensusTimestamp,
              sequenceNumber: response.sequenceNumber
            };
            latestTimestamp = response.consensusTimestamp;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return latest;
  }

  // Specific getter methods
  async getInstitution(did) {
    return this.getLatestMessage('INSTITUTION_REGISTRATION', 
      data => data.did === did
    );
  }

  async getAllInstitutions() {
    return this.getMessagesByType('INSTITUTION_REGISTRATION');
  }

  async getForm(formId) {
    return this.getLatestMessage('FORM_CREATION',
      data => data.id === formId
    );
  }

  async getFormsByInstitution(institutionDid) {
    const forms = await this.getMessagesByType('FORM_CREATION');
    return forms.filter(form => form.institutionDid === institutionDid);
  }

  async getApplication(applicationId) {
    return this.getLatestMessage('APPLICATION_SUBMISSION',
      data => data.id === applicationId
    );
  }

  async getCredential(credentialId) {
    return this.getLatestMessage('CREDENTIAL_ISSUANCE',
      data => data.id === credentialId
    );
  }
}

module.exports = HederaSecureStorage;