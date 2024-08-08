<div align="center">

# Asset Tokenization Studio - SDK

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Installation](#installation)**<br>
- **[Build](#build)**<br>
- **[Test](#test)**<br>


# Description

The SDK enables the web (or any other client facing application) to interact with the smart contracts deployed on Hedera.

# Installation

Run the command :

```
npm ci
```

# Build

Run the command :

```
npm run build
```

# Test

The SDK tests are located in the *__tests__* folder at the root of the sdk module.

Before running the tests you will need to create an ".env" file following the ".env.sample" template.

Then to execute all the tests run this command from the *sdk* folder:

```
npm run test
```