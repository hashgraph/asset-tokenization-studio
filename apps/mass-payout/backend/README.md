# Mass Payout Service

Backend service for managing scheduled mass payment distributions on the Hedera network. This service handles the scheduling, execution, and tracking of bulk payments to token holders.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [IDE Configuration](#ide-configuration)

## Overview

The Mass Payout Service is a NestJS-based backend that:

- **Manages assets**: Import and track tokenized assets from the Hedera network
- **Schedules distributions**: Create and manage payment distribution schedules for token holders
- **Executes payouts**: Process batch payments in configurable sizes
- **Monitors blockchain events**: Listen to on-chain events via the Hedera Mirror Node
- **Tracks holder status**: Maintain distribution status per holder (pending, completed, failed)

## Tech Stack

- **Runtime**: Node.js 22.x
- **Framework**: [NestJS](https://nestjs.com/) 10.x
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Hedera Hashgraph via Mirror Node API
- **SDK**: `@hashgraph/asset-tokenization-sdk`
- **Documentation**: Swagger/OpenAPI

## Architecture

The project follows a **hexagonal architecture** (ports & adapters):

```
src/
├── application/          # Use cases (business logic orchestration)
│   └── use-cases/        # Individual use case implementations
├── domain/               # Core business logic
│   ├── model/            # Domain entities (Asset, Distribution, Holder, etc.)
│   ├── ports/            # Interfaces for external dependencies
│   ├── services/         # Domain services
│   └── errors/           # Domain-specific errors
├── infrastructure/       # External implementations
│   ├── adapters/         # Port implementations (database, blockchain)
│   ├── rest/             # REST API controllers
│   └── cron/             # Scheduled tasks
└── config/               # Application configuration
```

## Prerequisites

- Node.js `22.17.0` (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- Docker & Docker Compose (for PostgreSQL)
- npm

## Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the PostgreSQL database:

   ```bash
   docker-compose up -d
   ```

## Running the App

```bash
# Development (starts DB + app)
npm run start:local

# Development with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production
npm run start:prod
```

The server runs on `http://localhost:3000` by default.

## API Documentation

When running in local environment, Swagger documentation is available at:

```
http://localhost:3000/swagger
```

### Main API Endpoints

| Resource                     | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `/assets`                    | Manage tokenized assets (import, list, pause/unpause) |
| `/distributions`             | Create and manage payment distributions               |
| `/distributions/:id/holders` | View holder status for a distribution                 |
| `/blockchain`                | Blockchain listener configuration                     |

## Testing

```bash
# Run all tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage report
npm run test:cov
```

## IDE Configuration

### VSCode

1. Install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions
2. Open settings (`Cmd + Shift + P` → "Open User Settings (JSON)")
3. Add:

   ```json
   {
     "editor.formatOnPaste": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.organizeImports": "explicit"
     }
   }
   ```

### IntelliJ IDEA

1. Go to **Settings** → **Languages & Frameworks** → **JavaScript** → **Prettier**
2. Enable "Automatic Prettier configuration" and "Run on save"
3. Go to **Tools** → **Actions on Save**
4. Enable "Optimize imports"

---

## 📚 Documentation

For more information about the project, see:

- [Guides](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/guides)
- [API Documentation](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/api)
- [References](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/references)
