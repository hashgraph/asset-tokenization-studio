# KpiLinkedRate

_Asset Tokenization Studio Team_

> KpiLinkedRate

Manages the interest rate and impact data of a KPI-linked rate instrument.

_Implements `IKpiLinkedRate` and delegates persistence to `InterestRateStorageWrapper`. Administrative initialisation is single-use per resolver key. Rate and impact updates require an operational, activated and unpaused token, and trigger pending scheduled cross-ordered tasks before mutation._

## Methods

### getKpiLinkedRateImpactData

```solidity
function getKpiLinkedRateImpactData() external view returns (struct IKpiLinkedRate.ImpactData impactData_)
```

Returns the current KPI-linked impact data configuration.

#### Returns

| Name         | Type                      | Description                     |
| ------------ | ------------------------- | ------------------------------- |
| impactData\_ | IKpiLinkedRate.ImpactData | The stored `ImpactData` struct. |

### getKpiLinkedRateInterestRate

```solidity
function getKpiLinkedRateInterestRate() external view returns (struct IKpiLinkedRate.InterestRate interestRate_)
```

Returns the current KPI-linked interest rate configuration.

#### Returns

| Name           | Type                        | Description                       |
| -------------- | --------------------------- | --------------------------------- |
| interestRate\_ | IKpiLinkedRate.InterestRate | The stored `InterestRate` struct. |

### initializeKpiLinkedRate

```solidity
function initializeKpiLinkedRate(IKpiLinkedRate.InterestRate _interestRate, IKpiLinkedRate.ImpactData _impactData) external nonpayable
```

#### Parameters

| Name           | Type                        | Description |
| -------------- | --------------------------- | ----------- |
| \_interestRate | IKpiLinkedRate.InterestRate | undefined   |
| \_impactData   | IKpiLinkedRate.ImpactData   | undefined   |

### setKpiLinkedRateImpactData

```solidity
function setKpiLinkedRateImpactData(IKpiLinkedRate.ImpactData _newImpactData) external nonpayable
```

#### Parameters

| Name            | Type                      | Description |
| --------------- | ------------------------- | ----------- |
| \_newImpactData | IKpiLinkedRate.ImpactData | undefined   |

### setKpiLinkedRateInterestRate

```solidity
function setKpiLinkedRateInterestRate(IKpiLinkedRate.InterestRate _newInterestRate) external nonpayable
```

#### Parameters

| Name              | Type                        | Description |
| ----------------- | --------------------------- | ----------- |
| \_newInterestRate | IKpiLinkedRate.InterestRate | undefined   |

## Events

### ImpactDataUpdated

```solidity
event ImpactDataUpdated(address indexed operator, IKpiLinkedRate.ImpactData newImpactData)
```

Emitted when the KPI-linked impact data configuration is updated.

#### Parameters

| Name               | Type                      | Description                                            |
| ------------------ | ------------------------- | ------------------------------------------------------ |
| operator `indexed` | address                   | Address that performed the update.                     |
| newImpactData      | IKpiLinkedRate.ImpactData | The new impact data parameters that have been applied. |

### InterestRateUpdated

```solidity
event InterestRateUpdated(address indexed operator, IKpiLinkedRate.InterestRate newInterestRate)
```

Emitted when the KPI-linked interest rate configuration is updated.

#### Parameters

| Name               | Type                        | Description                                              |
| ------------------ | --------------------------- | -------------------------------------------------------- |
| operator `indexed` | address                     | Address that performed the update.                       |
| newInterestRate    | IKpiLinkedRate.InterestRate | The new interest rate parameters that have been applied. |

### KpiLinkedRateInitialized

```solidity
event KpiLinkedRateInitialized(IKpiLinkedRate.InterestRate interestRate, IKpiLinkedRate.ImpactData impactData)
```

Emitted once when the KpiLinkedRate capability is initialised on a token.

_Fires exclusively from `initializeKpiLinkedRate` after the storage write succeeds._

#### Parameters

| Name         | Type                        | Description                                                 |
| ------------ | --------------------------- | ----------------------------------------------------------- |
| interestRate | IKpiLinkedRate.InterestRate | The initial interest rate configuration written to storage. |
| impactData   | IKpiLinkedRate.ImpactData   | The initial impact data configuration written to storage.   |

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### WrongImpactDataValues

```solidity
error WrongImpactDataValues(IKpiLinkedRate.ImpactData impactData)
```

Raised when KPI-linked rate impact data values are invalid

#### Parameters

| Name       | Type                      | Description                    |
| ---------- | ------------------------- | ------------------------------ |
| impactData | IKpiLinkedRate.ImpactData | The invalid impact data values |

### WrongInterestRateValues

```solidity
error WrongInterestRateValues(IKpiLinkedRate.InterestRate interestRate)
```

Raised when KPI-linked rate interest rate values are invalid

#### Parameters

| Name         | Type                        | Description                      |
| ------------ | --------------------------- | -------------------------------- |
| interestRate | IKpiLinkedRate.InterestRate | The invalid interest rate values |
