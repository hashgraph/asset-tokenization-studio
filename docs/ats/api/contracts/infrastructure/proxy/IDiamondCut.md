# IDiamondCut

_Asset Tokenization Studio Team_

> IDiamondCut

Interface for upgrading the Diamond proxy&#39;s Business Logic Resolver (BLR), configuration identifier, and version in a single or multi-step operation.

## Methods

### getConfigInfo

```solidity
function getConfigInfo() external view returns (address resolver_, bytes8 proxyVersion_, bytes32 configurationId_, uint256 configurationVersion_, bool replacementEnabled_)
```

Returns the active resolver address, configuration identifier, and version.

#### Returns

| Name                   | Type    | Description                                     |
| ---------------------- | ------- | ----------------------------------------------- |
| resolver\_             | address | Address of the current Business Logic Resolver. |
| proxyVersion\_         | bytes8  | proxy version.                                  |
| configurationId\_      | bytes32 | Identifier of the active configuration.         |
| configurationVersion\_ | uint256 | Version number of the active configuration.     |
| replacementEnabled\_   | bool    | Whether replacement is enabled.                 |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[] staticFunctionSelectors_)
```

Gets all function selectors of a facet

#### Returns

| Name                      | Type     | Description              |
| ------------------------- | -------- | ------------------------ |
| staticFunctionSelectors\_ | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[] staticInterfaceIds_)
```

Gets all interfaces ids of a facet.

#### Returns

| Name                 | Type     | Description        |
| -------------------- | -------- | ------------------ |
| staticInterfaceIds\_ | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### updateConfig

```solidity
function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external nonpayable
```

For the current BLR, update its configuration identifier and version.

#### Parameters

| Name                 | Type    | Description                                               |
| -------------------- | ------- | --------------------------------------------------------- |
| \_newConfigurationId | bytes32 | The new configuration identifier to apply.                |
| \_newVersion         | uint256 | The version number associated with the new configuration. |

### updateConfigVersion

```solidity
function updateConfigVersion(uint256 _newVersion) external nonpayable
```

For the current BLR and configuration, update the used version.

#### Parameters

| Name         | Type    | Description                                                  |
| ------------ | ------- | ------------------------------------------------------------ |
| \_newVersion | uint256 | The new version number to set for the current configuration. |

### updateReplacementEnabled

```solidity
function updateReplacementEnabled(bool _newReplacementEnabled) external nonpayable
```

For the current BLR update its configuration

#### Parameters

| Name                    | Type | Description                           |
| ----------------------- | ---- | ------------------------------------- |
| \_newReplacementEnabled | bool | The replacement enabled flag to set\* |

### updateResolver

```solidity
function updateResolver(contract IBusinessLogicResolver _newResolver, bytes32 _newConfigurationId, uint256 _newVersion, bool _newReplacementEnabled) external nonpayable
```

Replaces the Business Logic Resolver with a new one, setting configuration and version.

#### Parameters

| Name                    | Type                            | Description                                                   |
| ----------------------- | ------------------------------- | ------------------------------------------------------------- |
| \_newResolver           | contract IBusinessLogicResolver | The new BLR contract address to wire into the proxy.          |
| \_newConfigurationId    | bytes32                         | The configuration identifier to activate on the new resolver. |
| \_newVersion            | uint256                         | The version number associated with the new configuration.     |
| \_newReplacementEnabled | bool                            | undefined                                                     |
