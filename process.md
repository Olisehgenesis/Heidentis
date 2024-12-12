Here's the flow of credential verification on Hedera:

1. Institution/Issuer Setup
- Create HCS topics for institution registry and credential management
- Register institution with DID and public key
- Store institution data on HCS topic
- Institution status gets verified by system admins

2. Form/Credential Type Creation
- Institution creates credential form template
- Defines required fields and validation rules
- Stores form schema on HCS topic
- Links form to institution's DID

3. Credential Issuance
- User requests credential from institution
- Submits required information
- Institution verifies submitted data
- Institution signs credential with private key
- Store encrypted credential on HCS

4. Credential Verification
- Verifier requests credential proof
- System retrieves credential from HCS
- Validates institution's signature
- Checks credential status
- Verifies credential hasn't been revoked
- Confirms credential matches schema

Key Hedera Components Used:
- HCS (Hedera Consensus Service) for immutable record keeping
- DIDs for identity management
- Topic IDs for organizing different data types
- Public/private key pairs for signing
- Consensus timestamps for proof of existence

Verification relies on:
- Institution's verified status
- Digital signatures
- Timestamp proofs
- Schema validation
- Revocation checking

The entire process creates an auditable, verifiable chain of trust from institution registration through credential verification.