<div align="center">

# Asset Tokenization Studio - Contracts

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Installation](#installation)**<br>
- **[Build](#build)**<br>
- **[Tasks](#tasks)**<br>
- **[Test](#test)**<br>

# Description

The contracts module contains the code of all the solidity smart contracts deployed on Hedera.

# Installation

Run the command :

```
npm ci
```

# Build

Run the command :

```
npm run compile:force
```

# Tasks

### deployAll

Deploys the full infrastructure (factory, resolver, facets, and initialized contracts) in a single execution.

Parameters:

- `account` (optional): Hedera account in 0.0.XXXX format.
- `useDeployed` (optional, default: true): Reuses already deployed contracts.
- `privateKey` (optional): Private key in raw hexadecimal format.
- `signerAddress` (optional): Signer address from the Hardhat signers array.
- `signerPosition` (optional): Index of the signer in the Hardhat signers array.

```bash
npx hardhat deployAll --useDeployed false
```

### deploy

Deploys a specific contract.

Parameters:

- `contractName` (required): Name of the contract to deploy (e.g., ERC20, Bond).
- `privateKey` (optional): Private key in raw hexadecimal format.
- `signerAddress` (optional): Signer address from the Hardhat signers array.
- `signerPosition` (optional): Index of the signer in the Hardhat signers array.

```bash
npx hardhat deploy --contractName ERC20
```

# Test

The contracts tests are located in the _test_ folder at the root of the contracts module.

In order to execute all the tests run this command from the _contracts_ folder:

```
npm run test
```

# Latest Deployed Smart Contracts

| **Contract**                        | **Address**                                | **ID**      |
| ----------------------------------- | ------------------------------------------ | ----------- |
| Business Logic Resolver Proxy       | 0x20a5E266A8b83b248ae3b3516954c400fa7b1281 | 0.0.5827968 |
| Business Logic Resolver Proxy Admin | 0xcC9CdfC299A1b4cfaBF5C3d82522feF9ef5bb65D | 0.0.5827967 |
| Business Logic Resolver             | 0x62b81bA32bd526F0c6C14DDfa178491629DB2A36 | 0.0.5827966 |
| Factory Proxy                       | 0xEA5bF55277777d952deF8D92275f8f82C4d870dF | 0.0.5828112 |
| Factory Proxy Admin                 | 0x22DDA6B4dDb330DB0fC767D53FFec310Cd2a1C38 | 0.0.5828111 |
| Factory                             | 0xb603b85A9Ce5F82288274a069e601967D7EaB9AE | 0.0.5828110 |
| Access Control                      | 0xF715053FEC7e0ebd7C1E195Ea96eACD2f405a40a | 0.0.5827969 |
| Cap                                 | 0x9dF275691dFA0838aa23d0d0Bf1076c30b7DF419 | 0.0.5827970 |
| Control List                        | 0x1066157C65b46DbfA3Ca970b0B9dE6d4e7E2bbd9 | 0.0.5827971 |
| Kyc                                 | 0xb5fb3fD2169289d01b1d31794433E53d324718FE | 0.0.5827973 |
| SsiManagement                       | 0x987ab6a0857D3F14057a04B0aaCFeaB9F56c14D0 | 0.0.5827974 |
| Pause                               | 0xba6CBc7F865C0cb62796E5f498667adF3A9Cc51e | 0.0.5827976 |
| ERC20                               | 0xBbdeffc43B0a11f32c127F188BB029c4b65d6300 | 0.0.5827993 |
| ERC1410                             | 0x8FB10aAB6bd8669eD9745E13F6c850E274e7CdBE | 0.0.5828006 |
| ERC1594                             | 0xC1D3FeF914A746fD5f2252Ae3e3c77cd8e9AdCF0 | 0.0.5828021 |
| ERC1643                             | 0x4F827424315518a3C34a68a098D46B4117964775 | 0.0.5828023 |
| ERC1644                             | 0x9b4F4b6c163546031dae04edB927CE0a8b36eeCC | 0.0.5828034 |
| Snapshots                           | 0x837080e979340eD259FEB04E6DB7Ac8C398F31B1 | 0.0.5828039 |
| Diamond Facet                       | 0x8EC656B12B451a8DAF8d7EA9A23578Eb2316bb2B | 0.0.5828046 |
| Equity                              | 0x26Fe83E5205d06F89391C633C279d26E91104280 | 0.0.5828055 |
| Bond                                | 0x0a075A67Ba2158F626febc0cf41E69b85814D86c | 0.0.5828064 |
| Scheduled Snapshots                 | 0xcd7626C8Cc238fc1c7664aa9233DD48243ea54eB | 0.0.5828067 |
| Scheduled Balance Adjustments       | 0x7bDf559585178Be833C92fFb9C6915481F073489 | 0.0.5828069 |
| Scheduled Tasks                     | 0x385299c36b4A7f57B1fEAba0936DBb2EDa3c3d29 | 0.0.5828072 |
| Corporate Actions                   | 0x05f1241e60ec3B098cCF801a9583801ca3174644 | 0.0.5828078 |
| Lock                                | 0xF3240333A1b944fbd205854229BA3825C3AbD163 | 0.0.5827978 |
| Hold                                | 0xa1f0DCBa93ce06a530Cb1a9cd4f6319d4123f7b5 | 0.0.5827985 |
| Transfer and Lock                   | 0x9322c4EF212810e82Dc64905c83Bb4E700204E4a | 0.0.5828089 |
| Adjust Balances                     | 0xC62479a45CaC582684676277de7c1aE890333c3E | 0.0.5828090 |
| Clearing Action Facet               | 0xCE5257A6E5821Ee0e5e1392Eb3F433D954CDCAd4 | 0.0.5828105 |
| Clearing Transfer Facet             | 0xfB1396E83Fd8e0D62326Af767A463e8c35F2fFB9 | 0.0.5828093 |
| Clearing Redeem Facet               | 0x7B01Dc54924E5EF850a97aBc62afea18D8285A80 | 0.0.5828097 |
| Clearing Hold Creation Facet        | 0x15D17ac9755f1ADa737C0075cF39eD383B3393B2 | 0.0.5828101 |
| Clearing Read Facet                 | 0x8A9a9999E1131B357a46892B0c7a720923e3f73B | 0.0.5828102 |
