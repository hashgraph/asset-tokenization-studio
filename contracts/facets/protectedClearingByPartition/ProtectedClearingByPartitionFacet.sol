// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IProtectedClearingByPartition,
    RESOLVER_KEY_PROTECTED_CLEARING_BY_PARTITION
} from "./IProtectedClearingByPartition.sol";
import { ProtectedClearingByPartition } from "./ProtectedClearingByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ProtectedClearingByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that registers the `protectedClearingRedeemByPartition` and
 *         `protectedClearingTransferByPartition` selectors under
 *         `RESOLVER_KEY_PROTECTED_CLEARING_BY_PARTITION` on the Diamond proxy.
 * @dev Composed via `ProtectedClearingByPartition` for behaviour and
 *      `IStaticFunctionSelectors` for selector advertisement. Exposes two external selectors.
 */
contract ProtectedClearingByPartitionFacet is ProtectedClearingByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PROTECTED_CLEARING_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeProtectedClearingByPartition.selector,
                this.protectedClearingRedeemByPartition.selector,
                this.protectedClearingTransferByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IProtectedClearingByPartition).interfaceId);
    }
}
