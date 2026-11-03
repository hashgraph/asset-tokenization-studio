# IBatchTransfer

_Asset Tokenization Studio Team_

> IBatchTransfer

Interface for batch transferring tokens to multiple addresses in a single transaction.

_Intended for use by token holders operating on ERC3643-compliant tokens under single partition mode. Exposes the `batchTransfer` selector registered in the Diamond proxy under `RESOLVER_KEY_BATCH_TRANSFER`._

## Methods

### batchTransfer

```solidity
function batchTransfer(address[] _toList, uint256[] _amounts) external nonpayable
```

Transfers tokens from the caller to multiple addresses in a single transaction.

_Token must be unpaused, not in multi-partition mode, clearing disabled, and the caller plus every recipient must satisfy identity and compliance checks. Delegates each transfer to `TokenCoreOps.transfer`._

#### Parameters

| Name      | Type      | Description                                                                    |
| --------- | --------- | ------------------------------------------------------------------------------ |
| \_toList  | address[] | Recipient addresses.                                                           |
| \_amounts | uint256[] | Corresponding token amounts to transfer. Must be the same length as `_toList`. |

### initializeBatchTransfer

```solidity
function initializeBatchTransfer() external nonpayable
```

Initialises the batch transfer capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BatchTransferInitialized

```solidity
event BatchTransferInitialized()
```

Emitted once when the batch transfer capability is initialised on a token.

_Fires exclusively from `initializeBatchTransfer`._
