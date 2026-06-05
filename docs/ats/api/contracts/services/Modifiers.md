# Modifiers

_Asset Tokenization Studio Team_

> Modifiers

Aggregates reusable core and asset-level modifiers for inheriting contracts.

_Provides a single inheritance point for common access, pause, compliance, asset and validation restrictions. Inheriting contracts also receive modifiers declared by `CoreModifiers` and `AssetModifiers`._

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
