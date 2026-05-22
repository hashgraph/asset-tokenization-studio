// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingByPartition, RESOLVER_KEY_CLEARING_BY_PARTITION } from "./IClearingByPartition.sol";
import { ClearingByPartition } from "./ClearingByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ClearingByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the partition-scoped clearing operations: approve, cancel,
 *         reclaim, clearing redeem/transfer creation and their associated read queries.
 * @dev Registers 12 selectors under RESOLVER_KEY_CLEARING_BY_PARTITION. All mutation functions
 *      require clearing to be activated and the token to be unpaused.
 */
contract ClearingByPartitionFacet is ClearingByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CLEARING_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.approveClearingOperationByPartition.selector,
                this.cancelClearingOperationByPartition.selector,
                this.reclaimClearingOperationByPartition.selector,
                this.clearingRedeemByPartition.selector,
                this.clearingRedeemFromByPartition.selector,
                this.getClearingRedeemForByPartition.selector,
                this.clearingTransferByPartition.selector,
                this.clearingTransferFromByPartition.selector,
                this.getClearingTransferForByPartition.selector,
                this.getClearedAmountForByPartition.selector,
                this.getClearingCountForByPartition.selector,
                this.getClearingsIdForByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IClearingByPartition).interfaceId);
    }
}
