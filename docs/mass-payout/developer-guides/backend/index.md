---
id: index
title: Backend
sidebar_position: 3
---

# Backend

The Mass Payout backend is a NestJS application that provides REST API, database management, and blockchain synchronization.

## What the Backend Does

1. **REST API**: HTTP endpoints for frontend operations
2. **Database Management**: PostgreSQL storage for assets, distributions, and payouts
3. **Blockchain Sync**: Polls Hedera for events and syncs on-chain state
4. **Scheduled Execution**: Automatic execution of scheduled distributions
5. **Batch Processing**: Manages large-scale payouts with retry logic

## Available Guides

### Architecture Overview

[Architecture Overview →](./architecture.md)

Learn about the Domain-Driven Design architecture and application layers.

### Database Schema

[Database Schema →](./database.md)

Understand the PostgreSQL schema, entities, and relationships.

### Blockchain Integration

[Blockchain Integration →](./blockchain-integration.md)

How the backend syncs with Hedera and processes scheduled payouts.

### Running & Testing

[Running & Testing →](./running-and-testing.md)

Development setup, deployment, and testing strategies.

## Quick Start

```bash
# Start PostgreSQL
cd apps/mass-payout/backend
docker-compose up -d

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run backend in development mode
npm run mass-payout:backend:dev
```

Backend runs on `http://localhost:3000` with Swagger docs at `http://localhost:3000/api`.

## Next Steps

- [SDK Integration](../sdk-integration.md) - Integrate Mass Payout SDK
- [Smart Contracts](../contracts/index.md) - LifeCycle Cash Flow contract
- [API Documentation](../../api/rest-api/index.md) - REST API reference
