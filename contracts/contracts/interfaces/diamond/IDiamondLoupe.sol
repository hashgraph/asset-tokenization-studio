pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IStaticFunctionSelectors} from './IStaticFunctionSelectors.sol';

// A loupe is a small magnifying glass used to look at diamonds.
// These functions look at diamonds
/// #### Structs
/// ```
///    struct Facet {
///        bytes32 facetKey;
///        address facetAddress;
///        bytes4[] functionSelectors;
///    }
///```
// HACK: I think that Loupe and Cut should be only one contract.
interface IDiamondLoupe is IStaticFunctionSelectors {
    struct Facet {
        bytes32 facetKey;
        address facetAddress;
        bytes4[] functionSelectors;
        bytes4[] interfaceIds;
    }

    /// @notice Gets all facet addresses and their four byte function selectors.
    /// @return facets_ Facet
    function getFacets() external view returns (Facet[] memory facets_);

    /// @notice Gets all the function selectors supported by a specific facet.
    /// @param _facetKey The facet key for the resolver.
    /// @return facetFunctionSelectors_
    function getFacetFunctionSelectors(
        bytes32 _facetKey
    ) external view returns (bytes4[] memory facetFunctionSelectors_);

    /// @notice Get all the facet addresses used by a diamond.
    /// @return facetKeys_
    function getFacetKeys() external view returns (bytes32[] memory facetKeys_);

    /// @notice Get all the facet addresses used by a diamond.
    /// @return facetAddresses_
    function getFacetAddresses()
        external
        view
        returns (address[] memory facetAddresses_);

    /// @notice Gets the facet key that supports the given selector.
    /// @dev If facet is not found return address(0).
    /// @param _functionSelector The function selector.
    /// @return facetKey_ The facet key.
    function getFacetKeyBySelector(
        bytes4 _functionSelector
    ) external view returns (bytes32 facetKey_);

    /// @notice Get the information associated with an specific facet.
    /// @dev If facet is not found return empty Facet struct.
    /// @param _facetKey The facet key for the resolver.
    /// @return facet_ Facet data.
    function getFacet(
        bytes32 _facetKey
    ) external view returns (Facet memory facet_);

    /// @notice Gets the facet that supports the given selector.
    /// @dev If facet is not found return address(0).
    /// @param _functionSelector The function selector.
    /// @return facetAddress_ The facet address.
    function getFacetAddress(
        bytes4 _functionSelector
    ) external view returns (address facetAddress_);
}
