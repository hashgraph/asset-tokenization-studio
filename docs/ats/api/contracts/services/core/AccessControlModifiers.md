# AccessControlModifiers

_Asset Tokenization Studio Team_

> AccessControlModifiers

Modifiers are MANDATORY unless compilation fails or bytecode exceeds limits

_Abstract contract providing mandatory AccessControl modifiers This contract provides reusable modifiers for validating access control requirements. All facets should inherit from this contract to ensure consistent role validation across the codebase._

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |
