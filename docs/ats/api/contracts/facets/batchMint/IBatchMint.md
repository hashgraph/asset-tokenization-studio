# IBatchMint

_Hashgraph Asset Tokenization_

> IBatchMint

Interface for batch minting tokens to multiple addresses in a single transaction.

_Exposes the `batchMint` operation used by the `BatchMintFacet` Diamond facet. Callers must hold the issuer or agent role; each recipient must pass identity and compliance checks, and the cumulative issuance must not exceed the configured maximum supply cap._

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
