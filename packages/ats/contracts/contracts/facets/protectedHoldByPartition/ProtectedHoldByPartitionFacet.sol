// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedHoldByPartition } from "./IProtectedHoldByPartition.sol";
import { ProtectedHoldByPartition } from "./ProtectedHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _PROTECTED_HOLD_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ProtectedHoldByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that registers the `protectedCreateHoldByPartition` selector under
 *         `_PROTECTED_HOLD_BY_PARTITION_RESOLVER_KEY` on the Diamond proxy.
 * @dev Composed via `ProtectedHoldByPartition` for behaviour and `IStaticFunctionSelectors` for
 *      selector advertisement. Exposes a single external selector.
 */
contract ProtectedHoldByPartitionFacet is ProtectedHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROTECTED_HOLD_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.protectedCreateHoldByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IProtectedHoldByPartition).interfaceId;
    }
}
