// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingByPartition } from "./IClearingByPartition.sol";
import { ClearingByPartition } from "./ClearingByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CLEARING_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ClearingByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the partition-scoped clearing operations: approve, cancel,
 *         reclaim, clearing redeem/transfer creation and their associated read queries.
 * @dev Registers 12 selectors under _CLEARING_BY_PARTITION_RESOLVER_KEY. All mutation functions
 *      require clearing to be activated and the token to be unpaused.
 */
contract ClearingByPartitionFacet is ClearingByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 12;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getClearingsIdForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getClearingCountForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getClearedAmountForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getClearingTransferForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearingTransferFromByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearingTransferByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getClearingRedeemForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearingRedeemFromByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearingRedeemByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.reclaimClearingOperationByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.cancelClearingOperationByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.approveClearingOperationByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IClearingByPartition).interfaceId;
        }
    }
}
