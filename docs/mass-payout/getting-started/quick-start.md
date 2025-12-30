---
id: quick-start
title: Quick Start - Try the Web App
sidebar_label: Quick Start
sidebar_position: 1
---

# Quick Start - Try the Mass Payout App

Quick start guide to run the Mass Payout application for managing large-scale payment distributions.

## Prerequisites

- **Node.js**: v24.0.0 or newer (for backend)
- **npm**: v10.9.0 or newer
- **Docker**: For PostgreSQL database (or install PostgreSQL 12+ manually)
- **Hedera Account**: Testnet or mainnet account with HBAR

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hashgraph/asset-tokenization-studio.git
cd asset-tokenization-studio
```

### 2. Setup PostgreSQL Database

#### Option 1: Using Docker (Recommended)

Start PostgreSQL using the included docker-compose:

```bash
cd apps/mass-payout/backend
docker-compose up -d
cd ../../..
```

This will start PostgreSQL on port 5432 with default credentials (`postgres`/`postgres`).

#### Option 2: Manual PostgreSQL Installation

If you have PostgreSQL installed:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mass_payout;
```

## Configuration

### Backend Configuration

#### Create Environment File

```bash
cd apps/mass-payout/backend
cp .env.example .env
```

#### Configure Environment Variables

Edit `apps/mass-payout/backend/.env`:

##### Database Configuration

If you're using Docker (from Step 2), use these default values:

```bash
# PostgreSQL Connection (Docker defaults)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres
DATABASE_SCHEMA=public
DATABASE_SYNCHRONIZE=true  # Set to false in production
```

If you created a custom database, adjust `DATABASE_NAME` accordingly.

##### Blockchain Configuration

```bash
# Mirror Node and Contract ID
BLOCKCHAIN_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
BLOCKCHAIN_CONTRACT_ID=0.0.429274
BLOCKCHAIN_TOKEN_DECIMALS=6
BLOCKCHAIN_LISTENER_POLL_TIMEOUT=10000
BLOCKCHAIN_LISTENER_START_TIMESTAMP=2025-08-26T00:00:00.000Z
```

##### Asset Tokenization Studio (ATS) Integration

```bash
# ATS Network Configuration
ATS_NETWORK=testnet
ATS_MIRROR_URL=https://testnet.mirrornode.hedera.com/api/v1/
ATS_RPC_URL=https://testnet.hashio.io/api

# ATS Contract Addresses
ATS_FACTORY_ADDRESS=0.0.123456
ATS_RESOLVER_ADDRESS=0.0.123457

# Payment Token (USDC)
HEDERA_USDC_ADDRESS=0.0.429274
```

##### DFNS Custodial Wallet (Required)

The backend uses DFNS for secure transaction signing. Configure your DFNS wallet:

```bash
# Service Account Authentication
DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN=your_dfns_service_account_token_here
DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID=cr-xxxxx-xxxxx-xxxxxxxxxxxxxxxxx
DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH="-----BEGIN EC PRIVATE KEY-----
your_private_key_here
-----END EC PRIVATE KEY-----"

# DFNS Application Settings
DFNS_APP_ID=ap-xxxxx-xxxxx-xxxxxxxxxxxxxxxxx
DFNS_APP_ORIGIN=http://localhost:3000
DFNS_BASE_URL=https://api.dfns.ninja

# DFNS Wallet Configuration
DFNS_WALLET_ID=wa-xxxxx-xxxxx-xxxxxxxxxxxxxxxxx
DFNS_WALLET_PUBLIC_KEY=your_wallet_public_key_here
DFNS_HEDERA_ACCOUNT_ID=0.0.123456
```

:::info
To obtain DFNS credentials:

1. Create an account at [DFNS](https://www.dfns.co/)
2. Set up a service account for API access
3. Create a Hedera wallet in your DFNS dashboard
4. Copy the credentials to your `.env` file
   :::

##### Application Settings

```bash
# Server Port
PORT=3000

# API Prefix
API_PREFIX=api

# CORS Origins (comma-separated list of allowed origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

#### Create Environment File

```bash
cd apps/mass-payout/frontend
cp .env.example .env
```

#### Configure Environment Variables

Edit `apps/mass-payout/frontend/.env`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000

# Frontend Port (optional)
VITE_PORT=5173
```

## Running the Application

From the monorepo root, you can start both backend and frontend with simple commands:

### 1. Start the Backend

```bash
npm run mass-payout:backend:start
```

The backend API will be available at **http://localhost:3000**

### 2. Start the Frontend

In a new terminal:

```bash
npm run mass-payout:frontend:dev
```

The frontend will be available at **http://localhost:5173**

> **Tip**: You can run both in separate terminals to see logs from each service.

## First Steps

### 1. Import an Asset

- Click "Import Asset" in the dashboard
- Enter the token contract ID from ATS
- The system will sync token holders and balances

### 2. Create a Distribution

- Select an imported asset
- Click "New Distribution"
- Choose distribution type (dividend, coupon payment)
- Set amount and payment token
- Configure distribution parameters

### 3. Execute Payout

- Review distribution details
- Click "Execute Payout"
- The system will process batch payments to all holders
- Monitor transaction status in real-time

### 4. View History

- Check distribution history
- View payout details and transaction records
- Track failed payments and retry if needed

## Troubleshooting

### Database Connection Failed

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d mass_payout

# Check credentials in .env
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_correct_password
```

### Port Already in Use

```bash
# Kill process on backend port
lsof -ti:3000 | xargs kill -9

# Kill process on frontend port
lsof -ti:5173 | xargs kill -9
```

### Docker Database Issues

```bash
# Check if PostgreSQL container is running
docker ps

# View PostgreSQL logs
cd apps/mass-payout/backend
docker-compose logs -f

# Restart PostgreSQL container
docker-compose restart

# Stop and remove container
docker-compose down
```

### Build Errors

```bash
# Clean and rebuild
npm run mass-payout:clean
npm run mass-payout:build
```

### Contract Interaction Errors

- Verify operator account has sufficient HBAR balance
- Check that contract IDs are correct for your network
- Ensure operator private key is valid
- Verify the LifeCycle Cash Flow contract is deployed

### Migration Errors

Database migrations run automatically. If you encounter issues:

```bash
# Rebuild database (WARNING: This deletes all data)
# In PostgreSQL:
DROP DATABASE mass_payout;
CREATE DATABASE mass_payout;

# Restart backend to run migrations
npm run mass-payout:backend:dev
```

## Production Deployment

### Important Settings for Production

```bash
# Backend .env
DATABASE_SYNCHRONIZE=false  # Never use sync in production
NODE_ENV=production

# Use connection pooling
DATABASE_POOL_SIZE=10
```

### Security Considerations

- Store private keys securely (use secrets manager)
- Enable HTTPS for both frontend and backend
- Restrict CORS origins to your domain only
- Use strong database passwords
- Implement rate limiting on API endpoints

## Next Steps

- [User Guides](../user-guides/index.md) - Learn how to import assets and manage distributions
- [Developer Guides](../developer-guides/index.md) - Learn about the architecture
- [API Documentation](../api/index.md) - Explore the backend API

## Need Help?

- [GitHub Issues](https://github.com/hashgraph/asset-tokenization-studio/issues)
- [Hedera Discord](https://hedera.com/discord)
- [Documentation](../intro.md)
