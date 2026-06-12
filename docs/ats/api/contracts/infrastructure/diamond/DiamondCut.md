# DiamondCut

_Asset Tokenization Studio Team_

> Diamond Cut

Provides privileged resolver-proxy configuration update operations.

_Mutates resolver-proxy storage after validating target configurations through the configured or supplied business-logic resolver. Access is restricted to accounts holding the default admin role in the proxy access-control storage._

## Methods

### getConfigInfo

```solidity
function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_)
```

Returns the configuration used by the secuirity

#### Returns

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| resolver\_        | address | undefined   |
| configurationId\_ | bytes32 | undefined   |
| version\_         | uint256 | undefined   |

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

For the current BLR update its configuration\*

_Requires `DEFAULT_ADMIN_ROLE` and validates the configuration before storing the new configuration identifier and pinned version._

#### Parameters

| Name                 | Type    | Description |
| -------------------- | ------- | ----------- |
| \_newConfigurationId | bytes32 | undefined   |
| \_newVersion         | uint256 | undefined   |

### updateConfigVersion

```solidity
function updateConfigVersion(uint256 _newVersion) external nonpayable
```

For the current BLR and configuration, update the used version

_Requires `DEFAULT_ADMIN_ROLE` and preserves the active configuration identifier and resolver while updating only the pinned configuration version._

#### Parameters

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| \_newVersion | uint256 | undefined   |

### updateResolver

```solidity
function updateResolver(contract IBusinessLogicResolver _newResolver, bytes32 _newConfigurationId, uint256 _newVersion) external nonpayable
```

Updates the BLR to a new one

_Requires `DEFAULT_ADMIN_ROLE` and validates the target configuration against the new resolver before replacing the resolver pointer, configuration identifier and version._

#### Parameters

| Name                 | Type                            | Description |
| -------------------- | ------------------------------- | ----------- |
| \_newResolver        | contract IBusinessLogicResolver | undefined   |
| \_newConfigurationId | bytes32                         | undefined   |
| \_newVersion         | uint256                         | undefined   |

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
