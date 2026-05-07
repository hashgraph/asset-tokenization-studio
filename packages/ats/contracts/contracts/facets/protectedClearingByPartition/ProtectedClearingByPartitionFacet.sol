// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedClearingByPartition } from "./IProtectedClearingByPartition.sol";
import { ProtectedClearingByPartition } from "./ProtectedClearingByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ProtectedClearingByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that registers the `protectedClearingRedeemByPartition` and
 *         `protectedClearingTransferByPartition` selectors under
 *         `_PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY` on the Diamond proxy.
 * @dev Composed via `ProtectedClearingByPartition` for behaviour and
 *      `IStaticFunctionSelectors` for selector advertisement. Exposes two external selectors.
 */
contract ProtectedClearingByPartitionFacet is ProtectedClearingByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.protectedClearingTransferByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.protectedClearingRedeemByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IProtectedClearingByPartition).interfaceId;
    }
}
