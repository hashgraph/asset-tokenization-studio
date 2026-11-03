# Mass Payout Service

Backend service for managing scheduled mass payment distributions on the Hedera network. This service handles the scheduling, execution, and tracking of bulk payments to token holders.

## Table of Contents

- [Overview](#overview)
- [Security and Deployment](#security-and-deployment)
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

## Security and Deployment

> [!CAUTION]
> **No built-in authentication or authorization.**
>
> The Mass Payout backend does **not** authenticate callers or check what they are allowed to do. Any client that can reach its HTTP port can import assets, create, cancel and retry payouts, pause and unpause assets, change the blockchain listener configuration and start or stop polling. Payouts are executed with the service's own DFNS / Hedera credentials, so a request that reaches the backend is acted on with full authority.
>
> Mass Payout is an open-source reference accelerator. Authentication is deliberately left to the adopter's own API gateway and identity layer. **Never expose the backend directly to the internet.**

### Required deployment model

1. **Private network only.** Run the backend (default port `3000`) on a private network or cluster-internal interface with no public ingress. The PostgreSQL database must not be reachable from outside that network either.
2. **Put your own API gateway / identity layer in front of it.** Every request must pass through a component you control that:
   - authenticates the caller (for example OIDC / OAuth 2.0, SSO, or mTLS for service-to-service calls);
   - authorizes the route (see the table below) and, if several asset owners or tenants share one instance, restricts which `assetId` / `distributionId` values each caller may act on. The backend has no notion of ownership or tenants;
   - applies rate limits and request size limits;
   - terminates TLS.
3. **Serve the frontend behind the same identity layer.** The admin frontend calls the backend directly and sends no credentials of its own. `CORS_ORIGINS` only controls which browser origins may read responses; it is **not** an access control.
4. **Forward the authenticated identity for the audit log.** Set `AUDIT_ACTOR_HEADER` to the header your gateway sets after authentication (for example `x-authenticated-user`). Make the gateway overwrite that header on every request so clients cannot forge it.
5. **Keep secrets out of files.** Supply `POSTGRESQL_PASSWORD`, `DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN`, `DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_OR_PATH` and the other DFNS values from a secrets manager. `docker-compose.yml` is for a throwaway local database only.
6. **Keep Swagger internal.** Swagger UI is only mounted when `APP_ENV=local`; do not set that in shared environments.

### Suggested route policy for the gateway

| Access level     | Routes                                                                                                                                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read (operators) | `GET /assets`, `GET /assets/:assetId`, `GET /assets/:hederaTokenAddress/metadata`, `GET /assets/:assetId/distributions`, `GET /distributions`, `GET /distributions/:distributionId`, `GET /distributions/:distributionId/holders`, `GET /blockchain/config`                                                     |
| Payout operator  | `POST /assets/import`, `PATCH /assets/:assetId/pause`, `PATCH /assets/:assetId/unpause`, `PATCH /assets/:assetId/enable-sync`, `PATCH /assets/:assetId/disable-sync`, `POST /assets/:assetId/distributions/payout`, `PATCH /distributions/:distributionId/cancel`, `PATCH /distributions/:distributionId/retry` |
| Administrator    | `POST /blockchain/config`, `PATCH /blockchain/polling/start`, `PATCH /blockchain/polling/stop`                                                                                                                                                                                                                  |

`POST /assets/import` deploys a LifeCycleCashFlow contract paid for by the service account, and the payout routes move funds, so treat them as privileged.

### What the backend does on its own

These are defence in depth. They do not replace the gateway.

- **Request validation**: every body and query is validated with `class-validator`; unknown fields are rejected. `limit` on list endpoints is capped at 1000.
- **Mirror node allow-list**: automated payouts are triggered by `Transfer` events read from the mirror node, so the mirror node is the trust root for those payouts. `POST /blockchain/config` only accepts an `http`/`https` mirror node URL whose host is in `BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS` (default: the public Hedera mirror nodes plus the host of `BLOCKCHAIN_MIRROR_NODE_URL`), and the listener re-checks the stored URL before every poll. This stops the listener being pointed at internal services or at a server that returns forged events.
- **Bounded metadata lookups**: `GET /assets/:hederaTokenAddress/metadata` allows at most 10 concurrent on-chain lookups and answers `429` beyond that.
- **Generic error responses**: `400`, `404` and `409` responses carry a generic message and the error class name (for example `AssetPausedError`). Asset names, token addresses and other details are written to the server log only.
- **Audit log lines**: every `POST`, `PUT`, `PATCH` and `DELETE` writes one JSON line with the `Audit` logger context: `action`, `method`, `route`, path `params`, the names (not values) of the body fields, `actor` (from `AUDIT_ACTOR_HEADER`, otherwise `unknown`), `sourceIp`, `outcome` and `durationMs`. Ship these lines to your log store.
- **No infrastructure URLs in logs**: mirror node requests are logged by host and path only.

### Security-related environment variables

| Variable                               | Purpose                                                                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `CORS_ORIGINS`                         | Comma-separated browser origins allowed to call the API (default `http://localhost:5173`). Not an access control.                      |
| `AUDIT_ACTOR_HEADER`                   | Header set by your gateway with the authenticated caller; recorded as `actor` in audit lines.                                          |
| `BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS` | Comma-separated mirror node hosts the listener may poll. Empty: public Hedera mirror nodes plus the `BLOCKCHAIN_MIRROR_NODE_URL` host. |
| `APP_ENV`                              | `local` mounts Swagger UI at `/swagger`; use another value outside local development.                                                  |

The same guidance is published on the docs site: [Backend > Security and Deployment](../../../docs/mass-payout/developer-guides/backend/index.md#security-and-deployment).

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

See [Security and Deployment](#security-and-deployment) for the security-related variables (`CORS_ORIGINS`, `AUDIT_ACTOR_HEADER`, `BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS`, `APP_ENV`).

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the PostgreSQL database (local development only; it reads `POSTGRESQL_USER`, `POSTGRESQL_PASSWORD`, `POSTGRESQL_DB` and `POSTGRESQL_PORT` from `.env` and binds to `127.0.0.1`):

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
