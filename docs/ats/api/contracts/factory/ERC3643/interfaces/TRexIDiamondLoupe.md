# TRexIDiamondLoupe

## Methods

### getFacet

```solidity
function getFacet(bytes32 _facetId) external view returns (struct TRexIDiamondLoupe.Facet facet_)
```

Get the information associated with an specific facet

_If facet is not found return empty Facet struct_

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| \_facetId | bytes32 | The facet key for the resolver |

#### Returns

| Name    | Type                    | Description |
| ------- | ----------------------- | ----------- |
| facet\_ | TRexIDiamondLoupe.Facet | Facet data  |

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

Gets the facet key that supports the given selector

_If facet is not found return address(0)_

#### Parameters

| Name       | Type   | Description           |
| ---------- | ------ | --------------------- |
| \_selector | bytes4 | The function selector |

#### Returns

| Name      | Type    | Description   |
| --------- | ------- | ------------- |
| facetId\_ | bytes32 | The facet key |

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
function getFacets() external view returns (struct TRexIDiamondLoupe.Facet[] facets_)
```

Gets all facet addresses and their four byte function selectors.

#### Returns

| Name     | Type                      | Description |
| -------- | ------------------------- | ----------- |
| facets\_ | TRexIDiamondLoupe.Facet[] | Facet       |

### getFacetsByPage

```solidity
function getFacetsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (struct TRexIDiamondLoupe.Facet[] facets_)
```

Gets all facet addresses and their four byte function selectors.

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name     | Type                      | Description |
| -------- | ------------------------- | ----------- |
| facets\_ | TRexIDiamondLoupe.Facet[] | Facet       |

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

Gets all function selectors of a facet.

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

Gets the static resolver key.

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |
