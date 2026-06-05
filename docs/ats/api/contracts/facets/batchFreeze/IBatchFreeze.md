# IBatchFreeze

> IBatchFreeze

Interface for batch freezing and unfreezing addresses and partial tokens.

_Provides ERC3643-compliant batch freeze operations. Batch functions only work in single-partition mode. Events are shared with `IFreeze` (TokensFrozen, TokensUnfrozen, AddressFrozen)._

## Methods

### batchFreezePartialTokens

```solidity
function batchFreezePartialTokens(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Batch freezes partial tokens for multiple addresses.

_Emits `IFreeze.TokensFrozen` for each address. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                                              |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| \_userAddresses | address[] | Array of addresses to freeze tokens for.                                                                                 |
| \_amounts       | uint256[] | Corresponding token amounts to freeze. Must be the same length as `_userAddresses`. Only works in single-partition mode. |

### batchSetAddressFrozen

```solidity
function batchSetAddressFrozen(address[] _userAddresses, bool[] _freeze) external nonpayable
```

Batch freezes or unfreezes multiple addresses.

_Emits `IFreeze.AddressFrozen` for each address. Only callable by `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                              |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Array of addresses to freeze/unfreeze.                                                                   |
| \_freeze        | bool[]    | Array of freeze statuses (true = freeze, false = unfreeze). Must be the same length as `_userAddresses`. |

### batchUnfreezePartialTokens

```solidity
function batchUnfreezePartialTokens(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Batch unfreezes partial tokens for multiple addresses.

_Emits `IFreeze.TokensUnfrozen` for each address. Token must be unpaused._

#### Parameters

| Name            | Type      | Description                                                                                                                |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Array of addresses to unfreeze tokens for.                                                                                 |
| \_amounts       | uint256[] | Corresponding token amounts to unfreeze. Must be the same length as `_userAddresses`. Only works in single-partition mode. |

### initializeBatchFreeze

```solidity
function initializeBatchFreeze() external nonpayable
```

Initialises the batch freeze capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BatchFreezeInitialized

```solidity
event BatchFreezeInitialized()
```

Emitted once when the batch freeze capability is initialised on a token.

_Fires exclusively from `initializeBatchFreeze` after the storage write succeeds._
