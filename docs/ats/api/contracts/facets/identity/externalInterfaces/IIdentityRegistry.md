# IIdentityRegistry

_Asset Tokenization Studio Team_

> IIdentityRegistry

Minimal adapter interface for querying an external ERC-3643 identity registry.

_Implemented by third-party ONCHAINID-compatible registries whose address is registered on the token. The token calls `isVerified` before allowing a transfer to ensure the recipient has passed KYC/AML checks._

## Methods

### isVerified

```solidity
function isVerified(address _userAddress) external view returns (bool)
```

Returns whether `_userAddress` has a verified identity in the registry.

#### Parameters

| Name          | Type    | Description       |
| ------------- | ------- | ----------------- |
| \_userAddress | address | Address to check. |

#### Returns

| Name | Type | Description                                       |
| ---- | ---- | ------------------------------------------------- |
| \_0  | bool | True if the address is verified, false otherwise. |
