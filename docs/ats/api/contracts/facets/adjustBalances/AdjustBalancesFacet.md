# AdjustBalancesFacet

_Asset Tokenization Studio Team_

> AdjustBalancesFacet

Diamond facet that consolidates the 2 immediate balance-adjustment selectors under a single `RESOLVER_KEY_BALANCE_ADJUSTMENTS`.

_Inherits implementation from `AdjustBalances` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration._

## Methods

### adjustBalances

```solidity
function adjustBalances(uint256 factor, uint8 decimals) external nonpayable returns (bool success_)
```

Applies a balance adjustment to all token holders immediately.

_Emits {AdjustmentBalanceSet}._

#### Parameters

| Name     | Type    | Description                                                          |
| -------- | ------- | -------------------------------------------------------------------- |
| factor   | uint256 | Numerator of the multiplier; effective ratio = factor / 10^decimals. |
| decimals | uint8   | Denominator exponent.                                                |

#### Returns

| Name      | Type | Description                                           |
| --------- | ---- | ----------------------------------------------------- |
| success\_ | bool | True if the adjustment was applied without reverting. |

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

### initializeBalanceAdjustments

```solidity
function initializeBalanceAdjustments() external nonpayable
```

Initialises the balance adjustment capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### triggerAndSyncAll

```solidity
function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external nonpayable
```

Triggers pending scheduled tasks and synchronises the balance snapshot for a transfer pair.

_May emit {SnapshotTriggered} or {AdjustmentBalanceSet} depending on pending scheduled tasks._

#### Parameters

| Name        | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| \_partition | bytes32 | Partition identifier of the transfer.             |
| \_from      | address | Sender address whose snapshot is synchronised.    |
| \_to        | address | Recipient address whose snapshot is synchronised. |

## Events

### AdjustmentBalanceSet

```solidity
event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals)
```

Emitted when an immediate balance adjustment is applied.

#### Parameters

| Name               | Type    | Description                                                   |
| ------------------ | ------- | ------------------------------------------------------------- |
| operator `indexed` | address | Address that triggered the adjustment.                        |
| factor             | uint256 | Numerator of the adjustment ratio.                            |
| decimals           | uint8   | Denominator exponent; effective ratio = factor / 10^decimals. |

### BalanceAdjustmentsInitialized

```solidity
event BalanceAdjustmentsInitialized()
```

Emitted once when the balance adjustment capability is initialised on a token.

_Fires exclusively from `initializeBalanceAdjustments` after the storage write succeeds._

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

### DecimalsOverflow

```solidity
error DecimalsOverflow()
```

Reverts when the cumulative decimals shift would overflow `uint8`.

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

### FactorIsZero

```solidity
error FactorIsZero()
```

Reverts when `factor` is zero, which would zero-out all holder balances.

### FactorOverflow

```solidity
error FactorOverflow()
```

Reverts when the proposed factor would overflow the cumulative ABAF.

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### TotalSupplyOverflow

```solidity
error TotalSupplyOverflow()
```

Reverts when the proposed factor would overflow the projected total supply.

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
