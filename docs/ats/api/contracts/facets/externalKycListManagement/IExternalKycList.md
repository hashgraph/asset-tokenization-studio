# IExternalKycList

_Asset Tokenization Studio Team_

> IExternalKycList

Minimal interface for querying an external KYC-list contract.

_Implemented by third-party KYC registries whose address is registered on the token. The token calls `getKycStatus` to verify whether an account has passed KYC checks before allowing it to participate in token operations._

## Methods

### getKycStatus

```solidity
function getKycStatus(address account) external view returns (enum IKyc.KycStatus)
```

Returns the KYC status of `account` as recorded in the external KYC list.

#### Parameters

| Name    | Type    | Description       |
| ------- | ------- | ----------------- |
| account | address | Address to check. |

#### Returns

| Name | Type                | Description                                       |
| ---- | ------------------- | ------------------------------------------------- |
| \_0  | enum IKyc.KycStatus | The `IKyc.KycStatus` value for the given account. |
