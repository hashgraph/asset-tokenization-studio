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

The contracts module contains the code of all Solidity smart contracts deployed on Hedera. This package is part of the Asset Tokenization Studio monorepo.

The standard used for security tokens is ERC-1400.

Version 1.15.0 introduces partial compatibility with the ERC-3643 (TREX) standard; full identity and compliance support will be added in future releases.

## Workspace Context

This package is located at `packages/ats/contracts` within the monorepo. Other packages (like the SDK) depend on the compiled artifacts from this package.

# Installation

From the monorepo root:

```bash
npm ci                        # Install all workspace dependencies
npm run ats:contracts:build   # Build the contracts
```

For local development:

```bash
cd packages/ats/contracts
npm install
npm run compile
```

# Build

Build contracts using workspace commands from the root:

```bash
npm run ats:contracts:build
```

Or build all ATS components:

```bash
npm run ats:build
```

## ERC-3643 compatibility

| **function**                                                                                                           | **status** |
| ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| onchainID() external view returns (address)                                                                            | Done       |
| version() external view returns (string memory)                                                                        | Done       |
| identityRegistry() external view returns (IIdentityRegistry)                                                           | Done       |
| compliance() external view returns (ICompliance)                                                                       | Done       |
| paused() external view returns (bool)                                                                                  | Done       |
| isFrozen(address \_userAddress) external view returns (bool)                                                           | Done       |
| getFrozenTokens(address \_userAddress) external view returns (uint256)                                                 | Done       |
| setName(string calldata \_name) external                                                                               | Done       |
| setSymbol(string calldata \_symbol) external                                                                           | Done       |
| setOnchainID(address \_onchainID) external                                                                             | Done       |
| pause() external                                                                                                       | Done       |
| unpause() external                                                                                                     | Done       |
| setAddressFrozen(address \_userAddress, bool \_freeze) external                                                        | Done       |
| freezePartialTokens(address \_userAddress, uint256 \_amount) external                                                  | Done       |
| unfreezePartialTokens(address \_userAddress, uint256 \_amount) external                                                | Done       |
| setIdentityRegistry(address \_identityRegistry) external                                                               | Done       |
| setCompliance(address \_compliance) external                                                                           | Done       |
| forcedTransfer(address \_from, address \_to, uint256 \_amount) external returns (bool)                                 | Done       |
| mint(address \_to, uint256 \_amount) external                                                                          | Done       |
| burn(address \_userAddress, uint256 \_amount) external                                                                 | Done       |
| recoveryAddress(address \_lostWallet, address \_newWallet, address \_investorOnchainID) external returns (bool)        | Done       |
| batchTransfer(address[] calldata \_toList, uint256[] calldata \_amounts) external                                      | Done       |
| batchForcedTransfer(address[] calldata \_fromList, address[] calldata \_toList, uint256[] calldata \_amounts) external | Done       |
| batchMint(address[] calldata \_toList, uint256[] calldata \_amounts) external                                          | Done       |
| batchBurn(address[] calldata \_userAddresses, uint256[] calldata \_amounts) external                                   | Done       |
| batchSetAddressFrozen(address[] calldata \_userAddresses, bool[] calldata \_freeze) external                           | Done       |
| batchFreezePartialTokens(address[] calldata \_userAddresses, uint256[] calldata \_amounts) external                    | Done       |
| batchUnfreezePartialTokens(address[] calldata \_userAddresses, uint256[] calldata \_amounts) external                  | Done       |

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

**Parameters**:

- `useDeployed` (optional, default: true): Reuses already deployed contracts.
- `file-name` (optional): The output file name.
- `privateKey` (optional): Private key in raw hexadecimal format.
- `signerAddress` (optional): Signer address from the Hardhat signers array.
- `signerPosition` (optional): Index of the signer in the Hardhat signers array.
- `network` (optional): The network to run the command on (e.g., localhost, mainnet, testnet).

```bash
npx hardhat deployAll --useDeployed false
```

### deploy

Deploys a specific contract.

**Parameters**:

