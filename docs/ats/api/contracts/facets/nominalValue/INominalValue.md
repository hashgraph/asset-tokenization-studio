# INominalValue

_Asset Tokenization Studio Team_

> INominalValue

External surface for the nominal value capability: declares the per-token nominal value (amount, decimals, ISO 4217 currency code) and the events emitted when those fields are initialised or mutated.

_Implemented by `NominalValueFacet` via the abstract `NominalValue` writer. Events are declared here (writer interface) per the project&#39;s event-emission rule; the abstract is the sole emit site for each event. Currency uses `bytes3` to hold an ISO 4217 alphabetic code (e.g. `0x555344` for &quot;USD&quot;), matching the convention shared with security details._

## Methods

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
function getNominalValueDecimals() external view returns (uint8)
```

Returns the decimals applied to the nominal value.

#### Returns

| Name | Type  | Description                                        |
| ---- | ----- | -------------------------------------------------- |
| \_0  | uint8 | The current decimals applied to `getNominalValue`. |

### initializeNominalValue

```solidity
function initializeNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals, bytes3 _nominalValueCurrency) external nonpayable
```

Initialises the nominal value capability with amount, decimals, and currency.

_Callable once per token; subsequent calls revert with `AlreadyInitialized` via the `onlyNotNominalValueInitialized` modifier on the implementation. The factory calls this automatically when deploying security tokens, forwarding the currency from the security details so newly-deployed tokens land with the field populated._

#### Parameters

| Name                   | Type    | Description                                                         |
| ---------------------- | ------- | ------------------------------------------------------------------- |
| \_nominalValue         | uint256 | Initial nominal value amount.                                       |
| \_nominalValueDecimals | uint8   | Number of decimals applied to `_nominalValue`.                      |
| \_nominalValueCurrency | bytes3  | ISO 4217 currency code as `bytes3`; pass `0x000000` to leave unset. |

### setNominalValue

```solidity
function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external nonpayable
```

Updates the nominal value amount and its decimals.

_Restricted to holders of `ROLE_NOMINAL_VALUE`._

#### Parameters

| Name                   | Type    | Description                              |
| ---------------------- | ------- | ---------------------------------------- |
| \_nominalValue         | uint256 | New nominal value amount.                |
| \_nominalValueDecimals | uint8   | New decimals applied to `_nominalValue`. |

### setNominalValueCurrency

```solidity
function setNominalValueCurrency(bytes3 _nominalValueCurrency) external nonpayable
```

Updates the ISO 4217 currency code attached to the nominal value.

_Restricted to holders of `ROLE_NOMINAL_VALUE`. Does not touch the value/decimals; callers must update those separately via `setNominalValue` if both change._

#### Parameters

| Name                   | Type   | Description                             |
| ---------------------- | ------ | --------------------------------------- |
| \_nominalValueCurrency | bytes3 | New ISO 4217 currency code as `bytes3`. |

## Events

### NominalValueCurrencySet

```solidity
event NominalValueCurrencySet(address indexed operator, bytes3 nominalValueCurrency)
```

Emitted when the ISO 4217 currency code of the nominal value is updated.

_Fires exclusively from `setNominalValueCurrency`; initialisation goes through `NominalValueInitialized` instead._

#### Parameters

| Name                 | Type    | Description                                    |
| -------------------- | ------- | ---------------------------------------------- |
| operator `indexed`   | address | The caller authorised by `ROLE_NOMINAL_VALUE`. |
| nominalValueCurrency | bytes3  | The new ISO 4217 currency code as `bytes3`.    |

### NominalValueInitialized

```solidity
event NominalValueInitialized(uint256 nominalValue, uint8 nominalValueDecimals, bytes3 nominalValueCurrency)
```

Emitted once when the nominal value capability is initialised on a token.

_Fires exclusively from `initializeNominalValue` after the storage write succeeds. Subsequent value or currency updates emit `NominalValueSet` / `NominalValueCurrencySet` instead, never this event._

#### Parameters

| Name                 | Type    | Description                                                             |
| -------------------- | ------- | ----------------------------------------------------------------------- |
| nominalValue         | uint256 | The initial nominal value amount.                                       |
| nominalValueDecimals | uint8   | The number of decimals applied to `nominalValue`.                       |
| nominalValueCurrency | bytes3  | ISO 4217 currency code as `bytes3`; `0x000000` means &quot;unset&quot;. |

### NominalValueSet

```solidity
event NominalValueSet(address indexed operator, uint256 nominalValue, uint8 nominalValueDecimals)
```

Emitted when the nominal value amount or its decimals are updated post-initialisation.

_Fires exclusively from `setNominalValue`._

#### Parameters

| Name                 | Type    | Description                                    |
| -------------------- | ------- | ---------------------------------------------- |
| operator `indexed`   | address | The caller authorised by `ROLE_NOMINAL_VALUE`. |
| nominalValue         | uint256 | The new nominal value amount.                  |
| nominalValueDecimals | uint8   | The new decimals applied to `nominalValue`.    |
