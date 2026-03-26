# ----------------------------------------------------------
# Stage 1: Install dependencies
# ----------------------------------------------------------
FROM node:24-slim AS deps

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy all workspace package.json files so npm ci resolves the full workspace tree
COPY packages/ats/contracts/package.json packages/ats/contracts/
COPY packages/ats/sdk/package.json packages/ats/sdk/
COPY apps/ats/web/package.json apps/ats/web/
COPY packages/mass-payout/contracts/package.json packages/mass-payout/contracts/
COPY packages/mass-payout/sdk/package.json packages/mass-payout/sdk/
COPY apps/mass-payout/backend/package.json apps/mass-payout/backend/
COPY apps/mass-payout/frontend/package.json apps/mass-payout/frontend/
COPY apps/docs/package.json apps/docs/

# Root config files referenced by workspace packages
COPY prettier.config.mjs eslint.config.mjs .prettierignore .npmrc ./

RUN npm ci

# ----------------------------------------------------------
# Stage 2: Build contracts -> SDK -> web
# ----------------------------------------------------------
FROM deps AS builder

# Copy ATS contracts source
COPY packages/ats/contracts/ packages/ats/contracts/

# Build contracts (generates typechain types needed by SDK)
RUN npm run ats:contracts:build

# Copy ATS SDK source
COPY packages/ats/sdk/ packages/ats/sdk/

# Build SDK
RUN npm run ats:sdk:build

# Environment variables baked into the bundle at build time by Vite.

# Required — pass via: docker build --build-arg REACT_APP_RPC_FACTORY=0.0.xxx ...
ARG REACT_APP_MIRROR_NODE
ARG REACT_APP_RPC_NODE
ARG REACT_APP_RPC_RESOLVER
ARG REACT_APP_RPC_FACTORY

# Optional — override if needed
ARG REACT_APP_EQUITY_CONFIG_ID=0x0000000000000000000000000000000000000000000000000000000000000001
ARG REACT_APP_EQUITY_CONFIG_VERSION=0
ARG REACT_APP_BOND_CONFIG_ID=0x0000000000000000000000000000000000000000000000000000000000000002
ARG REACT_APP_BOND_CONFIG_VERSION=0
ARG REACT_APP_SHOW_DISCLAIMER=true
ARG REACT_APP_PROJECT_ID
ARG REACT_APP_DAPP_NAME=Asset Tokenization Studio
ARG REACT_APP_DAPP_DESCRIPTION=Asset Tokenization Studio. Built on Hedera Hashgraph.
ARG REACT_APP_DAPP_URL
ARG REACT_APP_DAPP_ICONS

ENV REACT_APP_EQUITY_CONFIG_ID=$REACT_APP_EQUITY_CONFIG_ID \
    REACT_APP_EQUITY_CONFIG_VERSION=$REACT_APP_EQUITY_CONFIG_VERSION \
    REACT_APP_BOND_CONFIG_ID=$REACT_APP_BOND_CONFIG_ID \
    REACT_APP_BOND_CONFIG_VERSION=$REACT_APP_BOND_CONFIG_VERSION \
    REACT_APP_SHOW_DISCLAIMER=$REACT_APP_SHOW_DISCLAIMER \
    REACT_APP_MIRROR_NODE=$REACT_APP_MIRROR_NODE \
    REACT_APP_RPC_NODE=$REACT_APP_RPC_NODE \
    REACT_APP_RPC_RESOLVER=$REACT_APP_RPC_RESOLVER \
    REACT_APP_RPC_FACTORY=$REACT_APP_RPC_FACTORY \
    REACT_APP_PROJECT_ID=$REACT_APP_PROJECT_ID \
    REACT_APP_DAPP_NAME=$REACT_APP_DAPP_NAME \
    REACT_APP_DAPP_DESCRIPTION=$REACT_APP_DAPP_DESCRIPTION \
    REACT_APP_DAPP_URL=$REACT_APP_DAPP_URL \
    REACT_APP_DAPP_ICONS=$REACT_APP_DAPP_ICONS

# Copy ATS web source and build
COPY apps/ats/web/ apps/ats/web/

RUN npm run ats:web:build

# ----------------------------------------------------------
# Stage 3: Serve with nginx
# ----------------------------------------------------------
FROM nginx:alpine

COPY --from=builder /app/apps/ats/web/dist /usr/share/nginx/html
COPY apps/ats/web/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid


USER 101

EXPOSE 5174

CMD ["nginx", "-g", "daemon off;"]