- `contractName` (required): Name of the contract to deploy (e.g., ERC20, Bond).
- `privateKey` (optional): Private key in raw hexadecimal format.
- `signerAddress` (optional): Signer address from the Hardhat signers array.
- `signerPosition` (optional): Index of the signer in the Hardhat signers array.

```bash
npx hardhat deploy --contractName ERC20
```

### keccak256

Calculates and prints the Keccak-256 hash of a given string.

**Parameters:**

- `input` (required): The string to be hashed.

```bash
npx hardhat keccak256 "ADMIN_ROLE"
```

### getConfigurationInfo

Fetches and displays detailed information about all facets (implementations) associated with a specific configuration ID from the BusinessLogicResolver.

**Parameters:**

- `resolver` (required): The resolver proxy admin address.
- `configurationId` (required): The configuration ID.
- `network` (required): The network to use (e.g., local, previewnet, testnet, mainnet).

```bash
npx hardhat getConfigurationInfo  <resolverAddress> <configurationId> --network <network-name>
```

### getResolverBusinessLogics

Retrieves and lists all registered business logic keys (contract identifiers) from a BusinessLogicResolver contract.

**Parameters:**

- `resolver` (required): The resolver proxy admin address.
- `network` (required): The network to use (e.g., local, previewnet, testnet, mainnet).

```bash
npx hardhat getResolverBusinessLogics <resolverAddress> --network <network-name>
```

### updateBusinessLogicKeys

Registers or updates the addresses of a list of business logic implementation contracts in a specified `BusinessLogicResolver`.

**Parameters:**

- `resolverAddress` (required): The address of the `BusinessLogicResolver` contract.
- `implementationAddressList` (required): A comma-separated list of contract addresses to be registered or updated in the resolver.At least all facets already registered must be included.
- `privateKey` (optional): The private key in raw hexadecimal format of the account that will sign the transaction.
- `signerAddress` (optional): The address of the signer to select from the Hardhat signers array.
- `signerPosition` (optional): The index of the signer to select from the Hardhat signers array.
- `network` (required): The network to run the command on (e.g., localhost, mainnet, testnet).

```bash
npx hardhat updateBusinessLogicKeys <resolverAddress> <allFacetsAddressList> --network <network-name>
```

### updateProxyImplementation

Upgrades the implementation address for a given transparent proxy contract. This task executes the upgrade by calling the `upgrade` function on the associated `ProxyAdmin` contract. The signer executing this task must be the owner of the `ProxyAdmin` contract.

**Parameters:**

- `proxyAdminAddress` (required): The address of the `ProxyAdmin` contract that owns the proxy.
- `transparentProxyAddress` (required): The address of the transparent proxy contract to be upgraded.
- `newImplementationAddress` (required): The address of the new implementation contract.
- `privateKey` (optional): The private key in raw hexadecimal format of the account that will sign the transaction.
- `signerAddress` (optional): The address of the signer to select from the Hardhat signers array.
- `signerPosition` (optional): The index of the signer to select from the Hardhat signers array.
- `network` (required): The network to run the command on (e.g., localhost, mainnet, testnet).

```bash
npx hardhat updateProxyImplementation <proxyAdminAddress> <transparentProxyAddress> <newImplementationAddress> --network <networkName>
```

### getProxyAdminConfig

Retrieves key configuration details from a `ProxyAdmin` contract. It fetches the owner of the `ProxyAdmin` contract and the current implementation address for a specific proxy contract that it manages.

**Parameters:**

- `proxyAdmin` (required): The address of the `ProxyAdmin` contract.
- `proxy` (required): The address of the proxy contract managed by the `ProxyAdmin`.
- `network` (required): The network to run the command on (e.g., localhost, mainnet, testnet).

```bash
npx hardhat getProxyAdminConfig <proxyAdminAddress> <proxyAddress> --network <networkName>
```

# Test

The tests are organized into two main categories:

- **Contract Tests** (`test/contracts/`) - Unit tests for Solidity smart contracts
- **Scripts Tests** (`test/scripts/`) - Unit and integration tests for TypeScript deployment scripts

