# IKpiLinkedRate

_Asset Tokenization Studio Team_

> IKpiLinkedRate

Interface for the KPI-linked rate facet that ties coupon rates to external performance indicators (KPIs) via configurable interest rate and impact data parameters.

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
