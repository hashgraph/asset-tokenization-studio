<div align="center">

# Asset Tokenization Studio - Web

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Installation](#installation)**<br>
- **[Environment Variables](#environment-variables)**<br>
  - **[General](#general)**<br>
  - **[Network](#nework)**<br>
  - **[Hedera Wallet Connnect](#hedera-wallet-connnect)**<br>
- **[Run](#run)**<br>
- **[Test](#test)**<br>

# Description

Front End for the Asset Tokenization Studio.
This dApp interacts directly with the Hedera Testnet through the SDK. This package is part of the Asset Tokenization Studio monorepo located at `apps/ats/web`.

## Workspace Context

This web application depends on the SDK (`packages/ats/sdk`) and indirectly on the contracts (`packages/ats/contracts`). The monorepo build process handles these dependencies automatically.

# Installation

## Prerequisites

From the monorepo root, ensure all dependencies are installed:

```bash
npm ci                    # Install all workspace dependencies
npm run ats:build         # Build contracts and SDK
```

## Local Development

For local development of just the web application:

```bash
cd apps/ats/web
npm install
```

# Environment Variables

Environment variables should be included in a ".env" file located in `apps/ats/web/`.
Please refer to ".env.sample" to see the list of variables that must be defined alongside some default values that you could use to start up the application.

Below is a description of what each variable represents.

## General

- **REACT_APP_SHOW_DISCLAIMER :** shows (true) or hides (false) the cookie disclaimer pop up message when running the web.

## Network

- **REACT_APP_MIRROR_NODE :** mirror node's url.
- **REACT_APP_RPC_NODE :** rpc node's url.
- **REACT_APP_RPC_RESOLVER :** resolver's proxy smart contract address. Should be immutable.
- **REACT_APP_RPC_FACTORY :** factory's proxy smart contract address. Should be immutable.

## Hedera Wallet Connnect

- **REACT_APP_PROJECT_ID :** Hedera wallet conenct project ID for this particular dapp.
- **REACT_APP_DAPP_NAME :** Dapps name.
- **REACT_APP_DAPP_DESCRIPTION :** Dapps descritpion.
- **REACT_APP_DAPP_URL :** Dapps url.
- **REACT_APP_DAPP_ICONS :** Dapps icon image.

# Run

## From monorepo root (recommended):

```bash
# Start full development environment (builds contracts & SDK, then starts web)
npm start
# or
npm run ats:start

# Start just the web development server (assumes contracts & SDK are built)
npm run ats:web:dev
```

## From web directory:

```bash
cd apps/ats/web
npm run dev
```

Open a browser and navigate to the URL displayed in the terminal (by default: _http://localhost:5173_)

# Test

The following _src_ folders contain _**tests**_ subfolders within them with their corresponding tests:

- components
- layouts
- views

## Running tests

### From monorepo root (recommended):

```bash
npm run ats:web:test
```

### From web directory:

```bash
cd apps/ats/web
npm test
```

### Available test commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Update test snapshots
npm run test:update
```
