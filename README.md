# HeiDenti

A decentralized digital identity management platform built on Hedera, designed to streamline identity verification and document management for global citizens.

## Overview

HeiDenti transforms the complex process of identity management and verification into a seamless, secure experience using Hedera's distributed ledger technology. The platform enables users to maintain control of their digital identity while providing verifiers with trusted, immutable verification channels.

### Key Features

- **Decentralized Identity Wallet**

  - Secure storage of verifiable credentials
  - Self-sovereign identity management
  - Document submission and tracking
  - Real-time verification status
- **Verification Portal**

  - Multi-party verification workflow
  - Automated credential validation
  - Compliance tracking dashboard
  - Audit trail management
- **Smart Document Management**

  - Hedera Topic-based document indexing
  - Encrypted document storage
  - Automatic expiration tracking
  - Cross-reference verification

### Benefits

- **For Users**

  - Single source of truth for identity documents
  - Reduced paperwork and manual processes
  - Real-time status tracking
  - Enhanced privacy and security
- **For Verifiers**

  - Streamlined verification workflows
  - Reduced fraud risk
  - Automated compliance checks
  - Immutable audit trails

## Technical Architecture

Sample ENV

```
VITE_MY_ACCOUNT_ID=0.0.5173126

VITE_MY_PRIVATE_KEY=

AUTH_CONTRACT_ADDRESS_TESTNET=0x278873527F6F3B789141FA842317224866e946eE

AUTH_CONTRACT_ID_TESTNET=0.0.5192447

VITE_MY_ADMIN_KEY=3030020100300706052b8104000a04220420f6f1c42277868d1a8560a067a2fc795f2365b2ab1af34af587f4591e233de37e

VITE_INSTITUTION_TOPIC_ID=0.0.5203908

VITE_CREDENTIAL_TOPIC_ID=0.0.5203911

#app topic

VITE_APP_TOPIC_ID=0.0.5215047


```

# Topics

### Core Components

1. **Hedera Infrastructure**

   - Topics for document metadata storage
   - Tokens for access control
   - Smart contracts for verification logic
   - HCS for secure messaging
2. **Backend Services**

   - Identity management service
   - Verification orchestration
   - Document processing engine
   - Analytics and reporting
3. **Frontend Applications**

   - User wallet interface
   - Verifier dashboard
   - Admin control panel

### Security Features

- End-to-end encryption
- Zero-knowledge proofs
- Multi-factor authentication
- Granular access control

## Use Cases

1. **Immigration & Visa Processing**

   - Document submission
   - Status tracking
   - Multi-agency verification
2. **Banking & Financial Services**

   - KYC/AML compliance
   - Account opening
   - Credit verification
3. **Employment Verification**

   - Background checks
   - Credential validation
   - Work authorization

## Getting Started

See [TECHME.md](./TECHME.md) for detailed setup and deployment instructions.

## License

MIT

---
