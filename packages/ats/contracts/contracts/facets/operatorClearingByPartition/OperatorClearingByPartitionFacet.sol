// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IOperatorClearingByPartition,
    RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION
} from "./IOperatorClearingByPartition.sol";
import { OperatorClearingByPartition } from "./OperatorClearingByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title OperatorClearingByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet for partition-scoped operator clearing redeem and transfer operations.
 * @dev Exposes operator clearing functionality to the Diamond proxy.
 */
contract OperatorClearingByPartitionFacet is OperatorClearingByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.operatorClearingRedeemByPartition.selector,
                this.operatorClearingTransferByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IOperatorClearingByPartition).interfaceId);
    }
}
