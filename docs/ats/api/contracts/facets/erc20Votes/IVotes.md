# IVotes

_Asset Tokenization Studio Team_

> IVotes

Common interface for vote-delegation and vote-weight queries on ERC-20 and ERC-721 tokens that implement on-chain governance weight tracking.

_Common interface for {ERC20Votes}, {ERC721Votes}, and other {Votes}-enabled contracts. *Available since v4.5.*_

## Methods

### delegate

```solidity
function delegate(address _delegatee) external nonpayable
```

Delegates the caller&#39;s voting power to `delegatee`.

_Delegates votes from the sender to `delegatee`._

#### Parameters

| Name        | Type    | Description                                              |
| ----------- | ------- | -------------------------------------------------------- |
| \_delegatee | address | Address that will receive the caller&#39;s voting power. |

### delegates

```solidity
function delegates(address _account) external view returns (address)
```

Returns the delegate address that `account` has chosen.

_Returns the delegate that `account` has chosen._

#### Parameters

| Name      | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| \_account | address | Address whose chosen delegate is queried. |

#### Returns

| Name | Type    | Description                                  |
| ---- | ------- | -------------------------------------------- |
| \_0  | address | Address of the delegate chosen by `account`. |

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 _timepoint) external view returns (uint256)
```

Returns the total vote supply available at a past `timepoint`.

_Returns the total supply of votes available at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block. NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes. Votes that have not been delegated are still part of total supply, even though they would not participate in a vote._

#### Parameters

| Name        | Type    | Description                                                      |
| ----------- | ------- | ---------------------------------------------------------------- |
| \_timepoint | uint256 | Block number or timestamp at which the total supply is resolved. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total vote supply at `timepoint`. |

### getPastVotes

```solidity
function getPastVotes(address _account, uint256 _timepoint) external view returns (uint256)
```

Returns the vote weight of `account` at a past `timepoint`.

_Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is configured to use block numbers, this will return the value at the end of the corresponding block._

#### Parameters

| Name        | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| \_account   | address | Address whose historical vote weight is queried.           |
| \_timepoint | uint256 | Block number or timestamp at which the weight is resolved. |

#### Returns

| Name | Type    | Description                              |
| ---- | ------- | ---------------------------------------- |
| \_0  | uint256 | Vote weight of `account` at `timepoint`. |

### getVotes

```solidity
function getVotes(address _account) external view returns (uint256)
```

Returns the current vote weight of `account`.

_Returns the current amount of votes that `account` has._

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| \_account | address | Address whose current vote weight is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current vote weight of `account`. |
