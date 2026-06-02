// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IOperatorClearingHoldByPartition,
    RESOLVER_KEY_OPERATOR_CLEARING_HOLDBYPARTITION
} from "./IOperatorClearingHoldByPartition.sol";
import { OperatorClearingHoldByPartition } from "./OperatorClearingHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title  OperatorClearingHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes operator-clearing-hold-by-partition operations to the proxy.
 * @dev    Selectors exposed:
 *         - `initializeOperatorClearingHoldByPartition`
 *         - `operatorClearingCreateHoldByPartition`
 */
contract OperatorClearingHoldByPartitionFacet is OperatorClearingHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_OPERATOR_CLEARING_HOLDBYPARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeOperatorClearingHoldByPartition.selector,
                this.operatorClearingCreateHoldByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IOperatorClearingHoldByPartition).interfaceId);
    }
}
