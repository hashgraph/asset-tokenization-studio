# NominalValue

_Asset Tokenization Studio Team_

> NominalValue

Writer abstract for the nominal value capability; sole emit site for the events declared on `INominalValue`.

_Delegates all storage reads and writes to `NominalValueStorageWrapper`, which owns the dedicated storage slot. Access guards are enforced via `Modifiers`._

## Methods

### getIsUnitNominalValue

```solidity
function getIsUnitNominalValue() external view returns (bool)
```

Returns whether the nominal value is a per-unit or aggregate value.

_Set once at `initializeNominalValue` time; unchanged by publish/republish._

#### Returns

| Name | Type | Description                                                              |
| ---- | ---- | ------------------------------------------------------------------------ |
| \_0  | bool | True when the nominal value is expressed per unit; false when aggregate. |

### getNominalValue

```solidity
function getNominalValue() external view returns (uint256)
```

Returns the nominal value amount.

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | The current nominal value amount. |

### getNominalValueCurrency

```solidity
function getNominalValueCurrency() external view returns (bytes3)
```

Returns the ISO 4217 currency code attached to the nominal value.

#### Returns

| Name | Type   | Description                                                                         |
| ---- | ------ | ----------------------------------------------------------------------------------- |
| \_0  | bytes3 | The current ISO 4217 currency code as `bytes3`; `0x000000` means &quot;unset&quot;. |

### getNominalValueDecimals

```solidity
function getNominalValueDecimals() external view returns (uint256)
```

Returns the decimals applied to the nominal value.

#### Returns

| Name | Type    | Description                                        |
| ---- | ------- | -------------------------------------------------- |
| \_0  | uint256 | The current decimals applied to `getNominalValue`. |

### initializeNominalValue

```solidity
function initializeNominalValue(uint256 _nominalValue, uint256 _nominalValueDecimals, bytes3 _nominalValueCurrency, uint256 _effectiveDatetime, bool _isUnitNominalValue) external nonpayable
```

Initialises the nominal value capability with amount, decimals, currency, effective datetime, and the unit/total flag.

_Callable once per token; subsequent calls revert with `AlreadyInitialized` via the `onlyFacetNotRegistered` modifier on the implementation. `_effectiveDatetime` may be zero during initialisation; any non-zero value must be strictly less than `block.timestamp` or the call reverts with `ICommonErrors.WrongTimestamp`._

#### Parameters

| Name                   | Type    | Description                                                                         |
| ---------------------- | ------- | ----------------------------------------------------------------------------------- |
| \_nominalValue         | uint256 | Initial nominal value amount.                                                       |
| \_nominalValueDecimals | uint256 | Number of decimals applied to `_nominalValue`. Fixed for the lifetime of the token. |
| \_nominalValueCurrency | bytes3  | ISO 4217 currency code as `bytes3`; pass `0x000000` to leave unset.                 |
| \_effectiveDatetime    | uint256 | Zero or a timestamp strictly less than `block.timestamp`.                           |
| \_isUnitNominalValue   | bool    | Whether `_nominalValue` is a per-unit (true) or aggregate (false) value.            |

### publishNominalValue

```solidity
function publishNominalValue(uint256 _nominalValue, uint256 _effectiveDatetime) external nonpayable
```

Publishes a new nominal value for a new valuation period.

_Restricted to holders of `ROLE_NOMINAL_VALUE`. The `onlyValidTimestamp` modifier rejects zero, `onlyValidPublishDatetime` requires `_effectiveDatetime` to be strictly greater than the currently stored `effectiveDatetime`, and `onlyPastTimestamp` requires it to be strictly less than `block.timestamp`. Triggers pending scheduled cross-ordered tasks and emits `NominalValuePublished`._

#### Parameters

| Name                | Type    | Description                                                                                                  |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| \_nominalValue      | uint256 | New nominal value amount.                                                                                    |
| \_effectiveDatetime | uint256 | New effective datetime; must satisfy `storedEffectiveDatetime &lt; _effectiveDatetime &lt; block.timestamp`. |

### republishNominalValue

