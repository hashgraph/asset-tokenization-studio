// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedClearingHoldByPartition } from "./IProtectedClearingHoldByPartition.sol";
import { ProtectedClearingHoldByPartition } from "./ProtectedClearingHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _PROTECTED_CLEARING_HOLD_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ProtectedClearingHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that registers the `protectedClearingCreateHoldByPartition` selector
 *         under `_PROTECTED_CLEARING_HOLD_BY_PARTITION_RESOLVER_KEY` on the Diamond proxy.
 * @dev Composed via `ProtectedClearingHoldByPartition` for behaviour and
 *      `IStaticFunctionSelectors` for selector advertisement. Exposes a single external
 *      selector.
 */
contract ProtectedClearingHoldByPartitionFacet is ProtectedClearingHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROTECTED_CLEARING_HOLD_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.protectedClearingCreateHoldByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IProtectedClearingHoldByPartition).interfaceId;
    }
}
