# Kyc

_Asset Tokenization Studio Team_

> Kyc

Manages internal KYC records and exposes paginated KYC status queries.

_Implements `IKyc` and delegates persistent state to `KycStorageWrapper`. Mutating operations require the token to be operational, activated and unpaused, except initialisation, which is restricted to an unregistered facet. Time-dependent status checks use `EvmAccessors` as the canonical timestamp source._

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
function initializeInternalKyc(bool _internalKycActivated) external nonpayable
```

_Initialize Internal Kyc_

#### Parameters

| Name                   | Type | Description |
| ---------------------- | ---- | ----------- |
| \_internalKycActivated | bool | undefined   |

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

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### AccountIsNotIssuer

```solidity
error AccountIsNotIssuer(address issuer)
```

Thrown when an address is required to be a listed issuer but is not.

#### Parameters

| Name   | Type    | Description                                          |
| ------ | ------- | ---------------------------------------------------- |
| issuer | address | The address that failed the issuer membership check. |

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### InvalidDates

```solidity
error InvalidDates()
```

Reverts when a date set is invalid.

_Used when the failing date constraint does not require exposing values._

### InvalidKycStatus

```solidity
error InvalidKycStatus()
```

### InvalidZeroAddress

```solidity
error InvalidZeroAddress()
```

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### KycIsNotGranted

```solidity
error KycIsNotGranted()
```

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
