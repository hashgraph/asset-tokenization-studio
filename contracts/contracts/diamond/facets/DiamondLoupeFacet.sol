pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

// The functions in DiamondLoupeFacet MUST be added to a diamond.
// The EIP-2535 Diamond standard requires these functions.

import {DiamondUnstructured} from '../unstructured/DiamondUnstructured.sol';
import {IDiamondLoupe} from '../../interfaces/diamond/IDiamondLoupe.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import {
    _DIAMOND_LOUPE_RESOLVER_KEY
} from '../../layer_1/constants/resolverKeys.sol';

// HACK: I think that Loupe and Cut implementation should be only one contract.
contract DiamondLoupeFacet is IDiamondLoupe, IERC165, DiamondUnstructured {
    function getFacets()
        external
        view
        override
        returns (Facet[] memory facets_)
    {
        facets_ = _getFacets(_getDiamondStorage());
    }

    function getFacetFunctionSelectors(
        bytes32 _facetKey
    ) external view override returns (bytes4[] memory facetFunctionSelectors_) {
        (
            facetFunctionSelectors_,

        ) = _getSelectorsAndInterfaceIdsByBusinessLogicKey(
            _getDiamondStorage().resolver,
            _facetKey
        );
    }

    function getFacetKeys()
        external
        view
        override
        returns (bytes32[] memory facetKeys_)
    {
        facetKeys_ = _getDiamondStorage().facetKeys;
    }

    function getFacetAddresses()
        external
        view
        override
        returns (address[] memory facetAddresses_)
    {
        facetAddresses_ = _getFacetAddresses(_getDiamondStorage());
    }

    function getFacetKeyBySelector(
        bytes4 _functionSelector
    ) external view override returns (bytes32 facetKey_) {
        facetKey_ = DiamondUnstructured
            ._getDiamondStorage()
            .facetKeysAndSelectorPosition[_functionSelector]
            .facetKey;
    }

    function getFacet(
        bytes32 _facetKey
    ) external view override returns (Facet memory facet_) {
        facet_ = _getFacet(_getDiamondStorage(), _facetKey);
    }

    function getFacetAddress(
        bytes4 _functionSelector
    ) external view override returns (address facetAddress_) {
        facetAddress_ = _getFacetAddress(
            _getDiamondStorage(),
            _functionSelector
        );
    }

    // This implements ERC-165.
    function supportsInterface(
        bytes4 _interfaceId
    ) external view override returns (bool) {
        return _getDiamondStorage().supportedInterfaces[_interfaceId];
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _DIAMOND_LOUPE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](8);
        uint256 selectorIndex;
        staticFunctionSelectors_[selectorIndex++] = this.getFacets.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getFacetFunctionSelectors
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getFacetKeys.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getFacetAddresses
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getFacetKeyBySelector
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getFacet.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getFacetAddress
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .supportsInterface
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondLoupe).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC165).interfaceId;
    }
}
