# Mint

_Asset Tokenization Studio Team_

> Mint

Abstract implementation of the consolidated token issuance operations.

_Gathers `isIssuable`, `issue` and `mint` on top of `ERC1594StorageWrapper`. Both issuance entry points enforce the same access-control matrix (issuer or agent), supply ceiling and compliance checks, and differ only in the calldata payload they accept._

## Methods

### initializeERC1594

```solidity
function initializeERC1594() external nonpayable
```

Initialises the ERC-1594 StorageWrapper on the calling contract.

_Can only be invoked once per contract; subsequent calls revert via `onlyFacetNotRegistered`._

### isIssuable

```solidity
function isIssuable() external view returns (bool)
```

Returns whether further issuance is permitted for this security.

_Once a token returns `false` it must never return `true` again. Implementations read the issuance flag maintained by `ERC1594StorageWrapper`._

#### Returns

| Name | Type | Description                                          |
| ---- | ---- | ---------------------------------------------------- |
| \_0  | bool | True while new tokens may still be issued or minted. |

### issue

```solidity
function issue(address _tokenHolder, uint256 _value, bytes _data) external nonpayable
```

Issues new tokens to a token holder under the ERC-1594 semantics.

_Restricted to issuer or agent roles. Increases the total supply and emits `IERC1594.Issued`. Only callable in single-partition mode and when the token is unpaused; the destination must pass identity and compliance checks._

#### Parameters

| Name          | Type    | Description                                                              |
| ------------- | ------- | ------------------------------------------------------------------------ |
| \_tokenHolder | address | Recipient of the newly issued tokens.                                    |
| \_value       | uint256 | Amount of tokens to issue, denominated in base units.                    |
| \_data        | bytes   | Arbitrary data forwarded alongside the issuance for off-chain consumers. |

### mint

```solidity
function mint(address _to, uint256 _amount) external nonpayable
```

Mints new tokens to a recipient under the ERC-3643 semantics.

_Behaves as a thin alias over `issue` with an empty `data` payload. Restricted to issuer or agent roles and subject to the same pause, supply, identity and compliance constraints. Emits `IERC1594.Issued`._

#### Parameters

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| \_to     | address | Recipient of the newly minted tokens.                |
| \_amount | uint256 | Amount of tokens to mint, denominated in base units. |

## Events

### ERC1594Initialized

```solidity
event ERC1594Initialized()
```

/\*\*Emitted once when the ERC-1594 capability is initialised on a token.

_Fires exclusively from `initializeERC1594` after the storage write succeeds._

### Issued

```solidity
event Issued(address indexed operator, address indexed to, uint256 value, bytes data)
```

Emitted when new tokens are issued to a holder.

#### Parameters

| Name               | Type    | Description                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| operator `indexed` | address | Account that invoked the issuance (issuer or agent). |
| to `indexed`       | address | Recipient of the newly issued tokens.                |
| value              | uint256 | Amount of tokens issued, denominated in base units.  |
| data               | bytes   | Arbitrary payload forwarded alongside the issuance.  |

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

Thrown when a single-partition operation is attempted on a multi-partition token.

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
