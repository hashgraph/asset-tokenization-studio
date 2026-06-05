# BatchMintFacet

_Hashgraph Asset Tokenization_

> BatchMintFacet

Diamond facet that exposes the ERC-3643 `batchMint` operation, registered under `RESOLVER_KEY_BATCH_MINT`.

_Inherits minting logic from `BatchMint` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for static selector registration. Exposes one selector: `batchMint`. No library links are required for deployment._

## Methods

### batchMint

```solidity
function batchMint(address[] _toList, uint256[] _amounts) external nonpayable
```

Batch mint tokens to multiple addresses.

_Iterates over `_toList` and `_amounts` in two passes: first validates identity, compliance, and cap constraints for every recipient, then issues tokens to each address via `ERC1594StorageWrapper.issue`. Reverts if the token is paused, if the arrays differ in length, if the caller lacks the issuer or agent role, if a recipient fails identity or compliance checks, or if any single mint would exceed the maximum supply. Restricted to non-multi-partition tokens._

#### Parameters

| Name      | Type      | Description                                                    |
| --------- | --------- | -------------------------------------------------------------- |
| \_toList  | address[] | Ordered list of recipient addresses.                           |
| \_amounts | uint256[] | Ordered list of token amounts corresponding to each recipient. |

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

### initializeBatchMint

```solidity
function initializeBatchMint() external nonpayable
```

Initialises the batch mint capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BatchMintInitialized

```solidity
event BatchMintInitialized()
```

Emitted once when the batch mint capability is initialised on a token.

_Fires exclusively from `initializeBatchMint` after the storage write succeeds._

### Issued

```solidity
event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data)
```

Emitted when new tokens are issued to a holder.

#### Parameters

| Name                 | Type    | Description                                          |
| -------------------- | ------- | ---------------------------------------------------- |
| \_operator `indexed` | address | Account that invoked the issuance (issuer or agent). |
| \_to `indexed`       | address | Recipient of the newly issued tokens.                |
| \_value              | uint256 | Amount of tokens issued, denominated in base units.  |
| \_data               | bytes   | Arbitrary payload forwarded alongside the issuance.  |

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

### AccountHasNoRoles

```solidity
error AccountHasNoRoles(address account, bytes32[] roles)
```

Thrown when an account does not hold any of the specified roles.

#### Parameters

| Name    | Type      | Description                       |
| ------- | --------- | --------------------------------- |
| account | address   | The account that lacks the roles. |
| roles   | bytes32[] | The roles that are not held.      |

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

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### MaxSupplyReached

```solidity
error MaxSupplyReached(uint256 maxSupply)
```

Thrown when a mint would cause the total supply to exceed the global maximum.

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| maxSupply | uint256 | The current global maximum supply. |

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

### WalletRecovered

```solidity
error WalletRecovered()
```
