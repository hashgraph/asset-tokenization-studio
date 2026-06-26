# ICore

_Asset Tokenization Studio Team_

> ICore

Consolidated interface for the token &quot;Core&quot; domain: identity-defining methods (ERC20 metadata readers, ERC3643 name/symbol setters, and version). Also owns the `ERC20MetadataInfo` and `ERC20Metadata` structs, since the only initializer for this data (`initializeCore`) lives in CoreFacet.

## Methods

### decimals

```solidity
function decimals() external view returns (uint8)
```

Returns the decimals simulating non-triggered decimal adjustments up until current timestamp.

#### Returns

| Name | Type  | Description                                    |
| ---- | ----- | ---------------------------------------------- |
| \_0  | uint8 | The number of decimals used for token amounts. |

### getERC20Metadata

```solidity
function getERC20Metadata() external view returns (struct ICore.ERC20Metadata)
```

Returns the full metadata struct of the security token.

#### Returns

| Name | Type                | Description                           |
| ---- | ------------------- | ------------------------------------- |
| \_0  | ICore.ERC20Metadata | The persisted `ERC20Metadata` bundle. |

### initializeCore

```solidity
function initializeCore(ICore.ERC20Metadata _metadata) external nonpayable
```

#### Parameters

| Name       | Type                | Description |
| ---------- | ------------------- | ----------- |
| \_metadata | ICore.ERC20Metadata | undefined   |

### name

```solidity
function name() external view returns (string)
```

Returns the name of the security token.

#### Returns

| Name | Type   | Description            |
| ---- | ------ | ---------------------- |
| \_0  | string | The token name string. |

### setName

```solidity
function setName(string _name) external nonpayable
```

Updates the token name. Restricted to the TREX owner role.

#### Parameters

| Name   | Type   | Description                      |
| ------ | ------ | -------------------------------- |
| \_name | string | New name to assign to the token. |

### setSymbol

```solidity
function setSymbol(string _symbol) external nonpayable
```

Updates the token symbol. Restricted to the TREX owner role.

#### Parameters

| Name     | Type   | Description                        |
| -------- | ------ | ---------------------------------- |
| \_symbol | string | New symbol to assign to the token. |

### symbol

```solidity
function symbol() external view returns (string)
```

Returns the symbol of the security token.

#### Returns

| Name | Type   | Description              |
| ---- | ------ | ------------------------ |
| \_0  | string | The token symbol string. |

### version

```solidity
function version() external view returns (string)
```

Returns the ERC3643 version string of the token.

#### Returns

| Name | Type   | Description                                    |
| ---- | ------ | ---------------------------------------------- |
| \_0  | string | The version string (e.g. `&quot;4.0.0&quot;`). |

## Events

### CoreInitialized

```solidity
event CoreInitialized(ICore.ERC20Metadata metadata)
```

Emitted once when the core ERC-20 metadata is initialised on a token.

_Fires exclusively from `initializeCore` after the storage write succeeds._

#### Parameters

| Name     | Type                | Description                                                  |
| -------- | ------------------- | ------------------------------------------------------------ |
| metadata | ICore.ERC20Metadata | The full ERC-20 metadata bundle persisted at initialisation. |
