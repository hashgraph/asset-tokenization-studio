# ICoreAdjusted

> ICoreAdjusted

Interface exposing time-adjusted ERC-20 decimal reads for the CoreAdjusted facet.

_Complements `ICore.decimals()`, which always resolves to the current block timestamp. This interface allows callers to query what the effective decimal precision would be at an arbitrary point in time, accounting for any pending scheduled balance adjustments (ABAFs) that have not yet been triggered on-chain._

## Methods

### decimalsAt

```solidity
function decimalsAt(uint256 _timestamp) external view returns (uint8)
```

Returns the effective token decimals at a given timestamp, simulating all pending scheduled balance adjustments (ABAFs) up to and including that timestamp.

_Delegates to `ERC20StorageWrapper.decimalsAdjustedAt`. Adjustments with an `executionDate` strictly greater than `_timestamp` are excluded. No state mutation occurs; this is a pure simulation._

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
