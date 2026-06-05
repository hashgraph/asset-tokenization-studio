# IERC3643Types

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
