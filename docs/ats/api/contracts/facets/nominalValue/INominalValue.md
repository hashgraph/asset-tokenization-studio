# INominalValue

_Asset Tokenization Studio Team_

> INominalValue

External surface for the nominal value capability: declares the per-token nominal value (amount, decimals, ISO 4217 currency code, effective datetime, and unit/total flag) and the publish/republish lifecycle keyed on `effectiveDatetime`.

_Implemented by `NominalValueFacet` via the abstract `NominalValue` writer. Events are declared here (writer interface) per the project&#39;s event-emission rule; the abstract is the sole emit site for each event. Currency uses `bytes3` to hold an ISO 4217 alphabetic code (e.g. `0x555344` for &quot;USD&quot;), matching the convention shared with security details._

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
