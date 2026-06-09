# TRexIFactory

_Asset Tokenization Studio Team_

> Factory Interface

Interface for deploying tokenised securities (equity, bonds, loans) through a centralised factory that configures resolver proxies, business-logic resolvers, and role-based access control.

## Methods

### deployBond

```solidity
function deployBond(TRexIFactory.BondData _bondData, FactoryRegulationData _factoryRegulationData) external nonpayable returns (address bondAddress_)
```

#### Parameters

| Name                    | Type                  | Description |
| ----------------------- | --------------------- | ----------- |
| \_bondData              | TRexIFactory.BondData | undefined   |
| \_factoryRegulationData | FactoryRegulationData | undefined   |

#### Returns

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| bondAddress\_ | address | undefined   |

### deployDepositToken

```solidity
function deployDepositToken(TRexIFactory.DepositTokenData _depositTokenData, FactoryRegulationData _factoryRegulationData) external nonpayable returns (address depositTokenAddress_)
```

#### Parameters

| Name                    | Type                          | Description |
| ----------------------- | ----------------------------- | ----------- |
| \_depositTokenData      | TRexIFactory.DepositTokenData | undefined   |
| \_factoryRegulationData | FactoryRegulationData         | undefined   |

#### Returns

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| depositTokenAddress\_ | address | undefined   |

### deployEquity

```solidity
function deployEquity(TRexIFactory.EquityData _equityData, FactoryRegulationData _factoryRegulationData) external nonpayable returns (address equityAddress_)
```

#### Parameters

| Name                    | Type                    | Description |
| ----------------------- | ----------------------- | ----------- |
| \_equityData            | TRexIFactory.EquityData | undefined   |
| \_factoryRegulationData | FactoryRegulationData   | undefined   |

#### Returns

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| equityAddress\_ | address | undefined   |

### deployProxy

```solidity
function deployProxy(contract TRexIBusinessLogicResolver _resolver, bytes32 _configKey, uint256 _version, TRexIResolverProxy.Rbac[] _rbacs) external nonpayable returns (address proxyAddress_)
```

#### Parameters

| Name        | Type                                | Description |
| ----------- | ----------------------------------- | ----------- |
| \_resolver  | contract TRexIBusinessLogicResolver | undefined   |
| \_configKey | bytes32                             | undefined   |
| \_version   | uint256                             | undefined   |
| \_rbacs     | TRexIResolverProxy.Rbac[]           | undefined   |

#### Returns

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| proxyAddress\_ | address | undefined   |

### getAppliedRegulationData

```solidity
function getAppliedRegulationData(enum RegulationType _regulationType, enum RegulationSubType _regulationSubType) external pure returns (struct RegulationData regulationData_)
```

Returns the regulation data that applies to a given type/sub-type pair.

#### Parameters

| Name                | Type                   | Description                         |
| ------------------- | ---------------------- | ----------------------------------- |
| \_regulationType    | enum RegulationType    | Primary regulation category.        |
| \_regulationSubType | enum RegulationSubType | Sub-category within the regulation. |

#### Returns

| Name             | Type           | Description                       |
| ---------------- | -------------- | --------------------------------- |
| regulationData\_ | RegulationData | Matched regulation configuration. |

## Events

### BondDeployed

```solidity
event BondDeployed(address indexed deployer, address bondAddress, TRexIFactory.BondData bondData, FactoryRegulationData regulationData)
```

Emitted when a new variable-rate bond is deployed.

#### Parameters

| Name               | Type                  | Description                                     |
| ------------------ | --------------------- | ----------------------------------------------- |
| deployer `indexed` | address               | Address that initiated the deployment.          |
| bondAddress        | address               | Address of the newly deployed bond proxy.       |
| bondData           | TRexIFactory.BondData | Full bond configuration supplied at deployment. |
| regulationData     | FactoryRegulationData | Regulation settings applied to the bond.        |

### DepositTokenDeployed

```solidity
event DepositTokenDeployed(address indexed deployer, address depositTokenAddress, TRexIFactory.DepositTokenData depositTokenData, FactoryRegulationData regulationData)
```

Emitted when a new deposit token is deployed.

#### Parameters

| Name                | Type                          | Description                                        |
| ------------------- | ----------------------------- | -------------------------------------------------- |
| deployer `indexed`  | address                       | Address that initiated the deployment.             |
| depositTokenAddress | address                       | Address of the newly deployed deposit token proxy. |
| depositTokenData    | TRexIFactory.DepositTokenData | Full deposit token configuration.                  |
| regulationData      | FactoryRegulationData         | Regulation data validated for the deposit token.   |

### EquityDeployed

```solidity
event EquityDeployed(address indexed deployer, address equityAddress, TRexIFactory.EquityData equityData, FactoryRegulationData regulationData)
```

Emitted when a new equity token is deployed.

#### Parameters

| Name               | Type                    | Description                                       |
| ------------------ | ----------------------- | ------------------------------------------------- |
| deployer `indexed` | address                 | Address that initiated the deployment.            |
| equityAddress      | address                 | Address of the newly deployed equity proxy.       |
| equityData         | TRexIFactory.EquityData | Full equity configuration supplied at deployment. |
| regulationData     | FactoryRegulationData   | Regulation settings applied to the equity.        |

### ProxyDeployed

```solidity
event ProxyDeployed(address indexed proxyAddress, contract TRexIBusinessLogicResolver resolver, bytes32 configKey, uint256 version, TRexIResolverProxy.Rbac[] rbac)
```

Emitted when a new resolver proxy is deployed.

#### Parameters

| Name                   | Type                                | Description                                             |
| ---------------------- | ----------------------------------- | ------------------------------------------------------- |
| proxyAddress `indexed` | address                             | Address of the newly deployed proxy.                    |
| resolver               | contract TRexIBusinessLogicResolver | Business-logic resolver attached to the proxy.          |
| configKey              | bytes32                             | Configuration identifier used by the proxy.             |
| version                | uint256                             | Initial configuration version.                          |
| rbac                   | TRexIResolverProxy.Rbac[]           | Role-based access control entries seeded at deployment. |

## Errors

### EmptyResolver

```solidity
error EmptyResolver(contract TRexIBusinessLogicResolver resolver)
```

Raised when the supplied resolver address is the zero address.

#### Parameters

| Name     | Type                                | Description                                       |
| -------- | ----------------------------------- | ------------------------------------------------- |
| resolver | contract TRexIBusinessLogicResolver | The zero-address resolver that caused the revert. |

### NoInitialAdmins

```solidity
error NoInitialAdmins()
```

Raised when no admin role assignments are provided for the new proxy.

### RegulationTypeAndSubTypeForbidden

```solidity
error RegulationTypeAndSubTypeForbidden(enum RegulationType regulationType, enum RegulationSubType regulationSubType)
```

Raised when the requested regulation type and sub-type combination is not permitted.

#### Parameters

| Name              | Type                   | Description                         |
| ----------------- | ---------------------- | ----------------------------------- |
| regulationType    | enum RegulationType    | Primary regulation category.        |
| regulationSubType | enum RegulationSubType | Sub-category within the regulation. |
