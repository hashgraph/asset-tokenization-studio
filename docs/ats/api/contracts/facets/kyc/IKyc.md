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

_Activate Internal Kyc_

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

### deactivateInternalKyc

```solidity
function deactivateInternalKyc() external nonpayable returns (bool success_)
```

_Deactivate Internal Kyc_

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

### getKycAccountsCount

```solidity
function getKycAccountsCount(enum IKyc.KycStatus _kycStatus) external view returns (uint256 kycAccountsCount_)
```

_Get the count of accounts with a given Kyc status_

#### Parameters

| Name        | Type                | Description            |
| ----------- | ------------------- | ---------------------- |
| \_kycStatus | enum IKyc.KycStatus | GRANTED or NOT_GRANTED |

#### Returns

| Name               | Type    | Description                                 |
| ------------------ | ------- | ------------------------------------------- |
| kycAccountsCount\_ | uint256 | count of accounts with the given Kyc status |

### getKycAccountsData

```solidity
function getKycAccountsData(enum IKyc.KycStatus _kycStatus, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] accounts_, struct IKyc.KycData[] kycData_)
```

_Returns an array with the KYC data from accounts with a given KYC status_

#### Parameters

| Name         | Type                | Description                                   |
| ------------ | ------------------- | --------------------------------------------- |
| \_kycStatus  | enum IKyc.KycStatus | GRANTED or NOT_GRANTED                        |
| \_pageIndex  | uint256             | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256             | number of members to return                   |

#### Returns

| Name       | Type           | Description                                     |
| ---------- | -------------- | ----------------------------------------------- |
| accounts\_ | address[]      | The array containing the accounts               |
| kycData\_  | IKyc.KycData[] | The array containing the data from the accounts |

### getKycFor

```solidity
function getKycFor(address _account) external view returns (struct IKyc.KycData kyc_)
```

_Get all the info of the Kyc for an account_

#### Parameters

| Name      | Type    | Description          |
| --------- | ------- | -------------------- |
| \_account | address | the account to check |

#### Returns

| Name  | Type         | Description |
| ----- | ------------ | ----------- |
| kyc\_ | IKyc.KycData | kyc\_       |

### getKycStatusFor

```solidity
function getKycStatusFor(address _account) external view returns (enum IKyc.KycStatus kycStatus_)
```

_Get the status of the Kyc for an account_

#### Parameters

| Name      | Type    | Description          |
| --------- | ------- | -------------------- |
| \_account | address | the account to check |

#### Returns

| Name        | Type                | Description            |
| ----------- | ------------------- | ---------------------- |
| kycStatus\_ | enum IKyc.KycStatus | GRANTED or NOT_GRANTED |

### grantKyc

```solidity
function grantKyc(address _account, string _vcId, uint256 _validFrom, uint256 _validTo, address _issuer) external nonpayable returns (bool success_)
```

_Grant kyc to an address_

#### Parameters

| Name        | Type    | Description                     |
| ----------- | ------- | ------------------------------- |
| \_account   | address | user whose Kyc is being granted |
| \_vcId      | string  | credential Id                   |
| \_validFrom | uint256 | start date of the Kyc           |
| \_validTo   | uint256 | end date of the Kyc             |
| \_issuer    | address | issurer of the Kyc              |

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

### initializeInternalKyc

```solidity
function initializeInternalKyc(bool _activateInternalKyc) external nonpayable
```

_Initialize Internal Kyc_

#### Parameters

| Name                  | Type | Description |
| --------------------- | ---- | ----------- |
| \_activateInternalKyc | bool | undefined   |

### isInternalKycActivated

```solidity
function isInternalKycActivated() external view returns (bool)
```

_Get the internal kyc flag_

#### Returns

| Name | Type | Description                                |
| ---- | ---- | ------------------------------------------ |
| \_0  | bool | bool true if the internal kyc is activated |

### revokeKyc

```solidity
function revokeKyc(address _account) external nonpayable returns (bool success_)
```

_Revoke kyc to an address_

#### Parameters

| Name      | Type    | Description                     |
| --------- | ------- | ------------------------------- |
| \_account | address | user whose Kyc is being revoked |

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

## Events

### InternalKycStatusUpdated

```solidity
event InternalKycStatusUpdated(address indexed operator, bool activated)
```

_Emitted when Internal Kyc is updated_

#### Parameters

| Name               | Type    | Description                              |
| ------------------ | ------- | ---------------------------------------- |
| operator `indexed` | address | The address for which the Kyc is updated |
| activated          | bool    | The status of the internal Kyc           |

### KycGranted

```solidity
event KycGranted(address indexed account, address indexed issuer)
```

_Emitted when a Kyc is granted_

#### Parameters

| Name              | Type    | Description                              |
| ----------------- | ------- | ---------------------------------------- |
| account `indexed` | address | The address for which the Kyc is granted |
| issuer `indexed`  | address | The address of the issuer of the Kyc     |

### KycInitialized

```solidity
event KycInitialized(bool internalKycActivated)
```

Emitted once when the KYC capability is initialised on a token.

_Fires exclusively from `initializeInternalKyc` after the storage write succeeds._

#### Parameters

| Name                 | Type | Description |
| -------------------- | ---- | ----------- |
| internalKycActivated | bool | undefined   |

### KycRevoked

```solidity
event KycRevoked(address indexed account, address indexed issuer)
```

_Emitted when a Kyc is revoked_

#### Parameters

| Name              | Type    | Description                              |
| ----------------- | ------- | ---------------------------------------- |
| account `indexed` | address | The address for which the Kyc is revoked |
| issuer `indexed`  | address | The address of the issuer of the Kyc     |

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
