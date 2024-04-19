// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    ERC1410SnapshotStorageWrapper
} from './ERC1410SnapshotStorageWrapper.sol';
import {ERC1410Basic} from './ERC1410Basic.sol';
import {ERC1410Operator} from './ERC1410Operator.sol';
import {ERC1410Standard} from './ERC1410Standard.sol';
import {ERC1410Controller} from './ERC1410Controller.sol';
import {_ERC1410_RESOLVER_KEY} from '../../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {IERC1410} from '../../interfaces/ERC1400/IERC1410.sol';

contract ERC1410Snapshot is
    IStaticFunctionSelectors,
    ERC1410Basic,
    ERC1410Operator,
    ERC1410Standard,
    ERC1410Controller,
    ERC1410SnapshotStorageWrapper
{
    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC1410_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](22);
        uint256 selectorIndex = 0;
        staticFunctionSelectors_[selectorIndex++] = this
            .initialize_ERC1410_Basic
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .transferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .isMultiPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .balanceOfByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.partitionsOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .totalSupplyByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .operatorTransferByPartition
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
        staticFunctionSelectors_[selectorIndex++] = this.isOperator.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .isOperatorForPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .redeemByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .operatorRedeemByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .issueByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .controllerTransferByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .controllerRedeemByPartition
            .selector;
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
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1410).interfaceId;
    }
}
