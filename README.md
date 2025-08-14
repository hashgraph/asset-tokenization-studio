<div align="center">

# Asset Tokenization Studio

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

### Table of Contents

- **[Development manifesto](#development-manifesto)**<br>
- **[Prerequisites](#prerequisites)**<br>
- **[Installation](#installation)**<br>
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

The ATS consists of three primary components that work together to provide a complete tokenization solution:

- Smart Contracts - The on-chain components deployed on the Hedera network
- SDK - A software development kit that provides programmatic access to the contracts
- Web Application - A user interface for interacting with the tokenized assets

The standard ERC for security tokens used in the smart contracts is ERC1400.

Version 1.15.0 introduces partial compatibility with the ERC-3643 (TREX) standard; full support will follow in upcoming releases.

# Development manifesto

The development of the project follows enterprise-grade practices for software development. Using DDD, hexagonal architecture, and the CQS pattern, all within an agile methodology.

## Domain driven design

By using DDD (Domain-Driven Design), we aim to create a shared language among all members of the project team, which allows us to focus our development efforts on thoroughly understanding the processes and rules of the domain. This helps to bring benefits such as increased efficiency and improved communication.

# Prerequisites

Ensure the following tools are installed with these versions:

- **Node:**`v20.17.0`
- **NPM:** `v10.8.3`
- **Yarn:** `v1.22.22`

# Project Structure

This project is organized as a monorepo using npm workspaces to manage multiple packages in a modular and scalable way. The codebase is structured around domain-specific folders, allowing independent development and deployment of different applications.

## ATS

ATS (Asset Tokenization Studio) is one of the main applications in the monorepo. Its components are organized as follows:

- `packages/ats/` Contains the core business logic of ATS:
  - `contracts/` Smart contracts that implement the tokenization logic.
  - `sdk/` A TypeScript SDK to interact with the contracts from frontend or backend applications.
- `apps/ats/` Contains the applications that consume the SDK:
  - `web/` A React + Vite-based web application for interacting with ATS.

⚠️ Note: The web module is not currently included in the npm workspaces because it uses Yarn for installation and build. This separation is due to compatibility constraints with some of its tooling. In future phases, we plan to integrate web into the npm workspaces once full compatibility is ensured.

## Mass-Payout

# Installation

In a terminal:

```
npm run setup
```

This will install the dependencies in all projects and sets up the links between them.

You can now start developing in any of the modules.

# Build

When making modifications to any of the modules, you have to re-compile the dependencies, in this order, depending on which ones the modifications where made:

```bash
  // 1st
  $ npm run build:ats:contracts
  // 2nd
  $ npm run build:ats:sdk
  // or
  $ npm run build:ats:web
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
- **`REACT_APP_RESOLVER`**: The Hedera testnet account ID for the resolver. Example: `0.0.6349503`
- **`REACT_APP_FACTORY`**: The Hedera testnet account ID for the factory. Example: `0.0.6349546`

## Optional Environment Variables (Hedera Wallet Connect)

These variables are only required if you are integrating Hedera Wallet Connect for decentralized application (dApp) interactions. If not needed, they can be omitted.

- **`REACT_APP_PROJECT_ID`**: Project ID for Wallet Connect integration. You can obtain it from the [WalletConnect website](https://walletconnect.com/).
- **`REACT_APP_DAPP_NAME`**: The name of your dApp as displayed in Wallet Connect.
- **`REACT_APP_DAPP_DESCRIPTION`**: A description of your dApp, typically displayed in Wallet Connect.
- **`REACT_APP_DAPP_URL`**: The URL of your dApp that will be referenced in Wallet Connect.
- **`REACT_APP_DAPP_ICONS`**: An array of URLs pointing to icons for the dApp, typically used in Wallet Connect interfaces. Example: `['https://stablecoinstudio.com/static/media/hedera-hbar-logo.4fd73fb360de0fc15d378e0c3ebe6c80.svg']`

## Steps to set up the `.env` file:

1. Navigate to the `web` module folder.
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
   REACT_APP_RESOLVER='0.0.6349503'
   REACT_APP_FACTORY='0.0.6349546'

   REACT_APP_PROJECT_ID="your_project_id_from_walletconnect"
   REACT_APP_DAPP_NAME="Asset Tokenization Studio"
   REACT_APP_DAPP_DESCRIPTION="Asset Tokenization Studio. Built on Hedera Hashgraph."
   REACT_APP_DAPP_URL="https://wc.ats.com/"
   REACT_APP_DAPP_ICONS='["https://stablecoinstudio.com/static/media/hedera-hbar-logo.4fd73fb360de0fc15d378e0c3ebe6c80.svg"]'
   ```

5. Save the file and proceed with running the application.

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

## ATS

In order to run the application locally:

- Clone the repository
- Create a ".env" file in the _web_ module (using the ".env.sample" file as a template)
- Open a terminal and run the command:

```bash
npm run start:ats
```

- Open a browser and type in the URL displayed in the terminal (by default it will be : _http://localhost:5173_)

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
