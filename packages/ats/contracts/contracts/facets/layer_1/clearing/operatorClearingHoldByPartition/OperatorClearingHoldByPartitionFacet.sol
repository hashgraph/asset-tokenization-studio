// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorClearingHoldByPartition } from "./IOperatorClearingHoldByPartition.sol";
import { OperatorClearingHoldByPartition } from "./OperatorClearingHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _OPERATOR_CLEARING_HOLDBYPARTITION_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract OperatorClearingHoldByPartitionFacet is OperatorClearingHoldByPartition, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _OPERATOR_CLEARING_HOLDBYPARTITION_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.operatorClearingCreateHoldByPartition.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IOperatorClearingHoldByPartition).interfaceId;
        }
    }
}
