# IFactory

_Asset Tokenization Studio Team_

> Factory Interface

Interface for deploying tokenised securities (equity, bonds, loans) through a centralised factory that configures resolver proxies, business-logic resolvers, and role-based access control.

## Methods

### deployBond

```solidity
function deployBond(IFactory.BondData _bondData, FactoryRegulationData _factoryRegulationData) external nonpayable returns (address bondAddress_)
```

#### Parameters

| Name                    | Type                  | Description |
| ----------------------- | --------------------- | ----------- |
| \_bondData              | IFactory.BondData     | undefined   |
| \_factoryRegulationData | FactoryRegulationData | undefined   |

#### Returns

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| bondAddress\_ | address | undefined   |

### deployDepositToken

```solidity
function deployDepositToken(IFactory.DepositTokenData _depositTokenData, FactoryRegulationData _factoryRegulationData) external nonpayable returns (address depositTokenAddress_)
```

#### Parameters

| Name                    | Type                      | Description |
| ----------------------- | ------------------------- | ----------- |
| \_depositTokenData      | IFactory.DepositTokenData | undefined   |
| \_factoryRegulationData | FactoryRegulationData     | undefined   |

#### Returns

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| depositTokenAddress\_ | address | undefined   |

### deployEquity

```solidity
function deployEquity(IFactory.EquityData _equityData, FactoryRegulationData _factoryRegulationData) external nonpayable returns (address equityAddress_)
```

#### Parameters

| Name                    | Type                  | Description |
| ----------------------- | --------------------- | ----------- |
| \_equityData            | IFactory.EquityData   | undefined   |
| \_factoryRegulationData | FactoryRegulationData | undefined   |

#### Returns

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| equityAddress\_ | address | undefined   |

### deployProxy

```solidity
function deployProxy(contract IBusinessLogicResolver _resolver, IResolverProxy.ResolverProxyConfigurationV2 _resolverProxyConfigurationV2, IResolverProxy.Rbac[] _rbacs, bytes _data) external nonpayable returns (address proxyAddress_)
```

#### Parameters

| Name                           | Type                                        | Description |
| ------------------------------ | ------------------------------------------- | ----------- |
| \_resolver                     | contract IBusinessLogicResolver             | undefined   |
| \_resolverProxyConfigurationV2 | IResolverProxy.ResolverProxyConfigurationV2 | undefined   |
| \_rbacs                        | IResolverProxy.Rbac[]                       | undefined   |
| \_data                         | bytes                                       | undefined   |

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
event BondDeployed(address indexed deployer, address bondAddress, IFactory.BondData bondData, FactoryRegulationData regulationData)
```

Emitted when a new variable-rate bond is deployed.

#### Parameters

| Name               | Type                  | Description                                     |
| ------------------ | --------------------- | ----------------------------------------------- |
| deployer `indexed` | address               | Address that initiated the deployment.          |
| bondAddress        | address               | Address of the newly deployed bond proxy.       |
| bondData           | IFactory.BondData     | Full bond configuration supplied at deployment. |
| regulationData     | FactoryRegulationData | Regulation settings applied to the bond.        |

### DepositTokenDeployed

```solidity
event DepositTokenDeployed(address indexed deployer, address depositTokenAddress, IFactory.DepositTokenData depositTokenData, FactoryRegulationData regulationData)
```

Emitted when a new deposit token is deployed.

#### Parameters

| Name                | Type                      | Description                                        |
| ------------------- | ------------------------- | -------------------------------------------------- |
| deployer `indexed`  | address                   | Address that initiated the deployment.             |
| depositTokenAddress | address                   | Address of the newly deployed deposit token proxy. |
| depositTokenData    | IFactory.DepositTokenData | Full deposit token configuration.                  |
| regulationData      | FactoryRegulationData     | Regulation data validated for the deposit token.   |

### EquityDeployed

```solidity
event EquityDeployed(address indexed deployer, address equityAddress, IFactory.EquityData equityData, FactoryRegulationData regulationData)
```

Emitted when a new equity token is deployed.

#### Parameters

| Name               | Type                  | Description                                       |
| ------------------ | --------------------- | ------------------------------------------------- |
| deployer `indexed` | address               | Address that initiated the deployment.            |
| equityAddress      | address               | Address of the newly deployed equity proxy.       |
| equityData         | IFactory.EquityData   | Full equity configuration supplied at deployment. |
| regulationData     | FactoryRegulationData | Regulation settings applied to the equity.        |

### ProxyDeployed

```solidity
event ProxyDeployed(address indexed proxyAddress, contract IBusinessLogicResolver resolver, bytes32 configKey, uint256 version, IResolverProxy.Rbac[] rbac, bytes data)
```

Emitted when a new resolver proxy is deployed.

#### Parameters

| Name                   | Type                            | Description                                             |
| ---------------------- | ------------------------------- | ------------------------------------------------------- |
| proxyAddress `indexed` | address                         | Address of the newly deployed proxy.                    |
| resolver               | contract IBusinessLogicResolver | Business-logic resolver attached to the proxy.          |
| configKey              | bytes32                         | Configuration identifier used by the proxy.             |
| version                | uint256                         | Initial configuration version.                          |
| rbac                   | IResolverProxy.Rbac[]           | Role-based access control entries seeded at deployment. |
| data                   | bytes                           | Additional data for the proxy deployment.               |

## Errors

### EmptyResolver

```solidity
error EmptyResolver(contract IBusinessLogicResolver resolver)
```

Raised when the supplied resolver address is the zero address.

#### Parameters

| Name     | Type                            | Description                                       |
| -------- | ------------------------------- | ------------------------------------------------- |
| resolver | contract IBusinessLogicResolver | The zero-address resolver that caused the revert. |

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
