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

Version 1.15.0 introduces partial compatibility with the ERC-3643 (TREX) standard; full identity and compliance support will be added in future releases.

## ERC-3643 compatibility

| **function**                                                                                                           | **status** |
| ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| onchainID() external view returns (address)                                                                            | Pending    |
| version() external view returns (string memory)                                                                        | Done       |
| identityRegistry() external view returns (IIdentityRegistry)                                                           | Pending    |
| compliance() external view returns (ICompliance)                                                                       | Pending    |
| paused() external view returns (bool)                                                                                  | Done       |
| isFrozen(address \_userAddress) external view returns (bool)                                                           | Done       |
| getFrozenTokens(address \_userAddress) external view returns (uint256)                                                 | Done       |
| setName(string calldata \_name) external                                                                               | Done       |
| setSymbol(string calldata \_symbol) external                                                                           | Done       |
| setOnchainID(address \_onchainID) external                                                                             | Pending    |
| pause() external                                                                                                       | Done       |
| unpause() external                                                                                                     | Done       |
| setAddressFrozen(address \_userAddress, bool \_freeze) external                                                        | Done       |
| freezePartialTokens(address \_userAddress, uint256 \_amount) external                                                  | Done       |
| unfreezePartialTokens(address \_userAddress, uint256 \_amount) external                                                | Done       |
| setIdentityRegistry(address \_identityRegistry) external                                                               | Pending    |
| setCompliance(address \_compliance) external                                                                           | Pending    |
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
| Business Logic Resolver Proxy          | 0x82Dc7e365b7E0330129382676D32D1D9903027Ae | 0.0.6457760 |
| Business Logic Resolver Proxy Admin    | 0x5E7ac47acB7eD548b4126125832e60Bc3FbFd5Fe | 0.0.6457757 |
| Business Logic Resolver                | 0xe704Ae96569aCC42616F6F847082ecA345e46eDe | 0.0.6457755 |
| Factory Proxy                          | 0x2231A039de55B0ab4c67f314310E6dbfBEB0562E | 0.0.6457855 |
| Factory Proxy Admin                    | 0x223d195D5EDe0b639302a54811A5b288385def2e | 0.0.6457854 |
| Factory                                | 0x2C910FE2DBfD4277C26F44da4A650Ff9339bb616 | 0.0.6457853 |
| Access Control                         | 0x139a20839541E76cb4A470526Ae106EFb7aF6Be5 | 0.0.6457762 |
| Cap                                    | 0x319aB17a2B1F6F0F6bf64E34B934f12B185c087a | 0.0.6457764 |
| Control List                           | 0x0975d0B95BC9DF189Ea343041525F37878e24f38 | 0.0.6457766 |
| Kyc                                    | 0xAadda31b7F5Ec36b20568e72C3466071422fF712 | 0.0.6457769 |
| SsiManagement                          | 0x692629a42956CC8cd87a65e2559f7De0c65EbC7B | 0.0.6457770 |
| Pause                                  | 0x9c1B8b625932cD64ad463c4aF3E1e68241f3E4B5 | 0.0.6457771 |
| ERC20                                  | 0x123feB154AaBdAcfe091Bf65335Fd6b2856623aF | 0.0.6457779 |
| ERC1410                                | 0x7D669F117DD38f28E47E8B4e779a5f369BB4C0C2 | 0.0.6457784 |
| ERC1594                                | 0x3c9f5Dd7dd595ec7E26F08eF6DB34C18e2BD06e2 | 0.0.6457786 |
| ERC1643                                | 0xE4489effBE98ED6f11f0D04b6Cc2496869f17278 | 0.0.6457787 |
| ERC1644                                | 0x425c693296F78aBC0D68e66F71F73D15AbF5efb1 | 0.0.6457789 |
| Snapshots                              | 0xC1e2f897e5968FE070e7375D8d703D29E05E4908 | 0.0.6457792 |
| Diamond Facet                          | 0x58C7AeC93FbE7B327Aeb1d8c22B0d03AD054cc63 | 0.0.6457794 |
| Equity                                 | 0x7213a91DA2E88FEA5f79a98a009B57881f17344A | 0.0.6457797 |
| Bond                                   | 0xbE82F4d20EcA1fdc6634C1f2b939341a193641e9 | 0.0.6457799 |
| Scheduled Snapshots                    | 0x2f4639D95649EC6D01Edb8773bA4BeeE9d8F8482 | 0.0.6457800 |
| Scheduled Balance Adjustments          | 0xAa2a6b7E518FeDB49cC8Ba87Beec6d577F3A48e9 | 0.0.6457801 |
| Scheduled Tasks                        | 0xD0912360EEAf127070131ed8B98cD3EC3903a15f | 0.0.6457802 |
| Corporate Actions                      | 0xD26B9BC5fC8421dcfE20b29428daEC9A326fDe63 | 0.0.6457804 |
| Lock                                   | 0xf5051965801bf2a02Aac43F220fc5c8Fc4909472 | 0.0.6457773 |
| Hold                                   | 0xab85654c07c87913521d0753DFeE8B623e7a3e9a | 0.0.6457775 |
| Transfer and Lock                      | 0xdfb5A5A5b0037C2eF23fEfec663e5c32b609edeC | 0.0.6457811 |
| Adjust Balances                        | 0x070CbE2039ac47896DF02F23622D0843c0Fc25fa | 0.0.6457815 |
| Clearing Action Facet                  | 0x0e328820Fbed3E7a896CBF97C223020348b7e5a7 | 0.0.6457833 |
| Clearing Transfer Facet                | 0x14930934435d03A9cD46C55e9b8c9F1f70Ed58bB | 0.0.6457825 |
| Clearing Redeem Facet                  | 0x5A9f3605Ac0d81B2c77751370D89129312877444 | 0.0.6457827 |
| Clearing Hold Creation Facet           | 0x0a75f22F275D0Dc8f143c59c72465fC563b7D8D5 | 0.0.6457829 |
| Clearing Read Facet                    | 0x771EA9A05dA75023A203cA11a6595b5dC6b1efbB | 0.0.6457831 |
| External Pause Management Facet        | 0xB9813c2335F2ef9D34d2c2F2516D43Bd5917AC6b | 0.0.6457834 |
| External Control List Management Facet | 0x6f7bedCC9df2272466F2E5F0CF69329EC00037e8 | 0.0.6457835 |
| External Kyc List Management Facet     | 0xdAce021Ddc30d6C3B91a134961d4fA29b3a377cd | 0.0.6457837 |
| Protected Partitions                   | 0x9B08572AFdb8730297AE901CeDA0F25335a52BF7 | 0.0.6457821 |
| ERC3643                                | 0x3b5B9366e88740347571fE34B249f12Dfc47224a | 0.0.6457844 |
| Freeze                                 | 0xf6178f2d15cd760e54584788bd9015d5355c87f3 | 0.0.6457848 |


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

- All roles are `bytes32` constants derived using:  `keccak256("security.token.standard.role.<roleName>")` *(replace `<roleName>` with the actual role string)*