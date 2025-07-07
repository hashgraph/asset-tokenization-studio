<div align="center">

# Asset Tokenization Studio - Web

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../../../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Yarn Version Compatibility](#yarn-version-compatibility)**<br>
- **[Installation](#installation)**<br>
- **[Environment Variables](#environment-variables)**<br>
  - **[General](#general)**<br>
  - **[Network](#nework)**<br>
  - **[Hedera Wallet Connnect](#hedera-wallet-connnect)**<br>
- **[Run](#run)**<br>
- **[Test](#test)**<br>

# Description

Front End for the Asset Tokenization Studio.
This Dapp interacts directly with the Hedera Testnet through the SDK.

# Yarn Version Compatibility

This project is compatible with Yarn version 1.22.22. Please ensure you have this version installed before running any yarn commands. If you need to install this version, you can run:

```
npm install -g yarn@1.22.22
```

# Installation

First, verify that you have the correct version of Yarn installed by running `yarn --version`. You should see `1.22.22` as the output.

Then, install the project dependencies with:

```
yarn install
```

# Environment Variables

Environment varibales should be included in a ".env" file located in "./web".
Please refer to ".env.sample" to see the list of varibales that must be defined alongside some default values that you could use to start up the application.

Below is a description of which each variable represents.

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

Run the command :

```
yarn dev
```

Open a browser and type in the URL displayed in the terminal (by default it will be : _http://localhost:5173_)

# Test

The following _src_ folders contain _**tests**_ subfolders within them with their corresponding tests:

- components
- layouts
- views

In order to execute all the tests run this command from the _web_ folder:

```
npm run test
```
