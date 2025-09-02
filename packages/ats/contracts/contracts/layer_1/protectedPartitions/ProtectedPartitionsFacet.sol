pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import { IProtectedPartitions } from '../interfaces/protectedPartitions/IProtectedPartitions.sol';
import { IStaticFunctionSelectors } from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import { _PROTECTED_PARTITIONS_RESOLVER_KEY } from '../constants/resolverKeys.sol';
import { ProtectedPartitions } from './ProtectedPartitions.sol';

contract ProtectedPartitionsFacet is ProtectedPartitions, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROTECTED_PARTITIONS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](6);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ProtectedPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unprotectPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.arePartitionsProtected.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNounceFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.calculateRoleForPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IProtectedPartitions).interfaceId;
    }
}
