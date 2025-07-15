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

The standard used for security token is ERC-1400.

In version 1.5.0 is added partially compability with standard ERC-3643 (TREX) that will be fully compatible in future versions (identity and compliance).

## ERC-3643 compatibility 

| **function**   | **status**  |
| -------------- | ----------- | 
| onchainID() external view returns (address) | Pending |
| version() external view returns (string memory) | Done | 
| identityRegistry() external view returns (IIdentityRegistry) | Pending | 
| compliance() external view returns (ICompliance) | Pending | 
| paused() external view returns (bool) | Done |
| isFrozen(address _userAddress) external view returns (bool) | Done | 
| getFrozenTokens(address _userAddress) external view returns (uint256) | Done |
| setName(string calldata _name) external | Done |
| setSymbol(string calldata _symbol) external | Done |
| setOnchainID(address _onchainID) external | Pending | 
| pause() external | Done |
| unpause() external | Done |
| setAddressFrozen(address _userAddress, bool _freeze) external | Done | 
| freezePartialTokens(address _userAddress, uint256 _amount) external | Done |
| unfreezePartialTokens(address _userAddress, uint256 _amount) external | Done |
| setIdentityRegistry(address _identityRegistry) external | Pending | 
| setCompliance(address _compliance) external | Pending | 
| forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool) | Done | 
| mint(address _to, uint256 _amount) external | Done | 
| burn(address _userAddress, uint256 _amount) external | Done | 
| recoveryAddress(address _lostWallet, address _newWallet, address _investorOnchainID) external returns (bool) | Done |
| batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external | Done |
| batchForcedTransfer(address[] calldata _fromList, address[] calldata _toList, uint256[] calldata _amounts) external | Done |
| batchMint(address[] calldata _toList, uint256[] calldata _amounts) external | Done |
| batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external | Done |
| batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external | Done |
| batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external | Done |
| batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external | Done |


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

-   `input` (required): The string to be hashed.

```bash
npx hardhat keccak256 "ADMIN_ROLE"
```

### getConfigurationInfo

Fetches and displays detailed information about all facets (implementations) associated with a specific configuration ID from the BusinessLogicResolver.

**Parameters:**

-   `resolver` (required): The resolver proxy admin address.
-   `configurationId` (required): The configuration ID.
-   `network` (required): The network to use (e.g., local, previewnet, testnet, mainnet).

```bash
npx hardhat getConfigurationInfo  <resolverAddress> <configurationId> --network <network-name>
```

### getResolverBusinessLogics

Retrieves and lists all registered business logic keys (contract identifiers) from a BusinessLogicResolver contract.

**Parameters:**

-   `resolver` (required): The resolver proxy admin address.
-   `network` (required): The network to use (e.g., local, previewnet, testnet, mainnet).

```bash
npx hardhat getResolverBusinessLogics <resolverAddress> --network <network-name>
```

### updateBusinessLogicKeys

Registers or updates the addresses of a list of business logic implementation contracts in a specified `BusinessLogicResolver`. 

**Parameters:**
-   `resolverAddress` (required): The address of the `BusinessLogicResolver` contract.
-   `implementationAddressList` (required): A comma-separated list of contract addresses to be registered or updated in the resolver.At least all facets already registered must be included.
-   `privateKey` (optional): The private key in raw hexadecimal format of the account that will sign the transaction.
-   `signerAddress` (optional): The address of the signer to select from the Hardhat signers array.
-   `signerPosition` (optional): The index of the signer to select from the Hardhat signers array.
-   `network` (required): The network to run the command on (e.g., localhost, mainnet, testnet).

```bash
npx hardhat updateBusinessLogicKeys <resolverAddress> <allFacetsAddressList> --network <network-name>
```

### updateProxyImplementation

Upgrades the implementation address for a given transparent proxy contract. This task executes the upgrade by calling the `upgrade` function on the associated `ProxyAdmin` contract. The signer executing this task must be the owner of the `ProxyAdmin` contract.

**Parameters:**

*   `proxyAdminAddress` (required): The address of the `ProxyAdmin` contract that owns the proxy.
*   `transparentProxyAddress` (required): The address of the transparent proxy contract to be upgraded.
*   `newImplementationAddress` (required): The address of the new implementation contract.
*   `privateKey` (optional): The private key in raw hexadecimal format of the account that will sign the transaction.
*   `signerAddress` (optional): The address of the signer to select from the Hardhat signers array.
*   `signerPosition` (optional): The index of the signer to select from the Hardhat signers array.
*   `network` (required): The network to run the command on (e.g., localhost, mainnet, testnet).

```bash
npx hardhat updateProxyImplementation <proxyAdminAddress> <transparentProxyAddress> <newImplementationAddress> --network <networkName>
```

### getProxyAdminConfig

Retrieves key configuration details from a `ProxyAdmin` contract. It fetches the owner of the `ProxyAdmin` contract and the current implementation address for a specific proxy contract that it manages.

**Parameters:**

*   `proxyAdmin` (required): The address of the `ProxyAdmin` contract.
*   `proxy` (required): The address of the proxy contract managed by the `ProxyAdmin`.
*   `network` (required): The network to run the command on (e.g., localhost, mainnet, testnet).

```bash
npx hardhat getProxyAdminConfig <proxyAdminAddress> <proxyAddress> --network <networkName>
```

# Test

The contracts tests are located in the _test_ folder at the root of the contracts module.

In order to execute all the tests run this command from the _contracts_ folder:

```
npm run test
```

### Adding a new facet

When introducing a new facet to the project, make sure to follow these steps:

1. **Register the contract name** <br>
  Add the name of the new facet to the `CONTRACT_NAMES` array in the `Configuration.ts` file.

