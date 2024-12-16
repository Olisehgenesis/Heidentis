# HeiDenti Setup Guide

## Prerequisites
- [ ] Node.js installed (v16 or higher)
- [ ] Git installed
- [ ] Hedera testnet account (for testing)
- [ ] Basic understanding of JavaScript/Node.js

## Initial Setup Steps

### 1. Clone and Setup
- [ ] Clone the repository
  ```bash
  git clone https://github.com/your-username/heidenti.git
  cd heidenti
  ```
- [ ] Install dependencies
  ```bash
  npm install
  ```

### 2. Environment Configuration
- [ ] Copy example environment file
  ```bash
  cp .env.example .env
  ```
- [ ] Add your Hedera testnet credentials to `.env`:
  ```
  VITE_MY_ACCOUNT_ID=your_testnet_account_id
  VITE_MY_PRIVATE_KEY=your_testnet_private_key
  ```

### 3. Test Topics Setup
- [ ] Run the topics setup script
  ```bash
  node topics.cjs
  ```
- [ ] Verify output shows:
  - Topic creation success
  - Message submission success
  - Message retrieval working
- [ ] Save the generated topic IDs for future use

## Common Issues

### Topic Creation Fails
- Check if you have enough HBAR in your testnet account
- Verify your credentials in .env are correct
- Make sure you're connected to the internet

### Message Submission Errors
- Ensure topic IDs are valid
- Check if messages are properly formatted
- Verify network connectivity

## Next Steps

### 1. Verify Setup
- [ ] Check if topics were created successfully
- [ ] Test message submission
- [ ] Verify message retrieval

### 2. Start Development
- [ ] Review the codebase structure
- [ ] Check the API documentation
- [ ] Set up your development environment

### 3. Testing
- [ ] Run existing tests
  ```bash
  npm test
  ```
- [ ] Add your own test cases

## Need Help?
- Create an issue in the repository
- Check existing issues for solutions
- Contact the maintainers

Remember to never commit your `.env` file with real credentials!


# HeiDenti TODO List

## ✅ Completed
- [x] Set up basic project structure
- [x] Create and deploy Hedera topics
  - Identity Management (ID: 0.0.5226904)
  - Document Storage (ID: 0.0.5226905)
  - Verification Status (ID: 0.0.5226906)
- [x] Implement and deploy smart contracts
  - AccessControl Contract
  - Identity Contract
  - Verification Contract

## 🚀 Next Steps

### 1. Vite Project Setup
- [ ] Initialize Vite project with React
- [ ] Configure Tailwind CSS
- [ ] Set up development environment
- [ ] Create folder structure for frontend/backend

### 2. Core Features
- [ ] Identity Management
  - [ ] User registration/login
  - [ ] Profile management
  - [ ] Document upload interface
  - [ ] Status tracking

- [ ] Document Handling
  - [ ] Upload system
  - [ ] Document verification flow
  - [ ] Status updates
  - [ ] Document history

- [ ] Verification System
  - [ ] Verifier dashboard
  - [ ] Approval workflow
  - [ ] Notification system

### 3. Integration
- [ ] Smart Contract Integration
  - [ ] Contract interaction services
  - [ ] Event listeners
  - [ ] Transaction handling

- [ ] Topic System Integration
  - [ ] Message publishing
  - [ ] Subscription handling
  - [ ] Real-time updates

### 4. Testing & Security
- [ ] Unit Tests
  - [ ] Contract tests
  - [ ] API tests
  - [ ] Component tests

- [ ] Security Implementation
  - [ ] Authentication system
  - [ ] Role-based access
  - [ ] Data encryption

### 5. UI/UX Development
- [ ] Core Components
  - [ ] Navigation
  - [ ] Forms
  - [ ] Modals
  - [ ] Notifications

- [ ] Pages
  - [ ] Dashboard
  - [ ] Profile
  - [ ] Document Management
  - [ ] Verification Interface

## 📋 Project Structure
```
heidenti/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Main application pages
│   ├── contracts/    # Contract interactions
│   ├── topics/       # Topic handlers
│   ├── services/     # Business logic
│   └── utils/        # Helper functions
├── contracts/        # Smart contracts
├── public/          # Static assets
└── tests/           # Test files
```

## 🔍 Important Notes
1. Keep track of topic and contract IDs
2. Regular testing on testnet
3. Document all API endpoints
4. Monitor Hedera token usage
5. Regular security reviews

## 🛠 Development Guidelines
1. Use consistent code style
2. Write tests for new features
3. Document API changes
4. Version control best practices
5. Regular deployments to testnet

## 📚 Documentation Needs
- [ ] API documentation
- [ ] Setup guides
- [ ] User manual
- [ ] Contract documentation
- [ ] Topic system guide