<div align="center">

# Asset Tokenization Studio

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

### Table of Contents

- **[Development manifesto](#development-manifesto)**<br>
- **[Prerequisites](#prerequisites)**<br>
- **[Installation](#installation)**<br>
- **[Workspace Overview](#workspace-overview)**<br>
- **[Build](#build)**<br>
- **[Setting Up the Environment](#setting-up-the-environment)**<br>
  - **[Required Environment Variables](#required-environment-variables)**<br>
  - **[Optional Environment Variables (Hedera Wallet Connect)](#optional-environment-variables-hedera-wallet-connect)**<br>
  - **[Steps to set up the `.env` file](#steps-to-set-up-the-env-file)**<br>
- **[Run](#run)**<br>
- **[Support](#support)**<br>
- **[Contributing](#contributing)**<br>
- **[Code of conduct](#code-of-conduct)**<br>
- **[License](#license)**<br>

# Description

Asset Tokenization Studio (ATS) is a suite designed to enable the creation, management, and trading of security tokens on the Hedera network.

The ATS facilitates the tokenization of traditional financial assets (equities and bonds) onto the Hedera distributed ledger, providing a framework for:

- Creating and deploying security tokens
- Managing token lifecycles
- Implementing compliance and regulatory requirements
- Enabling secure token transfers and operations

## Monorepo Structure

The project is organized as a monorepo using npm workspaces:

```
├── packages/                    # Core packages
│   ├── ats/
│   │   ├── contracts/          # Smart contracts deployed on Hedera
│   │   └── sdk/                # TypeScript SDK for contract interaction
│   └── mass-payout/            # Mass payout functionality
├── apps/                       # Applications
│   ├── ats/
│   │   └── web/                # React web application
│   └── mass-payout/            # Mass payout app
└── package.json               # Root workspace configuration
```

The ATS consists of three primary components that work together to provide a complete tokenization solution:

- **Smart Contracts** (`packages/ats/contracts`) - The on-chain components deployed on the Hedera network
- **SDK** (`packages/ats/sdk`) - A software development kit that provides programmatic access to the contracts
- **Web Application** (`apps/ats/web`) - A user interface for interacting with the tokenized assets

The standard ERC for security tokens used in the smart contracts is ERC1400.

Version 1.15.0 introduces partial compatibility with the ERC-3643 (TREX) standard; full support will follow in upcoming releases.

# Development manifesto

The development of the project follows enterprise-grade practices for software development. Using DDD, hexagonal architecture, and the CQS pattern, all within an agile methodology.

## Domain driven design

By using DDD (Domain-Driven Design), we aim to create a shared language among all members of the project team, which allows us to focus our development efforts on thoroughly understanding the processes and rules of the domain. This helps to bring benefits such as increased efficiency and improved communication.

## Token Standards Support

The Asset Tokenization Studio supports multiple security token standards:

- **ERC1400**: Core security token standard with partition-based token management
- **ERC3643 (T-REX)**: Advanced compliance framework with identity registry, compliance modules, and sophisticated freeze capabilities

# Prerequisites

Ensure the following tools are installed:

- **Node:** v20.19.4 (LTS: Iron) or newer
- **NPM :** v10.8.2 or newer

# Installation

This project uses npm workspaces for dependency management. In a terminal at the root directory:

```bash
npm ci
```

This will install all dependencies for all workspaces and automatically set up the links between packages.

You can now start developing in any of the workspace modules.

# Workspace Overview

This monorepo uses npm workspaces to manage dependencies and build processes across multiple packages and applications.

## Available Workspace Commands

### ATS (Asset Tokenization Studio)

```bash
# Build commands
npm run ats:build                # Build all ATS components
npm run ats:contracts:build      # Build smart contracts only
npm run ats:sdk:build           # Build SDK only
npm run ats:web:build           # Build web app only

# Test commands
npm run ats:test                # Test all ATS components
npm run ats:contracts:test      # Test contracts only
npm run ats:sdk:test           # Test SDK only
npm run ats:web:test           # Test web app only
npm run ats:test:ci            # Run CI tests

# Development commands
npm run ats:start              # Build contracts/SDK and start web dev server
npm run ats:web:dev           # Start web dev server only

# Publishing (for maintainers)
npm run ats:publish           # Publish contracts and SDK to npm
```

### Mass Payout (Placeholder)

```bash
npm run mass-payout:build     # Build mass payout components
npm run mass-payout:test      # Test mass payout components
npm run mass-payout:dev       # Start mass payout development
```

### Utility Commands

```bash
npm run clean:deps            # Remove all node_modules and lock files
npm run lint                  # Lint JavaScript and Solidity code
npm run format                # Format code with Prettier
```

## Workspace Dependencies

The workspaces have the following dependency relationships:

```
packages/ats/contracts  →  (standalone)
packages/ats/sdk       →  depends on contracts
apps/ats/web          →  depends on SDK (and transitively contracts)
```

When you run workspace commands, npm automatically handles building dependencies in the correct order.

# Build

The project uses workspace-aware build commands. When making modifications to any module, rebuild the dependencies in the following order:

```bash
# Build all ATS components (recommended)
npm run ats:build

# Or build individual components:
npm run ats:contracts:build  # 1st - Smart contracts
npm run ats:sdk:build        # 2nd - SDK (depends on contracts)
npm run ats:web:build        # 3rd - Web app (depends on SDK)

# Mass Payout (when available)
npm run mass-payout:build
```

# Setting Up the Environment

To run the project, you'll need to configure environment variables in the `.env` file. Below are the required and optional variables, along with their descriptions.

## Required Environment Variables

### _General Settings_

- **`REACT_APP_EQUITY_CONFIG_ID`**: Configuration Id for Equities.
- **`REACT_APP_EQUITY_CONFIG_VERSION`**: Equity Version.
- **`REACT_APP_BOND_CONFIG_ID`**: configuration Id for Bonds.
- **`REACT_APP_BOND_CONFIG_VERSION`**: Bond Version.
- **`REACT_APP_SHOW_DISCLAIMER`**: Set this value to `"true"` to show a disclaimer in the application.

### _Network Configuration_

- **`REACT_APP_MIRROR_NODE`**: The URL of the Hedera Mirror Node API used to query historical data from the Hedera testnet. Example: `https://testnet.mirrornode.hedera.com/api/v1/`
- **`REACT_APP_RPC_NODE`**: The RPC node URL used to communicate with the Hedera testnet. Example: `https://testnet.hashio.io/api`
- **`REACT_APP_RPC_RESOLVER`**: The Hedera testnet account ID for the resolver. Example: `0.0.5479997`
- **`REACT_APP_RPC_FACTORY`**: The Hedera testnet account ID for the factory. Example: `0.0.5480051`

## Optional Environment Variables (Hedera Wallet Connect)

These variables are only required if you are integrating Hedera Wallet Connect for decentralized application (dApp) interactions. If not needed, they can be omitted.

- **`REACT_APP_PROJECT_ID`**: Project ID for Wallet Connect integration. You can obtain it from the [WalletConnect website](https://walletconnect.com/).
- **`REACT_APP_DAPP_NAME`**: The name of your dApp as displayed in Wallet Connect.
- **`REACT_APP_DAPP_DESCRIPTION`**: A description of your dApp, typically displayed in Wallet Connect.
- **`REACT_APP_DAPP_URL`**: The URL of your dApp that will be referenced in Wallet Connect.
- **`REACT_APP_DAPP_ICONS`**: An array of URLs pointing to icons for the dApp, typically used in Wallet Connect interfaces. Example: `['https://stablecoinstudio.com/static/media/hedera-hbar-logo.4fd73fb360de0fc15d378e0c3ebe6c80.svg']`

## Steps to set up the `.env` file:

1. Navigate to the `apps/ats/web` directory.
2. Copy the `.env.sample` file to create a new `.env` file:

   ```bash
   cp .env.sample .env
   ```

3. Open the `.env` file in your preferred text editor.
4. Replace the placeholder values with your actual environment settings. For example:

   ```bash
   REACT_APP_EQUITY_CONFIG_ID='0x0000000000000000000000000000000000000000000000000000000000000001'
   REACT_APP_EQUITY_CONFIG_VERSION="0"
   REACT_APP_BOND_CONFIG_ID="0x0000000000000000000000000000000000000000000000000000000000000002"
   REACT_APP_BOND_CONFIG_VERSION="0"
   REACT_APP_SHOW_DISCLAIMER="true"

   REACT_APP_MIRROR_NODE="https://testnet.mirrornode.hedera.com/api/v1/"
   REACT_APP_RPC_NODE="https://testnet.hashio.io/api"
   REACT_APP_RPC_RESOLVER='0.0.6457760'
   REACT_APP_RPC_FACTORY='0.0.6457855'

   REACT_APP_PROJECT_ID="your_project_id_from_walletconnect"
   REACT_APP_DAPP_NAME="Asset Tokenization Studio"
   REACT_APP_DAPP_DESCRIPTION="Asset Tokenization Studio. Built on Hedera Hashgraph."
   REACT_APP_DAPP_URL="https://wc.ats.com/"
   REACT_APP_DAPP_ICONS='["https://stablecoinstudio.com/static/media/hedera-hbar-logo.4fd73fb360de0fc15d378e0c3ebe6c80.svg"]'
   ```

5. Save the file and proceed with running the application.

## Critical Setup Recommendation for Optimal Performance

For the best experience, we strongly recommend installing the [hiero-json-rpc-relay](https://github.com/hiero-ledger/hiero-json-rpc-relay/tree/main) on your local machine. The hashio API (`REACT_APP_RPC_NODE="https://testnet.hashio.io/api"`) has rate limits that may cause errors during operations. By setting up the relay locally, you can replace the `REACT_APP_RPC_NODE` environment variable with a local endpoint (e.g., `REACT_APP_RPC_NODE="http://localhost:7546"`) to ensure stable and uninterrupted performance.

## Key Features

### ERC3643 Compliance Framework

The platform now includes comprehensive ERC3643 (T-REX) support featuring:

- **Identity Registry**: Manage investor identities and compliance status
- **Compliance Module**: Configurable compliance rules and restrictions
- **Advanced Freeze Capabilities**: Partial token freezing and address-level freeze controls
- **Agent Management**: Dedicated agent roles for compliance operations
- **Batch Operations**: Efficient batch transfers, mints, burns, and freeze operations
- **Recovery Address**: Account recovery mechanisms for lost access scenarios

### Enhanced Token Operations

- **Forced Transfers**: Controller-initiated transfers for regulatory compliance
- **Batch Processing**: Multiple operations in single transactions for gas efficiency
- **Granular Freeze Controls**: Freeze specific amounts or entire addresses
- **Token Metadata Management**: On-chain token name, symbol, and metadata updates

## Custodian Integration

The ATS project utilizes a `custodians` library to facilitate interactions with various external custody providers.

The integration with custodian services is **available at the SDK level only**, that means that the current implementation does not support direct dApp integration workflows and is limited to SDK tests right now. You can use your custodian providers using the .env file ([.env.sample](./sdk/.env.sample)).

At the time the integration was first built, the SDKs provided by Dfns and Fireblocks did not yet support direct dApp integration workflows. Consequently, the current implementation focuses solely on SDK-based operations.

### Supported Custodians and SDK Versions

The following custody providers are supported through their respective SDKs within the ATS `custodians` library:

- **Dfns:** SDK Version `0.1.0-beta.5`
- **Fireblocks:** SDK Version `5.11.0`
- **AWS KMS:** AWS SDK Version `3.624.0`

For further details or assistance regarding the custodian integration, please consult the relevant source code within the SDK or reach out to the development team. [Custodians Library](https://github.com/hashgraph/hedera-custodians-library)

# Run

To run the application locally:

- Clone the repository
- Install dependencies as described in the _Installation_ section: `npm ci`
- Create a ".env" file in the `apps/ats/web` directory (using the ".env.sample" file as a template)
- Run the application using one of these commands:

  ```bash
  # Start the full ATS application (builds contracts & SDK, then starts web dev server)
  npm start
  # or
  npm run ats:start

  # For development of the web app only (assumes contracts & SDK are already built)
  npm run ats:web:dev
  ```

- Open a browser and navigate to the URL displayed in the terminal (by default: _http://localhost:5173_)

## Development Workflows

### Full Development Setup

```bash
# Option 1: Quick setup (install dependencies and build all ATS components)
npm run ats:setup      # Install dependencies and build all ATS components
npm run ats:web:dev    # Start web development server

# Option 2: Step by step
npm ci                 # Install all dependencies
npm run ats:build      # Build contracts and SDK
npm run ats:web:dev    # Start web development server
```

### Running Tests

```bash
# Test all ATS components
npm run ats:test

# Test individual components
npm run ats:contracts:test
npm run ats:sdk:test
npm run ats:web:test

# CI testing
npm run ats:test:ci
```

### Clean and Rebuild

```bash
# Clean all build artifacts
npm run ats:clean

# Clean dependencies (nuclear option)
npm run clean:deps
npm ci
```

## Continuous Integration

The project uses separate GitHub Actions workflows for different components:

- **ATS Tests** (`.github/workflows/test-ats.yml`): Runs when ATS-related files change
- **Mass Payout Tests** (`.github/workflows/test-mp.yml`): Runs when Mass Payout files change
- **Publishing** (`.github/workflows/publish.yml`): Handles publishing to npm with conditional logic based on release tags

Tests are automatically triggered only when relevant files are modified, improving CI efficiency.

# Support

If you have a question on how to use the product, please see our
[support guide](https://github.com/hashgraph/.github/blob/main/SUPPORT.md).

# Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

# Code of conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

# License

[Apache License 2.0](LICENSE)

# 🔐 Security

Please do not file a public ticket mentioning the vulnerability. Refer to the security policy defined in the [SECURITY.md](https://github.com/hashgraph/assettokenization-studio/blob/main/SECURITY.md).