## Test Structure

```
test/
├── contracts/
│   ├── unit/        # Contract unit tests (npm test, test:parallel, coverage)
│   └── demo/        # Demo tests (test:demo - explicit only)
│
└── scripts/
    ├── unit/        # Script unit tests (utilities, infrastructure)
    └── integration/ # Script integration tests (deployment, registry operations)
```

## Running tests

### From monorepo root (recommended):

```bash
npm run ats:contracts:test
```

### From contracts directory:

```bash
cd packages/ats/contracts
npm test                    # Runs contract unit tests only
npm run test:parallel       # Runs contract unit tests in parallel
npm run test:scripts        # Runs all script tests
```

### Available test commands:

```bash
# Contract Tests
npm test                           # Contract unit tests only
npm run test:parallel              # Contract unit tests (parallel execution)
npm run test:coverage              # Contract test coverage
npm run test:coverage:layer1       # Layer 1 coverage
npm run test:factory               # Factory tests
npm run test:resolver              # Resolver tests

# Script Tests
npm run test:scripts               # All script tests
npm run test:scripts:unit          # Script unit tests (utilities, infrastructure)
npm run test:scripts:integration   # Script integration tests (deployment, registry)

# Demo Tests (explicit only, not included in npm test)
npm run test:demo                  # Demo tests
npm run test:demo:hedera           # Hedera-specific demo tests
```

### Architecture

The Asset Tokenization Studio uses a modular diamond pattern architecture where functionality is split into facets. This approach allows for upgradeable contracts while maintaining gas efficiency.

#### Core Facets

**ERC1400 Token Standard Facets:**

- `ERC1410ManagementFacet`: Token partition management and administrative functions
- `ERC1410ReadFacet`: Read-only token state queries
- `ERC1410TokenHolderFacet`: Token holder operations (transfers, approvals)
- `ERC20Facet`: Basic ERC20 compatibility layer
- `ERC1594Facet`: Security token issuance and redemption
- `ERC1644Facet`: Controller operations for forced transfers

**ERC3643 (T-REX) Compliance Facets:**

- `ERC3643Facet`: Core ERC3643 token operations (mint, burn, forced transfers)
- `ERC3643BatchFacet`: Batch operations for gas-efficient bulk actions
- `FreezeFacet`: Advanced freeze functionality for partial and full address freezing

**Hold & Clearing Facets:**

- `HoldManagementFacet`: Hold creation and management
- `HoldReadFacet`: Hold state queries
- `HoldTokenHolderFacet`: Token holder hold operations
- `ClearingHoldCreationFacet`: Clearing-specific hold creation
- `ClearingTransferFacet`: Clearing transfers
- `ClearingRedeemFacet`: Clearing redemptions
- `ClearingActionsFacet`: Clearing operation approvals
- `ClearingReadFacet`: Clearing state queries

### Security Roles

The platform implements a comprehensive role-based access control system:

#### Administrative Roles

- **Admin Role**: Full administrative control over the security token
- **TREX Owner**: Owner of ERC3643 tokens with special privileges for compliance configuration
- **Diamond Owner**: Contract upgrade and facet management permissions

#### Operational Roles

- **Agent**: Can perform mint, burn, and forced transfer operations
- **Freeze Manager**: Can freeze/unfreeze tokens and addresses
- **Controller**: Can execute controller transfers and redemptions
- **Minter**: Can mint new tokens (legacy role, use Agent for ERC3643)
- **Locker**: Can lock tokens for specified periods
- **Control List Manager**: Manages whitelist/blacklist entries
- **KYC Manager**: Manages KYC status for investors
- **SSI Manager**: Manages self-sovereign identity configurations
- **Pause Manager**: Can pause/unpause token operations
- **Snapshot Manager**: Can create token balance snapshots
- **Corporate Actions Manager**: Can execute dividends, voting rights, etc.

### Adding a new facet

When introducing a new facet to the project, make sure to follow these steps:

