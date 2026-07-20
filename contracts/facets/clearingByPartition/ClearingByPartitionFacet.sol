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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorCount = 13;
        staticFunctionSelectors_ = new bytes4[](selectorCount);
        unchecked {
            staticFunctionSelectors_[--selectorCount] = this.getClearingsIdForByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.getClearingCountForByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.getClearedAmountForByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.getClearingTransferForByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.clearingTransferFromByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.clearingTransferByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.getClearingRedeemForByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.clearingRedeemFromByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.clearingRedeemByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.reclaimClearingOperationByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.cancelClearingOperationByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.approveClearingOperationByPartition.selector;
            staticFunctionSelectors_[--selectorCount] = this.initializeClearingByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IClearingByPartition).interfaceId);
    }
}
