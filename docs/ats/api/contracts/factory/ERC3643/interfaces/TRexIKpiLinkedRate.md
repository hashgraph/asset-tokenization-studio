# TRexIKpiLinkedRate

## Methods

### getKpiLinkedRateImpactData

```solidity
function getKpiLinkedRateImpactData() external view returns (struct TRexIKpiLinkedRate.ImpactData impactData_)
```

Returns the current KPI-linked impact data configuration.

#### Returns

| Name         | Type                          | Description                     |
| ------------ | ----------------------------- | ------------------------------- |
| impactData\_ | TRexIKpiLinkedRate.ImpactData | The stored `ImpactData` struct. |

### getKpiLinkedRateInterestRate

```solidity
function getKpiLinkedRateInterestRate() external view returns (struct TRexIKpiLinkedRate.InterestRate interestRate_)
```

Returns the current KPI-linked interest rate configuration.

#### Returns

| Name           | Type                            | Description                       |
| -------------- | ------------------------------- | --------------------------------- |
| interestRate\_ | TRexIKpiLinkedRate.InterestRate | The stored `InterestRate` struct. |

### initializeKpiLinkedRate

```solidity
function initializeKpiLinkedRate(TRexIKpiLinkedRate.InterestRate _interestRate, TRexIKpiLinkedRate.ImpactData _impactData) external nonpayable
```

#### Parameters

| Name           | Type                            | Description |
| -------------- | ------------------------------- | ----------- |
| \_interestRate | TRexIKpiLinkedRate.InterestRate | undefined   |
| \_impactData   | TRexIKpiLinkedRate.ImpactData   | undefined   |

### setKpiLinkedRateImpactData

```solidity
function setKpiLinkedRateImpactData(TRexIKpiLinkedRate.ImpactData _newImpactData) external nonpayable
```

#### Parameters

| Name            | Type                          | Description |
| --------------- | ----------------------------- | ----------- |
| \_newImpactData | TRexIKpiLinkedRate.ImpactData | undefined   |

### setKpiLinkedRateInterestRate

```solidity
function setKpiLinkedRateInterestRate(TRexIKpiLinkedRate.InterestRate _newInterestRate) external nonpayable
```

#### Parameters

| Name              | Type                            | Description |
| ----------------- | ------------------------------- | ----------- |
| \_newInterestRate | TRexIKpiLinkedRate.InterestRate | undefined   |

## Events

### ImpactDataUpdated

```solidity
event ImpactDataUpdated(address indexed operator, TRexIKpiLinkedRate.ImpactData newImpactData)
```

Emitted when the KPI-linked impact data configuration is updated.

#### Parameters

| Name               | Type                          | Description                                            |
| ------------------ | ----------------------------- | ------------------------------------------------------ |
| operator `indexed` | address                       | Address that performed the update.                     |
| newImpactData      | TRexIKpiLinkedRate.ImpactData | The new impact data parameters that have been applied. |

### InterestRateUpdated

```solidity
event InterestRateUpdated(address indexed operator, TRexIKpiLinkedRate.InterestRate newInterestRate)
```

Emitted when the KPI-linked interest rate configuration is updated.

#### Parameters

| Name               | Type                            | Description                                              |
| ------------------ | ------------------------------- | -------------------------------------------------------- |
| operator `indexed` | address                         | Address that performed the update.                       |
| newInterestRate    | TRexIKpiLinkedRate.InterestRate | The new interest rate parameters that have been applied. |

### KpiLinkedRateInitialized

```solidity
event KpiLinkedRateInitialized(TRexIKpiLinkedRate.InterestRate interestRate, TRexIKpiLinkedRate.ImpactData impactData)
```

Emitted once when the KpiLinkedRate capability is initialised on a token.

_Fires exclusively from `initializeKpiLinkedRate` after the storage write succeeds._

#### Parameters

| Name         | Type                            | Description |
| ------------ | ------------------------------- | ----------- |
| interestRate | TRexIKpiLinkedRate.InterestRate | undefined   |
| impactData   | TRexIKpiLinkedRate.ImpactData   | undefined   |

## Errors

### WrongImpactDataValues

```solidity
error WrongImpactDataValues(TRexIKpiLinkedRate.ImpactData impactData)
```

Raised when KPI-linked rate impact data values are invalid

#### Parameters

| Name       | Type                          | Description                    |
| ---------- | ----------------------------- | ------------------------------ |
| impactData | TRexIKpiLinkedRate.ImpactData | The invalid impact data values |

### WrongInterestRateValues

```solidity
error WrongInterestRateValues(TRexIKpiLinkedRate.InterestRate interestRate)
```

Raised when KPI-linked rate interest rate values are invalid

#### Parameters

| Name         | Type                            | Description                      |
| ------------ | ------------------------------- | -------------------------------- |
| interestRate | TRexIKpiLinkedRate.InterestRate | The invalid interest rate values |
