<div align="center">

# Asset Tokenization Studio - Web

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Yarn Version Compatibility](#yarn-version-compatibility)**<br>
- **[Installation](#installation)**<br>
- **[Run](#run)**<br>
- **[Test](#test)**<br>

# Description

Front End for the Asset Tokenization Studio.
This Dapp interacts directly with the Hedera Testnet through the SDK.

# Yarn Version Compatibility

This project is compatible with Yarn version 1.22.19. Please ensure you have this version installed before running any yarn commands. If you need to install this version, you can run:

```
npm install -g yarn@1.22.19
```

# Installation

First, verify that you have the correct version of Yarn installed by running `yarn --version`. You should see `1.22.19` as the output.

Then, install the project dependencies with:

```
yarn install
```

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
