# IRevocationList

_Asset Tokenization Studio Team_

> IRevocationList

Minimal interface for querying whether a verifiable credential issued to a subject has been revoked by its issuer.

## Methods

### revoked

```solidity
function revoked(address, string) external view returns (bool)
```

Checks if the VC granted by an issuer to a subject has been revoked

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | string  | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |
