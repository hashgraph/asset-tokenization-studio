# Allowance

_Asset Tokenization Studio Team_

> Allowance Facet

Implements ERC-20 allowance operations for non-partitioned security tokens.

_Delegates allowance mutations to `TokenCoreOps` and reads allowance snapshots from `ERC20StorageWrapper`. The facet must be registered once through the initializer flow before the token can become operational._

## Methods

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

Returns the remaining amount `spender` may spend on behalf of `owner` via a downstream `transferFrom`-style call.

_Reads the allowance at the current time-travel-adjusted block timestamp so snapshot-aware facets observe a consistent storage view._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| owner   | address | undefined   |
| spender | address | undefined   |

#### Returns

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| \_0  | uint256 | Remaining allowance of `spender` over `owner`&#39;s tokens. |

### approve

```solidity
function approve(address spender, uint256 value) external nonpayable returns (bool)
```

Sets `value` as the allowance of `spender` over the caller&#39;s tokens.

_Requires the token to be operational, activated, unpaused, and not configured for multi-partition behaviour. The authenticated sender and spender must satisfy compliance checks before the allowance is updated._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| spender | address | undefined   |
| value   | uint256 | undefined   |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### decreaseAllowance

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) external nonpayable returns (bool)
```

Atomically decreases the allowance granted to `spender` by the caller.

_Requires the token to be operational, activated, unpaused, and not configured for multi-partition behaviour. The authenticated sender and spender must satisfy compliance checks before the allowance is decreased._

#### Parameters

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| spender         | address | undefined   |
| subtractedValue | uint256 | undefined   |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### increaseAllowance

```solidity
function increaseAllowance(address spender, uint256 addedValue) external nonpayable returns (bool)
```

Atomically increases the allowance granted to `spender` by the caller.

_Requires the token to be operational, activated, unpaused, and not configured for multi-partition behaviour. The authenticated sender and spender must satisfy compliance checks before the allowance is increased._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| spender    | address | undefined   |
| addedValue | uint256 | undefined   |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### initializeAllowance

```solidity
function initializeAllowance() external nonpayable
```

Initialises the allowance capability on the token.

_Restricted to `DEFAULT_ADMIN_ROLE` and callable only before this facet is registered._

## Events

### AllowanceInitialized

```solidity
event AllowanceInitialized()
```

Emitted once when the allowance capability is initialised on a token.

_Fires exclusively from `initializeAllowance` after the storage write succeeds._

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```

Emitted when `owner` authorises `spender` to spend up to `value` tokens on their behalf, whether via {IAllowance.approve}, {IAllowance.increaseAllowance} or {IAllowance.decreaseAllowance}.

_Mirrors the ERC-20 `Approval` event. `value` is the resulting, absolute allowance after the update — not the delta applied._

#### Parameters

| Name              | Type    | Description                                                        |
| ----------------- | ------- | ------------------------------------------------------------------ |
| owner `indexed`   | address | Address whose tokens may be spent.                                 |
| spender `indexed` | address | Address authorised to spend on `owner`&#39;s behalf.               |
| value             | uint256 | Allowance of `spender` over `owner`&#39;s tokens after the update. |

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

### InsufficientAllowance

```solidity
error InsufficientAllowance(address spender, address from)
```

Reverts when `spender` attempts to consume more allowance than `from` has granted.

_Raised by `transferFrom`-style flows and by {IAllowance.decreaseAllowance} when the subtracted amount exceeds the current allowance._

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| spender | address | Address attempting to spend on behalf of `from`. |
| from    | address | Address whose allowance is being consumed.       |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

### SpenderWithZeroAddress

```solidity
error SpenderWithZeroAddress()
```

Reverts when the zero address is supplied as `spender` in an allowance update.

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

### ZeroOwnerAddress

```solidity
error ZeroOwnerAddress()
```

Reverts when an allowance operation references the zero address as the owner.

_Defensive guard against mis-wired flows or malformed calldata reaching the underlying storage wrappers._
