// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {_TRANSFER_AND_LOCK_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {ITransferAndLock} from '../interfaces/ITransferAndLock.sol';
import {TransferAndLock} from './TransferAndLock.sol';

contract TransferAndLockFacet is TransferAndLock, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _TRANSFER_AND_LOCK_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this
            .transferAndLockByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .transferAndLock
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
        staticInterfaceIds_[selectorsIndex++] = type(ITransferAndLock)
            .interfaceId;
    }
}
