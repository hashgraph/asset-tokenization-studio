# IERC3643Types

_Asset Tokenization Studio Team_

> IERC3643Types

Shared events and errors for the ERC-3643 (T-REX) compliant security token standard. Imported by every facet and storage wrapper that participates in identity verification, compliance enforcement, agent management, or wallet recovery.

## Events

### AgentAdded

```solidity
event AgentAdded(address indexed agent)
```

Emitted when an agent is granted transfer-management permissions.

#### Parameters

| Name            | Type    | Description                       |
| --------------- | ------- | --------------------------------- |
| agent `indexed` | address | Address of the newly added agent. |

### AgentRemoved

```solidity
event AgentRemoved(address indexed agent)
```

Emitted when an agent&#39;s transfer-management permissions are revoked.

#### Parameters

| Name            | Type    | Description                   |
| --------------- | ------- | ----------------------------- |
| agent `indexed` | address | Address of the removed agent. |

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

### RecoverySuccess

```solidity
event RecoverySuccess(address lostWallet, address newWallet, address investorOnchainID)
```

Emitted when a lost wallet is successfully recovered to a new address.

#### Parameters

| Name              | Type    | Description                                        |
| ----------------- | ------- | -------------------------------------------------- |
| lostWallet        | address | Address of the wallet that was lost.               |
| newWallet         | address | Address of the replacement wallet.                 |
| investorOnchainID | address | OnchainID of the investor performing the recovery. |

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
