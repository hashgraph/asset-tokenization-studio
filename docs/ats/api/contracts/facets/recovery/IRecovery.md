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

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_agent `indexed` | address | undefined   |

### AgentRemoved

```solidity
event AgentRemoved(address indexed _agent)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| \_agent `indexed` | address | undefined   |

### ComplianceAdded

```solidity
event ComplianceAdded(address indexed compliance)
```

#### Parameters

| Name                 | Type    | Description |
| -------------------- | ------- | ----------- |
| compliance `indexed` | address | undefined   |

### IdentityRegistryAdded

```solidity
event IdentityRegistryAdded(address indexed identityRegistry)
```

#### Parameters

| Name                       | Type    | Description |
| -------------------------- | ------- | ----------- |
| identityRegistry `indexed` | address | undefined   |

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

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| \_lostWallet        | address | undefined   |
| \_newWallet         | address | undefined   |
| \_investorOnchainID | address | undefined   |

### UpdatedTokenInformation

```solidity
event UpdatedTokenInformation(string indexed newName, string indexed newSymbol, uint8 newDecimals, string newVersion, address indexed newOnchainID)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| newName `indexed`      | string  | undefined   |
| newSymbol `indexed`    | string  | undefined   |
| newDecimals            | uint8   | undefined   |
| newVersion             | string  | undefined   |
| newOnchainID `indexed` | address | undefined   |

## Errors

### AddressNotVerified

```solidity
error AddressNotVerified()
```

### CannotRecoverWallet

```solidity
error CannotRecoverWallet()
```

### ComplianceCallFailed

```solidity
error ComplianceCallFailed()
```

### ComplianceNotAllowed

```solidity
error ComplianceNotAllowed()
```

### IdentityRegistryCallFailed

```solidity
error IdentityRegistryCallFailed()
```

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

### InputBoolArrayLengthMismatch

```solidity
error InputBoolArrayLengthMismatch()
```

### InsufficientFrozenBalance

```solidity
error InsufficientFrozenBalance(address user, uint256 requestedUnfreeze, uint256 availableFrozen, bytes32 partition)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| user              | address | undefined   |
| requestedUnfreeze | uint256 | undefined   |
| availableFrozen   | uint256 | undefined   |
| partition         | bytes32 | undefined   |

### WalletRecovered

```solidity
error WalletRecovered()
```
