# TREXFactoryAts

_Tokeny Solutions_

Adapted from the T-REX official repository to deploy an ERC-3643-compatible ATS security token

_Uses tree-like structure with libraries as leaves instead of resolver proxy pattern for simplicity_

## Methods

### deployTREXSuite

```solidity
function deployTREXSuite(string _salt, ITREXFactory.TokenDetails _tokenDetails, ITREXFactory.ClaimDetails _claimDetails) external nonpayable
```

#### Parameters

| Name           | Type                      | Description |
| -------------- | ------------------------- | ----------- |
| \_salt         | string                    | undefined   |
| \_tokenDetails | ITREXFactory.TokenDetails | undefined   |
| \_claimDetails | ITREXFactory.ClaimDetails | undefined   |

### getIdFactory

```solidity
function getIdFactory() external view returns (address)
```

_getter for identity factory address_

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### getImplementationAuthority

```solidity
function getImplementationAuthority() external view returns (address)
```

_getter for implementation authority address_

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### getToken

```solidity
function getToken(string _salt) external view returns (address)
```

_getter for token address corresponding to salt string_

#### Parameters

| Name   | Type   | Description                                       |
| ------ | ------ | ------------------------------------------------- |
| \_salt | string | The salt string that was used to deploy the token |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### owner

```solidity
function owner() external view returns (address)
```

_Returns the address of the current owner._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### recoverContractOwnership

```solidity
function recoverContractOwnership(address _contract, address _newOwner) external nonpayable
```

_function that can be used to recover the ownership of contracts owned by the factory typically used for IRS contracts owned by the factory (ownership of IRS is mandatory to call bind function)_

#### Parameters

| Name       | Type    | Description                                               |
| ---------- | ------- | --------------------------------------------------------- |
| \_contract | address | The smart contract address                                |
| \_newOwner | address | The address to transfer ownership to Only owner can call. |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

_Leaves the contract without owner. It will not be possible to call `onlyOwner` functions. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby disabling any functionality that is only available to the owner._

### setIdFactory

```solidity
function setIdFactory(address _idFactory) external nonpayable
```

_setter for identity factory contract address the identity factory contract is used by the TREX Factory to deploy the ONCHAINID of the token in case the ONCHAINID is not specified Only owner can call. emits `IdFactorySet` event_

#### Parameters

| Name        | Type    | Description                                  |
| ----------- | ------- | -------------------------------------------- |
| \_idFactory | address | The address of the identity factory contract |

### setImplementationAuthority

```solidity
function setImplementationAuthority(address _implementationAuthority) external nonpayable
```

_setter for implementation authority contract address the implementation authority contract contains the addresses of all implementation contracts the proxies created by the factory will use the different implementations available in the implementation authority contract Only owner can call. emits `ImplementationAuthoritySet` event_

#### Parameters

| Name                      | Type    | Description                                                |
| ------------------------- | ------- | ---------------------------------------------------------- |
| \_implementationAuthority | address | The address of the implementation authority smart contract |

### tokenDeployed

```solidity
function tokenDeployed(string) external view returns (address)
```

_Mapping containing info about the token contracts corresponding to salt already used for CREATE2 deployments_

#### Parameters

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

_Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner._

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| newOwner | address | undefined   |

## Events

### Deployed

```solidity
event Deployed(address indexed _addr)
```

event emitted whenever a single contract is deployed by the factory

#### Parameters

| Name             | Type    | Description |
| ---------------- | ------- | ----------- |
| \_addr `indexed` | address | undefined   |

### IdFactorySet

```solidity
event IdFactorySet(address _idFactory)
```

event emitted when the Identity Factory is set

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| \_idFactory | address | undefined   |

### ImplementationAuthoritySet

```solidity
event ImplementationAuthoritySet(address _implementationAuthority)
```

event emitted when the implementation authority of the factory contract is set

#### Parameters

| Name                      | Type    | Description |
| ------------------------- | ------- | ----------- |
| \_implementationAuthority | address | undefined   |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

#### Parameters

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| previousOwner `indexed` | address | undefined   |
| newOwner `indexed`      | address | undefined   |

### TREXSuiteDeployed

```solidity
event TREXSuiteDeployed(address indexed _token, address _ir, address _irs, address _tir, address _ctr, address _mc, string indexed _salt)
```

event emitted by the factory when a full suite of T-REX contracts is deployed

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_token `indexed` | address | undefined   |
| \_ir              | address | undefined   |
| \_irs             | address | undefined   |
| \_tir             | address | undefined   |
| \_ctr             | address | undefined   |
| \_mc              | address | undefined   |
| \_salt `indexed`  | string  | undefined   |
