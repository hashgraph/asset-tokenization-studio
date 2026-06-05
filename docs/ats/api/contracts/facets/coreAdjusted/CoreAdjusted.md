# CoreAdjusted

> CoreAdjusted

Abstract implementation of the CoreAdjusted domain, providing time-adjusted decimal reads that account for pending scheduled balance adjustments (ABAFs).

_Inherits `ICoreAdjusted` and delegates entirely to `ERC20StorageWrapper.decimalsAdjustedAt`. Designed to be inherited by `CoreAdjustedFacet` in the Diamond pattern. Contains no storage of its own; all state is managed by `ERC20StorageWrapper`._

## Methods

### decimalsAt

```solidity
function decimalsAt(uint256 _timestamp) external view returns (uint8)
```

Returns the effective token decimals at the given timestamp, simulating pending scheduled balance adjustments (ABAFs) up to and including that timestamp.

_Forwards to `ERC20StorageWrapper.decimalsAdjustedAt`. No state is mutated._

#### Parameters

| Name        | Type    | Description                                                 |
| ----------- | ------- | ----------------------------------------------------------- |
| \_timestamp | uint256 | The Unix timestamp up to which pending ABAFs are simulated. |

#### Returns

| Name | Type  | Description                                                              |
| ---- | ----- | ------------------------------------------------------------------------ |
| \_0  | uint8 | The effective decimal precision of the token at the specified timestamp. |

### initializeCoreAdjusted

```solidity
function initializeCoreAdjusted() external nonpayable
```

Initialises the core adjusted capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### CoreAdjustedInitialized

```solidity
event CoreAdjustedInitialized()
```

Emitted once when the core adjusted capability is initialised on a token.

_Fires exclusively from `initializeCoreAdjusted`._

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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
