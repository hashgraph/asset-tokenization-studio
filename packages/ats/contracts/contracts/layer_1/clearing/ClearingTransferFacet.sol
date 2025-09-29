// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IClearingTransfer} from '../interfaces/clearing/IClearingTransfer.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {_CLEARING_TRANSFER_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {ClearingTransfer} from './ClearingTransfer.sol';

contract ClearingTransferFacet is ClearingTransfer, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _CLEARING_TRANSFER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this
            .clearingTransferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .clearingTransferFromByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .operatorClearingTransferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .protectedClearingTransferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getClearingTransferForByPartition
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingTransfer)
            .interfaceId;
    }
}
