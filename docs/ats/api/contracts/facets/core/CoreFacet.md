# CoreFacet

> CoreFacet

Diamond facet for the Core domain. Registers the 8 selectors that define the base identity of the token (ERC20 metadata readers, ERC3643 name/symbol setters and version).

## Methods

### decimals

```solidity
function decimals() external view returns (uint8)
```

Returns the decimals simulating non-triggered decimal adjustments up until current timestamp.

#### Returns

| Name | Type  | Description |
| ---- | ----- | ----------- |
| \_0  | uint8 | undefined   |

### getERC20Metadata

```solidity
function getERC20Metadata() external view returns (struct ICore.ERC20Metadata)
```

Returns the full metadata struct of the security token.

#### Returns

| Name | Type                | Description |
| ---- | ------------------- | ----------- |
| \_0  | ICore.ERC20Metadata | undefined   |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

#### Returns

| Name | Type     | Description              |
| ---- | -------- | ------------------------ |
| \_0  | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Gets all interfaces ids of a facet.

#### Returns

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| \_0  | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeCore

```solidity
function initializeCore(ICore.ERC20Metadata metadata) external nonpayable
```

#### Parameters

| Name     | Type                | Description |
| -------- | ------------------- | ----------- |
| metadata | ICore.ERC20Metadata | undefined   |

### name

```solidity
function name() external view returns (string)
```

Returns the name of the security token.

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### setName

```solidity
function setName(string _name) external nonpayable
```

Updates the token name. Restricted to the TREX owner role.

#### Parameters

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| \_name | string | undefined   |

### setSymbol

```solidity
function setSymbol(string _symbol) external nonpayable
```

Updates the token symbol. Restricted to the TREX owner role.

#### Parameters

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| \_symbol | string | undefined   |

### symbol

```solidity
function symbol() external view returns (string)
```

Returns the symbol of the security token.

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### version

```solidity
function version() external view returns (string)
```

Returns the ERC3643 version string of the token.

#### Returns

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

## Events

### CoreInitialized

```solidity
event CoreInitialized(ICore.ERC20Metadata metadata)
```

Emitted once when the core ERC-20 metadata is initialised on a token.

_Fires exclusively from `initializeCore` after the storage write succeeds._

#### Parameters

| Name     | Type                | Description |
| -------- | ------------------- | ----------- |
| metadata | ICore.ERC20Metadata | undefined   |

### UpdatedTokenInformation

```solidity
event UpdatedTokenInformation(string indexed newName, string indexed newSymbol, uint8 newDecimals, string newVersion, address indexed newOnchainID)
```

Emitted when core token metadata is updated.

#### Parameters

| Name                   | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| newName `indexed`      | string  | New token name.                                  |
| newSymbol `indexed`    | string  | New token symbol.                                |
| newDecimals            | uint8   | New decimal precision.                           |
| newVersion             | string  | New token version string.                        |
| newOnchainID `indexed` | address | New onchainID address associated with the token. |

## Errors

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).
