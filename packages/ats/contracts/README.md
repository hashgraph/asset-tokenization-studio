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
- `ERC20`: Basic ERC20 compatibility layer
- `ERC1594`: Security token issuance and redemption
- `ERC1644`: Controller operations for forced transfers

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
| Business Logic Resolver Proxy          | 0x6E70DC7E1E9C96355076bd85258F65f9DDa54b20 | 0.0.6574176 |
| Business Logic Resolver Proxy Admin    | 0xFaff76f576abfCc48F239FDD438E626E1DD4310F | 0.0.6574175 |
| Business Logic Resolver                | 0x3806Bf042D6f0f431B709F6a43254F9128E067c7 | 0.0.6574174 |
| Factory Proxy                          | 0x72EE20a9E9571c3940bE41C6aad5fE9A28e01a85 | 0.0.6574245 |
| Factory Proxy Admin                    | 0xf9488F063AFEc34dc44CC94C99DCFE6b435B5768 | 0.0.6574243 |
| Factory                                | 0x1693C2bBC0b58E47638065059e7e5e163a6ff913 | 0.0.6574242 |
| Access Control                         | 0x02625B1cecc491d476629876ec9Cd88Ba0c682B1 | 0.0.6574178 |
| Cap                                    | 0x30745dd65C27Fc196738dB8f937a9265FBdb56CC | 0.0.6574179 |
| Control List                           | 0xC6C39235773Af61CDE02b6E466061f6BC254CB0c | 0.0.6574181 |
| Kyc                                    | 0xaca020408aD7110a2A04606457F8B4f4990a27AC | 0.0.6574182 |
| SsiManagement                          | 0x40cfF59FFe6248DDcfA8d2237443c3969fB3029B | 0.0.6574183 |
| Pause                                  | 0x6E5413c4E1442ab91BbD2e22c95C618323d29E59 | 0.0.6574184 |
| ERC20                                  | 0xfa7C3442423D02966cc0eaEF37B2B337cbBa26df | 0.0.6574190 |
| ERC1410Read                            | 0xCD530Eff64aa3cfF36996978f63dDd3f365ba783 | 0.0.6574193 |
| ERC1410Management                      | 0xc4d83a9B197ef79E83d36e9a96BBcF47F91D2a33 | 0.0.6574194 |
| ERC1410TokenHolder                     | 0xB385Be34DD8F59dBB51d865Ce6D5355b9faA21ae | 0.0.6574195 |
| ERC1594                                | 0xB74FFC76fd989c7BfdC5e85Ed22D1d1Ad74490a8 | 0.0.6574198 |
| ERC1643                                | 0x2E3Ae9875c86b80661c894dBB0e730BdeE816bF3 | 0.0.6574200 |
| ERC1644                                | 0xAAA44b82B62148771A7826a31fF6254476a36B74 | 0.0.6574201 |
| Snapshots                              | 0xA6787f85faff989edfB0D3F9aBc9e36e2130c94B | 0.0.6574203 |
| Diamond Facet                          | 0xE808213fc51A8AE8F810F7c5aAAd2888597a2Aa4 | 0.0.6574206 |
| Equity                                 | 0x65717323114dfD290Cac05d9B98E4b57e26fcC7b | 0.0.6574207 |
| Bond                                   | 0xae2003B0BeE6887342F074ab08e7a85a4417fcDe | 0.0.6574209 |
| Scheduled Snapshots                    | 0x7843C4576798F12aa8357B8ed72c89B7e2038CE5 | 0.0.6574210 |
| Scheduled Balance Adjustments          | 0x23DfA40D1623C798D2026Da225C9753dcB57400c | 0.0.6574211 |
| Scheduled Tasks                        | 0xb34c65CF033570B946c77E877288ab27Ab0F9f6E | 0.0.6574214 |
| Corporate Actions                      | 0x35d39582f3b14e9B742916d554563c8e54f01406 | 0.0.6574215 |
| Lock                                   | 0x245B3C1D1AD59e1449af0a57370559fD15Db7329 | 0.0.6574185 |
| Hold Read Facet                        | 0x15edFd54B5E76664B60Af47eF691d94608fc57CD | 0.0.6574186 |
| Hold Management Facet                  | 0x9c53C72f7e6DAd515B35959F770e82313193032b | 0.0.6574187 |
| Hold TokenHolder Facet                 | 0x11Aa9898371b18Ef2FfA19E062f8f6395AcD9BA1 | 0.0.6574189 |
| Transfer and Lock                      | 0xea1Df18b3AaFB37D44C024Db32ffBe80F3b666fc | 0.0.6574216 |
| Adjust Balances                        | 0x027698e5d8950146aC2792423ac5404a2A3B3f28 | 0.0.6574217 |
| Clearing Action Facet                  | 0x341e459241d860e91e45E8466b41c6BdcFd90399 | 0.0.6574227 |
| Clearing Transfer Facet                | 0x77D22229E5B70b81c5F8d00355F808C088945f91 | 0.0.6574219 |
| Clearing Redeem Facet                  | 0x402d0f49B745247aa91dF94BE9e475AA2E7116f4 | 0.0.6574222 |
| Clearing Hold Creation Facet           | 0x23AdC4348139aC936632605b11CFbBd26F9C726D | 0.0.6574225 |
| Clearing Read Facet                    | 0xbf5481Ca849dbDcbEC2857da4FaAf86782Bcf239 | 0.0.6574226 |
| External Pause Management Facet        | 0x888766208e2Fe9f3dc49EA580d7dEc7bd803eA52 | 0.0.6574229 |
| External Control List Management Facet | 0xA4d54d17d5cA23C7d59CFcEC0c68151df6Bdf6e2 | 0.0.6574230 |
| External Kyc List Management Facet     | 0xb4F2f8dD3D039014A7Fb640235CDfE2635D208f9 | 0.0.6574231 |
| Protected Partitions                   | 0xA52cEd9F146c608Df8330B8566aA02BB883Cd67e | 0.0.6574218 |
| ERC3643 Facet                          | 0x4d1307bCdDef88EA32988BB9e545b9e9f00787a1 | 0.0.6574233 |
| ERC3643 Batch Facet                    | 0x747D1309c11cC9ED8D56D6E5cef592824eEF8d1D | 0.0.6574235 |
| Freeze                                 | 0x7de236dFC57E70A001553De9D884b29603d7DEc8 | 0.0.6574236 |
| ERC20Permit                            | 0x7718c915A8988B9FB07d284D16Ec7eF8Fc3D8918 | 0.0.6574197 |

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
