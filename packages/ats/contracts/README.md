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

The contracts tests are located in the _test_ folder at the root of the contracts module.

## Running tests

### From monorepo root (recommended):

```bash
npm run ats:contracts:test
```

### From contracts directory:

```bash
cd packages/ats/contracts
npm test
```

### Available test commands:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- test/diamond/diamond.test.ts
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
| Business Logic Resolver Proxy          | 0x2463a7603C43E99D5aeFDCa9Fba752751CaF7B56 | 0.0.6797832 |
| Business Logic Resolver Proxy Admin    | 0xD8946D49b4709e8D50Eba3134Be5535a1f29F3b4 | 0.0.6797830 |
| Business Logic Resolver                | 0xe50D66DBf5562f21F6435589718BDc7476d1822B | 0.0.6797829 |
| Factory Proxy                          | 0xc4028832d0B086e52a8771C39da08529fD3E0d3C | 0.0.6797955 |
| Factory Proxy Admin                    | 0x74C90f57F95Ba359D408290f08EBf3c6B2668c84 | 0.0.6797954 |
| Factory                                | 0x0D8076eAfB5606A0CE5098BB0e37f0B8334f3f49 | 0.0.6797953 |
| Access Control                         | 0x34066e3cF644607C27615719EfCb1ED2DB90f9CF | 0.0.6797835 |
| Cap                                    | 0x0940DFda3CBF3D3b37C79eCBd922734819D380b0 | 0.0.6797836 |
| Control List                           | 0xc11f837d48bbc6662B5483e40bDec3A50Dfd2862 | 0.0.6797838 |
| Kyc                                    | 0x83df167Edb7f292c6a558a6cC0a4654a923CCD71 | 0.0.6797841 |
| SsiManagement                          | 0x7cFA924C5bE7378D015CE89f076534d4aB54108D | 0.0.6797842 |
| Pause                                  | 0xdCa4A3D8153cFE0C0a03a9b6AaFb81d82049cb6a | 0.0.6797843 |
| ERC20                                  | 0xB098a9422228C8F3F9d77FAe0bAEfCB60ebB3986 | 0.0.6797856 |
| ERC1410Read                            | 0x596201A594738258Ee2b0F83738FF0b1802C8aaD | 0.0.6797859 |
| ERC1410Management                      | 0x6Cf4D3cBdD2e298f9Bfcda3C8478b9611077587e | 0.0.6797862 |
| ERC1410TokenHolder                     | 0x6523A10B8Aa962c4E0338D277134f6e74C5dAC80 | 0.0.6797866 |
| ERC1594                                | 0xE8A7C957F33c1a6dEE65A5c557Bbf94107669Cc0 | 0.0.6797871 |
| ERC1643                                | 0xcaCF63220fFD174A284a83246891dEA9015Cd089 | 0.0.6797873 |
| ERC1644                                | 0xD4fdF7Df2c82302F4d437DF4eb0A7398CabF0F44 | 0.0.6797879 |
| Snapshots                              | 0x81416a39391afA2B4CA46D8C54A922aEfE45D15d | 0.0.6797882 |
| Diamond Facet                          | 0xac000bd33Be69BF129063af7D7Aa7EA05f6f28E5 | 0.0.6797887 |
| Equity                                 | 0xF8D4dC21F4Ee6e44E993855241d291414cc54A6A | 0.0.6797892 |
| Bond                                   | 0x66c452053349a11461f51fCa3713293ea5ED4760 | 0.0.6797895 |
| Scheduled Snapshots                    | 0x400C49ee24C4CC024eC92FB778648366f9B1AC49 | 0.0.6797896 |
| Scheduled Balance Adjustments          | 0xc8DeB5d7eB772d80ac2153664996aac2c371DdC5 | 0.0.6797898 |
| Scheduled Tasks                        | 0x2e0970a8078154a1f30bb55BEED0b83C53A55B55 | 0.0.6797899 |
| Corporate Actions                      | 0x0D5CeF872EC39bE0F05cC8a8225722599a47E334 | 0.0.6797901 |
| Lock                                   | 0x500ef05B572F28a8c6Aa9e8E9BEDE21873fE00Da | 0.0.6797846 |
| Hold Read Facet                        | 0x95D79B8c326E743234c6FD217301bebeB2b13159 | 0.0.6797847 |
| Hold Management Facet                  | 0x46F132F87D8f06FB8280F7fE7c1122A08C027E31 | 0.0.6797849 |
| Hold TokenHolder Facet                 | 0xE0495CdaDF78480329aF0AD1C23489552754E11e | 0.0.6797852 |
| Transfer and Lock                      | 0x3C47b48F0EbC2205Bc972474c7e799D04a126229 | 0.0.6797904 |
| Adjust Balances                        | 0xE72C2B1685315987c1bB26139f547c3990aFd201 | 0.0.6797907 |
| Clearing Action Facet                  | 0xEa89c00213BEEAB4E1A983f918046924D32C913C | 0.0.6797922 |
| Clearing Transfer Facet                | 0x71Cc31cbF1284e10c785F6157BFEFF894252cbdB | 0.0.6797911 |
| Clearing Redeem Facet                  | 0x611D96762aD0240161569D4c677625BdfEE593Fb | 0.0.6797914 |
| Clearing Hold Creation Facet           | 0x4396F5B347FC42b31e81b5Df1b9B9303a3e5E077 | 0.0.6797919 |
| Clearing Read Facet                    | 0xd8Ec6d8C6Dc008d796F552A873f71689B733F2cB | 0.0.6797920 |
| External Pause Management Facet        | 0xBea0088Ad580d63180AB05eaFbe58A06BC7d03d6 | 0.0.6797924 |
| External Control List Management Facet | 0x4c334d3b795F138aD4767873Ed4E77EbF6672d01 | 0.0.6797926 |
| External Kyc List Management Facet     | 0x754797640e052eDc4Cd2dD86040a9EF3c9769Af5 | 0.0.6797929 |
| Protected Partitions                   | 0xD20489d428B7f8F13ED5A0B3cE3B9562B4267c8D | 0.0.6797908 |
| ERC3643 Facet                          | 0x34aeaaa62cc4bA5D24E4fa374711126D1C432Fdb | 0.0.6797933 |
| ERC3643 Batch Facet                    | 0x3D104f59d44BD8D6D333416C2d0cc8Ee0450561C | 0.0.6797942 |
| Freeze                                 | 0x05FA46A125847a3d6fF9a348bC95e42Cddb9067C | 0.0.6797946 |
| ERC20Permit                            | 0xE99a559cDD666c0c6F4f92eb738991D237481475 | 0.0.6797867 |

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