1. **Register the contract name** <br>
   Add the name of the new facet to the `CONTRACT_NAMES` array in the `Configuration.ts` file.

2. **Update the deploy task listener** <br>
   In the `deployAll` task, include the new facet so its contract address is properly tracked via the mirror node.

3. **Deploy the facet** <br>
   In `scripts/deploy.ts`, within the `deployAtsContracts` function, add the logic to deploy the new facet and ensure the script awaits its deployment.

4. **Configure facet selectors** <br>
   Ensure the facet's function selectors are properly registered in the diamond cut process.

# Deployed Smart Contracts

| **Contract**                           | **Address**                                | **ID**      |
| -------------------------------------- | ------------------------------------------ | ----------- |
| Business Logic Resolver Proxy          | 0xf44be70B71f412643378bbd731Ad3081282Fb033 | 0.0.6930056 |
| Business Logic Resolver Proxy Admin    | 0x80Dcb2A77E56E9520f8B04848D64167bfA378292 | 0.0.6930055 |
| Business Logic Resolver                | 0xce4f0e542bcfD0d8f1229baf9adcAC271ae5978c | 0.0.6930054 |
| Factory Proxy                          | 0x66098aa13268a3f25B37ae532d483DcB08f6f522 | 0.0.6930123 |
| Factory Proxy Admin                    | 0xE5cdBd8d28c048D7bC4929E0D0d3d33aFE1bc929 | 0.0.6930122 |
| Factory                                | 0xdEbA1236Ca1dac9547F54fFAF4B297241c1F4467 | 0.0.6930121 |
| Access Control Facet                   | 0xcD296f27245dD055bb3776a27a48D80da198b202 | 0.0.6930058 |
| Cap Facet                              | 0x4DADAab326E6ab121f7Ed23d749229127cEe318A | 0.0.6930059 |
| Control List Facet                     | 0xFb28f952b3f16669589DA8D769B07C7718e7f1D0 | 0.0.6930060 |
| Kyc Facet                              | 0x4b8068C39ea5Ee9cf1Ba27fd6DA2b7D6c562Ca4f | 0.0.6930062 |
| SsiManagement Facet                    | 0x8A81DC398fC597Df28E172823b1A8f87479dC0E5 | 0.0.6930063 |
| Pause Facet                            | 0xD2677f8E9aa3A202a15d77191c02C55E1879A2E9 | 0.0.6930064 |
| ERC20 Facet                            | 0x629bf025B6FDDB0D44643c55686571aa73289ef0 | 0.0.6930069 |
| ERC1410 Read Facet                     | 0x1C0b482D81E623d206F2d3A52eE40bD42a64c8Fa | 0.0.6930070 |
| ERC1410 Management Facet               | 0xFB61834d2091eD4006cF1A346f34e5323aC30E40 | 0.0.6930071 |
| ERC1410 Issuer Facet                   | 0x8718CDC4fD66C76eb64606035C8Ded127623A649 | 0.0.6930072 |
| ERC1410 TokenHolder Facet              | 0x6aB85765836A5E43692fFD2579C04254501b5E28 | 0.0.6930074 |
| ERC1594 Facet                          | 0xE7cAB8Eb1E264584C85E9f0a1D66e50502e9b83e | 0.0.6930076 |
| ERC1643 Facet                          | 0xE30Fde8b8F31d637D835088824b3B13E0E5B2352 | 0.0.6930077 |
| ERC1644 Facet                          | 0x97FFcd4F0b1E52e0C0Ce9565d534Bae5531B9c9b | 0.0.6930079 |
| Snapshots Facet                        | 0xa15Ff9CC404Ea6B4a4F0790A220d8CB3cAE06572 | 0.0.6930080 |
| Diamond Facet                          | 0x22C93F496C438C7e63E4B56092969BA03b1417AE | 0.0.6930083 |
| Equity Facet                           | 0xB24932c4d4FE51E906921a8897a5c0C10cFb11ff | 0.0.6930085 |
| Bond Facet                             | 0x3F83d296eAd06d74672EEFEBE993C3D707A4f6C2 | 0.0.6930086 |
| BondRead                               | 0x1d562F43FBDD1Cfe0E75683475B9CbDe203cDced | 0.0.6930084 |
| Scheduled Snapshots Facet              | 0xBC15Df6e164e90a8eBAfeFC848fA0605fFD22d04 | 0.0.6930087 |
| Scheduled Balance Adjustments Facet    | 0x66eaac9f0c142D39643ACb5D283eE7cAd6778d85 | 0.0.6930088 |
| Scheduled Cross Ordered Tasks Facet    | 0xA18e09C0AeC82c70f372fcE182F71aa7da9523c6 | 0.0.6930089 |
| Corporate Actions Facet                | 0x2B9464e2D13278b681ad08e9741BFADc58268438 | 0.0.6930090 |
| Lock Facet                             | 0xe7932c9aC6198Fcb4Ff3fB571dF7f05Ed1b0196b | 0.0.6930065 |
| Hold Read Facet                        | 0x7923909D008dc07F835ECCef7B333A4EaDf08432 | 0.0.6930066 |
| Hold Management Facet                  | 0xff99e2ec8fb9565b9A04d7c8e4EE9223CaD8B27D | 0.0.6930067 |
| Hold TokenHolder Facet                 | 0xd8CA90867F9D9434C3cc644dc2A1856543a27D30 | 0.0.6930068 |
| Transfer and Lock Facet                | 0xCAdCC836ffE50Aabd68137F17b914B5Bff22504e | 0.0.6930091 |
| Adjust Balances Facet                  | 0xE4F1e2530afCd535FdAFe8CdEBFfC96ae8a5Cc70 | 0.0.6930092 |
| Clearing Action Facet                  | 0x2F0BB35125407DFdB3BCFBcC3e947e69a0dc253e | 0.0.6930103 |
| Clearing Transfer Facet                | 0xce70D4F37b976bee2Aa961A0d89719314312def1 | 0.0.6930095 |
| Clearing Redeem Facet                  | 0x322bfdfB61Efa214dc3ACD61362258233A4eD240 | 0.0.6930099 |
| Clearing Hold Creation Facet           | 0x9F72d0fD1992C10889D8B865736Ab0aFA8d6A9ac | 0.0.6930100 |
| Clearing Read Facet                    | 0xd9c933C85b9B81C800Cd1F78c42469A6F681bAa7 | 0.0.6930101 |
| Proceed Recipients Facet               | 0xC07A6aE17660Df4E3a93FaBb288635BaeD218F99 | 0.0.6930104 |
| External Pause Management Facet        | 0x30FB9962a38a76Fe5A37f5B1d01A4F2d7074b5D8 | 0.0.6930105 |
| External Control List Management Facet | 0x265dd9126e189Aa7AdF530468b0d2e97e139eBcB | 0.0.6930106 |
| External Kyc List Management Facet     | 0xbB6f8E0BDFaF5bE2AC551cc661C881c31d647155 | 0.0.6930109 |
| Protected Partitions Facet             | 0x903103Fb92eBBE331af410874bcad6218843518E | 0.0.6930093 |
| ERC3643 Management Facet               | 0x72a41aC5Df74381e3ed4812a10Dbc08c26dED5c6 | 0.0.6930111 |
| ERC3643 Operations Facet               | 0xc24bAc42E3FB05f76B47Da66791A74eFd4DeAf3c | 0.0.6930113 |
| ERC3643 Read Facet                     | 0xB70962B5C7C670A0491fbd088e1375Eb09b54386 | 0.0.6930116 |
| ERC3643 Batch Facet                    | 0x1dE35551d78B53B537Ba033d75D7b55D7dF5b5Ed | 0.0.6930118 |
| Freeze Facet                           | 0xfd3C8ff63CD7648516702df850DF5B9c6dF7f17c | 0.0.6930119 |
| ERC20Permit Facet                      | 0x4Ceb1b2df658C00a42E526bF546AEeE4E0eb6b6F | 0.0.6930075 |

