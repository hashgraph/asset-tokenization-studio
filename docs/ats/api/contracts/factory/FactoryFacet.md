# FactoryFacet

_Asset Tokenization Studio Team_

> FactoryFacet

Diamond facet that exposes all Factory selectors under a single `RESOLVER_KEY_FACTORY` for use as a ResolverProxy facet.

_Inherits all logic from `Factory` unchanged. Adds only the `IStaticFunctionSelectors` triplet required by the Diamond proxy for selector registration in the BusinessLogicResolver. Factory is stateless (no storage). Delegatecall from ResolverProxy is safe: all CREATE operations (deployProxy, deployEquity, etc.) execute in the proxy&#39;s context, so created contracts are correctly owned and funded by the proxy, not a separate factory contract. This is the intended behaviour for a factory-as-proxy pattern._

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

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

#### Returns

| Name | Type     | Description              |
| ---- | -------- | ------------------------ |
| \_0  | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Gets all interfaces ids of a facet.

#### Returns

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| \_0  | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

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

### UnexpectedError

```solidity
error UnexpectedError(bytes4 _errorId)
```

Reverts when an unreachable validation state is detected.

_Replaces assertions for defensive handling of logically impossible states._

#### Parameters

| Name      | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| \_errorId | bytes4 | Identifier of the unexpected validation condition. |

### WrongDates

```solidity
error WrongDates(uint256 firstDate, uint256 secondDate)
```

Reverts when two date values fail their required ordering constraint.

_The expected relationship between both dates is defined by the caller&#39;s validation context._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| firstDate  | uint256 | First date participating in the failed comparison.  |
| secondDate | uint256 | Second date participating in the failed comparison. |

### WrongTimestamp

```solidity
error WrongTimestamp(uint256 timeStamp)
```

Reverts when a scheduled timestamp is not strictly in the future.

_The current timestamp is read through `TimeTravelStorageWrapper`._

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| timeStamp | uint256 | Timestamp rejected for scheduling. |
