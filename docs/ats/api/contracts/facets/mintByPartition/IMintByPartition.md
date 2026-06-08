# IMintByPartition

_Asset Tokenization Studio Team_

> IMintByPartition

Interface for the partition-aware token issuance entry point of the ATS Diamond.

_Exposes `issueByPartition` which follows the ERC-1410 standard for issuing tokens into a specific partition. The operation requires the caller to hold either the issuer or agent role, honours max-supply and per-partition supply checks, and emits the `IssuedByPartition` event from `IERC1410Types`._

## Methods

### initializeMintByPartition

```solidity
function initializeMintByPartition() external nonpayable
```

Initialises the mint-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### issueByPartition

```solidity
function issueByPartition(IERC1410Types.IssueData _issueData) external nonpayable
```

#### Parameters

| Name        | Type                    | Description |
| ----------- | ----------------------- | ----------- |
| \_issueData | IERC1410Types.IssueData | undefined   |

## Events

### MintByPartitionInitialized

```solidity
event MintByPartitionInitialized()
```

Emitted once when the mint-by-partition capability is initialised on a token.

_Fires exclusively from `initializeMintByPartition`._
