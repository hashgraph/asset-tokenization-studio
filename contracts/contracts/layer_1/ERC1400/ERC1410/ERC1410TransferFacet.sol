/*
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   [Full Apache License text omitted for brevity but would be identical to previous files]

*/

// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    _ERC1410_TRANSFER_RESOLVER_KEY
} from '../../../layer_1/constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {IERC1410Transfer} from '../../interfaces/ERC1400/IERC1410Transfer.sol';
import {ERC1410Transfer} from './ERC1410Transfer.sol';

contract ERC1410TransferFacet is IStaticFunctionSelectors, ERC1410Transfer {
    function getStaticResolverKey()
        external
        pure
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC1410_TRANSFER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](11);
        uint256 selectorIndex = 0;
        staticFunctionSelectors_[selectorIndex++] = this
            .transferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .redeemByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .issueByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .authorizeOperator
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .revokeOperator
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .authorizeOperatorByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .revokeOperatorByPartition
            .selector;
        // Trigger sync function
        staticFunctionSelectors_[selectorIndex++] = this
            .triggerAndSyncAll
            .selector;
        // Utility functions
        staticFunctionSelectors_[selectorIndex++] = this
            .getStaticInterfaceIds
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Transfer).interfaceId;
    }
}
