// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "../interfaces/protectedPartitions/IProtectedPartitions.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ProtectedPartitions } from "./ProtectedPartitions.sol";

abstract contract ProtectedPartitionsFacetBase is ProtectedPartitions, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ProtectedPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unprotectPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.arePartitionsProtected.selector;
        staticFunctionSelectors_[selectorIndex++] = this.calculateRoleForPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IProtectedPartitions).interfaceId;
    }
}
