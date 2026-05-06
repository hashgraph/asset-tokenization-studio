// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorClearingByPartition } from "./IOperatorClearingByPartition.sol";
import { OperatorClearingByPartition } from "./OperatorClearingByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _OPERATOR_CLEARING_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title OperatorClearingByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet for partition-scoped operator clearing redeem and transfer operations.
 * @dev Exposes operator clearing functionality to the Diamond proxy.
 */
contract OperatorClearingByPartitionFacet is OperatorClearingByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _OPERATOR_CLEARING_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.operatorClearingTransferByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.operatorClearingRedeemByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IOperatorClearingByPartition).interfaceId;
        }
    }
}
