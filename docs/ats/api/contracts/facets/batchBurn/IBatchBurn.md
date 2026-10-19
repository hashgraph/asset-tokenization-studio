# IBatchBurn

_Asset Tokenization Studio Team_

> IBatchBurn

Interface for batch burning tokens from multiple addresses in a single transaction.

_Intended for use by authorised controllers and agents operating on ERC3643-compliant tokens. Exposes the `batchBurn` selector registered in the Diamond proxy under `RESOLVER_KEY_BATCH_BURN`._

## Methods

### batchBurn

```solidity
function batchBurn(address[] _userAddresses, uint256[] _amounts) external nonpayable
```

Burns tokens from multiple addresses in a single transaction.

_Caller must hold `ROLE_CONTROLLER` or `ROLE_AGENT`. The token must not be paused and must not be configured for multi-partition. Emits `IController.ControllerRedemption` for each address processed._

#### Parameters

| Name            | Type      | Description                                                                       |
| --------------- | --------- | --------------------------------------------------------------------------------- |
| \_userAddresses | address[] | Addresses from which tokens will be burnt.                                        |
| \_amounts       | uint256[] | Corresponding token amounts to burn. Must be the same length as `_userAddresses`. |

### initializeBatchBurn

```solidity
function initializeBatchBurn() external nonpayable
```

Initialises the batch burn capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BatchBurnInitialized

```solidity
event BatchBurnInitialized()
```

Emitted once when the batch burn capability is initialised on a token.

_Fires exclusively from `initializeBatchBurn` after the storage write succeeds._