```solidity
function republishNominalValue(uint256 _nominalValue, uint256 _effectiveDatetime) external nonpayable
```

Corrects the nominal value already published for the current valuation period.

_Restricted to holders of `ROLE_NOMINAL_VALUE`. The `onlyValidTimestamp` modifier rejects zero, and `onlyValidRepublishDatetime` reverts with `NominalValueEffectiveDatetimeMismatch` unless `_effectiveDatetime` exactly equals the currently stored `effectiveDatetime`. Triggers pending scheduled cross-ordered tasks and emits `NominalValueRepublished`._

#### Parameters

| Name                | Type    | Description                                                       |
| ------------------- | ------- | ----------------------------------------------------------------- |
| \_nominalValue      | uint256 | Corrected nominal value amount.                                   |
| \_effectiveDatetime | uint256 | Non-zero effective datetime; must equal the currently stored one. |

## Events

### NominalValueInitialized

```solidity
event NominalValueInitialized(uint256 nominalValue, uint256 nominalValueDecimals, bytes3 nominalValueCurrency)
```

Emitted once when the nominal value capability is initialised on a token.

_Fires exclusively from `initializeNominalValue` after the storage write succeeds._

#### Parameters

| Name                 | Type    | Description                                                             |
| -------------------- | ------- | ----------------------------------------------------------------------- |
| nominalValue         | uint256 | The initial nominal value amount.                                       |
| nominalValueDecimals | uint256 | The number of decimals applied to `nominalValue`.                       |
| nominalValueCurrency | bytes3  | ISO 4217 currency code as `bytes3`; `0x000000` means &quot;unset&quot;. |

### NominalValuePublished

```solidity
event NominalValuePublished(address indexed operator, uint256 nominalValue, uint256 effectiveDatetime)
```

Emitted when a new nominal value is published for a new valuation period.

_Fires exclusively from `publishNominalValue`._

#### Parameters

| Name               | Type    | Description                                    |
| ------------------ | ------- | ---------------------------------------------- |
| operator `indexed` | address | The caller authorised by `ROLE_NOMINAL_VALUE`. |
| nominalValue       | uint256 | The new nominal value amount.                  |
| effectiveDatetime  | uint256 | The new effective datetime.                    |

### NominalValueRepublished

```solidity
event NominalValueRepublished(address indexed operator, uint256 nominalValue, uint256 effectiveDatetime)
```

Emitted when the nominal value for the current valuation period is corrected.

_Fires exclusively from `republishNominalValue`._

#### Parameters

| Name               | Type    | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| operator `indexed` | address | The caller authorised by `ROLE_NOMINAL_VALUE`.      |
| nominalValue       | uint256 | The corrected nominal value amount.                 |
| effectiveDatetime  | uint256 | The (unchanged) effective datetime being corrected. |

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

### InvalidTimestamp

```solidity
error InvalidTimestamp()
```

Reverts when a timestamp value is invalid.

_Used for shared timestamp validation that is not tied to expiration._

### NominalValueEffectiveDatetimeMismatch

```solidity
error NominalValueEffectiveDatetimeMismatch(uint256 provided, uint256 current)
```

Raised when `republishNominalValue` is called with an `_effectiveDatetime` that does not exactly match the currently stored one.

#### Parameters

| Name     | Type    | Description                                      |
| -------- | ------- | ------------------------------------------------ |
| provided | uint256 | The `_effectiveDatetime` supplied by the caller. |
| current  | uint256 | The currently stored `effectiveDatetime`.        |

### NominalValueEffectiveDatetimeNotAfterCurrent

```solidity
error NominalValueEffectiveDatetimeNotAfterCurrent(uint256 provided, uint256 current)
```

Raised when `publishNominalValue` is called with an `_effectiveDatetime` that is not strictly after the currently stored one.

#### Parameters

| Name     | Type    | Description                                      |
| -------- | ------- | ------------------------------------------------ |
| provided | uint256 | The `_effectiveDatetime` supplied by the caller. |
| current  | uint256 | The currently stored `effectiveDatetime`.        |

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
