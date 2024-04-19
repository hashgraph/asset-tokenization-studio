pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {DiamondCutFacet} from './DiamondCutFacet.sol';
import {DiamondLoupeFacet} from './DiamondLoupeFacet.sol';
import {_DIAMOND_RESOLVER_KEY} from '../../layer_1/constants/resolverKeys.sol';
import {IDiamond} from '../../interfaces/diamond/IDiamond.sol';
import {IDiamondCut} from '../../interfaces/diamond/IDiamondCut.sol';
import {IDiamondLoupe} from '../../interfaces/diamond/IDiamondLoupe.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';

// Remember to add the loupe functions from DiamondLoupeFacet to the diamond.
// The loupe functions are required by the EIP2535 Diamonds standard
contract DiamondFacet is DiamondCutFacet, DiamondLoupeFacet {
    function getStaticResolverKey()
        external
        pure
        override(DiamondCutFacet, DiamondLoupeFacet)
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _DIAMOND_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override(DiamondCutFacet, DiamondLoupeFacet)
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](9);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this
            .registerFacets
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacets.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .getFacetFunctionSelectors
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetKeys.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .getFacetAddresses
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .getFacetKeyBySelector
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacet.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .getFacetAddress
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .supportsInterface
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override(DiamondCutFacet, DiamondLoupeFacet)
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondCut).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondLoupe).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC165).interfaceId;
    }
}
