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


# Development manifesto

The development of the project follows enterprise-grade practices for software development. Using DDD, hexagonal architecture, and the CQS pattern, all within an agile methodology.

## Domain driven design

By using DDD (Domain-Driven Design), we aim to create a shared language among all members of the project team, which allows us to focus our development efforts on thoroughly understanding the processes and rules of the domain. This helps to bring benefits such as increased efficiency and improved communication.

# Prerequisites
Ensure the following tools are installed with these versions:

- **Node:**`v20.17.0`
- **NPM:** `v10.8.3`
- **Yarn:** `v1.22.19`

# Installation

In a terminal:

```
npm run install:all
```

This will install the dependencies in all projects and sets up the links between them.

You can now start developing in any of the modules.


# Build

When making modifications to any of the modules, you have to re-compile the dependencies, in this order, depending on which ones the modifications where made:

```bash
  // 1st
  $ npm run build:contracts
  // 2nd
  $ npm run build:sdk
  // or
  $ npm run build:web
```

# Setting Up the Environment

To run the project, you'll need to configure environment variables in the `.env` file. Below are the required and optional variables, along with their descriptions.

## Required Environment Variables

### *General Settings*

- **`REACT_APP_BUSINESS_LOGIC_KEYS_COMMON`**: This is a list of common business logic keys required for the functioning of the application. Each key represents a smart contract or similar on-chain entity.
- **`REACT_APP_BUSINESS_LOGIC_KEYS_EQUITY`**: Business logic key specifically for handling equity-related operations.
- **`REACT_APP_BUSINESS_LOGIC_KEYS_BOND`**: Business logic key specifically for handling bond-related operations.
- **`REACT_APP_SHOW_DISCLAIMER`**: Set this value to `"true"` to show a disclaimer in the application.

### *Network Configuration*

- **`REACT_APP_MIRROR_NODE`**: The URL of the Hedera Mirror Node API used to query historical data from the Hedera testnet. Example: `https://testnet.mirrornode.hedera.com/api/v1/`
- **`REACT_APP_RPC_NODE`**: The RPC node URL used to communicate with the Hedera testnet. Example: `https://testnet.hashio.io/api`
- **`REACT_APP_RPC_RESOLVER`**: The Hedera testnet account ID for the resolver. Example: `0.0.3532144`
- **`REACT_APP_RPC_FACTORY`**: The Hedera testnet account ID for the factory. Example: `0.0.3532205`

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
    REACT_APP_BUSINESS_LOGIC_KEYS_COMMON="0x011768a41cb4fe76a26f444eec15d81a0d84e919a36336d72c6539cf41c0fcf6"
    REACT_APP_BUSINESS_LOGIC_KEYS_EQUITY="0xfe85fe0513f5a5676011f59495ae16b2b93c981c190e99e61903e5603542c810"
    REACT_APP_BUSINESS_LOGIC_KEYS_BOND="0x09c1d80a160a7250b5fabc46d06a7fa4067e6d7292047c5024584b43f17d55ef"
    REACT_APP_SHOW_DISCLAIMER="true"

    REACT_APP_MIRROR_NODE="https://testnet.mirrornode.hedera.com/api/v1/"
    REACT_APP_RPC_NODE="https://testnet.hashio.io/api"
    REACT_APP_RPC_RESOLVER="0.0.5038989"
    REACT_APP_RPC_FACTORY="0.0.5039041"

    REACT_APP_PROJECT_ID="your_project_id_from_walletconnect"
    REACT_APP_DAPP_NAME="Asset Tokenization Studio"
    REACT_APP_DAPP_DESCRIPTION="Asset Tokenization Studio. Built on Hedera Hashgraph."
    REACT_APP_DAPP_URL="https://wc.ats.com/"
    REACT_APP_DAPP_ICONS='["https://stablecoinstudio.com/static/media/hedera-hbar-logo.4fd73fb360de0fc15d378e0c3ebe6c80.svg"]'
    ```

5. Save the file and proceed with running the application.

# Run

In order to run the application locally:

- Clone the repository
- Install the application as described in the *Installation* section
- Create a ".env" file in the *web* module (using the ".env.sample" file as a template)
- Open a terminal and go to the *web* folder
- Run the command : __yarn dev__
- Open a browser and type in the URL displayed in the terminal (by default it will be : *http://localhost:5173*)


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