2. **Update the deploy task listener** <br>
  In the `deployAll` task, include the new facet so its contract address is properly tracked via the mirror node.

3. **Deploy the facet** <br>
   In `scripts/deploy.ts`, within the `deployAtsContracts` function, add the logic to deploy the new facet and ensure the script awaits its deployment.


# Latest Deployed Smart Contracts

| **Contract**                           | **Address**                                | **ID**      |
| -------------------------------------- | ------------------------------------------ | ----------- |
| Business Logic Resolver Proxy          | 0x20448EABf5d0EC3De6e26cce124Bf7b83E71F461 | 0.0.6349503 |
| Business Logic Resolver Proxy Admin    | 0xBcAd67895fa1AB30Df5d693307e33660bB359964 | 0.0.6349502 |
| Business Logic Resolver                | 0xc253Cd59916ed746c26d479c22208bd899F2F84e | 0.0.6349501 |
| Factory Proxy                          | 0xDC7371539489925573Cb4cf645fE4185E9A34e1a | 0.0.6349546 |
| Factory Proxy Admin                    | 0xc65e58224c647e6274F7aADa6B970Ee414DB2A3A | 0.0.6349545 |
| Factory                                | 0x60896554591765161B5cb30934FB028fD0dD8CBB | 0.0.6349544 |
| Access Control                         | 0xdF76da9E60dFdFC9a7807A006f86Dbd2b7eba2b1 | 0.0.6349504 |
| Cap                                    | 0xcc0C74A0F02873423681b1B4a14BfC4c9b90a268 | 0.0.6349505 |
| Control List                           | 0xa05d3Ab681b07aD0194266140acd0D28E13e4932 | 0.0.6349506 |
| Kyc                                    | 0x2635272E889a9f41043f043B7e878DB6578F5921 | 0.0.6349507 |
| SsiManagement                          | 0xABBFd0f021B09e48FC134f793790D45396F31231 | 0.0.6349508 |
| Pause                                  | 0x6358D00e1500e2DC14cD076318AA90eD37db2FDb | 0.0.6349509 |
| ERC20                                  | 0xCfC89968210EAEB7eBcdF332385562eB7982Ff6B | 0.0.6349512 |
| ERC1410                                | 0xD39a5923a14346088077234BB2a1AD0bC5f221b7 | 0.0.6349513 |
| ERC1594                                | 0xF0a03D43D0E134f870659593A84f366F12E64782 | 0.0.6349514 |
| ERC1643                                | 0xB7DF58517970079b534b2AB23C90582917c0fC2C | 0.0.6349515 |
| ERC1644                                | 0x9959aB13DBc4bcaE106d78F6b7d3f33d8b6Deadc | 0.0.6349516 |
| Snapshots                              | 0x0063FAdf9c4A38101b23F1215462f570A1805A18 | 0.0.6349517 |
| Diamond Facet                          | 0x085826Ee602dc86F94f9B3603B35E4E2CA430f0b | 0.0.6349518 |
| Equity                                 | 0x82c250Ab02CbD1A7a7098460DBbCe95A216ED3DA | 0.0.6349519 |
| Bond                                   | 0xA9baf66163cb8ef74d73De9eB02eE3b321d302F0 | 0.0.6349520 |
| Scheduled Snapshots                    | 0x5f8f36f338F239b2AD669eE6A1cBaF819B5BB0ac | 0.0.6349521 |
| Scheduled Balance Adjustments          | 0x2DbeE4b90CfCbb655eDFf0e6b989149087e8393a | 0.0.6349524 |
| Scheduled Tasks                        | 0x900fA92765d466d14AF0C1F2C1e649144dAb3417 | 0.0.6349525 |
| Corporate Actions                      | 0x9AA5cEE07F067435066588580228BfDB6785152b | 0.0.6349526 |
| Lock                                   | 0x9Dde239930346251411A5543F499f324A10F65E1 | 0.0.6349510 |
| Hold                                   | 0x9EF517df653883450c6B2c19e57491a980D48A66 | 0.0.6349511 |
| Transfer and Lock                      | 0x5B0CEA189499A2CF29ea3C657ED88b01FFA3528b | 0.0.6349527 |
| Adjust Balances                        | 0x042e75E2679bcd03901F372fcC661ede508911ca | 0.0.6349528 |
| Clearing Action Facet                  | 0xd853bD0535c6F8242a90778Eca6B816B2F7Cbe3d | 0.0.6349537 |
| Clearing Transfer Facet                | 0x8657Fced3D157De64D948cD2E0F1573D0B9F7527 | 0.0.6349530 |
| Clearing Redeem Facet                  | 0xb5E711220F25093581001B5A102D468C9CFBA537 | 0.0.6349532 |
| Clearing Hold Creation Facet           | 0x4e41a4be0D4A11A10Af6D8E5D710860F7f887714 | 0.0.6349535 |
| Clearing Read Facet                    | 0xd0A6A587D9E718e2ce597539D5dF8F6ad4bD8D93 | 0.0.6349536 |
| External Pause Management Facet        | 0x4780E9985D781417fD16d5eE35C5Aeef2aeF26Ba | 0.0.6349538 |
| External Control List Management Facet | 0xdD854B7d21A581F29cF1a85b784af8F0Bb451655 | 0.0.6349539 |
| External Kyc List Management Facet     | 0xd961b9FeD6E817e79148295bbFe904E92A5CA228 | 0.0.6349540 |
| Protected Partitions                   | 0x2b86fDa0fe11E2eb6cf2C3a20f88cD5FB6d573E6 | 0.0.6349529 |
| ERC3643                                | 0x48C2FaC3660f30E0Fa6C539f28acc78D528f5dCb | 0.0.6349541 |
