pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IDiamondCut} from '../../interfaces/diamond/IDiamondCut.sol';
import {IDiamond} from '../../interfaces/diamond/IDiamond.sol';
import {DiamondUnstructured} from '../unstructured/DiamondUnstructured.sol';
import {_DEFAULT_ADMIN_ROLE} from '../../layer_1/constants/roles.sol';
import {
    _DIAMOND_CUT_RESOLVER_KEY
} from '../../layer_1/constants/resolverKeys.sol';

// Remember to add the loupe functions from DiamondLoupeFacet to the diamond.
// The loupe functions are required by the EIP2535 Diamonds standard
contract DiamondCutFacet is IDiamondCut, DiamondUnstructured {
    function registerFacets(
        bytes32[] calldata _facets
    ) external override onlyRole(_DEFAULT_ADMIN_ROLE) {
        _cleanAndRegisterBusinessLogics(_getDiamondStorage(), _facets);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _DIAMOND_CUT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = IDiamondCut
            .registerFacets
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
        staticInterfaceIds_[selectorsIndex++] = type(IDiamond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondCut).interfaceId;
    }
}
