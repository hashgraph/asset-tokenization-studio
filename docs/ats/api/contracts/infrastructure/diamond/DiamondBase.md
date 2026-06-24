# DiamondBase

_Asset Tokenization Studio Team_

> DiamondBase

Abstract base for the Diamond facet that combines DiamondCut + DiamondLoupe with initialisation support via `initializeDiamondCut`.

_Inherits from existing DiamondCut and DiamondLoupe abstracts and adds the initialiser function that registers the facet with the centralised InitializerStorageWrapper._

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

### getFacet

```solidity
function getFacet(bytes32 _facetId) external view returns (struct IDiamondLoupe.Facet facet_)
```

Get the information associated with an specific facet

_If facet is not found return empty Facet struct_

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| \_facetId | bytes32 | The facet key for the resolver |

#### Returns

| Name    | Type                | Description |
| ------- | ------------------- | ----------- |
| facet\_ | IDiamondLoupe.Facet | Facet data  |

### getFacetAddress

```solidity
function getFacetAddress(bytes4 _selector) external view returns (address facetAddress_)
```

Gets the facet that supports the given selector

_If facet is not found return address(0)_

#### Parameters

| Name       | Type   | Description           |
| ---------- | ------ | --------------------- |
| \_selector | bytes4 | The function selector |

#### Returns

| Name           | Type    | Description       |
| -------------- | ------- | ----------------- |
| facetAddress\_ | address | The facet address |

### getFacetAddresses

```solidity
function getFacetAddresses() external view returns (address[] facetAddresses_)
```

Get all the facet addresses used by a resolverProxy

#### Returns

| Name             | Type      | Description      |
| ---------------- | --------- | ---------------- |
| facetAddresses\_ | address[] | facetAddresses\_ |

### getFacetAddressesByPage

```solidity
function getFacetAddressesByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] facetAddresses_)
```

Get all the facet addresses used by a resolverProxy

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name             | Type      | Description      |
| ---------------- | --------- | ---------------- |
| facetAddresses\_ | address[] | facetAddresses\_ |

### getFacetIdBySelector

```solidity
function getFacetIdBySelector(bytes4 _selector) external view returns (bytes32 facetId_)
```

Returns the facet identifier registered for a function selector.

_Reads resolver-proxy selector metadata and returns zero when the selector is absent._

#### Parameters

| Name       | Type   | Description                   |
| ---------- | ------ | ----------------------------- |
| \_selector | bytes4 | Function selector to resolve. |

#### Returns

| Name      | Type    | Description                                    |
| --------- | ------- | ---------------------------------------------- |
| facetId\_ | bytes32 | Facet identifier associated with the selector. |

### getFacetIds

```solidity
function getFacetIds() external view returns (bytes32[] facetIds_)
```

Get all the facet addresses used by a resolverProxy

#### Returns

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| facetIds\_ | bytes32[] | facetIds\_  |

### getFacetIdsByPage

```solidity
function getFacetIdsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] facetIds_)
```

Get all the facet addresses used by a resolverProxy

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| facetIds\_ | bytes32[] | facetIds\_  |

### getFacetSelectors

```solidity
function getFacetSelectors(bytes32 _facetId) external view returns (bytes4[] facetSelectors_)
```

Gets all the function selectors supported by a specific facet.

#### Parameters

| Name      | Type    | Description                     |
| --------- | ------- | ------------------------------- |
| \_facetId | bytes32 | The facet key for the resolver. |

#### Returns

| Name             | Type     | Description      |
| ---------------- | -------- | ---------------- |
| facetSelectors\_ | bytes4[] | facetSelectors\_ |

### getFacetSelectorsByPage

```solidity
function getFacetSelectorsByPage(bytes32 _facetId, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes4[] facetSelectors_)
```

Gets all the function selectors supported by a specific facet.

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_facetId    | bytes32 | The facet key for the resolver.               |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name             | Type     | Description      |
| ---------------- | -------- | ---------------- |
| facetSelectors\_ | bytes4[] | facetSelectors\_ |

### getFacetSelectorsLength

```solidity
function getFacetSelectorsLength(bytes32 _facetId) external view returns (uint256 facetSelectorsLength_)
```

Gets the function selectors length.

#### Parameters

| Name      | Type    | Description                     |
| --------- | ------- | ------------------------------- |
| \_facetId | bytes32 | The facet key for the resolver. |

#### Returns

| Name                   | Type    | Description            |
| ---------------------- | ------- | ---------------------- |
| facetSelectorsLength\_ | uint256 | facetSelectorsLength\_ |

### getFacets

```solidity
function getFacets() external view returns (struct IDiamondLoupe.Facet[] facets_)
```

Gets all facet addresses and their four byte function selectors.

#### Returns

| Name     | Type                  | Description |
| -------- | --------------------- | ----------- |
| facets\_ | IDiamondLoupe.Facet[] | Facet       |

### getFacetsByPage

```solidity
function getFacetsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (struct IDiamondLoupe.Facet[] facets_)
```

Gets all facet addresses and their four byte function selectors.

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name     | Type                  | Description |
| -------- | --------------------- | ----------- |
| facets\_ | IDiamondLoupe.Facet[] | Facet       |

### getFacetsLength

```solidity
function getFacetsLength() external view returns (uint256 facetsLength_)
```

Gets facet length.

#### Returns

| Name           | Type    | Description   |
| -------------- | ------- | ------------- |
| facetsLength\_ | uint256 | Facets length |

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

### initializeDiamondCut

```solidity
function initializeDiamondCut() external nonpayable
```

Initialises the diamond facet and registers it in the initialiser registry.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### supportsInterface

```solidity
function supportsInterface(bytes4 _interfaceId) external view returns (bool)
```

_Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas._

#### Parameters

| Name          | Type   | Description |
| ------------- | ------ | ----------- |
| \_interfaceId | bytes4 | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### updateConfig

```solidity
function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external nonpayable
```

For the current BLR, update its configuration identifier and version.

_Requires `DEFAULT_ADMIN_ROLE` and validates the configuration before storing the new configuration identifier and pinned version._

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

_Requires `DEFAULT_ADMIN_ROLE` and preserves the active configuration identifier and resolver while updating only the pinned configuration version._

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

_Requires `DEFAULT_ADMIN_ROLE` and validates the target configuration against the new resolver before replacing the resolver pointer, configuration identifier and version._

#### Parameters

| Name                    | Type                            | Description                                                   |
| ----------------------- | ------------------------------- | ------------------------------------------------------------- |
| \_newResolver           | contract IBusinessLogicResolver | The new BLR contract address to wire into the proxy.          |
| \_newConfigurationId    | bytes32                         | The configuration identifier to activate on the new resolver. |
| \_newVersion            | uint256                         | The version number associated with the new configuration.     |
| \_newReplacementEnabled | bool                            | The replacement enabled flag to set.                          |

## Events

### DiamondCutInitialized

```solidity
event DiamondCutInitialized()
```

Emitted once when the diamond facet is initialised.

_Fires exclusively from `initializeDiamondCut`._

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
