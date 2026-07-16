# Factory

_Asset Tokenization Studio Team_

> Factory

Provides shared proxy deployment and initialisation flows for ATS securities.

_Concrete factories inherit this contract to deploy resolver-backed security proxies. Deployment temporarily grants this factory `DEFAULT_ADMIN_ROLE`, initialises all required facets, verifies operational status, and then renounces the temporary role._

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

### AccountIsBlocked

```solidity
error AccountIsBlocked(address account)
```

Reverts when an operation targets or is requested by a blocked account.

_The blocking policy is enforced by the domain that performs the check._

#### Parameters

| Name    | Type    | Description                                  |
| ------- | ------- | -------------------------------------------- |
| account | address | Account rejected by the blocking validation. |

### AlreadyInitialized

```solidity
error AlreadyInitialized()
```

Reverts when an initialisation routine is invoked more than once.

_Used by contracts or facets that must be initialised exactly once._

### ContradictoryValuesInArray

```solidity
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex)
```

Reverts when ordered array values contradict expected ordering.

_Indicates that two indexed values cannot both satisfy the required monotonic or range invariant._

#### Parameters

| Name       | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| lowerIndex | uint256 | Lower array index involved in the contradiction. |
| upperIndex | uint256 | Upper array index involved in the contradiction. |

### DecimalsTooLarge

```solidity
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals)
```

Reverts when the difference between current decimals and new decimals exceeds the maximum value.

_Protects decimals amount difference between current and new not te be greater than maximum._

#### Parameters

| Name            | Type  | Description                  |
| --------------- | ----- | ---------------------------- |
| currentDecimals | uint8 | the current decimals amount. |
| newDecimals     | uint8 | the new decimals amount.     |

### EmptyResolver

```solidity
error EmptyResolver(contract IBusinessLogicResolver resolver)
```

Raised when the supplied resolver address is the zero address.

#### Parameters

| Name     | Type                            | Description                                       |
| -------- | ------------------------------- | ------------------------------------------------- |
| resolver | contract IBusinessLogicResolver | The zero-address resolver that caused the revert. |

### ExpiredDeadline

```solidity
error ExpiredDeadline(uint256 deadline)
```

Reverts when a signed payload is submitted after its deadline.

_The caller must provide and validate deadlines before accepting the signed operation._

#### Parameters

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| deadline | uint256 | Expired deadline carried by the signed payload. |

### ExponentOverflow

```solidity
error ExponentOverflow(uint256 exponent)
```

Reverts when an exponent would cause `10 ** exponent` to overflow `uint256`.

_Thrown by `DecimalsLib.checkExponentOverflow` when `exponent &gt;= 78`._

#### Parameters

| Name     | Type    | Description                                  |
| -------- | ------- | -------------------------------------------- |
| exponent | uint256 | The exponent that would produce an overflow. |

### GreaterThanMaxUint256

```solidity
error GreaterThanMaxUint256(uint256 amount, uint8 decimals)
```

Reverts when multiplying `amount` by `10 ** decimals` would exceed `uint256` max.

_Thrown by `DecimalsLib.calculateDecimalsAdjustment` when `amount &gt; MAX_UINT256 / 10 ** decimals`._

#### Parameters

| Name     | Type    | Description                                |
| -------- | ------- | ------------------------------------------ |
| amount   | uint256 | The token amount that cannot be scaled up. |
| decimals | uint8   | The exponent that causes the overflow.     |

### InvalidDates

```solidity
error InvalidDates()
```

Reverts when a date set is invalid.

_Used when the failing date constraint does not require exposing values._

### InvalidTimestamp

```solidity
error InvalidTimestamp()
```

Reverts when a timestamp value is invalid.

_Used for shared timestamp validation that is not tied to expiration._

### MaxExternalListSizeReached

```solidity
error MaxExternalListSizeReached(uint256 max)
```

Reverts when adding an entry would grow an external list beyond its maximum size.

_Enforced by `ExternalListManagementStorageWrapper.addExternalList` for the external pause, control and KYC lists. The bound exists because each list is iterated in full on the hot path of token operations, so an unbounded list could exceed the gas limit and brick the token._

#### Parameters

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| max  | uint256 | Maximum number of entries permitted in the external list. |

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

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._

### WrongNonce

```solidity
error WrongNonce(uint256 nonce, address account)
```

Reverts when a nonce does not match the expected value for an account.

_Protects signed operations against replay and out-of-order execution._

#### Parameters

| Name    | Type    | Description                                     |
| ------- | ------- | ----------------------------------------------- |
| nonce   | uint256 | Nonce supplied by the caller or signed payload. |
| account | address | Account for which the nonce validation failed.  |

### WrongSignature

```solidity
error WrongSignature()
```

Reverts when a signature fails verification.

_Applies to shared signature validation flows, including EIP-712 payloads and partition-based signatures._

### WrongSignatureLength

```solidity
error WrongSignatureLength()
```

Reverts when a signature payload has an invalid byte length.

_Used before signature recovery or verification to reject malformed input._

### WrongTimestamp

```solidity
error WrongTimestamp(uint256 timeStamp)
```

Reverts when a scheduled timestamp is not strictly in the future.

_Used for shared scheduling validation where the current block time is read through `TimeTravelStorageWrapper`._

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| timeStamp | uint256 | Timestamp rejected for scheduling. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._

### ZeroValueNotAllowed

```solidity
error ZeroValueNotAllowed()
```

Reverts when zero is supplied where a positive value is required.

_Used for shared validation of amounts, limits, factors, or identifiers._
