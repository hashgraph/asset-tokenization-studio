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

Note: Run commands from the contracts directory, or use npm --prefix ./contracts exec -- hardhat ... to ensure Hardhat uses the local installation.

### Selectors utilities

- Find a specific selector in Solidity sources (functions by default):

```
npx hardhat selectors:find --selector 0xa9059cbb
```

- Include errors too:

```
npx hardhat selectors:find --selector 0xa9059cbb --kind=all
```

- Return bytes32 (padded) selectors:

```
# when using --padded with selectors:find, if you also use --json the matching will compare
# with padded values; to search a padded selector, pass a 32-byte value.
npx hardhat selectors:find --selector 0xa9059cbb --padded
npx hardhat selectors:find --selector 0xa9059cbb00000000000000000000000000000000000000000000000000000000 --padded --json
```

- Write JSON output to file:

```
# when using --json, results are also written to contracts/.reports/selectors/<timestamped>.json by default.
# you can override the file path with --out
npx hardhat selectors:find --selector 0xa9059cbb --json
npx hardhat selectors:find --selector 0xa9059cbb --json --out my-find.json
```

- List selectors:

```
npx hardhat selectors:list
```

- Include errors too or return padded or JSON to file (with optional filter by contract):

```
# include errors as well
npx hardhat selectors:list --kind all

# return padded 32-byte selectors
npx hardhat selectors:list --padded

# filter by contract name and write JSON to a file (default path contracts/.reports/selectors)
# optional: choose a custom output path with --out
npx hardhat selectors:list --contract ERC20 --json
npx hardhat selectors:list --contract ERC20 --json --out erc20-selectors.json
```

- From a compiled artifact ABI:

```
# run from the contracts directory (recommended)
npx hardhat selectors:artifact --name ERC1594

# or using npm exec from the repo root
npm --prefix ./contracts exec -- hardhat selectors:artifact --name ERC1594 --kind all --padded --json
```

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
| Business Logic Resolver Proxy          | 0x1514B31D8C22a791EC659511Dc0acC6143dcCB1b | 0.0.5992323 |
| Business Logic Resolver Proxy Admin    | 0x33D8D8b085C6Ae455Cb78791a83063059FDbb24a | 0.0.5992322 |
| Business Logic Resolver                | 0x84CBF86620623D8a7ae7837E9d67De2d6FE51119 | 0.0.5992321 |
| Factory Proxy                          | 0x6E589ABE696e4fEe13aeD3E792065624A332cd2b | 0.0.5992438 |
| Factory Proxy Admin                    | 0x662350317DAE895b71491f5F6cB57f6Fe3838DDD | 0.0.5992436 |
| Factory                                | 0x0321f03A9D3B33d9788b5833Ac0682545A7DcFdE | 0.0.5992435 |
| Access Control                         | 0xF50f878716d90dAcBe3BBA694963e5Bd53250870 | 0.0.5992327 |
| Cap                                    | 0xa01b306cA71f96CcdC025457c3d0148B13EF47c0 | 0.0.5992328 |
| Control List                           | 0xA8B6DbBA2e01A7e1748c10a9a2dd61eb2bE9750d | 0.0.5992329 |
| Kyc                                    | 0x989Aea904B826cc2E18dc82F2366d8788e0C4517 | 0.0.5992331 |
| SsiManagement                          | 0x64b9E600091307Db093Aa788C40bdBa83920c5D6 | 0.0.5992332 |
| Pause                                  | 0xA14f0E268198B4cD1C5CB120569deD50E69338D3 | 0.0.5992333 |
| ERC20                                  | 0x8D3B8AB6F6D3318b10699995ee28C1821299aC38 | 0.0.5992349 |
| ERC1410                                | 0x8afbfF8fF7C6D90c0c27fb821d207389588bdD06 | 0.0.5992355 |
| ERC1594                                | 0x08604deF5eb36909eE808eDc9F7cDC022A241438 | 0.0.5992359 |
| ERC1643                                | 0x3001C415AF5750887Da90214277504C4F5B8e0cc | 0.0.5992360 |
| ERC1644                                | 0xdd72E2B066032Ac63856406A66cE7732361cf5C3 | 0.0.5992364 |
| Snapshots                              | 0x66C12677e71C235273cd10DD9405Af9638b3eA40 | 0.0.5992370 |
| Diamond Facet                          | 0x7ebFA3465A4F9C305e28E491B06321198b1A9acE | 0.0.5992374 |
| Equity                                 | 0x8814fcD614d6f802890D006C9091a83942ACe0Aa | 0.0.5992378 |
| Bond                                   | 0x718e13d437873979365864D8B4e87a4308348abF | 0.0.5992384 |
| Scheduled Snapshots                    | 0x3a4b07f37E04707686dA26F8496B36EBa1469C4C | 0.0.5992385 |
| Scheduled Balance Adjustments          | 0x12040576DDEfe043892b391c514F311B5df4086b | 0.0.5992387 |
| Scheduled Tasks                        | 0xa8aAFBF82f85eeDA5d571f7218D634812f60B6f5 | 0.0.5992388 |
| Corporate Actions                      | 0x4903a9053b0eac2C2eac9B1E8Ae59533D68B4F8b | 0.0.5992390 |
| Lock                                   | 0x1164422eF44d6341D23046245ccE5938f4a3Dc9a | 0.0.5992337 |
| Hold                                   | 0xE7c10df79Fb52F20205ad3A0B6FB64eFB077FFd5 | 0.0.5992346 |
| Transfer and Lock                      | 0x1b970Ed1201774aD92f0208F7a3fB9142D862e58 | 0.0.5992392 |
| Adjust Balances                        | 0xDA957E744aDF294B675057ECF52B7690e44F083f | 0.0.5992394 |
| Clearing Action Facet                  | 0xBea2623558a13317974A11B867629624D5687324 | 0.0.5992417 |
| Clearing Transfer Facet                | 0xa545Aa4E17044cb84F8e0e2C23bb8e2752BB2e2D | 0.0.5992401 |
| Clearing Redeem Facet                  | 0x8E34b5D7894Cd1B9dF5E0DcF0227F7D329153f10 | 0.0.5992406 |
| Clearing Hold Creation Facet           | 0xda5f9dC5424054ead25ba729f748fb5565aED831 | 0.0.5992411 |
| Clearing Read Facet                    | 0xb4372BCd9011E85Ed2785BDF755359BBED24cC75 | 0.0.5992413 |
| External Pause Management Facet        | 0xD92AbE7CA5Bc68c55b1040a2F8B96D748e9E115c | 0.0.5992419 |
| External Control List Management Facet | 0x006B6e71D221fCeBF723a7F818F32cC0f1672254 | 0.0.5992421 |
| External Kyc List Management Facet     | 0x60dFA6d5FA9eaE1B404BFEF9d0eb02B2F08EA8a0 | 0.0.5992422 |
