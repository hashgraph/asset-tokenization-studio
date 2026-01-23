---
id: full-setup
title: Full Development Setup
sidebar_label: Full Setup
sidebar_position: 2
---

# Full Development Setup for Mass Payout

Complete guide for setting up the Mass Payout development environment.

## Overview

This guide covers the complete setup process for developers who want to:

- Build and deploy smart contracts
- Integrate the Mass Payout SDK
- Extend or customize the backend API
- Contribute to the Mass Payout codebase
- Deploy the full stack infrastructure

## Prerequisites

- **Node.js**: v24.0.0 or newer (backend requirement)
- **npm**: v10.9.0 or newer
- **PostgreSQL**: 12 or newer
- **Git**: For cloning the repository
- **Hedera Account**: Testnet or mainnet account with HBAR
- **Code Editor**: VS Code recommended

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/hashgraph/asset-tokenization-studio.git
cd asset-tokenization-studio

# Install all dependencies
npm ci
```

## Step 2: Setup PostgreSQL

### Install PostgreSQL

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE mass_payout;
CREATE USER mass_payout_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mass_payout TO mass_payout_user;
\q
```

## Step 3: Build All Mass Payout Components

Build contracts, SDK, backend, and frontend:

```bash
# Build everything with one command
npm run mass-payout:build

# Or build individually
npm run mass-payout:contracts:build
npm run mass-payout:sdk:build
npm run mass-payout:backend:build
npm run mass-payout:frontend:build
```

## Step 4: Smart Contracts Setup

### Configure Hardhat

```bash
cd packages/mass-payout/contracts
cp .env.example .env
```

Configure environment variables:

```bash
# Hedera Network
HEDERA_NETWORK=testnet

# Operator Account (for deploying contracts)
OPERATOR_ID=0.0.12345678
OPERATOR_KEY=302e020100300506032b657004220420...

# JSON-RPC Relay
JSON_RPC_RELAY_URL=https://testnet.hashio.io/api
```

### Deploy Contracts

Deploy the LifeCycle Cash Flow contract:

```bash
npx hardhat run scripts/deploy.ts --network testnet
```

Note the deployed contract ID for backend configuration.

## Step 5: Backend Setup

### Configure Backend

```bash
cd apps/mass-payout/backend
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=mass_payout_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=mass_payout
DATABASE_SCHEMA=public
DATABASE_SYNCHRONIZE=true

# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
HEDERA_JSON_RPC_RELAY_URL=https://testnet.hashio.io/api

# Operator Account
HEDERA_OPERATOR_ACCOUNT_ID=0.0.12345678
HEDERA_OPERATOR_PRIVATE_KEY=302e020100300506032b657004220420...

# Contracts
LIFECYCLE_CASH_FLOW_CONTRACT_ID=0.0.87654321
ATS_FACTORY_CONTRACT_ID=0.0.11111111

# Server
PORT=3001
API_PREFIX=api
CORS_ORIGINS=http://localhost:5174,http://localhost:3000
```

### Run Database Migrations

Migrations run automatically when you start the backend:

```bash
npm run start:dev
```

## Step 6: Frontend Setup

### Configure Frontend

```bash
cd apps/mass-payout/frontend
cp .env.example .env
```

Edit `.env`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001

# Frontend Port
VITE_PORT=5174
```

### Start Frontend

```bash
npm run dev
# Or from root: npm run mass-payout:frontend:dev
```

## Step 7: Running the Full Stack

Open three terminal windows:

**Terminal 1 - Backend:**

```bash
npm run mass-payout:backend:dev
```

**Terminal 2 - Frontend:**

```bash
npm run mass-payout:frontend:dev
```

**Terminal 3 - Event Listener (optional):**
The backend includes automatic blockchain event polling, but you can monitor logs:

```bash
npm run mass-payout:backend:dev -- --watch
```

Access the application:

- Frontend: http://localhost:5174
- Backend API: http://localhost:3001/api
- API Docs (Swagger): http://localhost:3001/api/docs

## Step 8: Running Tests

### Contract Tests

```bash
cd packages/mass-payout/contracts
npm run test

# With coverage
npm run test:coverage
```

### SDK Tests

```bash
cd packages/mass-payout/sdk
npm run test
```

### Backend Tests

```bash
cd apps/mass-payout/backend
npm run test

# E2E tests
npm run test:e2e
```

### Frontend Tests

```bash
cd apps/mass-payout/frontend
npm run test
```

## Development Workflow

### Making Changes

1. **Contracts**: Edit in `packages/mass-payout/contracts/contracts/`
2. **SDK**: Edit in `packages/mass-payout/sdk/src/`
3. **Backend**: Edit in `apps/mass-payout/backend/src/`
4. **Frontend**: Edit in `apps/mass-payout/frontend/src/`

### Rebuilding After Changes

```bash
# If you change contracts
npm run mass-payout:contracts:build

# If you change SDK
npm run mass-payout:sdk:build

# Backend and frontend rebuild automatically in dev mode
```

### Database Migrations

To create a new migration:

```bash
cd apps/mass-payout/backend
npm run migration:generate -- src/infrastructure/persistence/migrations/MigrationName
```

### Linting and Formatting

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Next Steps

- [Developer Guides](../developer-guides/index.md) - Learn about architecture and patterns
- [SDK Integration](../developer-guides/sdk-integration.md) - Integrate Mass Payout SDK
- [Backend API](../api/rest-api/index.md) - REST API documentation
- [User Guides](../user-guides/index.md) - Learn how to use the application

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U mass_payout_user -d mass_payout -h localhost

# Reset database
DROP DATABASE mass_payout;
CREATE DATABASE mass_payout;
```

### Build Fails

```bash
# Clean build artifacts
npm run mass-payout:clean

# Remove node_modules and reinstall
npm run clean:deps
npm ci

# Rebuild
npm run mass-payout:build
```

### Port Conflicts

```bash
# Kill process on backend port
lsof -ti:3001 | xargs kill -9

# Kill process on frontend port
lsof -ti:5174 | xargs kill -9
```

### TypeScript Errors

```bash
# Ensure contracts and SDK are built first
npm run mass-payout:contracts:build
npm run mass-payout:sdk:build

# Check TypeScript
npm run typecheck
```

## Production Deployment

### Environment Variables

**Critical settings for production:**

```bash
# Backend .env
NODE_ENV=production
DATABASE_SYNCHRONIZE=false  # NEVER use sync in production
DATABASE_POOL_SIZE=10

# Use secrets manager for sensitive data
HEDERA_OPERATOR_PRIVATE_KEY=<from-secrets-manager>
```

### Security

- Store private keys in secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Enable HTTPS for both frontend and backend
- Restrict CORS origins to your domain
- Use strong database passwords
- Implement rate limiting
- Regular security audits

### Docker Deployment

Docker configurations are available in each module. See deployment guides for details.

## Need Help?

- [GitHub Issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- [Developer Guides](../developer-guides/index.md)
- [API Documentation](../api/index.md)
- [Hedera Discord](https://hedera.com/discord)
