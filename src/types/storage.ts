// File: src/types/storage.ts
import { PrivateKey, PublicKey } from '@hashgraph/sdk';

export interface Institution {
  did: string;
  publicKey: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  issuableCredentials: CredentialType[];
  dateRegistered: string;
  encryptedData?: string;
  adminEmail?: string;
  phone?: string;
  website?: string;
  description?: string;
}

export interface CredentialType {
  id: string;
  name: string;
  schema: string;
  requiredFields: string[];
}

export interface CredentialRequest {
  id: string;
  userDid: string;
  institutionDid: string;
  credentialTypeId: string;
  status: 'pending' | 'approved' | 'rejected';
  dateRequested: string;
  encryptedData: string;
}

export interface SecureStorage {
  encryptData(data: any, publicKey: PublicKey): Promise<string>;
  decryptData(encryptedData: string, privateKey: PrivateKey): Promise<any>;
  storeInstitution(institution: Institution): Promise<void>;
  getInstitution(did: string): Promise<Institution | null>;
  storeCredentialRequest(request: CredentialRequest): Promise<void>;
  getCredentialRequest(id: string): Promise<CredentialRequest | null>;
  getAllInstitutions(): Promise<Institution[]>;
}

