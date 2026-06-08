# IRecovery

_Asset Tokenization Studio Team_

> IRecovery

Interface for the Recovery facet, exposing lost-wallet recovery and recovery-status reads.

## Methods

### initializeRecovery

```solidity
function initializeRecovery() external nonpayable
```

Initialises the recovery capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isAddressRecovered

```solidity
function isAddressRecovered(address _wallet) external view returns (bool)
```

Returns whether a wallet address has been marked as recovered.

#### Parameters

| Name     | Type    | Description       |
| -------- | ------- | ----------------- |
| \_wallet | address | Address to query. |

#### Returns

| Name | Type | Description                                                                |
| ---- | ---- | -------------------------------------------------------------------------- |
| \_0  | bool | `true` if the address has previously been recovered via {recoveryAddress}. |

### recoveryAddress

```solidity
function recoveryAddress(address _lostWallet, address _newWallet, address _investorOnchainID) external nonpayable returns (bool success_)
```

Transfers the token balance and frozen amounts of a lost wallet to a new wallet, marking the lost wallet as recovered.

_Caller must hold `ROLE_AGENT`. The lost wallet must not have already been recovered, must carry no pending locks, holds, or clearings, and the token must be single-partition. Emits {RecoverySuccess} on success._

#### Parameters

| Name                | Type    | Description                                                       |
| ------------------- | ------- | ----------------------------------------------------------------- |
| \_lostWallet        | address | Address of the wallet that was lost.                              |
| \_newWallet         | address | Address of the replacement wallet that will receive the balances. |
| \_investorOnchainID | address | On-chain identity address of the investor (may be zero address).  |

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | `true` when the recovery completes successfully. |

## Events

### AgentAdded

```solidity
event AgentAdded(address indexed _agent)
```

Emitted when an agent is granted transfer-management permissions.

#### Parameters

| Name              | Type    | Description                       |
| ----------------- | ------- | --------------------------------- |
| \_agent `indexed` | address | Address of the newly added agent. |

### AgentRemoved

```solidity
event AgentRemoved(address indexed _agent)
```

Emitted when an agent&#39;s transfer-management permissions are revoked.

#### Parameters

| Name              | Type    | Description                   |
| ----------------- | ------- | ----------------------------- |
| \_agent `indexed` | address | Address of the removed agent. |

### ComplianceAdded

```solidity
event ComplianceAdded(address indexed compliance)
```

Emitted when the compliance contract address is updated.

#### Parameters

| Name                 | Type    | Description                                     |
| -------------------- | ------- | ----------------------------------------------- |
| compliance `indexed` | address | Address of the newly wired compliance contract. |

### IdentityRegistryAdded

```solidity
event IdentityRegistryAdded(address indexed identityRegistry)
```

Emitted when the identity registry contract address is updated.

#### Parameters

| Name                       | Type    | Description                                   |
| -------------------------- | ------- | --------------------------------------------- |
| identityRegistry `indexed` | address | Address of the newly wired identity registry. |

### RecoveryInitialized

```solidity
event RecoveryInitialized()
```

Emitted once when the recovery capability is initialised on a token.

_Fires exclusively from `initializeRecovery`._

### RecoverySuccess

```solidity
event RecoverySuccess(address _lostWallet, address _newWallet, address _investorOnchainID)
```

Emitted when a lost wallet is successfully recovered to a new address.

#### Parameters

| Name                | Type    | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| \_lostWallet        | address | Address of the wallet that was lost.               |
| \_newWallet         | address | Address of the replacement wallet.                 |
| \_investorOnchainID | address | OnchainID of the investor performing the recovery. |

### UpdatedTokenInformation

```solidity
event UpdatedTokenInformation(string indexed newName, string indexed newSymbol, uint8 newDecimals, string newVersion, address indexed newOnchainID)
```

Emitted when core token metadata is updated.

#### Parameters

| Name                   | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| newName `indexed`      | string  | New token name.                                  |
| newSymbol `indexed`    | string  | New token symbol.                                |
| newDecimals            | uint8   | New decimal precision.                           |
| newVersion             | string  | New token version string.                        |
| newOnchainID `indexed` | address | New onchainID address associated with the token. |

## Errors

### AddressNotVerified

```solidity
error AddressNotVerified()
```

Thrown when a transfer target address has not passed identity verification.

### CannotRecoverWallet

```solidity
error CannotRecoverWallet()
```

Thrown when wallet recovery preconditions are not met (e.g. identity mismatch).

### ComplianceCallFailed

```solidity
error ComplianceCallFailed()
```

Thrown when an external call to the compliance contract reverts or returns false.

### ComplianceNotAllowed

```solidity
error ComplianceNotAllowed()
```

Thrown when a transfer is blocked by the compliance module.

### IdentityRegistryCallFailed

```solidity
error IdentityRegistryCallFailed()
```

Thrown when an external call to the identity registry reverts or returns false.

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

Thrown when the lengths of two input amount arrays do not match.

### InputBoolArrayLengthMismatch

```solidity
error InputBoolArrayLengthMismatch()
```

Thrown when the lengths of two input boolean arrays do not match.

### InsufficientFrozenBalance

```solidity
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition)
```

Thrown when an unfreeze request exceeds the address&#39;s available frozen balance.

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| user              | address | Address whose frozen balance was checked.          |
| requestedUnfreeze | uint256 | Amount the caller attempted to unfreeze.           |
| availableFrozen   | uint256 | Actual frozen balance available for unfreezing.    |
| partition         | bytes32 | Partition on which the frozen balance was checked. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
