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

## Security and Deployment

:::danger No built-in authentication or authorization

The Mass Payout backend does **not** authenticate callers or check what they are allowed to do. Any client that can reach its HTTP port can import assets, create, cancel and retry payouts, pause and unpause assets, change the blockchain listener configuration and start or stop polling. Payouts are executed with the service's own DFNS / Hedera credentials, so a request that reaches the backend is acted on with full authority.

Mass Payout is an open-source reference accelerator. Authentication is deliberately left to the adopter's own API gateway and identity layer. **Never expose the backend directly to the internet.**

:::

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

Backend runs on `http://localhost:3000`; with `APP_ENV=local`, Swagger docs are at `http://localhost:3000/swagger`. Before deploying anywhere other than your own machine, read [Security and Deployment](#security-and-deployment).

## Next Steps

- [SDK Integration](../sdk-integration.md) - Integrate Mass Payout SDK
- [Smart Contracts](../contracts/index.md) - LifeCycle Cash Flow contract
- [API Documentation](../../api/rest-api/index.md) - REST API reference
