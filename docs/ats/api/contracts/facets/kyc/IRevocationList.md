# IRevocationList

_Asset Tokenization Studio Team_

> IRevocationList

Minimal interface for querying whether a verifiable credential issued to a subject has been revoked by its issuer.

## Methods

### revoked

```solidity
function revoked(address subject, string vcId) external view returns (bool)
```

Checks if the VC granted by an issuer to a subject has been revoked.

#### Parameters

| Name    | Type    | Description                                                   |
| ------- | ------- | ------------------------------------------------------------- |
| subject | address | The address of the subject whose credential is being queried. |
| vcId    | string  | The identifier of the verifiable credential to check.         |

#### Returns

| Name | Type | Description                                               |
| ---- | ---- | --------------------------------------------------------- |
| \_0  | bool | True if the credential has been revoked, false otherwise. |