# 🔐 Role Definitions by Layer

This project follows a layered smart contract architecture with role-based access control using `AccessControl`. Roles are defined in three distinct layers to separate responsibilities and permissions.

---

## 🟦 Layer 0:

```solidity
bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant _CONTROL_LIST_ROLE = 0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3;
bytes32 constant _CORPORATE_ACTION_ROLE = 0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6;
bytes32 constant _ISSUER_ROLE = 0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842;
bytes32 constant _DOCUMENTER_ROLE = 0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41;
bytes32 constant _CONTROLLER_ROLE = 0xa72964c08512ad29f46841ce735cff038789243c2b506a89163cc99f76d06c0f;
bytes32 constant _PAUSER_ROLE = 0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb;
bytes32 constant _CAP_ROLE = 0xb60cac52541732a1020ce6841bc7449e99ed73090af03b50911c75d631476571;
bytes32 constant _SNAPSHOT_ROLE = 0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da;
bytes32 constant _LOCKER_ROLE = 0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88;
bytes32 constant _BOND_MANAGER_ROLE = 0x8e99f55d84328dd46dd7790df91f368b44ea448d246199c88b97896b3f83f65d;
bytes32 constant _PROTECTED_PARTITIONS_ROLE = 0x8e359333991af626d1f6087d9bc57221ef1207a053860aaa78b7609c2c8f96b6;
bytes32 constant _PROTECTED_PARTITIONS_PARTICIPANT_ROLE = 0xdaba153046c65d49da6a7597abc24374aa681e3eee7004426ca6185b3927a3f5;
bytes32 constant _WILD_CARD_ROLE = 0x96658f163b67573bbf1e3f9e9330b199b3ac2f6ec0139ea95f622e20a5df2f46;
bytes32 constant _AGENT_ROLE = 0xc4aed0454da9bde6defa5baf93bb49d4690626fc243d138104e12d1def783ea6;
```

## 🟨 Layer 1:

```solidity
bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant _SSI_MANAGER_ROLE = 0x0995a089e16ba792fdf9ec5a4235cba5445a9fb250d6e96224c586678b81ebd0;
bytes32 constant _KYC_ROLE = 0x6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d;
bytes32 constant _CLEARING_ROLE = 0x2292383e7bb988fb281e5195ab88da11e62fec74cf43e8685cff613d6b906450;
bytes32 constant _CLEARING_VALIDATOR_ROLE = 0x7b688898673e16c47810f5da9ce1262a3d7d022dfe27c8ff9305371cd435c619;
bytes32 constant _PAUSE_MANAGER_ROLE = 0xbc36fbd776e95c4811506a63b650c876b4159cb152d827a5f717968b67c69b84;
bytes32 constant _CONTROL_LIST_MANAGER_ROLE = 0x0e625647b832ec7d4146c12550c31c065b71e0a698095568fd8320dd2aa72e75;
bytes32 constant _KYC_MANAGER_ROLE = 0x8ebae577938c1afa7fb3dc7b06459c79c86ffd2ac9805b6da92ee4cbbf080449;
bytes32 constant _INTERNAL_KYC_MANAGER_ROLE = 0x3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e;
bytes32 constant _FREEZE_MANAGER_ROLE = 0xd0e5294c1fc630933e135c5b668c5d577576754d33964d700bbbcdbfd7e1361b;
bytes32 constant _MATURITY_REDEEMER_ROLE = 0xa0d696902e9ed231892dc96649f0c62b808a1cb9dd1269e78e0adc1cc4b8358c;
```

## 🟩 Layer 2:

```solidity
bytes32 constant _ADJUSTMENT_BALANCE_ROLE = 0x6d0d63b623e69df3a6ea8aebd01f360a0250a880cbc44f7f10c49726a80a78a9;
```

---

## 🧩 Notes:

- All roles are `bytes32` constants derived using: `keccak256("security.token.standard.role.<roleName>")` _(replace `<roleName>` with the actual role string)_
