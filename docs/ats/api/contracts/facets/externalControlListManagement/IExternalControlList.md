# IExternalControlList

_Asset Tokenization Studio Team_

> IExternalControlList

Minimal interface for querying an external control-list contract.

_Implemented by third-party access-control contracts whose address is registered on the token. The token calls `isAuthorized` to decide whether a given account may participate in token operations._

## Methods

### isAuthorized

```solidity
function isAuthorized(address account) external view returns (bool)
```

Returns whether `account` is authorised according to the external control list.

#### Parameters

| Name    | Type    | Description       |
| ------- | ------- | ----------------- |
| account | address | Address to check. |

#### Returns

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| \_0  | bool | `true` if the account is on the allow-list; `false` otherwise. |
