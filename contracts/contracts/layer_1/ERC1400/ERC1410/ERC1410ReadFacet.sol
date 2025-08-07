// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    _ERC1410_READ_RESOLVER_KEY
} from '../../../layer_1/constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {IERC1410Read} from '../../interfaces/ERC1400/IERC1410Read.sol';
import {ERC1410Read} from './ERC1410Read.sol';

contract ERC1410ReadFacet is IStaticFunctionSelectors, ERC1410Read {
    function getStaticResolverKey()
        external
        pure
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC1410_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](10);
        uint256 selectorIndex = 0;
        // Balance and supply functions
        staticFunctionSelectors_[selectorIndex++] = this.balanceOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .balanceOfByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .totalSupplyByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.partitionsOf.selector;
        // Configuration functions
        staticFunctionSelectors_[selectorIndex++] = this
            .isMultiPartition
            .selector;
        // Operator functions
        staticFunctionSelectors_[selectorIndex++] = this.isOperator.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .isOperatorForPartition
            .selector;
        // Can transfer/redeem functions
        staticFunctionSelectors_[selectorIndex++] = this
            .canTransferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .canRedeemByPartition
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Read).interfaceId;
    }
}
