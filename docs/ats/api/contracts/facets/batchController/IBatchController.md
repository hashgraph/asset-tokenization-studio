# IBatchController

_Asset Tokenization Studio Team_

> IBatchController

Interface for controller-only batch transfer operations.

_Defines the write surface of the `BatchControllerFacet` diamond facet. The facet exposes privileged batch transfers that move tokens between arbitrary addresses and are gated on the controller/agent roles. Non-privileged batch operations (batchTransfer, batchMint, batchBurn) remain on their own dedicated facets._

## Methods

### batchForcedTransfer

```solidity
function batchForcedTransfer(address[] _fromList, address[] _toList, uint256[] _amounts) external nonpayable
```

Batch forced transfer of tokens from multiple source addresses to multiple destinations.

_Restricted to accounts holding the controller or agent role. Requires the token to be controllable and operating in single-partition mode. Emits one `IController.ControllerTransfer` event per element._

#### Parameters

| Name       | Type      | Description                                                               |
| ---------- | --------- | ------------------------------------------------------------------------- |
| \_fromList | address[] | Source addresses to debit.                                                |
| \_toList   | address[] | Destination addresses to credit.                                          |
| \_amounts  | uint256[] | Amounts to transfer, positionally aligned with `_fromList` and `_toList`. |

### initializeBatchController

```solidity
function initializeBatchController() external nonpayable
```

Initialises the batch controller capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BatchControllerInitialized

```solidity
event BatchControllerInitialized()
```

Emitted once when the batch controller capability is initialised on a token.

_Fires exclusively from `initializeBatchController` after the storage write succeeds._
