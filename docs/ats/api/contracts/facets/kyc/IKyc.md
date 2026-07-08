# IKyc

_Hashgraph_

> IKyc Interface

Interface for KYC (Know Your Customer) management operations

_Defines standard functions for granting, revoking, and checking KYC status_

## Methods

### activateInternalKyc

```solidity
function activateInternalKyc() external nonpayable returns (bool success_)
```

Activates internal KYC enforcement for the token.

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True when the call succeeds without reverting. |

### deactivateInternalKyc

```solidity
function deactivateInternalKyc() external nonpayable returns (bool success_)
```

Deactivates internal KYC enforcement for the token.

#### Returns

| Name      | Type | Description                                    |
| --------- | ---- | ---------------------------------------------- |
| success\_ | bool | True when the call succeeds without reverting. |

### getKycAccountsCount

```solidity
function getKycAccountsCount(enum IKyc.KycStatus _kycStatus) external view returns (uint256 kycAccountsCount_)
```

Returns the number of accounts with a given KYC status.

#### Parameters

| Name        | Type                | Description                                      |
| ----------- | ------------------- | ------------------------------------------------ |
| \_kycStatus | enum IKyc.KycStatus | The status to filter by: GRANTED or NOT_GRANTED. |

#### Returns

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| kycAccountsCount\_ | uint256 | The count of accounts matching the given status. |

### getKycAccountsData

```solidity
function getKycAccountsData(enum IKyc.KycStatus _kycStatus, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] accounts_, struct IKyc.KycData[] kycData_)
```

Returns a paginated list of accounts and their KYC data for a given KYC status.

#### Parameters

| Name         | Type                | Description                                                      |
| ------------ | ------------------- | ---------------------------------------------------------------- |
| \_kycStatus  | enum IKyc.KycStatus | The status to filter by: GRANTED or NOT_GRANTED.                 |
| \_pageIndex  | uint256             | Zero-based page index; skips `_pageIndex * _pageLength` entries. |
| \_pageLength | uint256             | Maximum number of entries to return per page.                    |

#### Returns

| Name       | Type           | Description                                                        |
| ---------- | -------------- | ------------------------------------------------------------------ |
| accounts\_ | address[]      | The accounts matching the given KYC status in the requested page.  |
| kycData\_  | IKyc.KycData[] | The KYC data records corresponding to each account in `accounts_`. |

### getKycFor

```solidity
function getKycFor(address _account) external view returns (struct IKyc.KycData kyc_)
```

Returns all KYC metadata recorded for an account.

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The account to query. |

#### Returns

| Name  | Type         | Description                                 |
| ----- | ------------ | ------------------------------------------- |
| kyc\_ | IKyc.KycData | The full `KycData` struct for that account. |

### getKycStatusFor

```solidity
function getKycStatusFor(address _account) external view returns (enum IKyc.KycStatus kycStatus_)
```

Returns the current KYC status for an account.

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The account to check. |

#### Returns

| Name        | Type                | Description             |
| ----------- | ------------------- | ----------------------- |
| kycStatus\_ | enum IKyc.KycStatus | GRANTED or NOT_GRANTED. |

### grantKyc

```solidity
function grantKyc(address _account, string _vcId, uint256 _validFrom, uint256 _validTo, address _issuer) external nonpayable returns (bool success_)
```

Grants KYC to an account with the supplied verifiable-credential metadata.

#### Parameters

| Name        | Type    | Description                                            |
| ----------- | ------- | ------------------------------------------------------ |
| \_account   | address | User whose KYC is being granted.                       |
| \_vcId      | string  | Verifiable-credential identifier issued by the issuer. |
| \_validFrom | uint256 | Start timestamp of the KYC validity period.            |
| \_validTo   | uint256 | End timestamp of the KYC validity period.              |
| \_issuer    | address | Address of the entity issuing the KYC.                 |

#### Returns

| Name      | Type | Description                                     |
| --------- | ---- | ----------------------------------------------- |
| success\_ | bool | True when the grant succeeds without reverting. |

### initializeInternalKyc

```solidity
function initializeInternalKyc(bool _activateInternalKyc) external nonpayable
```

Initialises the internal KYC capability on the token.

#### Parameters

| Name                  | Type | Description                                             |
| --------------------- | ---- | ------------------------------------------------------- |
| \_activateInternalKyc | bool | Whether to enable internal KYC enforcement immediately. |

### isInternalKycActivated

```solidity
function isInternalKycActivated() external view returns (bool)
```

Returns whether internal KYC enforcement is currently active.

#### Returns

| Name | Type | Description                                         |
| ---- | ---- | --------------------------------------------------- |
| \_0  | bool | True if internal KYC is activated, false otherwise. |

### revokeKyc

```solidity
function revokeKyc(address _account) external nonpayable returns (bool success_)
```

Revokes the KYC previously granted to an account.

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_account | address | User whose KYC is being revoked. |

#### Returns

| Name      | Type | Description                                          |
| --------- | ---- | ---------------------------------------------------- |
| success\_ | bool | True when the revocation succeeds without reverting. |

## Events

### InternalKycStatusUpdated

```solidity
event InternalKycStatusUpdated(address indexed operator, bool activated)
```

Emitted when the internal KYC enforcement status is toggled.

#### Parameters

| Name               | Type    | Description                                   |
| ------------------ | ------- | --------------------------------------------- |
| operator `indexed` | address | The address that triggered the status update. |
| activated          | bool    | The new activation state of the internal KYC. |

### KycGranted

```solidity
event KycGranted(address indexed account, address indexed issuer)
```

Emitted when KYC is granted to an account.

#### Parameters

| Name              | Type    | Description                               |
| ----------------- | ------- | ----------------------------------------- |
| account `indexed` | address | The address for which the KYC is granted. |
| issuer `indexed`  | address | The address of the issuer of the KYC.     |

### KycInitialized

```solidity
event KycInitialized(bool internalKycActivated)
```

Emitted once when the KYC capability is initialised on a token.

_Fires exclusively from `initializeInternalKyc` after the storage write succeeds._

#### Parameters

| Name                 | Type | Description                                                     |
| -------------------- | ---- | --------------------------------------------------------------- |
| internalKycActivated | bool | Whether internal KYC enforcement was enabled at initialisation. |

### KycRevoked

```solidity
event KycRevoked(address indexed account, address indexed issuer)
```

Emitted when KYC is revoked from an account.

#### Parameters

| Name              | Type    | Description                                 |
| ----------------- | ------- | ------------------------------------------- |
| account `indexed` | address | The address for which the KYC is revoked.   |
| issuer `indexed`  | address | The address of the issuer revoking the KYC. |

## Errors

### InvalidKycStatus

```solidity
error InvalidKycStatus()
```

### InvalidZeroAddress

```solidity
error InvalidZeroAddress()
```

### KycIsNotGranted

```solidity
error KycIsNotGranted()
```
